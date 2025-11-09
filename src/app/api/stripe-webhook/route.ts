import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin"; // ✅ bon nom d'import
import { doc, updateDoc } from "firebase-admin/firestore";

// ⚙️ Initialisation Stripe (clé secrète depuis .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

// ✅ Nouvelle méthode Next.js 16 : on définit la config directement
export const dynamic = "force-dynamic"; // autorise le body brut

// 🔐 Lecture du corps brut pour vérification de signature
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
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Signature Stripe manquante");
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET! // ⚠️ à configurer dans Vercel
    );
  } catch (err: any) {
    console.error("⚠️ Erreur de vérification du webhook:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ✅ Cas principal : paiement réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      console.warn("⚠️ Aucun order_id dans la session Stripe.");
      return NextResponse.json({ received: true });
    }

    console.log("💰 Paiement complété pour la commande:", orderId);

    try {
      const orderRef = doc(dbAdmin, "pending_orders", orderId);
      await updateDoc(orderRef, {
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });
      console.log("✅ Commande mise à jour comme payée:", orderId);
    } catch (err) {
      console.error("🔥 Erreur lors de la mise à jour Firestore:", err);
    }
  }

  // ⚠️ Cas secondaires
  else if (event.type === "checkout.session.expired") {
    console.log("⌛ Session Stripe expirée:", event.id);
  } else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué:", event.id);
  }

  return NextResponse.json({ received: true });
}
