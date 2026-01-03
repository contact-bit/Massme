// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

type AlertTone = "info" | "warn" | "danger";

export const dynamic = "force-dynamic";

/* =========================
   Dates (Europe/Paris)
========================= */
function parisStartOfDay(d: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
}
function addDaysUTC(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/* =========================
   Montants
========================= */
function orderTotalEUR(order: any) {
  if (typeof order?.total === "number") return order.total;
  if (typeof order?.amount_total === "number") return order.amount_total / 100;

  const subtotal =
    order?.items?.reduce((sum: number, item: any) => {
      const price =
        typeof item?.price === "number"
          ? item.price
          : Number(item?.price?.eur ?? 0);
      const qty = Number(item?.quantity ?? 1);
      return sum + price * qty;
    }, 0) ?? 0;

  const shipping =
    typeof order?.shippingMethod?.price === "number"
      ? order.shippingMethod.price
      : Number(order?.shippingMethod?.price?.eur ?? 0);

  return subtotal + shipping;
}

function pct(a: number, b: number) {
  if (b === 0 && a === 0) return 0;
  if (b === 0) return 100;
  return ((a - b) / b) * 100;
}

export async function GET() {
  try {
    const productsCol = dbAdmin.collection("products");
    const ordersCol = dbAdmin.collection("pending_orders");

    // Fenêtres de temps
    const now = new Date();
    const todayStart = parisStartOfDay(now);
    const yesterdayStart = addDaysUTC(todayStart, -1);

    const last7Start = addDaysUTC(todayStart, -6);
    const prev7Start = addDaysUTC(last7Start, -7);

    // ✅ 1) COUNTS (ne lit pas tous les docs)
    const [
      productsCountSnap,
      activeProductsCountSnap,
      ordersCountSnap,
      paidOrdersCountSnap,
      pendingCountSnap,
    ] = await Promise.all([
      productsCol.count().get(),
      productsCol.where("isActive", "==", true).count().get(),
      ordersCol.count().get(),
      ordersCol.where("status", "==", "paid").count().get(),
      ordersCol.where("status", "!=", "paid").count().get(), // peut nécessiter index
    ]);

    const productsCount = productsCountSnap.data().count ?? 0;
    const activeProducts = activeProductsCountSnap.data().count ?? 0;
    const ordersCount = ordersCountSnap.data().count ?? 0;
    const paidOrdersCount = paidOrdersCountSnap.data().count ?? 0;
    const pendingCount = pendingCountSnap.data().count ?? 0;

    // ✅ 2) LOW STOCK : 5 docs max
    const lowStockSnap = await productsCol
      .where("stock", "<=", 3)
      .orderBy("stock", "asc")
      .limit(5)
      .get();

    const lowStock = lowStockSnap.docs.map((d) => {
      const p: any = d.data();
      return {
        id: d.id,
        name: p?.name?.fr ?? p?.name ?? "Produit",
        stock: typeof p?.stock === "number" ? p.stock : 0,
      };
    });

    // ✅ 3) LAST ORDERS : 8 docs max
    // ⚠️ createdAt doit être un Timestamp
    const lastOrdersSnap = await ordersCol
      .orderBy("createdAt", "desc")
      .limit(8)
      .get();

    const lastOrders = lastOrdersSnap.docs.map((d) => {
      const o: any = d.data();
      const iso =
        o?.createdAt?.toDate?.()?.toISOString?.() ??
        (typeof o?.createdAt === "string" ? o.createdAt : null);

      return {
        id: d.id,
        status: o?.status ?? "unknown",
        total: Number(orderTotalEUR(o).toFixed(2)),
        email: o?.customer?.email ?? o?.email ?? "",
        createdAt: iso,
      };
    });

    // ✅ 4) REVENUS : on ne lit que les payées sur 14 jours
    // (prev7Start -> today), ça limite drastiquement les reads
    const paid14Snap = await ordersCol
      .where("status", "==", "paid")
      .where("createdAt", ">=", prev7Start) // Timestamp
      .get();

    const paid14 = paid14Snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const todayMs = todayStart.getTime();
    const yesterdayMs = yesterdayStart.getTime();
    const last7Ms = last7Start.getTime();
    const prev7Ms = prev7Start.getTime();

    const toMs = (v: any) =>
      v?.toDate ? v.toDate().getTime() : typeof v === "string" ? new Date(v).getTime() : 0;

    const paidWithTime = paid14
      .map((o) => ({ ...o, __ms: toMs(o.createdAt) }))
      .filter((o) => o.__ms > 0);

    const revenueLast7 = paidWithTime
      .filter((o) => o.__ms >= last7Ms)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenuePrev7 = paidWithTime
      .filter((o) => o.__ms >= prev7Ms && o.__ms < last7Ms)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenueToday = paidWithTime
      .filter((o) => o.__ms >= todayMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenueYesterday = paidWithTime
      .filter((o) => o.__ms >= yesterdayMs && o.__ms < todayMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const aov = paidOrdersCount > 0 ? revenueLast7 / paidOrdersCount : 0;

    // Série 7 jours (à partir des mêmes docs déjà chargés)
    const series = Array.from({ length: 7 }).map((_, i) => {
      const day = addDaysUTC(last7Start, i);
      const dayStartMs = day.getTime();
      const nextDayMs = addDaysUTC(day, 1).getTime();

      const dayRevenue = paidWithTime
        .filter((o) => o.__ms >= dayStartMs && o.__ms < nextDayMs)
        .reduce((sum, o) => sum + orderTotalEUR(o), 0);

      return {
        day: day.toISOString().slice(0, 10),
        revenue: Number(dayRevenue.toFixed(2)),
      };
    });

    // Alerts
    const alerts: { tone: AlertTone; title: string; desc: string }[] = [];
    if (pendingCount > 0) {
      alerts.push({
        tone: "info",
        title: "Commandes à traiter",
        desc: `${pendingCount} commande(s) ne sont pas marquées payées.`,
      });
    }
    if (lowStock.length > 0) {
      alerts.push({
        tone: "warn",
        title: "Stock faible",
        desc: `${lowStock.length} produit(s) ont un stock ≤ 3.`,
      });
    }
    if (paidOrdersCount > 0 && paidWithTime.length === 0) {
      alerts.push({
        tone: "danger",
        title: "createdAt manquant",
        desc: "Des commandes payées existent, mais createdAt est absent : tendances (jour/7j) à 0.",
      });
    }

    return NextResponse.json({
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
    });
  } catch (e: any) {
    console.error("❌ /api/admin/stats error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Stats error" },
      { status: 500 }
    );
  }
}
