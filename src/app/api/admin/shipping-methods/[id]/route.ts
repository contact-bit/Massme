import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      name,
      delay,
      type,
      relayProvider,
      priceHT,
      vatRate,
      isActive,
    } = body;

    // ✅ validations cohérentes
    if (!id || typeof name !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload (id / name)" },
        { status: 400 }
      );
    }

    if (
      typeof priceHT !== "number" ||
      Number.isNaN(priceHT)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid priceHT" },
        { status: 400 }
      );
    }

    if (
      typeof vatRate !== "number" ||
      Number.isNaN(vatRate)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid vatRate" },
        { status: 400 }
      );
    }

    if (!Object.keys(name).length) {
      return NextResponse.json(
        { ok: false, error: "Empty name object" },
        { status: 400 }
      );
    }

    const payload = {
      name,                 // 🔑 ON GARDE TOUTES LES LOCALES
      delay: delay || {},
      type: type || "home",
      relayProvider: relayProvider ?? null,
      priceHT,
      vatRate,
      isActive: isActive ?? true,
      updatedAt: new Date(),
    };

    await dbAdmin
      .collection("shipping_methods")
      .doc(id)
      .update(payload);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ PATCH shipping_method error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
