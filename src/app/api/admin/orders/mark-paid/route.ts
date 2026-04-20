import { NextResponse } from "next/server";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" });
    }

    const result = await finalizePaidOrder({
      orderId,
      provider: "bank_transfer",
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