// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function GET() {
  try {
    const snap = await dbAdmin.collection("products").get();

    const products = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        ok: true,
        products,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("❌ Error loading products:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
