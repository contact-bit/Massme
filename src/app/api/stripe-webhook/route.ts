import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// ⚙️ Initialise Stripe avec ta clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: "2025-10-29.clover",
});

// 🚨 Important : désactiver le body parser de Next.js
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const buf = await req.arrayBuffer();
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Erreur vérification signature Stripe:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // 🔔 Événement de paiement réussi
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // ✅ Récupère l'ID de la commande Firestore stockée dans Stripe metadata
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.warn("Aucune metadata order_id trouvée dans la session Stripe");
        return NextResponse.json({ received: true });
      }

      // 💾 Met à jour la commande Firestore
      const orderRef = doc(db, "pending_orders", orderId);
      await updateDoc(orderRef, {
        status: "paid",
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        paid_at: serverTimestamp(),
      });

      console.log(`✅ Commande ${orderId} mise à jour comme PAYÉE`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("⚠️ Erreur dans le webhook Stripe:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
