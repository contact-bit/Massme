import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

type Context = {
  params: Promise<{ id: string }>;
};

/* =====================================================
   PATCH → modifier une méthode (partiel, safe)
===================================================== */
export async function PATCH(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      name,
      delay,
      type,
      relayProvider,
      priceHT,
      vatRate,
      isActive,
    } = body;

    const payload: any = {
      updatedAt: new Date(),
    };

    /* ---------- name ---------- */
    if (name !== undefined) {
      if (
        typeof name !== "object" ||
        !Object.keys(name).length
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid name" },
          { status: 400 }
        );
      }
      payload.name = name;
    }

    /* ---------- delay ---------- */
    if (delay !== undefined) {
      payload.delay =
        typeof delay === "object" ? delay : {};
    }

    /* ---------- type ---------- */
    if (type !== undefined) {
      payload.type = type;

      if (type === "relay" && !relayProvider) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "relayProvider is required when type=relay",
          },
          { status: 400 }
        );
      }
    }

    /* ---------- relayProvider ---------- */
    if (relayProvider !== undefined) {
      payload.relayProvider = relayProvider;
    }

    /* ---------- priceHT ---------- */
    if (priceHT !== undefined) {
      if (
        typeof priceHT !== "number" ||
        Number.isNaN(priceHT)
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid priceHT" },
          { status: 400 }
        );
      }
      payload.priceHT = priceHT;
    }

    /* ---------- vatRate ---------- */
    if (vatRate !== undefined) {
      if (
        typeof vatRate !== "number" ||
        Number.isNaN(vatRate)
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid vatRate" },
          { status: 400 }
        );
      }
      payload.vatRate = vatRate;
    }

    /* ---------- isActive ---------- */
    if (typeof isActive === "boolean") {
      payload.isActive = isActive;
    }

    /* ---------- UPDATE ---------- */
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

/* =====================================================
   DELETE → suppression définitive (sans conditions)
===================================================== */
export async function DELETE(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );
    }

    console.log("🗑️ DELETE shipping_method:", id);

    await dbAdmin
      .collection("shipping_methods")
      .doc(id)
      .delete();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ DELETE shipping_method error:", e);
    return NextResponse.json(
      { ok: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
