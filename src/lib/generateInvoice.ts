// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

type OrderItem = {
  name?: any;
  description?: string;
  price?: number | { eur?: number };
  quantity?: number;
};

type Order = {
  email?: string;
  createdAt?: any;
  items?: OrderItem[];
  shippingAddress?: any;
  shippingMethod?: { name?: string; price?: number | { eur?: number } };
  shippingPrice?: number;
  amount_total?: number; // cents stripe (si présent)
  total?: number; // eur (si présent)
  status?: string;
};

type GenOpts = {
  invoiceNumber?: string;
  issueDate?: Date;
  vatRate?: number; // 0.2 = 20%
  paidLabel?: boolean; // affiche FACTURE ACQUITTEE
};

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function getItemName(it: OrderItem) {
  const n = it?.name;
  if (typeof n === "string") return n;
  return n?.fr || n?.en || "Produit";
}

function getItemUnitPrice(it: OrderItem): number {
  const p = (it as any)?.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object" && typeof p.eur === "number") return p.eur;
  return Number(p || 0) || 0;
}

function getShippingPrice(order: Order): number {
  const m = order?.shippingMethod?.price as any;
  if (typeof m === "number") return m;
  if (m && typeof m === "object" && typeof m.eur === "number") return m.eur;
  if (typeof order?.shippingPrice === "number") return order.shippingPrice;
  return 0;
}

function formatMoney(n: number) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  // évite symboles non WinAnsi (OK pour €)
  return `${v.toFixed(2)} €`;
}

