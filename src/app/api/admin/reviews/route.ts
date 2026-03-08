// src/app/api/admin/reviews/route.ts
import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebaseAdmin";

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

    const rows = snap.docs.map((d) => {
      const r = d.data() || {};
      return {
        id: d.id,
        orderId: r.orderId || d.id,
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

    return NextResponse.json({ ok: true, status, count: rows.length, rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "server_error", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}