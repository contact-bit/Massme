import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20" as any,
});

// 🔐 Important : Empêche Next.js de parser le body
export const config = {
  api: {
    bodyParser: false,
  },
};

// 🧩 Utilitaire pour lire le raw body
async function readBuffer(readable: ReadableStream) {
  const chunks = [];
  const reader = readable.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    chunks.push(result.value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  try {
    const rawBody = await readBuffer(req.body!);
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    // ✅ Vérification de la signature Stripe
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("📦 Stripe webhook reçu :", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        console.log("✅ Paiement confirmé pour la commande:", orderId);
        await db.collection("pending_orders").doc(orderId).update({
          status: "paid",
          paymentIntentId: session.payment_intent,
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Erreur webhook Stripe:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
