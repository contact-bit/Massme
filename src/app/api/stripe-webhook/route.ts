import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";

// =============================================================
// 📌 INITIALISATION
// =============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

// Lecture du RAW body (Stripe requirement)
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

// =============================================================
// 📌 WEBHOOK — TRAITEMENT PRINCIPAL
// =============================================================
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
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // =============================================================
  // 🟢 PAIEMENT VALIDÉ
  // =============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    if (!orderId || !customerEmail) {
      console.error("❌ Missing required metadata");
      return NextResponse.json({ received: true });
    }

    // Récupération commande Firestore
    const orderSnap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = orderSnap.data();

    // 1️⃣ Mise à jour Firestore
    await dbAdmin.collection("pending_orders").doc(orderId).update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
    });

    // 2️⃣ Email client (1 seul email)
    await resend.emails.send({
      from: "Massme <contact@hdconnects.com>",
      to: customerEmail,
      subject: "🎉 Merci pour votre commande - Massme",
      html: `
        <h2>Merci pour votre commande !</h2>
        <p>Votre paiement est confirmé.</p>
        <p><b>ID commande :</b> ${orderId}</p>
        <p>Nous vous informerons lors de l'expédition.</p>
      `,
    });

    // 3️⃣ Email admin via endpoint séparé
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    }).catch(() => {});

    // 4️⃣ Email logistique via endpoint séparé
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    }).catch(() => {});
  }

  // =============================================================
  // AUTRES ÉVÉNEMENTS
  // =============================================================
  else if (event.type === "checkout.session.expired") {
    console.log("⚠️ Session expirée :", event.id);
  } else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué :", event.id);
  }

  return NextResponse.json({ received: true });
}
