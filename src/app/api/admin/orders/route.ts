import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import {
  assertAdminOrLogistics,
  getRoleFromRequest,
} from "@/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   GET ORDERS
========================================================= */

export async function GET(req: Request) {
  const auth = assertAdminOrLogistics(req);
  if (auth) return auth;

  const role = getRoleFromRequest(req);

  try {
    // 🔥 FIX: suppression du orderBy Firestore (source du bug)
    const snap = await dbAdmin
      .collection("orders")
      .limit(300)
      .get();

    const orders = snap.docs
      .map((d) => {
        const o = d.data() as any;

        const base = {
          id: d.id,

          orderNumber:
            typeof o.orderNumber === "string" ? o.orderNumber : null,

          status: o.status ?? "unknown",
          email: o.email ?? "",
          items: Array.isArray(o.items) ? o.items : [],

          shippingMethod: o.shippingMethod ?? null,
          shippingAddress: o.shippingAddress ?? null,
          billingAddress: o.billingAddress ?? null,

          relayPoint: o.relayPoint ?? null,

          payment: o.payment ?? null,

          createdAt: o.createdAt ?? null,
          paidAt: o.paidAt ?? null,

          shippingStatus: o.shippingStatus ?? null,
          trackingNumber: o.trackingNumber ?? null,
          carrier: o.carrier ?? null,

          totals: o.totals ?? null,
        };

        // 👑 ADMIN → full data
        if (role === "admin") {
          return {
            ...base,
            total:
              typeof o?.totals?.totalTTC === "number"
                ? o.totals.totalTTC
                : 0,
          };
        }

        // 📦 LOGISTICS → sans prix
        return {
          ...base,
          totals: null,
          total: 0,
        };
      })
      // 🔥 TRI SAFE côté JS
      .sort((a, b) => {
        const da =
          a.createdAt?.toDate?.()?.getTime?.() ||
          new Date(a.createdAt || 0).getTime() ||
          0;

        const db =
          b.createdAt?.toDate?.()?.getTime?.() ||
          new Date(b.createdAt || 0).getTime() ||
          0;

        return db - da;
      });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err: any) {
    console.error("[admin/orders] GET error:", err);

    return NextResponse.json(
      {
        error: "Orders failed",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE ORDER
========================================================= */

export async function DELETE(req: Request) {
  const auth = assertAdminOrLogistics(req);
  if (auth) return auth;

  const role = getRoleFromRequest(req);

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

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
      {
        error: "Delete failed",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}