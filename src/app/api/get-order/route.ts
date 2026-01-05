import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const order_id = searchParams.get("order_id");     // ✅ le mieux
    const session_id = searchParams.get("session_id"); // fallback

    if (!order_id && !session_id) {
      return NextResponse.json(
        { error: "Missing order_id or session_id" },
        { status: 400 }
      );
    }

    let orderId = order_id || "";

    // ⚠️ Stripe uniquement si on n'a pas order_id
    if (!orderId) {
      const session = await stripe.checkout.sessions.retrieve(session_id!);
      orderId = session.metadata?.order_id || "";
      if (!orderId) {
        return NextResponse.json(
          { error: "Order not found (no order_id in Stripe metadata)" },
          { status: 404 }
        );
      }
    }

    // ✅ Lis dans la collection finale si tu en as une
    // Sinon garde pending_orders mais c'est mieux de centraliser.
    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    // fallback si tu n'as pas encore migré
    let finalSnap = snap;
    if (!finalSnap.exists) {
      finalSnap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    }

    if (!finalSnap.exists) {
      return NextResponse.json({ error: "No order found" }, { status: 404 });
    }

    // ✅ Cache léger pour éviter les refetchs inutiles par le browser (optionnel)
    const res = NextResponse.json({
      order: { id: finalSnap.id, ...finalSnap.data() },
    });
    res.headers.set("Cache-Control", "private, max-age=10"); // 10s suffit souvent
    return res;
  } catch (err: any) {
    console.error("❌ /api/get-order error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
