// src/app/api/admin/orders/export/route.ts

import { NextResponse } from "next/server";
import { loadOrdersForExport } from "@/server/orders/loadOrdersForExport";
import { buildExportData } from "@/server/exports/buildExportData";
import { buildCSV } from "@/server/exports/csv";
import { buildExcel } from "@/server/exports/excel";
import { buildPDF } from "@/server/exports/pdf";

/* ================= AUTH ================= */

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/* ================= DATE ================= */

function parseDate(v: any): Date | null {
  if (!v) return null;

  // Firestore Timestamp
  if (typeof v?.toDate === "function") {
    try {
      return v.toDate();
    } catch {}
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getOrderDate(order: any): Date | null {
  return (
    parseDate(order.createdAt) ||
    parseDate(order.paidAt) ||
    parseDate(order.updatedAt) ||
    null
  );
}

// 🔥 FORMAT SAFE (clé du fix)
function toYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toYM(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/* ================= ROUTE ================= */

export async function GET(req: Request) {
  try {
    const auth = assertAdmin(req);
    if (auth) return auth;

    const { searchParams } = new URL(req.url);

    const format = (searchParams.get("format") || "csv").toLowerCase();
    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const allOrders = await loadOrdersForExport();

    console.log("ALL ORDERS:", allOrders.length);

    /* ================= FILTER (FIX FINAL) ================= */

    let filtered = allOrders.filter((o) => getOrderDate(o));

    // JOUR
    if (day) {
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        if (!d) return false;
        return toYMD(d) === day;
      });
    }

    // MOIS
    if (month) {
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        if (!d) return false;
        return toYM(d) === month;
      });
    }

    // RANGE
    if (from && to) {
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        if (!d) return false;

        const current = toYMD(d);
        return current >= from && current <= to;
      });
    }

    console.log("FILTERED:", filtered.length);

    /* ================= SORT ================= */

    filtered.sort((a, b) => {
      const da = getOrderDate(a)?.getTime() || 0;
      const db = getOrderDate(b)?.getTime() || 0;
      return db - da;
    });

    /* ================= DATA ================= */

    const data = filtered.map(buildExportData);

    console.log("DATA SAMPLE:", data.slice(0, 2));

    const now = new Date().toISOString().slice(0, 10);

    /* ================= CSV ================= */

    if (format === "csv") {
      return new Response(buildCSV(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="orders_${now}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    /* ================= EXCEL ================= */

    if (format === "xlsx" || format === "accounting_xlsx") {
      const buffer = await buildExcel(data);

      return new Response(buffer as ArrayBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="orders_${now}.xlsx"`,
          "Cache-Control": "no-store",
        },
      });
    }

    /* ================= PDF ================= */

    const pdf = await buildPDF(data);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orders_${now}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[EXPORT ERROR]", err);

    return NextResponse.json(
      {
        error: "Export failed",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}