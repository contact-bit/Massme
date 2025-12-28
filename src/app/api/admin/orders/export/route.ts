// src/app/api/admin/orders/export/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

/* ---------- PDF helpers (pdf-lib uses WinAnsi for StandardFonts) ---------- */
function sanitizePdfText(s: string) {
  return String(s ?? "")
    .replaceAll("→", "->")
    .replaceAll("•", "-")
    .replaceAll("—", "-")
    .replaceAll("…", "...")
    .replaceAll("\u00A0", " "); // NBSP
}

async function loadOrders(): Promise<Order[]> {
  const snap = await dbAdmin.collection("pending_orders").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any;
}

/* ---------- PDF (pdf-lib) ---------- */
async function buildOrdersPdf(opts: {
  title: string;
  periodLabel: string;
  headers: string[];
  rows: string[][];
  totals: { subtotal: number; shipping: number; total: number };
}) {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // A4 landscape
  const pageSize: [number, number] = [842, 595];
  let page = pdfDoc.addPage(pageSize);

  const margin = 32;
  const width = page.getWidth();
  const height = page.getHeight();
  const usableW = width - margin * 2;

  // column widths (scaled)
  const base = [90, 140, 180, 90, 220, 60, 60, 70];
  const sum = base.reduce((a, b) => a + b, 0);
  const scale = sum > usableW ? usableW / sum : 1;
  const widths = base.map((w) => w * scale);

  const rowH = 16;
  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    bold = false,
    size = 9,
    color = rgb(0, 0, 0)
  ) => {
    page.drawText(sanitizePdfText(text), {
      x,
      y: yPos,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  const newPage = () => {
    page = pdfDoc.addPage(pageSize);
    y = height - margin;
  };

  const drawHeader = () => {
    drawText(opts.title, margin, y, true, 16, rgb(0.04, 0.07, 0.13));
    y -= 18;

    drawText(opts.periodLabel, margin, y, false, 10, rgb(0.42, 0.45, 0.5));
    y -= 18;

    // light header bar
    page.drawRectangle({
      x: margin,
      y: y - 10,
      width: usableW,
      height: 18,
      color: rgb(0.93, 0.95, 1),
    });

    let x = margin;
    for (let i = 0; i < opts.headers.length; i++) {
      drawText(opts.headers[i], x + 3, y - 6, true, 9, rgb(0.04, 0.07, 0.13));
      x += widths[i];
    }
    y -= 22;
  };

  drawHeader();

  for (let r = 0; r < opts.rows.length; r++) {
    if (y < margin + 80) {
      newPage();
      drawHeader();
    }

    const row = opts.rows[r];

    if (r % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: y - 2,
        width: usableW,
        height: rowH,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    let x = margin;
    for (let c = 0; c < row.length; c++) {
      const t = sanitizePdfText(String(row[c] ?? ""));
      const maxChars = c === 4 ? 44 : c === 2 ? 28 : 18;
      const s = t.length > maxChars ? t.slice(0, maxChars - 1) + "…" : t; // "…" will be sanitized on draw

      drawText(s, x + 3, y, false, 9, rgb(0.07, 0.09, 0.12));
      x += widths[c];
    }

    y -= rowH;
  }

  if (y < margin + 60) newPage();

  // totals box
  page.drawRectangle({
    x: margin,
    y: y - 40,
    width: usableW,
    height: 48,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  drawText("Totaux", margin + 10, y - 22, true, 10, rgb(0.04, 0.07, 0.13));
  drawText(`Sous-total: ${euro(opts.totals.subtotal)} €`, margin + 120, y - 22, false, 10);
  drawText(`Livraison: ${euro(opts.totals.shipping)} €`, margin + 340, y - 22, false, 10);
  drawText(`Total: ${euro(opts.totals.total)} €`, margin + 560, y - 22, true, 10);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
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
      if (isNaN(a.getTime()) || isNaN(b.getTime()) || a > b) {
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
      }
      fromDate = startOfDay(a);
      toDate = endOfDay(b);
    } else {
      const now = new Date();
      toDate = endOfDay(now);
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      fromDate = startOfDay(past);
    }

    const periodLabel = sanitizePdfText(
      `Période : ${fromDate.toISOString().slice(0, 10)} -> ${toDate.toISOString().slice(0, 10)}`
    );

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
              .join(" - ") + (items.length > 3 ? " ..." : "");

      const st = getSubtotal(o);
      const sh = getShipping(o);
      const tt = getTotal(o);

      sumSubtotal += st;
      sumShip += sh;
      sumTotal += tt;

      return [
        sanitizePdfText(dateStr),
        sanitizePdfText(o.id),
        sanitizePdfText(o.email || "—"),
        sanitizePdfText(o.status || "—"),
        sanitizePdfText(itemsLabel),
        sanitizePdfText(euro(st)),
        sanitizePdfText(euro(sh)),
        sanitizePdfText(euro(tt)),
      ];
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

    // PDF (pdf-lib, sans pdfkit)
    const pdfBuffer = await buildOrdersPdf({
      title: "Export commandes",
      periodLabel: `${periodLabel} - ${filtered.length} commande(s)`,
      headers: headers.map(sanitizePdfText),
      rows,
      totals: { subtotal: sumSubtotal, shipping: sumShip, total: sumTotal },
    });

    return new Response(new Uint8Array(pdfBuffer), {
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
      { error: "Export failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
