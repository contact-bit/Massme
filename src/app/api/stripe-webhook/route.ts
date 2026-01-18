import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { computePrice } from "@/lib/pricing";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
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
    console.error("❌ Webhook signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const orderId = metadata.order_id;
    const isRelay = metadata.isRelay === "true";
    const relayProvider = metadata.relayProvider || null;
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    if (!orderId || !customerEmail) {
      console.error("⚠️ Missing order_id or customer email");
      return NextResponse.json({ received: true });
    }

    /* ---------------------------------------------------
       🔎 Firestore
    --------------------------------------------------- */
    const ref = dbAdmin.collection("pending_orders").doc(orderId);
    const snap = await ref.get();
    const savedOrder = snap.data();

    if (!savedOrder) {
      console.error("⚠️ Order not found:", orderId);
      return NextResponse.json({ received: true });
    }

    /* ---------------------------------------------------
       📦 ITEMS — ADAPTER TVA → LEGACY
    --------------------------------------------------- */
    const items = (savedOrder.items || []).map((it: any) => {
      const priceHT = Number(it.priceHT ?? it.price ?? 0);

      return {
        name: it.name || "Produit",
        description: it.description || "",
        quantity: Number(it.quantity || 1),

        // 🔥 LEGACY (emails + success + PDF)
        price: priceHT,

        // interne
        priceHT,
      };
    });

    /* ---------------------------------------------------
       🚚 SHIPPING — ADAPTER TVA → LEGACY
    --------------------------------------------------- */
    const sm = savedOrder.shippingMethod || {};
    const priceHT = Number(sm.priceHT ?? sm.price ?? 0);
    const vatRate = Number(sm.vatRate ?? 0);

    const priceCalc = computePrice({
      priceHT,
      vatRate,
    });

    const shippingMethod = {
      ...sm,

      // 🔥 legacy
      price: priceCalc.ttc,

      // interne
      priceHT,
      vatRate,
      priceTTC: priceCalc.ttc,

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
       💾 UPDATE Firestore
    --------------------------------------------------- */
    await ref.update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
      relayPoint: normalizedOrder.relayPoint,
    });

    /* ---------------------------------------------------
       📄 FACTURE PDF + EMAIL CLIENT
    --------------------------------------------------- */
    try {
      const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId);

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre achat — Votre facture",
        html: `
          <div style="font-family:Arial,sans-serif">
            <h2>Merci pour votre commande</h2>
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
    } catch (err) {
      console.error("❌ PDF / email client error:", err);
    }

    /* ---------------------------------------------------
       📮 EMAILS ADMIN / LOGISTIQUE (NON BLOQUANTS)
    --------------------------------------------------- */
    try {
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
        method: "POST",
        body: JSON.stringify({ orderId, customerEmail }),
        headers: { "Content-Type": "application/json" },
      });

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
        method: "POST",
        body: JSON.stringify({
          orderId,
          customerEmail,
          isRelay,
          relayProvider,
        }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("⚠️ Admin/logistic email error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
