// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const dynamic = "force-dynamic";

/* =========================
   Cache mémoire (30s)
========================= */
let __cache: { at: number; data: any } | null = null;
const CACHE_TTL = 30_000;

/* =========================
   Dates Europe/Paris
========================= */
function parisStartOfDay(d: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(parts.find(p => p.type === "year")?.value);
  const m = Number(parts.find(p => p.type === "month")?.value);
  const day = Number(parts.find(p => p.type === "day")?.value);

  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0));
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/* =========================
   Totaux commandes
========================= */
function orderTotalEUR(order: any): number {
  return typeof order?.totals?.totalTTC === "number"
    ? order.totals.totalTTC
    : 0;
}

function pct(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

/* =========================
   API
========================= */
export async function GET() {
  try {
    /* =========================
       Cache
    ========================= */
    if (__cache && Date.now() - __cache.at < CACHE_TTL) {
      return NextResponse.json(__cache.data, {
        headers: { "x-stats-cache": "HIT", "Cache-Control": "no-store" },
      });
    }

    const productsCol = dbAdmin.collection("products");
    const ordersCol = dbAdmin.collection("orders");
    const statsRef = dbAdmin.doc("stats/global");

    const now = new Date();
    const todayStart = parisStartOfDay(now);
    const yesterdayStart = addDays(todayStart, -1);
    const last7Start = addDays(todayStart, -6);
    const prev7Start = addDays(last7Start, -7);

    /* =========================
       STATS GLOBAL (SOURCE)
    ========================= */
    const statsSnap = await statsRef.get();
    const stats = statsSnap.data() ?? {};

    const productsCount = Number(stats.productsCount ?? 0);
    const activeProducts = Number(stats.activeProducts ?? 0);
    const ordersCount = Number(stats.ordersCount ?? 0);
    const paidOrdersCount = Number(stats.paidOrdersCount ?? 0);
    const pendingCount = Math.max(0, ordersCount - paidOrdersCount);

    /* =========================
       LOW STOCK
    ========================= */
    const lowStockSnap = await productsCol
      .where("stock", "<=", 3)
      .orderBy("stock", "asc")
      .limit(5)
      .get();

    const lowStock = lowStockSnap.docs.map(d => {
      const p: any = d.data();
      return {
        id: d.id,
        name: p?.name?.fr ?? p?.name ?? "Produit",
        stock: Number(p?.stock ?? 0),
      };
    });

    /* =========================
       LAST ORDERS
    ========================= */
    const lastOrdersSnap = await ordersCol
      .orderBy("createdAt", "desc")
      .limit(8)
      .get();

    const lastOrders = lastOrdersSnap.docs.map(d => {
      const o: any = d.data();
      const iso =
        o?.createdAt?.toDate?.()?.toISOString?.() ??
        (typeof o?.createdAt === "string" ? o.createdAt : null);

      return {
        id: d.id,
        status: o?.status ?? "unknown",
        total: orderTotalEUR(o),
        email: o?.email ?? "",
        createdAt: iso,
      };
    });

    /* =========================
       REVENUS (14 jours)
    ========================= */
    const paid14Snap = await ordersCol
      .where("status", "==", "paid")
      .where("createdAt", ">=", prev7Start)
      .get();

    const paidOrders = paid14Snap.docs.map(d => {
      const o: any = d.data();
      return {
        ...o,
        _ms: o?.createdAt?.toDate?.()?.getTime?.() ?? 0,
      };
    });

    const todayMs = todayStart.getTime();
    const yesterdayMs = yesterdayStart.getTime();
    const last7Ms = last7Start.getTime();
    const prev7Ms = prev7Start.getTime();

    const revenueLast7 = paidOrders
      .filter(o => o._ms >= last7Ms)
      .reduce((s, o) => s + orderTotalEUR(o), 0);

    const revenuePrev7 = paidOrders
      .filter(o => o._ms >= prev7Ms && o._ms < last7Ms)
      .reduce((s, o) => s + orderTotalEUR(o), 0);

    const revenueToday = paidOrders
      .filter(o => o._ms >= todayMs)
      .reduce((s, o) => s + orderTotalEUR(o), 0);

    const revenueYesterday = paidOrders
      .filter(o => o._ms >= yesterdayMs && o._ms < todayMs)
      .reduce((s, o) => s + orderTotalEUR(o), 0);

    const paidLast7Count = paidOrders.filter(o => o._ms >= last7Ms).length;
    const aov = paidLast7Count > 0 ? revenueLast7 / paidLast7Count : 0;

    /* =========================
       SERIES 7 JOURS
    ========================= */
    const series = Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(last7Start, i);
      const start = day.getTime();
      const end = addDays(day, 1).getTime();

      const revenue = paidOrders
        .filter(o => o._ms >= start && o._ms < end)
        .reduce((s, o) => s + orderTotalEUR(o), 0);

      return {
        day: day.toISOString().slice(0, 10),
        revenue: Number(revenue.toFixed(2)),
      };
    });

    /* =========================
       ALERTS
    ========================= */
    const alerts: any[] = [];

    if (pendingCount > 0) {
      alerts.push({
        tone: "info",
        title: "Commandes en attente",
        desc: `${pendingCount} commande(s) non traitée(s).`,
      });
    }

    if (lowStock.length > 0) {
      alerts.push({
        tone: "warn",
        title: "Stock faible",
        desc: `${lowStock.length} produit(s) ont un stock ≤ 3.`,
      });
    }

    /* =========================
       PAYLOAD FINAL
    ========================= */
    const payload = {
      kpis: {
        productsCount,
        activeProducts,
        ordersCount,
        paidOrdersCount,
        pendingCount,
        revenueLast7: Number(revenueLast7.toFixed(2)),
        revenuePrev7: Number(revenuePrev7.toFixed(2)),
        revenueToday: Number(revenueToday.toFixed(2)),
        revenueYesterday: Number(revenueYesterday.toFixed(2)),
        aov: Number(aov.toFixed(2)),
      },
      deltas: {
        revenue7dPct: Number(pct(revenueLast7, revenuePrev7).toFixed(1)),
        revenueDayPct: Number(pct(revenueToday, revenueYesterday).toFixed(1)),
      },
      series,
      lastOrders,
      lowStock,
      alerts,
    };

    __cache = { at: Date.now(), data: payload };

    return NextResponse.json(payload, {
      headers: { "x-stats-cache": "MISS", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("❌ admin/stats error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Stats error" },
      { status: 500 }
    );
  }
}
