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

// Webhooks Next.js App Router
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

// Lecture RAW body obligatoire pour Stripe
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
// 📌 ROUTE PRINCIPALE — WEBHOOK
// =============================================================
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Signature Stripe manquante");
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // ---------------------------------------
  // 🎯 Vérification de la signature Stripe
  // ---------------------------------------
  try {
    const rawBody = await buffer(req.body!);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Erreur validation webhook:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // =============================================================
  // 🟢 PAIEMENT VALIDÉ — L'ÉVÉNEMENT LE PLUS IMPORTANT
  // =============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    console.log("💰 Paiement complété");
    console.log("🧾 ID Commande :", orderId);
    console.log("📧 Email client :", customerEmail);

    if (!orderId || !customerEmail) {
      console.error("⚠️ order_id ou email manquant — arrêt du process email.");
      return NextResponse.json({ received: true });
    }

    // 🔍 Récupère les infos Firestore pour les emails admin/logistique
    const orderSnap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = orderSnap.data();

    // ---------------------------------------
    // 1️⃣ Mise à jour Firestore
    // ---------------------------------------
    try {
      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });

      console.log("✅ Firestore mis à jour");
    } catch (err) {
      console.error("🔥 Erreur Firestore :", err);
    }

    // ---------------------------------------
    // 2️⃣ Email Client (Confirmation)
    // ---------------------------------------
    try {
      const emailClient = await resend.emails.send({
        from: "Massme <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre commande - Massme",
        html: `
          <h2>Merci pour votre commande !</h2>
          <p>Votre paiement est confirmé.</p>
          <p><b>ID commande :</b> ${orderId}</p>
          <p>Vous recevrez une notification lors de l'expédition.</p>
        `,
      });

      console.log("📧 Email CLIENT envoyé :", emailClient.data?.id);
    } catch (err) {
      console.error("❌ Erreur envoi email CLIENT :", err);
    }

    // ---------------------------------------
    // 3️⃣ Email ADMIN (Notification interne)
    // ---------------------------------------
    try {
      const adminEmail = await resend.emails.send({
        from: "Massme <contact@hdconnects.com>",
        to: process.env.ADMIN_EMAIL!,
        subject: `🛒 Nouvelle commande #${orderId}`,
        html: `
          <h2>Nouvelle commande reçue</h2>
          <p><b>ID commande :</b> ${orderId}</p>
          <p><b>Client :</b> ${customerEmail}</p>

          <h3>Détails :</h3>
          <pre>${JSON.stringify(order, null, 2)}</pre>
        `,
      });

      console.log("📧 Email ADMIN envoyé :", adminEmail.data?.id);
    } catch (err) {
      console.error("❌ Erreur email ADMIN :", err);
    }

    // ---------------------------------------
    // 4️⃣ Email LOGISTIQUE (préparation colis)
    // ---------------------------------------
    try {
      const logisticsEmail = await resend.emails.send({
        from: "Massme <contact@hdconnects.com>",
        to: process.env.LOGISTICS_EMAIL!,
        subject: `📦 Préparer commande #${orderId}`,
        html: `
          <h2>Préparation logistique</h2>

          <p><b>ID commande :</b> ${orderId}</p>
          <p><b>Client :</b> ${customerEmail}</p>

          <h3>Adresse de livraison :</h3>
          <pre>${JSON.stringify(order?.shippingAddress, null, 2)}</pre>

          <h3>Produits :</h3>
          <pre>${JSON.stringify(order?.items, null, 2)}</pre>
        `,
      });

      console.log("📧 Email LOGISTIQUE envoyé :", logisticsEmail.data?.id);
    } catch (err) {
      console.error("❌ Erreur envoi email LOGISTIQUE :", err);
    }
  }

  // =============================================================
  // AUTRES ÉVÉNEMENTS UTILES
  // =============================================================
  else if (event.type === "checkout.session.expired") {
    console.log("⚠️ Session expirée :", event.id);
  } else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué :", event.id);
  }

  return NextResponse.json({ received: true });
}
