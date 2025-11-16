import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

// =============================================================
// 🚀 INIT
// =============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Stripe demande le RAW body
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

// =============================================================
// 📌 WEBHOOK PRINCIPAL
// =============================================================
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
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // =============================================================
  // 🎯 PAIEMENT VALIDÉ
  // =============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    if (!orderId || !customerEmail) {
      console.error("⚠️ Missing order_id or customerEmail");
      return NextResponse.json({ received: true });
    }

    // 🔎 Récupérer commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    let order = snap.data();

    if (!order) {
      console.error("⚠️ Commande introuvable");
      return NextResponse.json({ received: true });
    }

    // =============================================================
    // 🧹 NORMALISATION AVANT GÉNÉRATION PDF (FIX DÉFINITIF)
    // =============================================================

    // 🟢 Normalisation des items
    const normalizedItems = order.items.map((item: any) => {
      const name = item.name || "Produit";

      // 🔥 Firestore enregistre TOUJOURS price en number
      const price =
        typeof item.price === "number"
          ? item.price
          : Number(item.unit_price) ||
            Number(item.total) ||
            0;

      const quantity = Number(item.quantity || 1);

      return { name, price, quantity };
    });

    // 🟢 Normalisation shipping
    const shippingPrice =
      typeof order.shippingMethod?.price === "number"
        ? order.shippingMethod.price
        : Number(order.shippingMethod?.price?.fr) ||
          Number(order.shippingMethod?.price?.en) ||
          0;

    order = {
      ...order,
      items: normalizedItems,
      shippingMethod: { price: shippingPrice },
    };

    console.log("📦 Données envoyées au PDF :", order);

    // =============================================================
    // 🔄 Mise à jour Firestore
    // =============================================================
    await dbAdmin.collection("pending_orders").doc(orderId).update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
    });

    // =============================================================
    // ✉️ ENVOI EMAIL CLIENT + FACTURE PDF
    // =============================================================
    try {
      const pdfBuffer = await generateInvoicePDF(order, orderId);
      const pdfBase64 = pdfBuffer.toString("base64");

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre commande - Massme",
        html: `
          <div style="font-family:Arial; padding:20px;">
            <h2>🎉 Merci pour votre commande !</h2>
            <p>Votre facture est jointe à cet e-mail.</p>
            <p>ID commande : <b>${orderId}</b></p>
          </div>
        `,
        attachments: [
          {
            filename: `facture-${orderId}.pdf`,
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📎 Facture envoyée :", orderId);
    } catch (err) {
      console.error("❌ Erreur email PDF :", err);
    }

    // =============================================================
    // 📮 Emails Admin + Logistique (sans attendre)
    // =============================================================
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    });

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    });
  }

  return NextResponse.json({ received: true });
}
