// src/app/api/admin/orders/export/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AddressLike = {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  address2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

type ShippingMethodLike = {
  name?: string;
  priceHT?: number;
  priceTTC?: number;
  vatRate?: number;
};

type PaymentMethodLike = {
  provider?: string;
  type?: string;
  label?: string;
};

type OrderItem = {
  id?: string;
  name?: string;
  priceHT?: number;
  quantity?: number;
};

type Order = {
  id: string;

  email?: string;
  status?: string;
  locale?: string;

  createdAt?: any;
  created_at?: any;
  date?: any;
  timestamp?: any;
  paidAt?: any;

  items?: OrderItem[];

  billingAddress?: AddressLike;
  shippingAddress?: AddressLike;
  shippingMethod?: ShippingMethodLike;
  paymentMethod?: PaymentMethodLike;

  relayPoint?: any;

  shippingPrice?: number;

  totals?: {
    country?: string;
    vatRate?: number;
    totalHT?: number;
    totalVAT?: number;
    totalTTC?: number;
    vatDisabled?: boolean;
  };

  heardFrom?: string | null;
  heardFromOther?: string | null;

  customerName?: string;
  phone?: string;
  paymentStatus?: string;
};

/* ---------------- Réglages compta ---------------- */

/**
 * Coût de fabrication par produit.
 * Modifie ici selon tes vrais coûts.
 */
const FAB_COST_BY_PRODUCT: Record<string, number> = {
  Vitrectromed: 0,
  Housse: 0,
};

/**
 * Commission Stripe estimative.
 * Exemple: 1.5% + 0.25€
 * Ajuste si besoin.
 */
function estimateStripeCommission(ttc: number) {
  return round2(ttc * 0.015 + 0.25);
}

/* ---------------- Auth ---------------- */

