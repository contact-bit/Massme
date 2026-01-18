import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { computePrice } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* =====================================================
   RAW BODY → BUFFER (obligatoire pour Stripe)
===================================================== */
async function buffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/* =====================================================
   STRIPE WEBHOOK
===================================================== */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Stripe signature error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }

  /* =====================================================
     🎯 CHECKOUT SESSION PAYÉE
  ===================================================== */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const orderId = metadata.order_id;

    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!orderId || !customerEmail) {
      console.error("⚠️ order_id ou email manquant");
      return NextResponse.json({ received: true });
    }

    /* ---------------------------------------------------
       🔎 ORDERS = SOURCE DE VÉRITÉ
    --------------------------------------------------- */
    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.error("❌ Commande introuvable:", orderId);
      return NextResponse.json({ received: true });
    }

    const savedOrder = snap.data()!;

    /* ---------------------------------------------------
       👤 CLIENT — PRÉNOM / NOM (JAMAIS DEPUIS STRIPE)
    --------------------------------------------------- */
    const firstName =
      savedOrder.shippingAddress?.firstName ||
      savedOrder.customerFirstName ||
      savedOrder.shippingAddress?.name?.split(" ")[0] ||
      "";

    const lastName =
      savedOrder.shippingAddress?.lastName ||
      savedOrder.customerLastName ||
      "";

    /* ---------------------------------------------------
       📦 ITEMS — NORMALISATION (LEGACY COMPAT)
    --------------------------------------------------- */
    const items = (savedOrder.items || []).map((it: any) => {
      const priceHT = Number(it.priceHT ?? it.price ?? 0);

      return {
        name: it.name || "Produit",
        description: it.description || "",
        quantity: Number(it.quantity || 1),

        // legacy (PDF / emails / success)
        price: priceHT,

        // interne
        priceHT,
      };
    });

    /* ---------------------------------------------------
       🚚 SHIPPING — NORMALISATION TVA
    --------------------------------------------------- */
    const sm = savedOrder.shippingMethod || {};
    const shippingHT = Number(sm.priceHT ?? sm.price ?? 0);
    const vatRate = Number(sm.vatRate ?? 0);

    const shippingCalc = computePrice({
      priceHT: shippingHT,
      vatRate,
    });

    const shippingMethod = {
      ...sm,

      // legacy
      price: shippingCalc.ttc,

      // interne
      priceHT: shippingHT,
      vatRate,
      priceTTC: shippingCalc.ttc,

      type: sm.type || "home",
      relayProvider: sm.relayProvider || null,
    };

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod,
      relayPoint: savedOrder.relayPoint || null,
      customerFirstName: firstName,
      customerLastName: lastName,
    };

    /* ---------------------------------------------------
       💾 UPDATE COMMANDE → PAYÉE
    --------------------------------------------------- */
    await ref.update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
      customerFirstName: firstName,
      customerLastName: lastName,
    });

    /* ---------------------------------------------------
       📄 FACTURE PDF + EMAIL CLIENT
    --------------------------------------------------- */
    try {
      const pdfBuffer = await generateInvoicePDF(
        normalizedOrder,
        orderId
      );

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre commande — Facture jointe",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Merci ${firstName || ""} pour votre commande 🎉</h2>
            <p>Votre facture est jointe à cet email.</p>
            <p><b>Commande :</b> ${orderId}</p>
          </div>
        `,
        attachments: [
          {
            filename: `facture-${orderId}.pdf`,
            content: pdfBuffer.toString("base64"),
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📧 Email client envoyé");
    } catch (err) {
      console.error("❌ PDF / email client:", err);
    }

    /* ---------------------------------------------------
       📮 EMAILS ADMIN + LOGISTIQUE (NON BLOQUANTS)
    --------------------------------------------------- */
    try {
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerEmail,
          firstName,
          lastName,
        }),
      });

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerEmail,
          shippingMethod: shippingMethod.type,
          relayPoint: normalizedOrder.relayPoint,
        }),
      });
    } catch (err) {
      console.error("⚠️ Emails admin/logistique:", err);
    }
  }

  return NextResponse.json({ received: true });
}
