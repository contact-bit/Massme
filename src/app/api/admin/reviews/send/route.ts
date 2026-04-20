// src/app/api/admin/reviews/send/route.ts

import { NextResponse } from "next/server";
import { sendReviewEmailNow } from "@/server/reviewEmailSender";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "missing_orderId" },
        { status: 400 }
      );
    }

    // 🔥 FIX ICI
    const result = await sendReviewEmailNow(orderId, {
      force: true,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (e: any) {
    console.error("SEND REVIEW ADMIN ERROR", e);

    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "server_error",
      },
      { status: 500 }
    );
  }
}