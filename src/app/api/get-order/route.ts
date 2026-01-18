// src/app/api/get-order/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const order_id = searchParams.get("order_id");
    const session_id = searchParams.get("session_id"); // fallback ancien

    if (!order_id && !session_id) {
      return NextResponse.json(
        { error: "Missing order_id or session_id" },
        { status: 400 }
      );
    }

    let orderId = order_id || "";

    // 🔁 fallback Stripe UNIQUEMENT si nécessaire
    if (!orderId) {
      const session = await stripe.checkout.sessions.retrieve(session_id!);
      orderId = session.metadata?.order_id || "";
      if (!orderId) {
        return NextResponse.json(
          { error: "Order not found in Stripe metadata" },
          { status: 404 }
        );
      }
    }

    // ✅ SOURCE DE VÉRITÉ = orders
    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const data = snap.data();

    // 🔥 NORMALISATION DATE (CRITIQUE)
    const createdAt =
      data?.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data?.createdAt?._seconds
        ? new Date(data.createdAt._seconds * 1000).toISOString()
        : null;

    const res = NextResponse.json({
      order: {
        id: snap.id,
        ...data,
        createdAt,
      },
    });

    res.headers.set("Cache-Control", "private, max-age=10");
    return res;
  } catch (err: any) {
    console.error("❌ /api/get-order error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
