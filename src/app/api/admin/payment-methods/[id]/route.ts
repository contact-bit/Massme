// src/app/api/admin/payment-methods/[id]/route.ts

import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: RouteCtx
) {
  try {
    const { id } = await params;

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
      method: {
        id: snap.id,
        ...snap.data(),
      },
    });
  } catch (e) {
    console.error("❌ ADMIN PAYMENT METHOD GET ERROR", e);

    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: RouteCtx
) {
  try {
    const { id } = await params;

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

    const payload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (country !== undefined)
      payload.country = country;

    if (name !== undefined)
      payload.name = name ?? {};

    if (description !== undefined)
      payload.description = description ?? {};

    if (provider !== undefined)
      payload.provider = provider ?? "stripe";

    if (config !== undefined)
      payload.config = config ?? {};

    if (isActive !== undefined) {
      payload.isActive =
        typeof isActive === "boolean"
          ? isActive
          : true;
    }

    if (sortOrder !== undefined) {
      payload.sortOrder =
        sortOrder === "" || sortOrder == null
          ? null
          : Number.isNaN(Number(sortOrder))
          ? null
          : Number(sortOrder);
    }

    const ref = dbAdmin
      .collection("payment_methods")
      .doc(id);

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { ok: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    await ref.set(payload, {
      merge: true,
    });

    return NextResponse.json({
      ok: true,
      id,
    });
  } catch (e: any) {
    console.error(
      "❌ ADMIN PAYMENT METHOD PATCH ERROR",
      e
    );

    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: RouteCtx
) {
  try {
    const { id } = await params;

    await dbAdmin
      .collection("payment_methods")
      .doc(id)
      .delete();

    return NextResponse.json({
      ok: true,
      id,
    });
  } catch (e) {
    console.error(
      "❌ ADMIN PAYMENT METHOD DELETE ERROR",
      e
    );

    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}