// src/app/api/admin/reviews/route.ts
import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";

type ReviewDoc = {
  orderId?: string;
  email?: string;
  rating?: number | null;
  comment?: string;
  locale?: string;
  status?: string;
  createdAt?: any;
  items?: any[];
  moderatedAt?: any;
  moderatedBy?: string;
};

function getStatusParam(req: Request) {
  const { searchParams } = new URL(req.url);
  const s = String(searchParams.get("status") || "pending").trim();
  if (s === "pending" || s === "approved" || s === "rejected") return s;
  return "pending";
}

function getLimitParam(req: Request) {
  const { searchParams } = new URL(req.url);
  const n = Number(searchParams.get("limit") || 50);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(200, Math.floor(n)));
}

export async function GET(req: Request) {
  try {
    const db = getAdminDb();
    const status = getStatusParam(req);
    const limit = getLimitParam(req);

    const snap = await db
      .collection("reviews")
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    // ✅ typé correctement
    const reviews = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ReviewDoc),
    }));

    // 🔥 récupérer tous les orderId valides
    const orderIds = [
      ...new Set(
        reviews
          .map((r) => r.orderId)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    ];

    // 🔥 récupérer les commandes associées
    const ordersSnap = await Promise.all(
      orderIds.map((id) => db.collection("orders").doc(id).get())
    );

    const ordersMap = new Map<string, any>();

    for (const doc of ordersSnap) {
      if (doc.exists) {
        ordersMap.set(doc.id, doc.data());
      }
    }

    // 🔥 construire les rows
    const rows = reviews.map((r) => {
      const orderId = r.orderId || r.id;
      const order = ordersMap.get(orderId);

      return {
        id: r.id,
        orderId,

        // ✅ numéro client propre
        orderNumber: order?.orderNumber || orderId,

        email: r.email || "",
        rating: r.rating ?? null,
        comment: r.comment || "",
        locale: r.locale || "fr",
        status: r.status || status,

        createdAt: r.createdAt?.toDate?.()?.toISOString?.() || null,
        items: Array.isArray(r.items) ? r.items : [],

        moderatedAt: r.moderatedAt?.toDate?.()?.toISOString?.() || null,
        moderatedBy: r.moderatedBy || null,
      };
    });

    return NextResponse.json({
      ok: true,
      status,
      count: rows.length,
      rows,
    });
  } catch (e: any) {
    console.error("[admin/reviews] error:", e);

    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: e?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}