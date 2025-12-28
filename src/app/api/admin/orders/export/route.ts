// src/app/api/admin/orders/export/route.ts
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { dbAdmin } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItem = {
  name?: any;
  price?: number | { eur?: number };
  quantity?: number;
};

type Order = {
  id: string;
  email?: string;
  status?: string;
  createdAt?: any;

  amount_total?: number;
  total?: number;

  shippingMethod?: { name?: string; price?: number | { eur?: number } };
  shippingPrice?: number;

  items?: OrderItem[];
};

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/* ---------- Date helpers ---------- */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfMonth(year: number, month1to12: number) {
  return new Date(year, month1to12 - 1, 1, 0, 0, 0, 0);
}
function endOfMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0, 23, 59, 59, 999);
}

function parseCreatedAt(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

/* ---------- Money helpers ---------- */
function getItemPrice(it: OrderItem): number {
  const p = it?.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object" && typeof p.eur === "number") return p.eur;
  return 0;
}
function getSubtotal(o: Order): number {
  const items = Array.isArray(o.items) ? o.items : [];
  return items.reduce((sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1), 0);
}
function getShipping(o: Order): number {
  const m = o.shippingMethod?.price;
  if (typeof m === "number") return m;
  if (m && typeof m === "object" && typeof (m as any).eur === "number") return (m as any).eur;
  if (typeof o.shippingPrice === "number") return o.shippingPrice;
  return 0;
}
function getTotal(o: Order): number {
  if (typeof o.amount_total === "number") return o.amount_total / 100;
  if (typeof o.total === "number") return o.total;
  return getSubtotal(o) + getShipping(o);
}
function euro(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/* ---------- CSV ---------- */
function toCSV(headers: string[], rows: string[][]) {
  const esc = (v: string) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

/* ---------- Fonts ---------- */
function mustFont(rel: string) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) {
    throw new Error(`Font missing in build: ${rel} (resolved: ${p})`);
  }
  return p;
}

/* ---------- PDF table (Body / BodyBold only) ---------- */
function drawPDFTable(
  doc: any,
  title: string,
  periodLabel: string,
  headers: string[],
  rows: string[][],
  totals: { subtotal: number; shipping: number; total: number }
) {
  const margin = 40;
  const pageWidth = doc.page.width;
  const usable = pageWidth - margin * 2;

  const baseW = [85, 115, 170, 90, 220, 60, 60, 60];
  const sumW = baseW.reduce((a: number, b: number) => a + b, 0);
  const scale = sumW > usable ? usable / sumW : 1;
  const widths = baseW.map((w: number) => Math.floor(w * scale));

  let y = margin;

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const drawHeader = () => {
    doc.font("BodyBold").fontSize(16).fillColor("#0b1220").text(title, margin, y);
    y += 18;

    doc.font("Body").fontSize(10).fillColor("#6b7280").text(periodLabel, margin, y);
    y += 18;

    doc.fillColor("#eef2ff").rect(margin, y, usable, 22).fill();

    doc.fillColor("#0b1220").font("BodyBold").fontSize(9);
    let x = margin;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 4, y + 6, { width: widths[i] - 8, ellipsis: true });
      x += widths[i];
    }

    y += 24;
    doc.font("Body").fontSize(9).fillColor("#111827");
  };

  const rowH = 18;
  drawHeader();

  rows.forEach((r, idx) => {
    if (y + rowH > doc.page.height - margin - 80) {
      newPage();
      drawHeader();
    }

    if (idx % 2 === 1) {
      doc.fillColor("#fafafa").rect(margin, y - 2, usable, rowH).fill();
      doc.fillColor("#111827");
    }

    let x = margin;
    for (let i = 0; i < r.length; i++) {
      doc.text(r[i], x + 4, y, { width: widths[i] - 8, ellipsis: true });
      x += widths[i];
    }
    y += rowH;
  });

  if (y + 70 > doc.page.height - margin) newPage();

  doc.fillColor("#ffffff").rect(margin, y + 12, usable, 54).fillAndStroke("#ffffff", "#e5e7eb");

  doc.fillColor("#0b1220").font("BodyBold").fontSize(10).text("Totaux", margin + 10, y + 18);

  doc.font("Body").fontSize(10).fillColor("#111827");
  doc.text(`Sous-total: ${euro(totals.subtotal)} €`, margin + 120, y + 18);
  doc.text(`Livraison: ${euro(totals.shipping)} €`, margin + 320, y + 18);
  doc.font("BodyBold").text(`Total: ${euro(totals.total)} €`, margin + 480, y + 18);
}

