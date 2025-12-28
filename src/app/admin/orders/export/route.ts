import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { dbAdmin } from "@/lib/firebase.admin"; // <= ton admin SDK
import { Timestamp } from "firebase-admin/firestore";

type Order = {
  id: string;
  status?: string;
  email?: string;
  createdAt?: any;

  amount_total?: number;
  total?: number;

  shippingMethod?: { name?: string; price?: number };
  shippingPrice?: number;

  shippingAddress?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  items?: {
    name: any;
    quantity?: number;
    price?: any;
  }[];
};

function requireAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  if (!process.env.ADMIN_PASSWORD) return false;
  return pass && pass === process.env.ADMIN_PASSWORD;
}

function toDateMs(createdAt: any): number {
  // Firestore Timestamp
  if (createdAt?.toDate) return createdAt.toDate().getTime();
  // { seconds }
  if (typeof createdAt?.seconds === "number") return createdAt.seconds * 1000;
  // ISO string
  if (typeof createdAt === "string") {
    const ms = Date.parse(createdAt);
    return Number.isFinite(ms) ? ms : 0;
  }
  // JS Date
  if (createdAt instanceof Date) return createdAt.getTime();
  return 0;
}

function getItemName(it: any) {
  if (!it?.name) return "Produit";
  if (typeof it.name === "string") return it.name;
  // { fr/en }
  return it.name.fr || it.name.en || "Produit";
}

function getItemPrice(it: any): number {
  if (typeof it?.price === "number") return it.price;
  if (typeof it?.price?.eur === "number") return it.price.eur;
  return 0;
}

function calcSubtotal(o: Order) {
  return (o.items || []).reduce((sum, it) => sum + getItemPrice(it) * (it.quantity || 1), 0);
}

function calcShipping(o: Order) {
  if (typeof o.shippingMethod?.price === "number") return o.shippingMethod.price;
  if (typeof o.shippingPrice === "number") return o.shippingPrice;
  return 0;
}

function calcTotal(o: Order) {
  if (typeof o.amount_total === "number") return o.amount_total / 100;
  if (typeof o.total === "number") return o.total;
  return calcSubtotal(o) + calcShipping(o);
}

function fmtDate(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCSV(rows: any[]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

function drawPDFTable(doc: PDFDocument, headers: string[], rows: string[][]) {
  const pageWidth = doc.page.width;
  const margin = 40;
  const usable = pageWidth - margin * 2;

  // colonnes “simples” (ajuste si tu veux)
  const colW = [90, 110, 70, 180, 80, 110]; // date, id, status, email, total, items
  const scale = usable / colW.reduce((a, b) => a + b, 0);
  const widths = colW.map((w) => w * scale);

  let y = doc.y;

  const rowH = 18;

  // header row
  doc.fontSize(10).font("Helvetica-Bold");
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y + 4, { width: widths[i] - 8, ellipsis: true });
    x += widths[i];
  });
  y += rowH;

  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor("#e5e7eb").stroke();

  doc.font("Helvetica").fontSize(9);

  for (const r of rows) {
    // nouvelle page si besoin
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }

    let xx = margin;
    r.forEach((cell, i) => {
      doc.text(cell, xx + 4, y + 4, { width: widths[i] - 8, ellipsis: true });
      xx += widths[i];
    });

    y += rowH;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor("#f1f5f9").stroke();
  }

  doc.y = y + 10;
}

export async function GET(req: Request) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "csv").toLowerCase(); // csv|pdf
    const from = url.searchParams.get("from"); // YYYY-MM-DD
    const to = url.searchParams.get("to");     // YYYY-MM-DD
    const status = url.searchParams.get("status") || "all"; // all|paid|pending_payment

    const fromMs = from ? Date.parse(from + "T00:00:00.000Z") : 0;
    const toMs = to ? Date.parse(to + "T23:59:59.999Z") : 0;

    // Query Firestore
    // On essaye d’abord un filtrage Firestore si createdAt est un Timestamp
    // Sinon fallback filtrage local.
    let snap;
    const col = dbAdmin.collection("pending_orders");

    // tentative query timestamp
    const canRangeQuery = Boolean(fromMs || toMs);
    if (canRangeQuery) {
      let q: any = col;

      if (fromMs) q = q.where("createdAt", ">=", Timestamp.fromMillis(fromMs));
      if (toMs) q = q.where("createdAt", "<=", Timestamp.fromMillis(toMs));
      // si index absent ou createdAt pas timestamp => ça peut throw
      snap = await q.get().catch(() => null);
    }

    if (!snap) {
      snap = await col.get();
    }

    let orders: Order[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() || {}) }));

    // filtre local dates
    if (fromMs) orders = orders.filter((o) => toDateMs(o.createdAt) >= fromMs);
    if (toMs) orders = orders.filter((o) => toDateMs(o.createdAt) <= toMs);

    // filtre status
    if (status !== "all") orders = orders.filter((o) => (o.status || "") === status);

    // Tri desc
    orders.sort((a, b) => toDateMs(b.createdAt) - toDateMs(a.createdAt));

    // build rows
    const header = ["Date", "Order ID", "Status", "Email", "Total (€)", "Articles"];
    const rows = orders.map((o) => {
      const ms = toDateMs(o.createdAt);
      const total = calcTotal(o);
      const itemsStr = (o.items || [])
        .map((it) => `${getItemName(it)} x${it.quantity || 1}`)
        .join(" | ");

      return [
        fmtDate(ms),
        o.id,
        o.status || "",
        o.email || "",
        total.toFixed(2),
        itemsStr,
      ];
    });

    const labelFrom = from || "all";
    const labelTo = to || "all";
    const filenameBase = `orders_${labelFrom}_to_${labelTo}_${status}`;

    // CSV
    if (format === "csv") {
      const csv = buildCSV([header, ...rows]);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    // PDF
    if (format === "pdf") {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (c) => chunks.push(c));
      const done = new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
      });

      doc.font("Helvetica-Bold").fontSize(16).text("Export commandes", { align: "left" });
      doc.moveDown(0.2);
      doc.font("Helvetica").fontSize(10).fillColor("#334155").text(
        `Période: ${labelFrom} → ${labelTo} | Statut: ${status} | Total: ${orders.length} commande(s)`
      );
      doc.moveDown(0.8);

      drawPDFTable(doc, header, rows);

      // Résumé
      const totalRevenue = orders.reduce((sum, o) => sum + calcTotal(o), 0);
      doc.moveDown(0.6);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(
        `Chiffre d'affaires (sur la sélection): ${totalRevenue.toFixed(2)} €`
      );

      doc.end();
      const pdf = await done;

      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (e: any) {
    console.error("Export error:", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
