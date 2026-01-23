import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

// GET
export async function GET() {
  const snap = await dbAdmin
    .collection("shipping_methods")
    .get();

  const methods = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json({ ok: true, methods });
}

// POST
export async function POST(req: Request) {
  try {
    const {
      country,
      name,
      delay,
      type,
      relayProvider,
      priceHT,
      vatRate,
      isActive,
    } = await req.json();

    if (!country || typeof name !== "object") {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (
      typeof priceHT !== "number" ||
      Number.isNaN(priceHT)
    ) {
      return NextResponse.json(
        { error: "Invalid priceHT" },
        { status: 400 }
      );
    }

    if (
      typeof vatRate !== "number" ||
      Number.isNaN(vatRate)
    ) {
      return NextResponse.json(
        { error: "Invalid vatRate" },
        { status: 400 }
      );
    }

    if (!Object.keys(name).length) {
      return NextResponse.json(
        { error: "Empty name" },
        { status: 400 }
      );
    }

    const payload = {
      country,
      name,
      delay: delay || {},
      type: type || "home",
      relayProvider: relayProvider ?? null,
      priceHT,
      vatRate,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    const doc = await dbAdmin
      .collection("shipping_methods")
      .add(payload);

    return NextResponse.json(
      { ok: true, id: doc.id },
      { status: 201 }
    );
  } catch (e) {
    console.error("❌ CREATE SHIPPING ERROR", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
