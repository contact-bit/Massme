// src/app/api/admin/payment-methods/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export async function GET() {
  try {
    const snap = await dbAdmin.collection("payment_methods").get();
    const methods = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ ok: true, methods });
  } catch (e) {
    console.error("❌ ADMIN PAYMENT METHODS LIST ERROR", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      country,
      name,
      description,
      provider,
      config,
      isActive,
      sortOrder,
    } = body;

    const payload: Record<string, any> = {
      country,
      name: name ?? {},
      description: description ?? {},
      provider: provider ?? "stripe",
      config: config ?? {},
      isActive: typeof isActive === "boolean" ? isActive : true,
      sortOrder:
        sortOrder === "" || sortOrder == null
          ? null
          : Number.isNaN(Number(sortOrder))
          ? null
          : Number(sortOrder),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await dbAdmin.collection("payment_methods").add(payload);

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (e: any) {
    console.error("❌ CREATE PAYMENT METHOD ERROR", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