function formatDateFR(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  size: number
): string[] {
  const words = safeString(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadLogo(pdfDoc: PDFDocument) {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    return await pdfDoc.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawLine(
  page: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: any,
  thickness = 1
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color,
  });
}

export async function generateInvoicePDF(
  order: Order,
  orderId: string,
  opts: GenOpts = {}
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width: W, height: H } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 🎨 DA (bleus logo)
  const BLUE = rgb(0.14, 0.35, 0.86);
  const BLUE_DARK = rgb(0.05, 0.18, 0.55);
  const INK = rgb(0.06, 0.07, 0.1);
  const MUTED = rgb(0.40, 0.45, 0.55);
  const BORDER = rgb(0.86, 0.89, 0.93);
  const LIGHT = rgb(0.94, 0.97, 1.0);
  const GREEN = rgb(0.06, 0.63, 0.42);

  const M = 42;
  const GUTTER = 22;

  const leftW = 185;
  const leftX = M;
  const rightX = leftX + leftW + GUTTER;
  const rightW = W - rightX - M;

  const issueDate = opts.issueDate ?? new Date();
  const VAT = typeof opts.vatRate === "number" ? opts.vatRate : 0.2;

  const invoiceNumber =
    opts.invoiceNumber ??
    `F${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, "0")}${String(
      issueDate.getDate()
    ).padStart(2, "0")}`;

  // =========================
  // HEADER TOP
  // =========================
  let yTop = H - M;

  // Logo (left)
  const logo = await loadLogo(pdfDoc);
  if (logo) {
    const maxW = 110;
    const scale = maxW / logo.width;
    const lw = logo.width * scale;
    const lh = logo.height * scale;

    // Logo aligné sur le haut
    page.drawImage(logo, { x: leftX, y: yTop - lh, width: lw, height: lh });
    yTop -= 6; // petit spacing visuel
  }

  // Company block (left)
  let yLeft = H - M - 80;
  if (logo) yLeft = H - M - 80; // stable même si logo varie

  const companyLines = [
    { t: "LAZURCO", s: 10, f: bold, c: INK, gap: 14 },
    { t: "189 avenue de Fabron", s: 8.5, f: regular, c: MUTED, gap: 12 },
    { t: "06200 Nice, FRANCE", s: 8.5, f: regular, c: MUTED, gap: 12 },
    { t: "", s: 8, f: regular, c: MUTED, gap: 8 },
    { t: "SIRET : 831 588 926 00012", s: 8.5, f: regular, c: MUTED, gap: 12 },
    { t: "TVA : FR52831588926", s: 8.5, f: regular, c: MUTED, gap: 12 },
    { t: "", s: 8, f: regular, c: MUTED, gap: 8 },
    { t: "Email : contact@hdconnects.com", s: 8.5, f: regular, c: MUTED, gap: 12 },
    { t: "Site : www.ocularest.fr", s: 8.5, f: regular, c: MUTED, gap: 12 },
  ];

  for (const line of companyLines) {
    if (!line.t) {
      yLeft -= line.gap;
      continue;
    }
    page.drawText(line.t, { x: leftX, y: yLeft, size: line.s, font: line.f, color: line.c });
    yLeft -= line.gap;
  }

  // Right header box
  const headerH = 44;
  const headerY = H - M - headerH;

  page.drawRectangle({
    x: rightX,
    y: headerY,
    width: rightW,
    height: headerH,
    borderColor: BORDER,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  // Top blue strip
  page.drawRectangle({
    x: rightX,
    y: headerY + headerH - 9,
    width: rightW,
    height: 9,
    color: BLUE,
  });

  // “OculaRest par Lazurco” (left inside box)
  page.drawText("OculaRest", {
    x: rightX + 14,
    y: headerY + 18,
    size: 13,
    font: bold,
    color: INK,
  });
  page.drawText("par Lazurco", {
    x: rightX + 14,
    y: headerY + 6,
    size: 8.5,
    font: regular,
    color: MUTED,
  });

  // FACTURE (right inside box)
  const fact = "FACTURE";
  const factSize = 11;
  const factW = bold.widthOfTextAtSize(fact, factSize);
  page.drawText(fact, {
    x: rightX + rightW - factW - 14,
    y: headerY + 14,
    size: factSize,
    font: bold,
    color: INK,
  });

  // =========================
  // CLIENT BOX
  // =========================
  const clientBoxYTop = headerY - 16;
  const clientBoxH = 95;
  const clientBoxY = clientBoxYTop - clientBoxH;

  page.drawRectangle({
    x: rightX,
    y: clientBoxY,
    width: rightW,
    height: clientBoxH,
    borderColor: BORDER,
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  // Client bar
  page.drawRectangle({
    x: rightX,
    y: clientBoxY + clientBoxH - 18,
    width: rightW,
    height: 18,
    color: BLUE_DARK,
  });

  const clientLabel = "Client";
  const clientLabelW = bold.widthOfTextAtSize(clientLabel, 10);
  page.drawText(clientLabel, {
    x: rightX + rightW / 2 - clientLabelW / 2,
    y: clientBoxY + clientBoxH - 14,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  const a = order?.shippingAddress || {};
  const clientLines = [
    safeString(a.name).toUpperCase(),
    safeString(a.address),
    `${safeString(a.postalCode)} ${safeString(a.city)}`.trim(),
    safeString(a.country || "FR"),
  ].filter((x) => x && x !== " ");

  let cy = clientBoxY + clientBoxH - 36;
  for (const line of clientLines) {
    page.drawText(line, { x: rightX + 12, y: cy, size: 9, font: regular, color: INK });
    cy -= 13;
  }

  // =========================
  // INFO ROW (DATE / N° FACTURE)
  // =========================
  const infoRowY = clientBoxY - 28;
  drawLine(page, leftX, infoRowY + 14, W - M, infoRowY + 14, BORDER, 1);

  page.drawText("Date :", { x: leftX, y: infoRowY, size: 9, font: bold, color: INK });
  page.drawText(formatDateFR(issueDate), { x: leftX + 42, y: infoRowY, size: 9, font: regular, color: INK });

  const nLabel = "N° Facture :";
  const nLabelW = bold.widthOfTextAtSize(nLabel, 9);
  page.drawText(nLabel, {
    x: rightX + rightW - nLabelW - 120,
    y: infoRowY,
    size: 9,
    font: bold,
    color: INK,
  });
  page.drawText(invoiceNumber, {
    x: rightX + rightW - 120,
    y: infoRowY,
    size: 9,
    font: bold,
    color: INK,
  });

  // =========================
  // ORDER META BOX (light blue)
  // =========================
  const metaBoxYTop = infoRowY - 12;
  const metaH = 58;
  const metaY = metaBoxYTop - metaH;

  page.drawRectangle({
    x: leftX,
    y: metaY,
    width: W - M - leftX,
    height: metaH,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 1,
  });

  // left meta
  page.drawText("Votre commande", { x: leftX + 12, y: metaY + 38, size: 8, font: regular, color: MUTED });
  page.drawText("www.ocularest.fr", { x: leftX + 12, y: metaY + 26, size: 8.5, font: bold, color: BLUE_DARK });

  // middle meta (order id)
  page.drawText(orderId, {
    x: leftX + 180,
    y: metaY + 26,
    size: 8.5,
    font: regular,
    color: INK,
  });

  // right meta (email client)
  const email = safeString(order?.email || a.email || "");
  page.drawText("Email client :", { x: leftX + 12, y: metaY + 10, size: 8, font: regular, color: MUTED });
  page.drawText(email || "-", { x: leftX + 80, y: metaY + 10, size: 8.5, font: regular, color: INK });

  // =========================
  // TABLE
  // =========================
  const tableTop = metaY - 22;

  const cols = [
    { key: "ref", label: "Reference", w: 76 },
    { key: "designation", label: "Designation", w: 220 },
    { key: "qty", label: "Quantite", w: 70 },
    { key: "unit", label: "Prix unitaire HT", w: 95 },
    { key: "total", label: "Prix Total HT", w: 92 },
  ];

  const tableX = leftX;
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const startX = tableX;

  // Header bar
  const headH = 18;
  page.drawRectangle({
    x: tableX,
    y: tableTop - headH,
    width: tableW,
    height: headH,
    color: BLUE_DARK,
  });

  let x = tableX;
  for (const c of cols) {
    page.drawText(c.label, {
      x: x + 6,
      y: tableTop - 13,
      size: 8,
      font: bold,
      color: rgb(1, 1, 1),
    });
    x += c.w;
  }

  // Rows
  const rowH = 22;
  let y = tableTop - headH;

  const itemsRaw = Array.isArray(order?.items) ? order.items : [];
  const rows = itemsRaw.map((it) => {
    const qty = Number(it.quantity || 1) || 1;
    const unit = getItemUnitPrice(it);
    const name = getItemName(it);
    const desc = safeString((it as any).description || "");
    const designation = desc ? `${name} - ${desc}` : name;
    return { ref: "", designation, qty, unit, total: unit * qty };
  });

  const shipping = getShippingPrice(order);
  if (shipping > 0) {
    rows.push({
      ref: "",
      designation: "Livraison",
      qty: 1,
      unit: shipping,
      total: shipping,
    });
  }

  // Totals (HT + TVA)
  const totalHT = rows.reduce((s: number, r) => s + r.total, 0);
  const vatAmount = totalHT * VAT;
  const totalTTC = totalHT + vatAmount;

  // Draw grid rows
  const gridColor = rgb(0.82, 0.86, 0.93);

  for (let i = 0; i < Math.max(rows.length, 6); i++) {
    const r = rows[i];

    // row container
    page.drawRectangle({
      x: tableX,
      y: y - rowH,
      width: tableW,
      height: rowH,
      borderColor: gridColor,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    // vertical separators
    let sx = tableX;
    for (const c of cols) {
      drawLine(page, sx, y - rowH, sx, y, gridColor, 1);
      sx += c.w;
    }
    drawLine(page, tableX + tableW, y - rowH, tableX + tableW, y, gridColor, 1);

    if (r) {
      let cx = tableX;

      // ref
      page.drawText(safeString(r.ref), { x: cx + 6, y: y - 15, size: 8.5, font: regular, color: INK });
      cx += cols[0].w;

      // designation (wrap)
      const maxTextW = cols[1].w - 12;
      const lines = wrapText(safeString(r.designation), maxTextW, regular, 8.5).slice(0, 2);
      page.drawText(lines[0] || "", { x: cx + 6, y: y - 15, size: 8.5, font: regular, color: INK });
      if (lines[1]) {
        page.drawText(lines[1], { x: cx + 6, y: y - 25, size: 8.2, font: regular, color: MUTED });
      }
      cx += cols[1].w;

      // qty
      page.drawText(String(r.qty), { x: cx + 6, y: y - 15, size: 8.5, font: regular, color: INK });
      cx += cols[2].w;

      // unit
      page.drawText(formatMoney(r.unit), { x: cx + 6, y: y - 15, size: 8.5, font: regular, color: INK });
      cx += cols[3].w;

      // total
      page.drawText(formatMoney(r.total), { x: cx + 6, y: y - 15, size: 8.5, font: regular, color: INK });
    }

    y -= rowH;
  }

  // Totals block (bottom right)
  const totalsX = tableX + tableW - 200;
  const totalsY = y - 10;

  const lineGap = 14;

  page.drawText("Total HT", { x: totalsX + 70, y: totalsY - 0 * lineGap, size: 8.5, font: regular, color: MUTED });
  page.drawText(formatMoney(totalHT), {
    x: totalsX + 140,
    y: totalsY - 0 * lineGap,
    size: 8.5,
    font: bold,
    color: INK,
  });

  page.drawText(`TVA ${Math.round(VAT * 100)}%`, {
    x: totalsX + 70,
    y: totalsY - 1 * lineGap,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  page.drawText(formatMoney(vatAmount), {
    x: totalsX + 140,
    y: totalsY - 1 * lineGap,
    size: 8.5,
    font: bold,
    color: INK,
  });

  page.drawText("Total TTC", { x: totalsX + 70, y: totalsY - 2 * lineGap, size: 9, font: bold, color: MUTED });
  page.drawText(formatMoney(totalTTC), {
    x: totalsX + 140,
    y: totalsY - 2 * lineGap,
    size: 9,
    font: bold,
    color: INK,
  });

  // =========================
  // PAYMENT CONDITIONS (bottom left)
  // =========================
  const payYTop = totalsY - 80;

  page.drawText("Conditions de paiement :", { x: leftX, y: payYTop, size: 8.8, font: bold, color: INK });

  const linesPay = [
    "Mode de paiement : Carte bancaire",
    `Paiement recu le : ${formatDateFR(issueDate)}`,
    "Escompte pour paiement anticipe : neant",
    "Penalite de retard : 3 fois le taux legal",
    "Indemnite forfaitaire de 40 EUR pour frais de recouvrement (art. L441-5 du code de commerce).",
  ];

  let py = payYTop - 14;
  for (const l of linesPay) {
    const wrapped = wrapText(l, 300, regular, 7.3);
    for (const w of wrapped) {
      page.drawText(w, { x: leftX, y: py, size: 7.3, font: regular, color: MUTED });
      py -= 10;
    }
  }

  // FACTURE ACQUITTEE (center)
  if (opts.paidLabel !== false) {
    page.drawText("FACTURE ACQUITTEE", {
      x: rightX + rightW / 2 - bold.widthOfTextAtSize("FACTURE ACQUITTEE", 9.5) / 2,
      y: payYTop - 48,
      size: 9.5,
      font: bold,
      color: GREEN,
    });
  }

  // =========================
  // FOOTER BAR + NOTE
  // =========================
  const footerBarY = 70;
  page.drawRectangle({ x: M, y: footerBarY, width: W - 2 * M, height: 8, color: BLUE_DARK });

  page.drawText("Reserve de propriete", {
    x: W / 2 - bold.widthOfTextAtSize("Reserve de propriete", 8) / 2,
    y: footerBarY - 18,
    size: 8,
    font: bold,
    color: INK,
  });
  const foot = "Lazurco conserve l'entière propriete des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980).";
  const footLines = wrapText(foot, W - 2 * M, regular, 7);
  let fy = footerBarY - 30;
  for (const l of footLines.slice(0, 2)) {
    page.drawText(l, {
      x: W / 2 - regular.widthOfTextAtSize(l, 7) / 2,
      y: fy,
      size: 7,
      font: regular,
      color: MUTED,
    });
    fy -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
