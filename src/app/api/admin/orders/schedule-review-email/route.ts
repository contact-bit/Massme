import { NextResponse } from "next/server";
import { scheduleReviewEmailForOrder } from "@/server/reviewEmailScheduler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    if (!orderId) return NextResponse.json({ ok: false, message: "orderId manquant" }, { status: 400 });

    const result = await scheduleReviewEmailForOrder(orderId);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, message: e?.message || String(e) }, { status: 500 });
  }
}