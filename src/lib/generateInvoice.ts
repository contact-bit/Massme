// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type InvoiceItem = {
  ref: string;
  name: string;
  desc: string;
  qty: number;
  unit: number; // HT
};

type ShippingAddress = {
  name?: string;
  email?: string;
  address?: string;
  address2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
};

type OrderLike = {
  items?: any[];
  shippingMethod?: { price?: number };
  shippingAddress?: ShippingAddress;

  invoiceNumber?: string;
  invoiceDate?: string | number | Date;

  paidAt?: string | number | Date;
  paymentMethod?: string;
  vatNumber?: string;
};

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

export async function generateInvoicePDF(order: OrderLike, orderId: string) {
  // =========================
  // Helpers
  // =========================
  const safe = (v: any) => (v == null ? "" : String(v));
  const upper = (v: any) => safe(v).trim().toUpperCase();
  const money = (n: number) =>
    (Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100).toFixed(2);

  const fmtDateFR = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const widthOf = (font: any, text: string, size: number) =>
    font.widthOfTextAtSize(text, size);

  const wrap = (font: any, text: string, size: number, maxW: number) => {
    const words = safe(text)
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!words.length) return [""];

    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (widthOf(font, test, size) <= maxW) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const drawText = (
    page: any,
    font: any,
    text: string,
    x: number,
    y: number,
    size: number,
    color = rgb(0, 0, 0)
  ) => {
    page.drawText(safe(text), { x, y, size, font, color });
  };

  const drawBox = (
    page: any,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: { fill?: any; stroke?: any; strokeWidth?: number; r?: number }
  ) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: opts?.fill,
      borderColor: opts?.stroke,
      borderWidth: opts?.strokeWidth ?? (opts?.stroke ? 1 : 0),
      borderRadius: opts?.r ?? 0,
    });
  };

  const drawLine = (
    page: any,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = rgb(0.85, 0.85, 0.85)
  ) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color,
    });
  };

  const parseDate = (v: any, fallback = new Date()) => {
    if (!v) return fallback;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? fallback : d;
  };

  // =========================
  // Data normalization
  // =========================
  const a: ShippingAddress = (order?.shippingAddress || {}) as ShippingAddress;
  const itemsRaw = Array.isArray(order?.items) ? order.items : [];

  const itemsNorm: InvoiceItem[] = itemsRaw.map((it: any): InvoiceItem => {
    const name =
      typeof it?.name === "string"
        ? it.name
        : it?.name?.fr || it?.name?.en || it?.name?.title || "Produit";

    const desc = safe(it?.description || "");
    const qty = Number(it?.quantity || 1);

    const unit =
      typeof it?.price === "number"
        ? it.price
        : typeof it?.price?.eur === "number"
        ? it.price.eur
        : Number(it?.unitPrice || 0);

    const ref = safe(it?.ref || it?.sku || "");
    return { ref, name: safe(name), desc, qty, unit: Number(unit || 0) };
  });

  const shipping = Number(order?.shippingMethod?.price || 0);

  const totalHT_items = itemsNorm.reduce<number>(
    (sum: number, it: InvoiceItem) => sum + it.unit * it.qty,
    0
  );

  const totalHT = totalHT_items + shipping;

  const VAT_RATE = 0.2;
  const vat = totalHT * VAT_RATE;
  const totalTTC = totalHT + vat;

  const invoiceDate = parseDate(order?.invoiceDate, new Date());

  const invoiceNumber =
    safe(order?.invoiceNumber) ||
    `F${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(invoiceDate.getDate()).padStart(2, "0")}`;

  // =========================
  // Document + Fonts + Colors (DA BLEU)
  // =========================
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.06, 0.09, 0.16);
  const muted = rgb(0.35, 0.42, 0.55);
  const border = rgb(0.82, 0.86, 0.92);

  const blue = rgb(0.14, 0.38, 0.9);
  const blueDark = rgb(0.05, 0.2, 0.55);
  const blueSoft = rgb(0.93, 0.96, 1.0);
  const success = rgb(0.05, 0.62, 0.45);

  const M = 42;

  // =========================
  // Logo (Cloudflare Images) - évite WEBP
  // =========================
  async function tryEmbedLogo() {
    try {
      const res = await fetch(LOGO_URL, {
        headers: { Accept: "image/png,image/jpeg,*/*" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`logo fetch failed: ${res.status}`);

      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const bytes = new Uint8Array(await res.arrayBuffer());

      if (ct.includes("png")) return await pdfDoc.embedPng(bytes);
      if (ct.includes("jpeg") || ct.includes("jpg")) return await pdfDoc.embedJpg(bytes);

      console.warn(`[invoice] Logo unsupported (${ct}). Skipping.`);
      return null;
    } catch (e) {
      console.warn("[invoice] Logo error, skipping:", e);
      return null;
    }
  }

  const logoImg = await tryEmbedLogo();

  // =========================
  // Header left (brand + company)
  // =========================
  const logoBox = { x: M, y: 842 - M - 52, w: 220, h: 52 };

  if (logoImg) {
    const maxW = 150;
    const maxH = 40;
    const dims = logoImg.scale(1);
    const scale = Math.min(maxW / dims.width, maxH / dims.height);
    const w = dims.width * scale;
    const h = dims.height * scale;

    page.drawImage(logoImg, {
      x: logoBox.x,
      y: logoBox.y + (logoBox.h - h) / 2,
      width: w,
      height: h,
    });

    drawText(page, boldFont, "OculaRest", logoBox.x + 160, logoBox.y + 26, 15, ink);
    drawText(page, regularFont, "par Lazurco", logoBox.x + 160, logoBox.y + 10, 9, muted);
  } else {
    drawText(page, boldFont, "OculaRest", logoBox.x, logoBox.y + 26, 22, blue);
    drawText(page, regularFont, "par Lazurco", logoBox.x, logoBox.y + 10, 9, muted);
  }

  let yL = logoBox.y - 14;

  const companyLines: string[] = [
    "LAZURCO",
    "189 avenue de Fabron",
    "06200 Nice, FRANCE",
    "",
    "SIRET : 831 588 926 00012",
    "TVA : FR52831588926",
    "",
    "Email : contact@hdconnects.com",
    "Site : www.ocularest.fr",
  ];

  for (const ln of companyLines) {
    if (ln === "") {
      yL -= 8;
      continue;
    }
    drawText(page, regularFont, ln, M, yL, 8.7, ink);
    yL -= 12;
  }

  // =========================
  // Header right (FACTURE + OculaRest/par Lazurco DANS LE RECTANGLE)
  // =========================
  const titleBoxW = 300;
  const titleBoxH = 46;
  const titleX = 595 - M - titleBoxW;
  const titleY = 842 - M - titleBoxH;

  // Box + top blue bar
  drawBox(page, titleX, titleY, titleBoxW, titleBoxH, {
    stroke: border,
    strokeWidth: 1,
    r: 10,
  });
  drawBox(page, titleX, titleY + titleBoxH - 10, titleBoxW, 10, { fill: blue });

  // ✅ Left text inside box
  drawText(page, boldFont, "OculaRest", titleX + 14, titleY + 20, 12, ink);
  drawText(page, regularFont, "par Lazurco", titleX + 14, titleY + 8, 8.5, muted);

  // ✅ Right "FACTURE" inside box (aligned right)
  const facture = "FACTURE";
  const factureSize = 11;
  const factureW = widthOf(boldFont, facture, factureSize);
  drawText(
    page,
    boldFont,
    facture,
    titleX + titleBoxW - 14 - factureW,
    titleY + 18,
    factureSize,
    ink
  );

  // =========================
  // Header right (Client box)
  // =========================
  const clientBoxW = 320;
  const clientBoxH = 110;
  const clientX = 595 - M - clientBoxW;
  const clientY = titleY - 22 - clientBoxH;

  drawBox(page, clientX, clientY, clientBoxW, clientBoxH, {
    stroke: border,
    strokeWidth: 1,
  });
  drawBox(page, clientX, clientY + clientBoxH - 20, clientBoxW, 20, { fill: blueDark });
  drawText(
    page,
    boldFont,
    "Client",
    clientX + clientBoxW / 2 - 18,
    clientY + clientBoxH - 14,
    9,
    rgb(1, 1, 1)
  );

  const clientLines = [
    upper(a.name),
    upper(a.address),
    upper(a.address2),
    upper(`${safe(a.postalCode)} ${safe(a.city)}`.trim()),
    upper(a.country),
  ].filter((x) => x && x.trim().length);

  let yC = clientY + clientBoxH - 34;
  for (const ln of clientLines) {
    drawText(page, boldFont, ln, clientX + 12, yC, 9, ink);
    yC -= 14;
  }

  // =========================
  // Separator + Date / Invoice number
  // =========================
  const infoTopY = clientY - 26;
  drawLine(page, M, infoTopY, 595 - M, infoTopY, border);

  const lineY = infoTopY - 20;

  drawText(page, boldFont, "Date :", M, lineY, 9, ink);
  drawText(page, regularFont, fmtDateFR(invoiceDate), M + 110, lineY, 9, ink);

  drawText(page, boldFont, "N° Facture :", M + 290, lineY, 9, ink);
  drawText(page, boldFont, invoiceNumber, M + 390, lineY, 9, ink);

  // Info box
  const greyY = lineY - 76;
  const greyH = 72;
  const greyW = 595 - M * 2;
  drawBox(page, M, greyY, greyW, greyH, { fill: blueSoft, stroke: border, strokeWidth: 1 });

  drawText(page, regularFont, "Votre commande", M + 10, greyY + greyH - 22, 8, muted);
  drawText(page, boldFont, "www.ocularest.fr", M + 10, greyY + greyH - 34, 8, blueDark);
  drawText(page, regularFont, safe(orderId) || "-", M + 160, greyY + greyH - 34, 8, ink);

  drawText(page, regularFont, "Email client :", M + 10, greyY + greyH - 54, 8, muted);
  drawText(
    page,
    regularFont,
    safe(a.email || order?.shippingAddress?.email) || "-",
    M + 160,
    greyY + greyH - 54,
    8,
    ink
  );

  drawText(page, regularFont, "TVA intracom : ", M + 10, greyY + greyH - 66, 8, muted);
  drawText(page, regularFont, safe(order?.vatNumber) || "-", M + 160, greyY + greyH - 66, 8, ink);

  // =========================
  // Table
  // =========================
  const tableX = M;
  const tableW = 595 - M * 2;
  const tableTop = greyY - 18;

  const colRef = 75;
  const colQty = 60;
  const colUnit = 90;
  const colTot = 90;
  const colDes = tableW - (colRef + colQty + colUnit + colTot);

  const headH = 18;
  const rowH = 18;

  drawBox(page, tableX, tableTop - headH, tableW, headH, { fill: blueDark });
  drawText(page, boldFont, "Reference", tableX + 6, tableTop - 12, 8, rgb(1, 1, 1));
  drawText(page, boldFont, "Designation", tableX + colRef + 6, tableTop - 12, 8, rgb(1, 1, 1));
  drawText(page, boldFont, "Quantite", tableX + colRef + colDes + 6, tableTop - 12, 8, rgb(1, 1, 1));
  drawText(
    page,
    boldFont,
    "Prix unitaire HT",
    tableX + colRef + colDes + colQty + 6,
    tableTop - 12,
    8,
    rgb(1, 1, 1)
  );
  drawText(
    page,
    boldFont,
    "Prix Total HT",
    tableX + colRef + colDes + colQty + colUnit + 6,
    tableTop - 12,
    8,
    rgb(1, 1, 1)
  );

  const xRef = tableX + colRef;
  const xDes = xRef + colDes;
  const xQty = xDes + colQty;
  const xUnit = xQty + colUnit;

  const lines: InvoiceItem[] = [...itemsNorm];
  if (shipping > 0) lines.push({ ref: "", name: "Livraison", desc: "", qty: 1, unit: shipping });

  const maxRows = Math.max(6, lines.length);
  let y = tableTop - headH;

  for (let i = 0; i < maxRows; i++) {
    const rowY = y - rowH;

    if (i % 2 === 1) drawBox(page, tableX, rowY, tableW, rowH, { fill: rgb(0.985, 0.99, 1) });

    drawLine(page, tableX, rowY, tableX + tableW, rowY, border);
    drawLine(page, tableX, y, tableX, rowY, border);
    drawLine(page, tableX + tableW, y, tableX + tableW, rowY, border);
    drawLine(page, xRef, y, xRef, rowY, border);
    drawLine(page, xDes, y, xDes, rowY, border);
    drawLine(page, xQty, y, xQty, rowY, border);
    drawLine(page, xUnit, y, xUnit, rowY, border);

    const it = lines[i];
    if (it) {
      drawText(page, regularFont, safe(it.ref), tableX + 6, rowY + 5, 8, ink);

      const designation = `${safe(it.name)}${it.desc ? ` - ${safe(it.desc)}` : ""}`;
      const desLines = wrap(regularFont, designation, 8, colDes - 12).slice(0, 2);
      drawText(page, regularFont, desLines[0] || "", tableX + colRef + 6, rowY + 5, 8, ink);
      if (desLines[1]) drawText(page, regularFont, desLines[1], tableX + colRef + 6, rowY - 6, 8, ink);

      drawText(page, regularFont, String(it.qty), tableX + colRef + colDes + 6, rowY + 5, 8, ink);
      drawText(page, regularFont, `${money(it.unit)} €`, tableX + colRef + colDes + colQty + 6, rowY + 5, 8, ink);
      drawText(
        page,
        regularFont,
        `${money(it.unit * it.qty)} €`,
        tableX + colRef + colDes + colQty + colUnit + 6,
        rowY + 5,
        8,
        ink
      );
    }

    y = rowY;
  }

  drawLine(page, tableX, y, tableX + tableW, y, border);

  // =========================
  // Totals
  // =========================
  const totalsW = 240;
  const totalsX = tableX + tableW - totalsW;
  const totalsY = y - 60;

  drawLine(page, totalsX, y, totalsX, totalsY + 60, border);

  drawText(page, regularFont, "Total HT", totalsX + 10, totalsY + 40, 9, muted);
  drawText(page, boldFont, `${money(totalHT)} €`, totalsX + 140, totalsY + 40, 9, ink);

  drawText(page, regularFont, "TVA 20%", totalsX + 10, totalsY + 24, 9, muted);
  drawText(page, boldFont, `${money(vat)} €`, totalsX + 140, totalsY + 24, 9, ink);

  drawText(page, boldFont, "Total TTC", totalsX + 10, totalsY + 8, 9, ink);
  drawText(page, boldFont, `${money(totalTTC)} €`, totalsX + 140, totalsY + 8, 9, blueDark);

  // =========================
  // Payment conditions
  // =========================
  const payY = totalsY - 70;

  drawText(page, boldFont, "Conditions de paiement :", M, payY + 44, 9, ink);

  const paidAt = parseDate(order?.paidAt, invoiceDate);

  const payLines: string[] = [
    `Mode de paiement : ${safe(order?.paymentMethod) || "Carte bancaire"}`,
    `Paiement recu le : ${fmtDateFR(paidAt)}`,
    `Escompte pour paiement anticipe : neant`,
    `Penalite de retard : 3 fois le taux legal`,
    `Indemnite forfaitaire de 40 € pour frais de recouvrement (art. L441-5 du code de commerce) en cas de retard de paiement.`,
  ];

  let yP = payY + 28;
  for (const l of payLines) {
    const lines2 = wrap(regularFont, l, 8, 330);
    for (const ll of lines2) {
      drawText(page, regularFont, ll, M, yP, 8, ink);
      yP -= 12;
    }
  }

  drawText(page, boldFont, "FACTURE ACQUITTEE", 595 / 2 + 40, payY + 10, 10, success);

  // =========================
  // Footer
  // =========================
  const footerBarY = 56;
  drawBox(page, M, footerBarY, 595 - M * 2, 10, { fill: blueDark });

  drawText(page, boldFont, "Reserve de propriete", 595 / 2 - 56, footerBarY - 18, 8, ink);

  const footerTxt =
    "Lazurco conserve l'entière propriete des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980).";
  const footerLines = wrap(regularFont, footerTxt, 7.6, 595 - M * 2).slice(0, 2);

  let yF = footerBarY - 32;
  for (const ln of footerLines) {
    drawText(page, regularFont, ln, M + 30, yF, 7.6, muted);
    yF -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
