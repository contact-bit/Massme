import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("❌ session_id manquant dans la requête");
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    console.log("🔎 Vérification Stripe pour la session :", sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      console.error("❌ Session Stripe introuvable !");
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    console.log("💳 Stripe status:", session.payment_status);
    console.log("🧾 Metadata:", session.metadata);

    const orderId = session.metadata?.order_id;

    if (session.payment_status === "paid") {
      if (!orderId) {
        console.warn("⚠️ Aucune commande associée (order_id manquant).");
        return NextResponse.json({ success: true, note: "No order_id metadata" });
      }

      console.log("✅ Paiement confirmé, mise à jour Firestore...");

      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });

      console.log("🔥 Commande mise à jour avec succès :", orderId);
      return NextResponse.json({ success: true });
    }

    console.warn("⚠️ Paiement non encore confirmé :", session.payment_status);
    return NextResponse.json({ success: false, status: session.payment_status });

  } catch (err: any) {
    console.error("🚨 Erreur interne verify-payment :", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
