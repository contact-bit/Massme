import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin"; // ✅ Admin SDK (pas db client)

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // 1️⃣ Récupère la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order not found (no order_id in metadata)" },
        { status: 404 }
      );
    }

    // 2️⃣ Lecture Firestore via Admin SDK → ignore les règles de sécurité
    const snap = await dbAdmin
      .collection("pending_orders")
      .doc(orderId)
      .get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "No order found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: { id: snap.id, ...snap.data() },
    });
  } catch (err: any) {
    console.error("❌ /api/get-order error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
