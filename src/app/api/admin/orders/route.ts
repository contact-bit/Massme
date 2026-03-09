import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdminOrLogistics, getRoleFromRequest } from "@/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = assertAdminOrLogistics(req);
  if (auth) return auth;

  const role = getRoleFromRequest(req);

  try {
    const snap = await dbAdmin
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    const orders = snap.docs.map((d) => {
      const o = d.data() as any;

      const base = {
        id: d.id,
        status: o.status ?? "unknown",
        email: o.email ?? "",
        items: o.items ?? [],
        shippingMethod: o.shippingMethod ?? null,
        shippingAddress: o.shippingAddress ?? null,
        createdAt: o.createdAt ?? null,
        paidAt: o.paidAt ?? null,

        // logistique
        shippingStatus: o.shippingStatus ?? null,
        trackingNumber: o.trackingNumber ?? null,
        carrier: o.carrier ?? null,
        shippingMode: o.shippingMode ?? null,
        shippingTracking: o.shippingTracking ?? null,
        fulfillment: o.fulfillment ?? null,
        shippedAt: o.shippedAt ?? null,
        shipstation: o.shipstation ?? null,
      };

      // admin voit tout
      if (role === "admin") {
        return {
          ...base,
          totals: o.totals ?? null,
          total: o.totals?.totalTTC ?? 0,
        };
      }

      // logistics : pas de chiffres
      return {
        ...base,
        totals: null,
        total: 0,
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

export async function DELETE(req: Request) {
  const auth = assertAdminOrLogistics(req);
  if (auth) return auth;

  // sécurité : suppression réservée admin
  const role = getRoleFromRequest(req);
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  try {
    await dbAdmin.collection("orders").doc(id).delete();

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: any) {
    console.error("[admin/orders] DELETE error:", err);
    return NextResponse.json(
      { error: "Delete failed", message: err?.message },
      { status: 500 }
    );
  }
}