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

/* -------------------------------------------------------
   RAW BODY → BUFFER (Stripe obligatoire)
------------------------------------------------------- */
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

/* =======================================================
   STRIPE WEBHOOK
======================================================= */
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
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  /* =====================================================
     CHECKOUT PAYÉ
  ===================================================== */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const orderId = metadata.order_id;
    const isRelay = metadata.isRelay === "true";
    const relayProvider = metadata.relayProvider || null;

    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    const customerName =
      session.customer_details?.name ||
      session.shipping_details?.name ||
      null;

    const customerFirstName =
      customerName?.split(" ")?.[0] || null;

    if (!orderId || !customerEmail) {
      console.error("⚠️ order_id ou email manquant");
      return NextResponse.json({ received: true });
    }

    /* ---------------------------------------------------
       ORDERS = SOURCE DE VÉRITÉ
    --------------------------------------------------- */
    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.error("❌ Commande introuvable:", orderId);
      return NextResponse.json({ received: true });
    }

    const savedOrder = snap.data()!;

    /* ---------------------------------------------------
       ITEMS
    --------------------------------------------------- */
    const items = (savedOrder.items || []).map((it: any) => {
      const priceHT = Number(it.priceHT ?? it.price ?? 0);

      return {
        name: it.name || "Produit",
        description: it.description || "",
        quantity: Number(it.quantity || 1),

        // legacy
        price: priceHT,
        priceHT,
      };
    });

    /* ---------------------------------------------------
       SHIPPING
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
      price: shippingCalc.ttc,
      priceHT: shippingHT,
      vatRate,
      priceTTC: shippingCalc.ttc,
      type: sm.type || "home",
      relayProvider: sm.relayProvider || relayProvider || null,
    };

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod,
      relayPoint: savedOrder.relayPoint || null,
      isRelay,
    };

    /* ---------------------------------------------------
       UPDATE COMMANDE
    --------------------------------------------------- */
    await ref.update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,

      email: customerEmail,
      customerName,
      customerFirstName,

      relayPoint: normalizedOrder.relayPoint || null,
    });

    /* ---------------------------------------------------
       FACTURE + EMAIL CLIENT
    --------------------------------------------------- */
    try {
      const pdfBuffer = await generateInvoicePDF(
        normalizedOrder,
        orderId
      );

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre achat — Votre facture",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Merci ${customerFirstName ?? ""} pour votre commande</h2>
            <p>Votre facture est jointe.</p>
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
       EMAILS ADMIN / LOGISTIQUE
    --------------------------------------------------- */
    try {
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, customerEmail }),
      });

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerEmail,
          isRelay,
          relayProvider,
        }),
      });
    } catch (err) {
      console.error("⚠️ Emails admin/logistique:", err);
    }
  }

  return NextResponse.json({ received: true });
}
