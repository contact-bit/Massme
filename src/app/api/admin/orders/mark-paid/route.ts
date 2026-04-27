import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" });
    }

    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Order not found" });
    }

    const order = snap.data();

    const result = await finalizePaidOrder({
      orderId,
      provider: "bank_transfer",
      email: order?.email || null, // 🔥 IMPORTANT
      locale: order?.locale || "fr", // 🔥 IMPORTANT
      payment: {
        method: "bank_transfer",
        manual: true,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}