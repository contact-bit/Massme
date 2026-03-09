import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { buildManualShippingUpdate } from "@/server/logistics/updates";

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

    await dbAdmin.collection("pending_orders").doc(id).delete();

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
      shippingStatus?: "pending" | "preparing" | "shipped" | "delivered" | "cancelled";
      trackingNumber?: string | null;
      carrier?: string | null;
    };

    if (!shippingStatus) {
      return NextResponse.json(
        { error: "Missing shippingStatus" },
        { status: 400 }
      );
    }

    const orderSnap = await dbAdmin.collection("orders").doc(id).get();
    const order = orderSnap.exists ? (orderSnap.data() as any) : null;

    const existingShipDate =
      order?.shippingTracking?.shipDate ||
      order?.fulfillment?.tracking?.shipDate ||
      order?.shippedAt ||
      null;

    const effectiveTrackingNumber =
      trackingNumber !== undefined
        ? trackingNumber
        : order?.trackingNumber ||
          order?.shippingTracking?.trackingNumber ||
          order?.fulfillment?.tracking?.trackingNumber ||
          null;

    const effectiveCarrier =
      carrier !== undefined
        ? carrier
        : order?.carrier ||
          order?.shippingTracking?.carrier ||
          order?.fulfillment?.tracking?.carrier ||
          null;

    const updates = buildManualShippingUpdate({
      shippingStatus,
      trackingNumber: effectiveTrackingNumber,
      carrier: effectiveCarrier,
      actor: "admin_manual",
      existingShipDate,
    });

    console.log("[PATCH ORDER SHIPPING]", id, updates);

    await dbAdmin.collection("pending_orders").doc(id).set(updates, {
      merge: true,
    });

    try {
      await dbAdmin.collection("orders").doc(id).set(updates, { merge: true });
    } catch {}

    return NextResponse.json({
      ok: true,
      shippingMode: "manual",
      shippingStatus,
    });
  } catch (err: any) {
    console.error("[PATCH ORDER SHIPPING ERROR]", err);

    if (err?.message === "invalid_shipping_status") {
      return NextResponse.json(
        { error: "Invalid shippingStatus" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}