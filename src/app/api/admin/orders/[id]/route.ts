import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// SUPPRESSION COMMANDE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    console.log("[DELETE ORDER]", id);

    // pending_orders
    await dbAdmin.collection("pending_orders").doc(id).delete();

    // orders (si existe)
    try {
      await dbAdmin.collection("orders").doc(id).delete();
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE ORDER ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}

// MISE À JOUR STATUT LIVRAISON / TRACKING
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as any));
    const { shippingStatus, trackingNumber, carrier } = body as {
      shippingStatus?: string;
      trackingNumber?: string | null;
      carrier?: string | null;
    };

    const updates: Record<string, any> = {};
    if (shippingStatus) updates.shippingStatus = shippingStatus;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (carrier !== undefined) updates.carrier = carrier;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    console.log("[PATCH ORDER SHIPPING]", id, updates);

    // pending_orders
    await dbAdmin.collection("pending_orders").doc(id).set(updates, {
      merge: true,
    });

    // orders (si déjà copiée)
    try {
      await dbAdmin.collection("orders").doc(id).set(updates, { merge: true });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[PATCH ORDER SHIPPING ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}
