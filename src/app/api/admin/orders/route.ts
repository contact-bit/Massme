// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   AUTH ADMIN
========================= */
function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/* =========================
   GET — LISTE COMMANDES
========================= */
export async function GET(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const snap = await dbAdmin
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    const orders = snap.docs.map((d) => {
      const o = d.data() as any;

      return {
        id: d.id,
        status: o.status ?? "unknown",
        email: o.email ?? "",
        items: o.items ?? [],
        shippingMethod: o.shippingMethod ?? null,
        shippingAddress: o.shippingAddress ?? null,
        totals: o.totals ?? null,

        total: o.totals?.totalTTC ?? 0,
        createdAt: o.createdAt ?? null,
        paidAt: o.paidAt ?? null,

        // ✅ champs logistiques nécessaires au front
        shippingStatus: o.shippingStatus ?? null,
        trackingNumber: o.trackingNumber ?? null,
        carrier: o.carrier ?? null,
        shippingMode: o.shippingMode ?? null,
        shippingTracking: o.shippingTracking ?? null,
        fulfillment: o.fulfillment ?? null,
        shippedAt: o.shippedAt ?? null,
        shipstation: o.shipstation ?? null,
      };
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err: any) {
    console.error("[admin/orders] GET error:", err);
    return NextResponse.json(
      { error: "Orders failed", message: err?.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — SUPPRIMER COMMANDE
========================= */
export async function DELETE(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing order id" },
      { status: 400 }
    );
  }

  try {
    await dbAdmin.collection("orders").doc(id).delete();

    return NextResponse.json(
      { success: true, id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[admin/orders] DELETE error:", err);
    return NextResponse.json(
      { error: "Delete failed", message: err?.message },
      { status: 500 }
    );
  }
}