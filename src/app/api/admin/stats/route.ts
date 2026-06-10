// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { COUNTRIES } from "@/lib/countries";

// ✅ IMPORTANT
import { getLogisticStatus } from "@/app/admin/orders/domain/logistics";

export const dynamic = "force-dynamic";

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

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
  );
}

function startOfYear(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
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

    const productsCol =
      dbAdmin.collection("products");

    const ordersCol =
      dbAdmin.collection("orders");

    const paymentMethodsCol =
      dbAdmin.collection("payment_methods");

    const shippingMethodsCol =
      dbAdmin.collection("shipping_methods");

    const reviewsCol =
      dbAdmin.collection("reviews");

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
       ADMIN CONFIG
    ===================================================== */

    const [
      paymentMethodsSnap,
      shippingMethodsSnap,
      reviewsSnap,
    ] = await Promise.all([
      paymentMethodsCol.get(),
      shippingMethodsCol.get(),
      reviewsCol.get(),
    ]);

    const paymentMethods =
      paymentMethodsSnap.docs.map((d) =>
        d.data()
      );

    const shippingMethods =
      shippingMethodsSnap.docs.map((d) =>
        d.data()
      );

    const reviews =
      reviewsSnap.docs.map((d) =>
        d.data()
      );

    const paymentMethodsCount =
      paymentMethods.length;

    const activePaymentMethods =
      paymentMethods.filter(
        (m: any) => m?.isActive !== false
      ).length;

    const shippingMethodsCount =
      shippingMethods.length;

    const adminCountriesCount =
      COUNTRIES.length;

    const reviewsCount =
      reviews.length;

    const approvedReviews =
      reviews.filter(
        (r: any) => r?.status === "approved"
      ).length;

    const pendingReviews =
      reviews.filter(
        (r: any) => r?.status === "pending"
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

    type DashboardPeriod =
      | "day"
      | "7d"
      | "month"
      | "year"
      | "all";

    function buildPeriod(period: DashboardPeriod) {
      const earliestMs = Math.min(
        ...allOrders
          .map((order) => order._ms)
          .filter((ms) => ms > 0),
        todayStart.getTime()
      );

      let start = todayStart;
      let previousStart: Date | null = null;
      let points: Array<{
        label: string;
        start: number;
        end: number;
      }> = [];

      if (period === "day") {
        previousStart = addDays(todayStart, -1);
        points = Array.from({ length: 24 }, (_, hour) => {
          const pointStart =
            todayStart.getTime() + hour * 3600000;

          return {
            label: `${String(hour).padStart(2, "0")}h`,
            start: pointStart,
            end: pointStart + 3600000,
          };
        });
      } else if (period === "7d") {
        start = addDays(todayStart, -6);
        previousStart = addDays(start, -7);
        points = Array.from({ length: 7 }, (_, index) => {
          const day = addDays(start, index);

          return {
            label: new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            }).format(day),
            start: day.getTime(),
            end: addDays(day, 1).getTime(),
          };
        });
      } else if (period === "month") {
        start = startOfMonth(todayStart);
        previousStart = addMonths(start, -1);
        const days =
          Math.floor(
            (todayStart.getTime() - start.getTime()) / 86400000
          ) + 1;

        points = Array.from({ length: days }, (_, index) => {
          const day = addDays(start, index);

          return {
            label: new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            }).format(day),
            start: day.getTime(),
            end: addDays(day, 1).getTime(),
          };
        });
      } else if (period === "year") {
        start = startOfYear(todayStart);
        previousStart = addMonths(start, -12);
        points = Array.from({ length: 12 }, (_, index) => {
          const month = addMonths(start, index);

          return {
            label: new Intl.DateTimeFormat("fr-FR", {
              month: "short",
            }).format(month),
            start: month.getTime(),
            end: addMonths(month, 1).getTime(),
          };
        });
      } else {
        start = startOfMonth(new Date(earliestMs));
        const monthCount =
          (todayStart.getUTCFullYear() - start.getUTCFullYear()) *
            12 +
          todayStart.getUTCMonth() -
          start.getUTCMonth() +
          1;

        points = Array.from(
          { length: Math.max(monthCount, 1) },
          (_, index) => {
            const month = addMonths(start, index);

            return {
              label: new Intl.DateTimeFormat("fr-FR", {
                month: "short",
                year: "2-digit",
              }).format(month),
              start: month.getTime(),
              end: addMonths(month, 1).getTime(),
            };
          }
        );
      }

      const end = now.getTime();
      const periodOrders = allOrders.filter(
        (order) =>
          order._ms >= start.getTime() && order._ms <= end
      );
      const paidOrders = periodOrders.filter(
        (order) => order._status === "paid"
      );
      const pendingOrders = periodOrders.filter(
        (order) => order._status === "pending_payment"
      );
      const revenue = paidOrders.reduce(
        (sum, order) => sum + order._total,
        0
      );

      const previousEnd = start.getTime();
      const previousRevenue = previousStart
        ? allOrders
            .filter(
              (order) =>
                order._status === "paid" &&
                order._ms >= previousStart!.getTime() &&
                order._ms < previousEnd
            )
            .reduce((sum, order) => sum + order._total, 0)
        : 0;

      return {
        revenue: Number(revenue.toFixed(2)),
        previousRevenue: Number(previousRevenue.toFixed(2)),
        revenueDeltaPct:
          period === "all"
            ? 0
            : Number(pct(revenue, previousRevenue).toFixed(1)),
        ordersCount: periodOrders.length,
        paidOrdersCount: paidOrders.length,
        pendingCount: pendingOrders.length,
        aov: Number(
          (paidOrders.length ? revenue / paidOrders.length : 0).toFixed(
            2
          )
        ),
        series: points.map((point) => {
          const orders = allOrders.filter(
            (order) =>
              order._ms >= point.start && order._ms < point.end
          );
          const pointRevenue = orders
            .filter((order) => order._status === "paid")
            .reduce((sum, order) => sum + order._total, 0);

          return {
            day: point.label,
            revenue: Number(pointRevenue.toFixed(2)),
            orders: orders.length,
          };
        }),
      };
    }

    const periods = {
      day: buildPeriod("day"),
      "7d": buildPeriod("7d"),
      month: buildPeriod("month"),
      year: buildPeriod("year"),
      all: buildPeriod("all"),
    };

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
      allOrders.filter(
        (o) =>
          getLogisticStatus(o) ===
          "to_prepare"
      ).length;

    const shippedCount =
      allOrders.filter(
        (o) =>
          getLogisticStatus(o) ===
          "shipped"
      ).length;

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

    /* =====================================================
       PAYLOAD
    ===================================================== */

    const payload = {
      kpis: {
        productsCount,
        activeProducts,

        paymentMethodsCount,
        activePaymentMethods,
        shippingMethodsCount,
        adminCountriesCount,
        reviewsCount,
        approvedReviews,
        pendingReviews,

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
      periods,

      lastOrders,

      alerts,
    };

    return NextResponse.json(
      payload,
      {
        headers: {
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
