import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const dynamic = "force-dynamic";

/* =========================
   Helpers Dates (Europe/Paris)
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

  // UTC minuit sur la date "Paris"
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
}

function addDaysUTC(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function toMs(v: any) {
  try {
    if (!v) return 0;
    if (typeof v === "string") return new Date(v).getTime();
    if (typeof v === "number") return v;
    if (v?.toDate) return v.toDate().getTime(); // Firestore Timestamp
    if (typeof v?.seconds === "number") return v.seconds * 1000; // raw timestamp-like
    return 0;
  } catch {
    return 0;
  }
}

/* =========================
   Helpers Montants
========================= */

function orderTotalEUR(order: any) {
  // Cas 1: total déjà calculé
  if (typeof order?.total === "number") return order.total;

  // Cas 2: Stripe amount_total en cents
  if (typeof order?.amount_total === "number") return order.amount_total / 100;

  // Cas 3: recalcul items + shipping
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

/* =========================
   Route
========================= */

export async function GET() {
  try {
    // ⚠️ Adapte si ton nom de collection diffère
    const productsCol = dbAdmin.collection("products");
    const ordersCol = dbAdmin.collection("pending_orders");

    /* ---------- PRODUCTS ---------- */
    const productsSnap = await productsCol.get();
    const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const productsCount = products.length;
    const activeProducts = products.filter((p) => p.isActive !== false).length;

    const lowStock = products
      .filter((p) => typeof p.stock === "number" && p.stock <= 3)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p?.name?.fr ?? p?.name ?? "Produit",
        stock: p.stock ?? 0,
      }));

    /* ---------- ORDERS ---------- */
    const allOrdersSnap = await ordersCol.get();
    const allOrders = allOrdersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const ordersCount = allOrders.length;
    const paidOrders = allOrders.filter((o) => o.status === "paid");
    const paidOrdersCount = paidOrders.length;
    const pendingCount = allOrders.filter((o) => o.status !== "paid").length;

    /* ---------- TIME WINDOWS (Paris) ---------- */
    const now = new Date();
    const todayStart = parisStartOfDay(now);
    const yesterdayStart = addDaysUTC(todayStart, -1);

    const last7Start = addDaysUTC(todayStart, -6); // 7 jours incluant aujourd'hui
    const prev7Start = addDaysUTC(last7Start, -7);

    const todayStartMs = todayStart.getTime();
    const yesterdayStartMs = yesterdayStart.getTime();
    const last7StartMs = last7Start.getTime();
    const prev7StartMs = prev7Start.getTime();

    /* ---------- paid orders with timestamp ---------- */
    const paidWithTime = paidOrders
      .map((o) => ({ ...o, __ms: toMs(o.createdAt) }))
      .filter((o) => o.__ms > 0);

    // Revenus (si createdAt manque => ces blocs seront à 0, mais l’API ne crashe pas)
    const revenueLast7 = paidWithTime
      .filter((o) => o.__ms >= last7StartMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenuePrev7 = paidWithTime
      .filter((o) => o.__ms >= prev7StartMs && o.__ms < last7StartMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenueToday = paidWithTime
      .filter((o) => o.__ms >= todayStartMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    const revenueYesterday = paidWithTime
      .filter((o) => o.__ms >= yesterdayStartMs && o.__ms < todayStartMs)
      .reduce((sum, o) => sum + orderTotalEUR(o), 0);

    // AOV (panier moyen)
    const aov = paidOrdersCount > 0 ? revenueLast7 / paidOrdersCount : 0;

    /* ---------- Series 7 jours ---------- */
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

    /* ---------- Last orders ---------- */
    const lastOrders = allOrders
      .slice()
      .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
      .slice(0, 8)
      .map((o) => ({
        id: o.id,
        status: o.status ?? "unknown",
        total: Number(orderTotalEUR(o).toFixed(2)),
        email: o.customer?.email ?? o.email ?? "",
        createdAt:
          o.createdAt?.toDate?.()?.toISOString?.() ??
          (typeof o.createdAt === "string" ? o.createdAt : null),
      }));

    /* ---------- Alerts ---------- */
    const alerts: { tone: "info" | "warn" | "danger"; title: string; desc: string }[] = [];

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
      {
        error: e?.message ?? "Stats error",
        hint:
          "Vérifie dbAdmin, le nom de la collection (pending_orders), les champs status/createdAt, et les logs serveur.",
      },
      { status: 500 }
    );
  }
}
