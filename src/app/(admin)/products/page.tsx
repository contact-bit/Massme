import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function GET() {
  try {
    const snap = await dbAdmin.collection("products").get();
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ ok: true, products });
  } catch (e) {
    console.error("❌ Admin products error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
