// src/app/api/admin/payment-methods/[id]/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Compatible Next: params peut être un objet OU une Promise
type RouteCtx = { params: { id: string } | Promise<{ id: string }> };

async function getId(ctx: RouteCtx) {
  const p = await Promise.resolve(ctx.params);
  return p.id;
}

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const id = await getId(ctx);

    const ref = dbAdmin.collection("payment_methods").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { ok: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      method: { id: snap.id, ...snap.data() },
    });
  } catch (e) {
    console.error("❌ ADMIN PAYMENT METHOD GET ERROR", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  try {
    const id = await getId(ctx);
    const body = await req.json().catch(() => ({}));

    const {
      country,
      name,
      description,
      provider,
      config,
      isActive,
      sortOrder,
    } = body ?? {};

    const payload: Record<string, any> = { updatedAt: new Date() };

    if (country !== undefined) payload.country = country;
    if (name !== undefined) payload.name = name ?? {};
    if (description !== undefined) payload.description = description ?? {};
    if (provider !== undefined) payload.provider = provider ?? "stripe";
    if (config !== undefined) payload.config = config ?? {};
    if (isActive !== undefined)
      payload.isActive = typeof isActive === "boolean" ? isActive : true;

    if (sortOrder !== undefined) {
      payload.sortOrder =
        sortOrder === "" || sortOrder == null
          ? null
          : Number.isNaN(Number(sortOrder))
          ? null
          : Number(sortOrder);
    }

    const ref = dbAdmin.collection("payment_methods").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { ok: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    await ref.set(payload, { merge: true });

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error("❌ ADMIN PAYMENT METHOD PATCH ERROR", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  try {
    const id = await getId(ctx);
    await dbAdmin.collection("payment_methods").doc(id).delete();
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("❌ ADMIN PAYMENT METHOD DELETE ERROR", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