function assertAdmin(req: Request) {
  const pass = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || pass !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/* ---------------- Date helpers ---------------- */

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

function parseOrderDate(order: Order): Date | null {
  return (
    parseCreatedAt(order.createdAt) ||
    parseCreatedAt(order.created_at) ||
    parseCreatedAt(order.date) ||
    parseCreatedAt(order.timestamp) ||
    parseCreatedAt(order.paidAt) ||
    null
  );
}

function formatOrderDate(order: Order) {
  const d = parseOrderDate(order);
  if (!d) return "-";
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function formatFrenchDate(order: Order) {
  const d = parseOrderDate(order);
  if (!d) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/* ---------------- Formatting helpers ---------------- */

function num(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number) {
  return Math.round(num(n) * 100) / 100;
}

function euro(n: number) {
  return round2(n).toFixed(2);
}

function sanitizePdfText(s: string) {
  return String(s ?? "")
    .replaceAll("→", "->")
    .replaceAll("•", "-")
    .replaceAll("—", "-")
    .replaceAll("…", "...")
    .replaceAll("\u00A0", " ");
}

function truncateText(s: string, max: number) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 3) + "..." : s;
}

function yesNo(v: boolean | undefined) {
  if (v === true) return "Oui";
  if (v === false) return "Non";
  return "-";
}

/* ---------------- Order data helpers ---------------- */

function getOrderItems(order: Order): OrderItem[] {
  return Array.isArray(order.items) ? order.items : [];
}

function getItemQty(item: OrderItem): number {
  const q = Number(item?.quantity ?? 1);
  return q > 0 ? q : 1;
}

function getItemName(item: OrderItem): string {
  return String(item?.name || "Produit");
}

function getItemUnitPriceHT(item: OrderItem): number {
  return num(item?.priceHT);
}

function getItemLineTotalHT(item: OrderItem): number {
  return round2(getItemUnitPriceHT(item) * getItemQty(item));
}

function getProductsHT(order: Order): number {
  return round2(
    getOrderItems(order).reduce((sum, item) => sum + getItemLineTotalHT(item), 0)
  );
}

function getShippingHT(order: Order): number {
  return round2(num(order.shippingPrice ?? order.shippingMethod?.priceHT ?? 0));
}

function getVAT(order: Order): number {
  return round2(num(order.totals?.totalVAT ?? 0));
}

function getTotalHT(order: Order): number {
  const totalHT = round2(num(order.totals?.totalHT));
  if (totalHT > 0) return totalHT;

  return round2(getProductsHT(order) + getShippingHT(order));
}

function getTotalTTC(order: Order): number {
  const totalTTC = round2(num(order.totals?.totalTTC));
  if (totalTTC > 0) return totalTTC;

  return round2(getTotalHT(order) + getVAT(order));
}

function getVATRate(order: Order): number {
  return round2(num(order.totals?.vatRate ?? order.shippingMethod?.vatRate ?? 0));
}

function getShippingName(order: Order): string {
  return String(order.shippingMethod?.name || "Livraison");
}

function getCustomerName(order: Order): string {
  return String(
    order.billingAddress?.name ||
      order.shippingAddress?.name ||
      order.customerName ||
      "-"
  );
}

function splitFullName(fullName?: string) {
  const raw = String(fullName || "").trim();
  if (!raw) return { firstName: "-", lastName: "-" };

  const parts = raw.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "-" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
}

function getFirstName(order: Order) {
  return splitFullName(getCustomerName(order)).firstName;
}

function getLastName(order: Order) {
  return splitFullName(getCustomerName(order)).lastName;
}

function getPhone(order: Order): string {
  return String(
    order.billingAddress?.phone ||
      order.shippingAddress?.phone ||
      order.phone ||
      "-"
  );
}

function getPaymentLabel(order: Order): string {
  return String(
    order.paymentMethod?.label ||
      order.paymentMethod?.type ||
      order.paymentMethod?.provider ||
      "-"
  );
}

function getPaymentProvider(order: Order): string {
  return String(order.paymentMethod?.provider || "-");
}

function getPaymentStatus(order: Order): string {
  if (order.status === "paid") return "Payé";
  if (order.status === "pending_payment") return "En attente";
  return String(order.paymentStatus || order.status || "-");
}

function formatAddress(a?: AddressLike | null) {
  if (!a) return "-";

  const parts = [
    a.name,
    a.address,
    a.address2,
    [a.postalCode, a.city].filter(Boolean).join(" ").trim(),
    a.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

function getBillingAddressLabel(order: Order) {
  return formatAddress(order.billingAddress);
}

function getShippingAddressLabel(order: Order) {
  return formatAddress(order.shippingAddress);
}

function getRelayPointLabel(order: Order) {
  if (!order.relayPoint) return "-";

  if (typeof order.relayPoint === "string") return order.relayPoint;

  const rp = order.relayPoint;
  const parts = [
    rp.name,
    rp.label,
    rp.address,
    [rp.postalCode, rp.city].filter(Boolean).join(" ").trim(),
    rp.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

function getHeardFromLabel(order: Order) {
  if (order.heardFromOther) {
    return `${order.heardFrom || "Autre"}: ${order.heardFromOther}`;
  }
  return String(order.heardFrom || "-");
}

function getCountry(order: Order) {
  return String(
    order.totals?.country ||
      order.shippingAddress?.country ||
      order.billingAddress?.country ||
      "-"
  );
}

function getItemsLabel(order: Order) {
  const items = getOrderItems(order);
  if (!items.length) return "Aucun article";

  return items
    .map((item) => {
      const name = getItemName(item);
      const qty = getItemQty(item);
      const unitHT = getItemUnitPriceHT(item);
      const lineHT = getItemLineTotalHT(item);
      return `${name} x${qty} (${euro(unitHT)} € HT u. / ${euro(lineHT)} € HT ligne)`;
    })
    .join(" | ");
}

function getItemsDetailedLines(order: Order): string[] {
  const items = getOrderItems(order);
  if (!items.length) return ["Aucun article"];

  return items.map((item, index) => {
    const name = getItemName(item);
    const qty = getItemQty(item);
    const unitHT = getItemUnitPriceHT(item);
    const lineHT = getItemLineTotalHT(item);
    return `${index + 1}. ${name} - Qté: ${qty} - PU HT: ${euro(unitHT)} € - Ligne HT: ${euro(lineHT)} €`;
  });
}

function getTotalQty(order: Order) {
  return getOrderItems(order).reduce((sum, item) => sum + getItemQty(item), 0);
}

function getQtyHousse(order: Order) {
  return getOrderItems(order).reduce((sum, item) => {
    const name = getItemName(item).toLowerCase();
    return name.includes("housse") ? sum + getItemQty(item) : sum;
  }, 0);
}

function getPaymentCommission(order: Order) {
  const provider = getPaymentProvider(order).toLowerCase();
  const totalTTC = getTotalTTC(order);

  if (provider === "stripe") {
    return estimateStripeCommission(totalTTC);
  }

  return 0;
}

function getFabricationCost(order: Order) {
  return round2(
    getOrderItems(order).reduce((sum, item) => {
      const name = getItemName(item);
      const qty = getItemQty(item);
      const unitCost = num(FAB_COST_BY_PRODUCT[name] ?? 0);
      return sum + unitCost * qty;
    }, 0)
  );
}

function getGain(order: Order) {
  return round2(getTotalHT(order) - getPaymentCommission(order) - getFabricationCost(order));
}

/* ---------------- Debug helpers ---------------- */

function safeJson(value: any) {
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (val instanceof Timestamp) {
          return { _timestamp: val.toDate().toISOString() };
        }
        return val;
      },
      2
    );
  } catch {
    return "[unserializable]";
  }
}

function debugOrder(order: Order) {
  console.log("========== DEBUG ORDER ==========");
  console.log("ID:", order.id);
  console.log("TOP LEVEL KEYS:", Object.keys(order));
  console.log("ORDER JSON:", safeJson(order));
  console.log("EXTRACTED productsHT =", getProductsHT(order));
  console.log("EXTRACTED shippingHT =", getShippingHT(order));
  console.log("EXTRACTED vat =", getVAT(order));
  console.log("EXTRACTED totalHT =", getTotalHT(order));
  console.log("EXTRACTED totalTTC =", getTotalTTC(order));
  console.log("EXTRACTED paymentCommission =", getPaymentCommission(order));
  console.log("EXTRACTED fabricationCost =", getFabricationCost(order));
  console.log("EXTRACTED gain =", getGain(order));
  console.log("================================");
}

/* ---------------- CSV helpers ---------------- */

function toCSV(headers: string[], rows: string[][]) {
  const esc = (v: string) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

function buildAccountingCsvRows(order: Order): string[] {
  return [
    formatFrenchDate(order),            // Date
    order.id || "-",                    // ID
    order.status || "-",                // Statut
    getFirstName(order),                // Prénom
    getLastName(order),                 // Nom
    getCountry(order),                  // Pays
    getHeardFromLabel(order),           // Média
    String(getTotalQty(order)),         // Quantité
    String(getQtyHousse(order)),        // Quantité Housse
    getShippingName(order),             // Mode livraison
    euro(getShippingHT(order)),         // Coût livraison HT Mode
    getPaymentProvider(order),          // Paiement Mode
    euro(getPaymentCommission(order)),  // Paiement Com
    euro(getFabricationCost(order)),    // Cout Fabrication
    euro(getTotalHT(order)),            // CA HT
    euro(getVAT(order)),                // TVA
    euro(getTotalTTC(order)),           // CA TTC
    euro(getGain(order)),               // Gain
  ];
}

/* ---------------- Firestore load ---------------- */

async function loadOrders(): Promise<Order[]> {
  const results = await Promise.allSettled([
    dbAdmin.collection("orders").get(),
    dbAdmin.collection("pending_orders").get(),
  ]);

  const loaded: Order[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const d of result.value.docs) {
        loaded.push({
          id: d.id,
          ...(d.data() as any),
        });
      }
    }
  }

  const deduped = new Map<string, Order>();
  for (const order of loaded) {
    deduped.set(order.id, order);
  }

  const merged = Array.from(deduped.values());

  merged.sort((a, b) => {
    const da = parseOrderDate(a)?.getTime() ?? 0;
    const db = parseOrderDate(b)?.getTime() ?? 0;
    return db - da;
  });

  return merged;
}

/* ---------------- PDF ---------------- */

async function buildOrdersPdf(opts: {
  title: string;
  periodLabel: string;
  orders: Order[];
  totals: {
    productsHT: number;
    shippingHT: number;
    vat: number;
    totalHT: number;
    totalTTC: number;
  };
}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [842, 595];
  let page = pdfDoc.addPage(pageSize);

  const margin = 24;
  const width = page.getWidth();
  const height = page.getHeight();
  const usableW = width - margin * 2;

  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options?: { bold?: boolean; size?: number; gray?: number }
  ) => {
    const size = options?.size ?? 9;
    const bold = options?.bold ?? false;
    const gray = options?.gray ?? 0;

    page.drawText(sanitizePdfText(text), {
      x,
      y: yPos,
      size,
      font: bold ? fontBold : font,
      color: rgb(gray, gray, gray),
    });
  };

  const drawDivider = (yy: number) => {
    page.drawLine({
      start: { x: margin, y: yy },
      end: { x: width - margin, y: yy },
      thickness: 0.8,
      color: rgb(0.88, 0.9, 0.92),
    });
  };

  const drawHeader = () => {
    drawText(opts.title, margin, y, { bold: true, size: 16 });
    y -= 18;

    drawText(opts.periodLabel, margin, y, { size: 10, gray: 0.45 });
    y -= 15;

    drawText(
      `Commandes: ${opts.orders.length}   |   Produits HT: ${euro(opts.totals.productsHT)} €   |   Livraison HT: ${euro(opts.totals.shippingHT)} €   |   TVA: ${euro(opts.totals.vat)} €   |   Total HT: ${euro(opts.totals.totalHT)} €   |   Total TTC: ${euro(opts.totals.totalTTC)} €`,
      margin,
      y,
      { size: 9.5, bold: true }
    );
    y -= 18;

    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: usableW,
      height: 20,
      color: rgb(0.94, 0.96, 1),
    });

    drawText("Export admin complet des commandes", margin + 8, y + 2, {
      bold: true,
      size: 9,
    });

    y -= 18;
  };

  const newPage = () => {
    page = pdfDoc.addPage(pageSize);
    y = height - margin;
    drawHeader();
  };

  drawHeader();

  for (let i = 0; i < opts.orders.length; i++) {
    const o = opts.orders[i];

    const productsHT = getProductsHT(o);
    const shippingHT = getShippingHT(o);
    const vat = getVAT(o);
    const totalHT = getTotalHT(o);
    const totalTTC = getTotalTTC(o);

    const line1 = truncateText(
      `Date: ${formatOrderDate(o)}   |   ID: ${o.id}   |   Statut: ${o.status || "-"}   |   Paiement: ${getPaymentStatus(o)}   |   Email: ${o.email || "-"}`,
      150
    );

    const line2 = truncateText(
      `Client: ${getCustomerName(o)}   |   Téléphone: ${getPhone(o)}   |   Méthode paiement: ${getPaymentLabel(o)}   |   Provider: ${getPaymentProvider(o)}`,
      150
    );

    const line3 = truncateText(
      `Facturation: ${getBillingAddressLabel(o)}`,
      150
    );

    const line4 = truncateText(
      `Livraison: ${getShippingAddressLabel(o)}`,
      150
    );

    const line5 = truncateText(
      `Transport: ${getShippingName(o)}   |   Pays: ${getCountry(o)}   |   TVA désactivée: ${yesNo(Boolean(o.totals?.vatDisabled))}   |   Taux TVA: ${euro(getVATRate(o))}%`,
      150
    );

    const line6 = truncateText(
      `Origine client: ${getHeardFromLabel(o)}   |   Relais: ${getRelayPointLabel(o)}   |   Locale: ${o.locale || "-"}`,
      150
    );

    const line7 = truncateText(
      `Articles: ${getItemsLabel(o)}`,
      150
    );

    const line8 = truncateText(
      `Produits HT: ${euro(productsHT)} €   |   Livraison HT: ${euro(shippingHT)} €   |   TVA: ${euro(vat)} €   |   Total HT: ${euro(totalHT)} €   |   Total TTC: ${euro(totalTTC)} €`,
      150
    );

    const neededHeight = 102;
    if (y < margin + neededHeight) newPage();

    if (i % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 82,
        width: usableW,
        height: 90,
        color: rgb(0.985, 0.987, 0.992),
      });
    }

    drawText(line1, margin + 6, y, { bold: true, size: 8.6 });
    y -= 10;
    drawText(line2, margin + 6, y, { size: 8.1, gray: 0.12 });
    y -= 10;
    drawText(line3, margin + 6, y, { size: 8.1, gray: 0.16 });
    y -= 10;
    drawText(line4, margin + 6, y, { size: 8.1, gray: 0.16 });
    y -= 10;
    drawText(line5, margin + 6, y, { size: 8.1, gray: 0.14 });
    y -= 10;
    drawText(line6, margin + 6, y, { size: 8.1, gray: 0.14 });
    y -= 10;
    drawText(line7, margin + 6, y, { size: 8.1, gray: 0.1 });
    y -= 10;
    drawText(line8, margin + 6, y, { size: 8.2, gray: 0.05, bold: true });
    y -= 11;

    drawDivider(y + 4);
    y -= 8;
  }

  if (y < margin + 80) newPage();

  page.drawRectangle({
    x: margin,
    y: y - 42,
    width: usableW,
    height: 50,
    borderColor: rgb(0.82, 0.85, 0.88),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  drawText("Résumé global", margin + 10, y - 20, { bold: true, size: 11 });
  drawText(`Nb commandes: ${opts.orders.length}`, margin + 120, y - 20, { size: 10 });
  drawText(`Produits HT: ${euro(opts.totals.productsHT)} €`, margin + 250, y - 20, { size: 10 });
  drawText(`Livraison HT: ${euro(opts.totals.shippingHT)} €`, margin + 410, y - 20, { size: 10 });
  drawText(`TVA: ${euro(opts.totals.vat)} €`, margin + 560, y - 20, { size: 10 });
  drawText(`HT: ${euro(opts.totals.totalHT)} €`, margin + 650, y - 20, { size: 10 });
  drawText(`TTC: ${euro(opts.totals.totalTTC)} €`, margin + 735, y - 20, {
    size: 10,
    bold: true,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

/* ---------------- Route GET ---------------- */

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
    const debugId = searchParams.get("debugId");

    let fromDate: Date;
    let toDate: Date;

    if (day) {
      const d = new Date(day);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid day" }, { status: 400 });
      }
      fromDate = startOfDay(d);
      toDate = endOfDay(d);
    } else if (month) {
      const [y, m] = month.split("-").map(Number);
      if (!y || !m || m < 1 || m > 12) {
        return NextResponse.json({ error: "Invalid month" }, { status: 400 });
      }
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

    const all = await loadOrders();

    if (debugId) {
      const order = all.find((o) => o.id === debugId);
      if (order) debugOrder(order);
      else console.log("DEBUG ORDER NOT FOUND:", debugId);
    }

    const filtered = all.filter((o) => {
      const d = parseOrderDate(o);
      if (!d) return false;
      const t = d.getTime();
      return t >= fromDate.getTime() && t <= toDate.getTime();
    });

    let sumProductsHT = 0;
    let sumShippingHT = 0;
    let sumVAT = 0;
    let sumTotalHT = 0;
    let sumTotalTTC = 0;

    for (const o of filtered) {
      sumProductsHT += getProductsHT(o);
      sumShippingHT += getShippingHT(o);
      sumVAT += getVAT(o);
      sumTotalHT += getTotalHT(o);
      sumTotalTTC += getTotalTTC(o);
    }

    if (format === "accounting_csv") {
      const headers = [
        "Date",
        "ID",
        "Statut",
        "Prénom",
        "Nom",
        "Pays",
        "Média",
        "Quantité",
        "Quantité Housse",
        "Mode livraison",
        "Coût livraison HT Mode",
        "Paiement Mode",
        "Paiement Com",
        "Cout Fabrication",
        "CA HT",
        "TVA",
        "CA TTC",
        "Gain",
      ];

      const rows = filtered.map((o) => buildAccountingCsvRows(o));
      const csv = toCSV(headers, rows);

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="accounting_${fromDate.toISOString().slice(0, 10)}_${toDate.toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const headers = [
      "Date",
      "ID complet",
      "Statut",
      "Paiement",
      "Email",
      "Client",
      "Telephone",
      "Provider paiement",
      "Methode paiement",
      "Adresse facturation",
      "Adresse livraison",
      "Point relais",
      "Mode livraison",
      "Pays",
      "Locale",
      "Origine client",
      "TVA desactivee",
      "Taux TVA",
      "Articles",
      "Produits HT",
      "Livraison HT",
      "TVA",
      "Total HT",
      "Total TTC",
    ];

    const rows: string[][] = filtered.map((o) => [
      formatOrderDate(o),
      o.id,
      o.status || "-",
      getPaymentStatus(o),
      o.email || "-",
      getCustomerName(o),
      getPhone(o),
      getPaymentProvider(o),
      getPaymentLabel(o),
      getBillingAddressLabel(o),
      getShippingAddressLabel(o),
      getRelayPointLabel(o),
      getShippingName(o),
      getCountry(o),
      o.locale || "-",
      getHeardFromLabel(o),
      yesNo(Boolean(o.totals?.vatDisabled)),
      euro(getVATRate(o)),
      getItemsLabel(o),
      euro(getProductsHT(o)),
      euro(getShippingHT(o)),
      euro(getVAT(o)),
      euro(getTotalHT(o)),
      euro(getTotalTTC(o)),
    ]);

    const filenameBase = `orders_${fromDate.toISOString().slice(0, 10)}_${toDate.toISOString().slice(0, 10)}`;

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

    const pdfBuffer = await buildOrdersPdf({
      title: "Export commandes",
      periodLabel: `Période : ${fromDate.toISOString().slice(0, 10)} -> ${toDate.toISOString().slice(0, 10)}`,
      orders: filtered,
      totals: {
        productsHT: sumProductsHT,
        shippingHT: sumShippingHT,
        vat: sumVAT,
        totalHT: sumTotalHT,
        totalTTC: sumTotalTTC,
      },
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
      {
        error: "Export failed",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}