import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";

// ⚙️ Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // 🔍 Vérifie la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata?.order_id;
      if (orderId) {
        const orderRef = dbAdmin.collection("pending_orders").doc(orderId);
        await orderRef.update({
          status: "paid",
          paidAt: new Date(),
          stripeSessionId: session.id,
        });
      }

      console.log("✅ Paiement confirmé via verify-payment:", session.id);
      return NextResponse.json({ success: true });
    }

    console.warn("⚠️ Paiement non confirmé :", session.payment_status);
    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (err: any) {
    console.error("❌ Erreur de vérification Stripe:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
