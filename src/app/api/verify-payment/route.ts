import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // 🔍 Récupération session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Stripe session not found" },
        { status: 404 }
      );
    }

    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID missing from Stripe metadata",
      });
    }

    // 📌 Récupération de la commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = snap.data();

    // 🟢 Si Stripe confirme → Mise à jour Firestore
    if (session.payment_status === "paid") {
      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });
    }

    // 🔥 On renvoie tout : shipping method, address, items, total, etc.
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        ...order,
        amount_total: session.amount_total, // Stripe total en CENTIMES
      },
    });

  } catch (err: any) {
    console.error("❌ verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
