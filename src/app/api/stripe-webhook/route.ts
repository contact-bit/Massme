import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";

// INITIALISATION
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Requis par Stripe webhooks
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

// Lecture raw body (obligatoire)
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
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
    console.error("❌ Signature Stripe manquante");
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
    console.error("⚠️ Erreur validation webhook:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // =============================================================
  // 🟢 PAIEMENT RÉUSSI
  // =============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    console.log("💰 Paiement validé. Order:", orderId);
    console.log("📧 Email client:", customerEmail);

    if (!orderId || !customerEmail) {
      console.error("⚠️ Pas d'order_id ou email → pas d'envoi d'email");
      return NextResponse.json({ received: true });
    }

    // 🔥 1. Mise à jour Firestore
    try {
      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });

      console.log("✅ Firestore mis à jour :", orderId);
    } catch (err) {
      console.error("🔥 Erreur update Firestore :", err);
    }

    // 🔥 2. Envoi de l’email de confirmation
    try {
      const emailResponse = await resend.emails.send({
        from: "Massme <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre commande - Massme",
        html: `
          <h2>Merci pour votre commande !</h2>
          <p>Votre paiement a été confirmé.</p>
          <p><b>ID Commande :</b> ${orderId}</p>
          <p>Nous vous tiendrons informé de l'expédition.</p>
        `,
      });

      console.log("📧 Email envoyé :", emailResponse.data?.id);
    } catch (error: any) {
      console.error("❌ Erreur envoi email Resend :", error);
    }
  }

  // =============================================================
  // AUTRES ÉVÉNEMENTS
  // =============================================================
  else if (event.type === "checkout.session.expired") {
    console.log("⚠️ Session expirée:", event.id);
  }

  else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué:", event.id);
  }

  return NextResponse.json({ received: true });
}
