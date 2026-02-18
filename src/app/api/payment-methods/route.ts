import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "FR";

  try {
    const snap = await dbAdmin
      .collection("payment_methods")
      .where("country", "==", country)
      .where("isActive", "==", true)
      .get();

    const methods = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a: any, b: any) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      );

    return NextResponse.json({ ok: true, methods });
  } catch (e) {
    console.error("❌ PUBLIC PAYMENT METHODS ERROR", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
