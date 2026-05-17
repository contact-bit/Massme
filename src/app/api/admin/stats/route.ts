// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";

export const dynamic = "force-dynamic";

/* =========================================================
   CACHE
========================================================= */

let __cache: {
  at: number;
  data: any;
} | null = null;

const CACHE_TTL = 30_000;

/* =========================================================
   DATES EUROPE/PARIS
========================================================= */

function parisStartOfDay(d: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(
    parts.find((p) => p.type === "year")?.value
  );

  const m = Number(
    parts.find((p) => p.type === "month")?.value
  );

  const day = Number(
    parts.find((p) => p.type === "day")?.value
  );

  return new Date(
    Date.UTC(y, m - 1, day, 0, 0, 0)
  );
}

function addDays(d: Date, n: number) {
  const x = new Date(d);

  x.setUTCDate(x.getUTCDate() + n);

  return x;
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeOrderStatus(order: any): string {
  const status =
    order?.status ||
    order?.paymentStatus ||
    order?.payment?.status ||
    order?.shipstation?.status ||
    "unknown";

  const s = String(status).toLowerCase();

  if (
    s === "pending" ||
    s === "pending_payment" ||
    s === "awaiting_bank_transfer"
  ) {
    return "pending_payment";
  }

  if (
    s === "paid" ||
    s === "completed"
  ) {
    return "paid";
  }

  if (s === "shipped") {
    return "shipped";
  }

  return s;
}

/* =========================================================
   TOTALS
========================================================= */

function orderTotalEUR(order: any): number {
  if (
    typeof order?.totals?.totalTTC === "number"
  ) {
    return order.totals.totalTTC;
  }

  if (typeof order?.total === "number") {
    return order.total;
  }

  if (typeof order?.__total === "number") {
    return order.__total;
  }

  return 0;
}

/* =========================================================
   DELTAS
========================================================= */

function pct(
  current: number,
  previous: number
) {
  if (previous === 0 && current === 0) {
    return 0;
  }

  if (previous === 0) {
    return 100;
  }

  return (
    ((current - previous) / previous) * 100
  );
}

/* =========================================================
   API
========================================================= */

export async function GET() {
  try {

    /* =====================================================
       CACHE
    ===================================================== */

    if (
      __cache &&
      Date.now() - __cache.at < CACHE_TTL
    ) {
      return NextResponse.json(
        __cache.data,
        {
          headers: {
            "x-stats-cache": "HIT",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const productsCol =
      dbAdmin.collection("products");

    const ordersCol =
      dbAdmin.collection("orders");

    const now = new Date();

    const todayStart =
      parisStartOfDay(now);

    const yesterdayStart =
      addDays(todayStart, -1);

    const last7Start =
      addDays(todayStart, -6);

    const prev7Start =
      addDays(last7Start, -7);

    const monthStart =
      parisStartOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        )
      );

    /* =====================================================
       PRODUCTS
    ===================================================== */

    const productsSnap =
      await productsCol.get();

    const products =
      productsSnap.docs.map((d) =>
        d.data()
      );

    const productsCount =
      products.length;

    const activeProducts =
      products.filter(
        (p: any) => p?.active === true
      ).length;

    /* =====================================================
       ORDERS
    ===================================================== */

    const allOrdersSnap =
      await ordersCol.get();

    const allOrdersRaw =
      allOrdersSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

    const allOrders =
      allOrdersRaw.map((o) => {

        const rawDate =
          o?.createdAt?.toDate?.() ??
          (typeof o?.createdAt === "string"
            ? new Date(o.createdAt)
            : null);

        const ms =
          rawDate instanceof Date &&
          !isNaN(rawDate.getTime())
            ? rawDate.getTime()
            : 0;

        return {
          ...o,

          _ms: ms,

          _status:
            normalizeOrderStatus(o),

          _total:
            orderTotalEUR(o),
        };
      });

    const nowMs = now.getTime();

    const monthStartMs =
      monthStart.getTime();

    /* =====================================================
       MONTH ORDERS
    ===================================================== */

    const monthOrders =
      allOrders.filter((o) => {

        if (
          !o._ms ||
          o._ms < monthStartMs ||
          o._ms > nowMs
        ) {
          return false;
        }

        return (
          o._status === "paid" ||
          o._status ===
            "pending_payment"
        );
      });

    const ordersCount =
      monthOrders.length;

    const paidOrdersCount =
      monthOrders.filter(
        (o) => o._status === "paid"
      ).length;

    const pendingCount =
      monthOrders.filter(
        (o) =>
          o._status ===
          "pending_payment"
      ).length;

    /* =====================================================
       LOGISTICS KPI
    ===================================================== */
const toPrepareCount =
  allOrders.filter((o) => {

    const shippingStatus = String(
      o?.shipping?.status ||
      o?.shipstation?.status ||
      ""
    ).toLowerCase();

    return (
      shippingStatus === "to_prepare" ||
      shippingStatus === "pending" ||
      shippingStatus === "preparing"
    );
  }).length;

const shippedCount =
  allOrders.filter((o) => {

    const shippingStatus = String(
      o?.shipping?.status ||
      o?.shipstation?.status ||
      ""
    ).toLowerCase();

    return (
      shippingStatus === "shipped"
    );
  }).length;
  
  /* =====================================================
       LOW STOCK
    ===================================================== */

    const lowStockSnap =
      await productsCol
        .where("stock", "<=", 3)
        .orderBy("stock", "asc")
        .limit(20)
        .get();

    const lowStock =
      lowStockSnap.docs
        .map((d) => {
          const p: any = d.data();

          const manageStock =
            typeof p?.manageStock ===
            "boolean"
              ? p.manageStock
              : false;

          return {
            id: d.id,

            name:
              p?.name?.fr ??
              p?.name ??
              "Produit",

            stock: Number(
              p?.stock ?? 0
            ),

            manageStock,
          };
        })

        .filter((p) => p.manageStock)

        .map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
        }));

    /* =====================================================
       LAST ORDERS
    ===================================================== */

    const lastOrdersSnap =
      await ordersCol
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(8)
        .get();

    const lastOrders =
      lastOrdersSnap.docs.map((d) => {

        const o: any = d.data();

        const iso =
          o?.createdAt
            ?.toDate?.()
            ?.toISOString?.() ??
          (typeof o?.createdAt ===
          "string"
            ? o.createdAt
            : null);

        return {
          id: d.id,

          orderNumber:
            o?.orderNumber ?? null,

          status:
            normalizeOrderStatus(o),

          total:
            orderTotalEUR(o),

          email:
            o?.email ?? "",

          createdAt: iso,
        };
      });

    /* =====================================================
       REVENUE
    ===================================================== */

    const paid14 =
      allOrders.filter(
        (o) =>
          o._status === "paid" &&
          o._ms >=
            prev7Start.getTime()
      );

    const todayMs =
      todayStart.getTime();

    const yesterdayMs =
      yesterdayStart.getTime();

    const last7Ms =
      last7Start.getTime();

    const prev7Ms =
      prev7Start.getTime();

    const revenueLast7 =
      paid14
        .filter(
          (o) => o._ms >= last7Ms
        )
        .reduce(
          (s, o) => s + o._total,
          0
        );

    const revenuePrev7 =
      paid14
        .filter(
          (o) =>
            o._ms >= prev7Ms &&
            o._ms < last7Ms
        )
        .reduce(
          (s, o) => s + o._total,
          0
        );

    const revenueToday =
      paid14
        .filter(
          (o) => o._ms >= todayMs
        )
        .reduce(
          (s, o) => s + o._total,
          0
        );

    const revenueYesterday =
      paid14
        .filter(
          (o) =>
            o._ms >= yesterdayMs &&
            o._ms < todayMs
        )
        .reduce(
          (s, o) => s + o._total,
          0
        );

    const paidLast7Count =
      paid14.filter(
        (o) => o._ms >= last7Ms
      ).length;

    const aov =
      paidLast7Count > 0
        ? revenueLast7 /
          paidLast7Count
        : 0;

    /* =====================================================
       SERIES
    ===================================================== */

    const series = Array.from({
      length: 7,
    }).map((_, i) => {

      const day =
        addDays(last7Start, i);

      const start =
        day.getTime();

      const end =
        addDays(day, 1).getTime();

      const revenue =
        paid14
          .filter(
            (o) =>
              o._ms >= start &&
              o._ms < end
          )
          .reduce(
            (s, o) =>
              s + o._total,
            0
          );

      return {
        day:
          new Intl.DateTimeFormat(
            "fr-FR",
            {
              day: "2-digit",
              month: "2-digit",
            }
          ).format(day),

        revenue: Number(
          revenue.toFixed(2)
        ),
      };
    });

    /* =====================================================
       ALERTS
    ===================================================== */

    const alerts: any[] = [];

    if (pendingCount > 0) {
      alerts.push({
        tone: "info",

        title:
          "Commandes en attente",

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

    /* =====================================================
       PAYLOAD
    ===================================================== */

    const payload = {
      kpis: {
        productsCount,
        activeProducts,

        ordersCount,
        paidOrdersCount,
        pendingCount,

        toPrepareCount,
        shippedCount,

        revenueLast7: Number(
          revenueLast7.toFixed(2)
        ),

        revenuePrev7: Number(
          revenuePrev7.toFixed(2)
        ),

        revenueToday: Number(
          revenueToday.toFixed(2)
        ),

        revenueYesterday: Number(
          revenueYesterday.toFixed(2)
        ),

        aov: Number(
          aov.toFixed(2)
        ),
      },

      deltas: {
        revenue7dPct: Number(
          pct(
            revenueLast7,
            revenuePrev7
          ).toFixed(1)
        ),

        revenueDayPct: Number(
          pct(
            revenueToday,
            revenueYesterday
          ).toFixed(1)
        ),
      },

      series,

      lastOrders,

      lowStock,

      alerts,
    };

    __cache = {
      at: Date.now(),
      data: payload,
    };

    return NextResponse.json(
      payload,
      {
        headers: {
          "x-stats-cache": "MISS",
          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (err: any) {

    console.error(
      "❌ admin/stats error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ??
          "Stats error",
      },
      {
        status: 500,
      }
    );
  }
}