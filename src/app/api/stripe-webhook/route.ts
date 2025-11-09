import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin"; // ✅ bon import (SDK Admin)

// ⚙️ Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

// ✅ Nouvelle syntaxe Next.js 16
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

// 🔐 Fonction pour lire le raw body du webhook
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  let done, value;
  while ((({ done, value } = await reader.read()), !done)) {
    if (value) chunks.push(value); // ✅ vérifie que value n’est pas undefined
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Signature Stripe manquante");
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await buffer(req.body!);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Erreur de vérification du webhook:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ✅ Paiement réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      console.warn("⚠️ Aucun order_id trouvé dans la session Stripe.");
      return NextResponse.json({ received: true });
    }

    console.log("💰 Paiement complété pour la commande:", orderId);

    try {
      const orderRef = dbAdmin.collection("pending_orders").doc(orderId);
      await orderRef.update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });

      console.log("✅ Commande mise à jour comme payée:", orderId);
    } catch (err) {
      console.error("🔥 Erreur Firestore:", err);
    }
  }

  else if (event.type === "checkout.session.expired") {
    console.log("⚠️ Session expirée:", event.id);
  } else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué:", event.id);
  }

  return NextResponse.json({ received: true });
}