async function loadOrders(): Promise<Order[]> {
  const snap = await dbAdmin.collection("pending_orders").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any;
}

export async function GET(req: Request) {
  try {
    const auth = assertAdmin(req);
    if (auth) return auth;

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "pdf").toLowerCase();

    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let fromDate: Date;
    let toDate: Date;

    if (day) {
      const d = new Date(day);
      if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid day" }, { status: 400 });
      fromDate = startOfDay(d);
      toDate = endOfDay(d);
    } else if (month) {
      const [y, m] = month.split("-").map((x) => Number(x));
      if (!y || !m || m < 1 || m > 12) return NextResponse.json({ error: "Invalid month" }, { status: 400 });
      fromDate = startOfMonth(y, m);
      toDate = endOfMonth(y, m);
    } else if (from && to) {
      const a = new Date(from);
      const b = new Date(to);
      if (isNaN(a.getTime()) || isNaN(b.getTime()))
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
      fromDate = startOfDay(a);
      toDate = endOfDay(b);
    } else {
      const now = new Date();
      toDate = endOfDay(now);
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      fromDate = startOfDay(past);
    }

    const all = await loadOrders();

    const filtered = all.filter((o) => {
      const d = parseCreatedAt(o.createdAt);
      if (!d) return false;
      const t = d.getTime();
      return t >= fromDate.getTime() && t <= toDate.getTime();
    });

    const headers = ["Date", "ID", "Email", "Statut", "Articles", "ST", "Ship", "Total"];

    let sumSubtotal = 0;
    let sumShip = 0;
    let sumTotal = 0;

    const rows: string[][] = filtered.map((o) => {
      const d = parseCreatedAt(o.createdAt);
      const dateStr = d ? d.toISOString().slice(0, 10) : "—";

      const items = Array.isArray(o.items) ? o.items : [];
      const itemsLabel =
        items.length === 0
          ? "—"
          : items
              .map((it) => {
                const n = typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || "Produit";
                const q = it?.quantity ?? 1;
                return `${n} x${q}`;
              })
              .slice(0, 3)
              .join(" • ") + (items.length > 3 ? " …" : "");

      const st = getSubtotal(o);
      const sh = getShipping(o);
      const tt = getTotal(o);

      sumSubtotal += st;
      sumShip += sh;
      sumTotal += tt;

      return [dateStr, o.id, o.email || "—", o.status || "—", itemsLabel, euro(st), euro(sh), euro(tt)];
    });

    const filenameBase = `orders_${fromDate.toISOString().slice(0, 10)}_${toDate.toISOString().slice(0, 10)}`;

    // CSV
    if (format === "csv") {
      const csv = toCSV(headers, rows);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // PDF
    const periodLabel = `Période : ${fromDate.toISOString().slice(0, 10)} → ${toDate.toISOString().slice(0, 10)}`;

    /**
     * 🔑 IMPORTANT:
     * - autoFirstPage:false empêche PDFKit de créer une page automatiquement (sinon fallback Helvetica)
     * - on register les fonts AVANT doc.addPage()
     */
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
      autoFirstPage: false,
    });

    // ✅ Register fonts BEFORE any page/text
    const fontRegular = mustFont("src/assets/fonts/Inter-Regular.ttf");
    const fontBold = mustFont("src/assets/fonts/Inter-Bold.ttf");

    doc.registerFont("Body", fontRegular);
    doc.registerFont("BodyBold", fontBold);

    // ✅ Create first page AFTER fonts
    doc.addPage();
    doc.font("Body");

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    drawPDFTable(
      doc,
      "Export commandes",
      `${periodLabel} • ${filtered.length} commande(s)`,
      headers,
      rows,
      { subtotal: sumSubtotal, shipping: sumShip, total: sumTotal }
    );

    doc.end();

    const pdfBuffer = await done;
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[export] ERROR:", err);
    return NextResponse.json(
      {
        error: "Export failed",
        message: err?.message || String(err),
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
