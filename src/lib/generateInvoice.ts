// src/lib/generateInvoice.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/* =========================================================
   CONFIG
========================================================= */

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

/* =========================================================
   I18N
========================================================= */

export type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

type I18nDict = {
  BRAND: string;
  BRAND_BY: string;
  WEBSITE: string;
  FACTURE: string;
  CLIENT: string;
  DATE: string;
  INVOICE_NO: string;
  YOUR_ORDER: string;
  EMAIL: string;
  REFERENCE: string;
  DESIGNATION: string;
  QTY: string;
  UNIT_PRICE: string;
  TOTAL_PRICE: string;
  SHIPPING: string;
  TOTAL_HT: string;
  VAT: string;
  TOTAL_TTC: string;
  PAYMENT_TITLE: string;
  PAYMENT_METHOD: string;
  PAYMENT_DATE: string;
  EARLY_DISCOUNT: string;
  LATE_PENALTY: string;
  RECOVERY: string;
  PAID: string;
  FOOTER_TITLE: string;
  FOOTER_TEXT: string;
};

export const I18N: Record<Locale, I18nDict> = {
  fr: {
    BRAND: "OculaRest",
    BRAND_BY: "par Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "FACTURE",
    CLIENT: "Client",
    DATE: "Date :",
    INVOICE_NO: "N° Facture :",
    YOUR_ORDER: "Votre commande",
    EMAIL: "Email client :",
    REFERENCE: "Référence",
    DESIGNATION: "Désignation",
    QTY: "Quantité",
    UNIT_PRICE: "Prix unitaire HT",
    TOTAL_PRICE: "Prix total HT",
    SHIPPING: "Livraison",
    TOTAL_HT: "Total HT",
    VAT: "TVA",
    TOTAL_TTC: "Total TTC",
    PAYMENT_TITLE: "Conditions de paiement :",
    PAYMENT_METHOD: "Mode de paiement : Carte bancaire",
    PAYMENT_DATE: "Paiement reçu le :",
    EARLY_DISCOUNT: "Escompte pour paiement anticipé : néant",
    LATE_PENALTY: "Pénalité de retard : 3 fois le taux légal",
    RECOVERY:
      "Indemnité forfaitaire de 40 EUR pour frais de recouvrement (art. L441-5 du code de commerce).",
    PAID: "FACTURE ACQUITTEE",
    FOOTER_TITLE: "Réserve de propriété",
    FOOTER_TEXT:
      "Lazurco conserve l'entière propriété des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980).",
  },
  en: {
    BRAND: "OculaRest",
    BRAND_BY: "by Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "INVOICE",
    CLIENT: "Customer",
    DATE: "Date:",
    INVOICE_NO: "Invoice No:",
    YOUR_ORDER: "Your order",
    EMAIL: "Customer email:",
    REFERENCE: "Reference",
    DESIGNATION: "Description",
    QTY: "Quantity",
    UNIT_PRICE: "Unit price excl. VAT",
    TOTAL_PRICE: "Total excl. VAT",
    SHIPPING: "Shipping",
    TOTAL_HT: "Subtotal",
    VAT: "VAT",
    TOTAL_TTC: "Total incl. VAT",
    PAYMENT_TITLE: "Payment conditions:",
    PAYMENT_METHOD: "Payment method: Credit card",
    PAYMENT_DATE: "Payment received on:",
    EARLY_DISCOUNT: "Early payment discount: none",
    LATE_PENALTY: "Late payment penalty: 3× legal interest rate",
    RECOVERY: "Fixed compensation of 40 EUR for recovery costs.",
    PAID: "PAID INVOICE",
    FOOTER_TITLE: "Retention of title",
    FOOTER_TEXT:
      "Ownership of goods remains with Lazurco until full payment is received.",
  },
  es: {
    BRAND: "OculaRest",
    BRAND_BY: "por Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "FACTURA",
    CLIENT: "Cliente",
    DATE: "Fecha:",
    INVOICE_NO: "N° Factura:",
    YOUR_ORDER: "Su pedido",
    EMAIL: "Email del cliente:",
    REFERENCE: "Referencia",
    DESIGNATION: "Descripción",
    QTY: "Cantidad",
    UNIT_PRICE: "Precio unitario sin IVA",
    TOTAL_PRICE: "Total sin IVA",
    SHIPPING: "Envío",
    TOTAL_HT: "Total sin IVA",
    VAT: "IVA",
    TOTAL_TTC: "Total con IVA",
    PAYMENT_TITLE: "Condiciones de pago:",
    PAYMENT_METHOD: "Método de pago: Tarjeta",
    PAYMENT_DATE: "Pago recibido el:",
    EARLY_DISCOUNT: "Descuento por pronto pago: ninguno",
    LATE_PENALTY: "Penalización por retraso: 3× interés legal",
    RECOVERY: "Indemnización fija de 40 EUR por costes de cobro.",
    PAID: "FACTURA PAGADA",
    FOOTER_TITLE: "Reserva de dominio",
    FOOTER_TEXT:
      "Lazurco conserva la propiedad de los bienes jusqu'au paiement complet.",
  },
  de: {
    BRAND: "OculaRest",
    BRAND_BY: "von Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "RECHNUNG",
    CLIENT: "Kunde",
    DATE: "Datum:",
    INVOICE_NO: "Rechnungsnummer:",
    YOUR_ORDER: "Ihre Bestellung",
    EMAIL: "Kunden-E-Mail:",
    REFERENCE: "Referenz",
    DESIGNATION: "Bezeichnung",
    QTY: "Menge",
    UNIT_PRICE: "Stückpreis netto",
    TOTAL_PRICE: "Gesamt netto",
    SHIPPING: "Lieferung",
    TOTAL_HT: "Zwischensumme",
    VAT: "MwSt",
    TOTAL_TTC: "Gesamtbetrag",
    PAYMENT_TITLE: "Zahlungsbedingungen:",
    PAYMENT_METHOD: "Zahlungsart: Kreditkarte",
    PAYMENT_DATE: "Zahlung erhalten am:",
    EARLY_DISCOUNT: "Skonto: keiner",
    LATE_PENALTY: "Verzugszinsen: 3× gesetzlicher Zinssatz",
    RECOVERY: "Pauschale Entschädigung von 40 EUR für Inkassokosten.",
    PAID: "BEZAHLTE RECHNUNG",
    FOOTER_TITLE: "Eigentumsvorbehalt",
    FOOTER_TEXT:
      "Die Ware bleibt bis zur vollständigen Bezahlung Eigentum von Lazurco.",
  },
  it: {
    BRAND: "OculaRest",
    BRAND_BY: "di Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "FATTURA",
    CLIENT: "Cliente",
    DATE: "Data:",
    INVOICE_NO: "N° Fattura:",
    YOUR_ORDER: "Il tuo ordine",
    EMAIL: "Email cliente:",
    REFERENCE: "Riferimento",
    DESIGNATION: "Descrizione",
    QTY: "Quantità",
    UNIT_PRICE: "Prezzo unitario IVA escl.",
    TOTAL_PRICE: "Totale IVA escl.",
    SHIPPING: "Spedizione",
    TOTAL_HT: "Totale IVA escl.",
    VAT: "IVA",
    TOTAL_TTC: "Totale IVA incl.",
    PAYMENT_TITLE: "Condizioni di pagamento:",
    PAYMENT_METHOD: "Metodo di pagamento: Carta",
    PAYMENT_DATE: "Pagamento ricevuto il:",
    EARLY_DISCOUNT: "Sconto pagamento anticipato: nessuno",
    LATE_PENALTY: "Penale di ritardo : 3× tasso legale",
    RECOVERY: "Indennità fissa di 40 EUR per spese di recupero.",
    PAID: "FATTURA PAGATA",
    FOOTER_TITLE: "Riserva di proprietà",
    FOOTER_TEXT:
      "La proprietà dei beni rimane a Lazurco fino al pagamento completo.",
  },
  nl: {
    BRAND: "OculaRest",
    BRAND_BY: "door Lazurco",
    WEBSITE: "www.ocularest.fr",
    FACTURE: "FACTUUR",
    CLIENT: "Klant",
    DATE: "Datum:",
    INVOICE_NO: "Factuurnummer:",
    YOUR_ORDER: "Uw bestelling",
    EMAIL: "Klant e-mail:",
    REFERENCE: "Referentie",
    DESIGNATION: "Omschrijving",
    QTY: "Aantal",
    UNIT_PRICE: "Stuksprijs excl. btw",
    TOTAL_PRICE: "Totaal excl. btw",
    SHIPPING: "Verzending",
    TOTAL_HT: "Subtotaal",
    VAT: "BTW",
    TOTAL_TTC: "Totaal incl. btw",
    PAYMENT_TITLE: "Betalingsvoorwaarden:",
    PAYMENT_METHOD: "Betaalmethode: Creditcard",
    PAYMENT_DATE: "Betaling ontvangen op:",
    EARLY_DISCOUNT: "Korting bij vooruitbetaling: geen",
    LATE_PENALTY: "Boete bij te late betaling: 3× wettelijke rente",
    RECOVERY: "Vaste vergoeding van 40 EUR voor incassokosten.",
    PAID: "BETAALDE FACTUUR",
    FOOTER_TITLE: "Eigendomsvoorbehoud",
    FOOTER_TEXT:
      "De goederen blijven eigendom van Lazurco tot volledige betaling.",
  },
};

/* =========================================================
   TYPES
========================================================= */

type ShippingAddress = {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

type OrderItem = {
  name?: any;
  description?: string;
  price?: number | { eur?: number };
  quantity?: number;
};

type OrderTotals = {
  totalHT?: number;
  totalVAT?: number;
  totalTTC?: number;
  vatRate?: number;
};

type Order = {
  email?: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod?: { price?: number | { eur?: number } };
  shippingPrice?: number;
  totals?: OrderTotals;
  orderNumber?: string;
};

type GenOpts = {
  locale?: Locale;
  invoiceNumber?: string;
  issueDate?: Date;
  vatRate?: number;
  paidLabel?: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

const safeString = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const formatMoney = (n: number) =>
  `${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)} €`;

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;

const drawLine = (
  page: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: any,
  thickness = 1
) =>
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color,
  });

const getItemUnitPrice = (it: OrderItem) => {
  // ✅ PRIORITÉ : ton vrai champ BDD
  if (typeof (it as any).priceHT === "number") {
    return (it as any).priceHT;
  }

  // fallback legacy
  if (typeof it.price === "number") return it.price;

  if (typeof it.price === "object" && typeof it.price?.eur === "number") {
    return it.price.eur;
  }

  return 0;
};

const getItemName = (it: OrderItem) => {
  if (typeof it.name === "string") return it.name;
  return it.name?.fr || it.name?.en || "Produit";
};

/** Livraison : on lit shippingPrice (HT) */
const getShippingPrice = (order: Order) => {
  const v = order.shippingPrice;
  return typeof v === "number" ? v : 0;
};

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

/* =========================================================
   MAIN
========================================================= */

export async function generateInvoicePDF(
  order: Order,
  orderId: string,
  opts: GenOpts = {}
): Promise<Buffer> {
  const locale: Locale = opts.locale ?? "fr";
  const t = I18N[locale];

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width: W, height: H } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const BLUE = rgb(0.14, 0.35, 0.86);
  const BLUE_DARK = rgb(0.05, 0.18, 0.55);
  const INK = rgb(0.06, 0.07, 0.1);
  const MUTED = rgb(0.4, 0.45, 0.55);
  const BORDER = rgb(0.86, 0.89, 0.93);
  const LIGHT = rgb(0.94, 0.97, 1);
  const GREEN = rgb(0.06, 0.63, 0.42);

  const M = 42;
  const GUTTER = 22;

  const leftW = 185;
  const leftX = M;
  const rightX = leftX + leftW + GUTTER;
  const rightW = W - rightX - M;

  const issueDate = opts.issueDate ?? new Date();
  const VAT = order.totals?.vatRate ?? opts.vatRate ?? 0.2;

  // 🔥 Source unique de vérité : numéro métier
  const invoiceNumber =
    order.orderNumber ?? opts.invoiceNumber ?? orderId;

  // Ce qui s'affiche comme "Votre commande"
  const displayId = invoiceNumber;

  /* HEADER TOP */
  let yTop = H - M;
  const logo = await loadLogo(pdfDoc);
  if (logo) {
    const maxW = 110;
    const scale = maxW / logo.width;
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    page.drawImage(logo, { x: leftX, y: yTop - lh, width: lw, height: lh });
  }

  let yLeft = H - M - 80;
  const companyLines = [
    "LAZURCO",
    "189 avenue de Fabron",
    "06200 Nice, FRANCE",
    "",
    "SIRET : 831 588 926 00012",
    "TVA : FR52831588926",
    "",
    "Email : contact@hdconnects.com",
    "Site : www.vitrectomed.com",
  ];
  for (const line of companyLines) {
    if (!line) {
      yLeft -= 10;
      continue;
    }
    page.drawText(line, {
      x: leftX,
      y: yLeft,
      size: line === "LAZURCO" ? 10 : 8.5,
      font: line === "LAZURCO" ? bold : regular,
      color: line === "LAZURCO" ? INK : MUTED,
    });
    yLeft -= 12;
  }

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
  page.drawRectangle({
    x: rightX,
    y: headerY + headerH - 9,
    width: rightW,
    height: 9,
    color: BLUE,
  });
  page.drawText(t.BRAND, {
    x: rightX + 14,
    y: headerY + 18,
    size: 13,
    font: bold,
    color: INK,
  });
  page.drawText(t.BRAND_BY, {
    x: rightX + 14,
    y: headerY + 6,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  const factW = bold.widthOfTextAtSize(t.FACTURE, 11);
  page.drawText(t.FACTURE, {
    x: rightX + rightW - factW - 14,
    y: headerY + 14,
    size: 11,
    font: bold,
    color: INK,
  });

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
  page.drawRectangle({
    x: rightX,
    y: clientBoxY + clientBoxH - 18,
    width: rightW,
    height: 18,
    color: BLUE_DARK,
  });
  const clientLabelW = bold.widthOfTextAtSize(t.CLIENT, 10);
  page.drawText(t.CLIENT, {
    x: rightX + rightW / 2 - clientLabelW / 2,
    y: clientBoxY + clientBoxH - 14,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  // ----- BLOC CLIENT (avec téléphone) -----
  const a = order.shippingAddress || {};
  const billing = order.billingAddress || {};

  let cy = clientBoxY + clientBoxH - 36;
  const clientLines = [
    safeString(a.name).toUpperCase(),
    safeString(a.address),
    `${safeString(a.postalCode)} ${safeString(a.city)}`.trim(),
    safeString(a.country || "FR"),
  ].filter(Boolean);

  for (const line of clientLines) {
    page.drawText(line, {
      x: rightX + 12,
      y: cy,
      size: 9,
      font: regular,
      color: INK,
    });
    cy -= 13;
  }

  const phone = a.phone || billing.phone;
  if (phone) {
    page.drawText(`Tél : ${safeString(phone)}`, {
      x: rightX + 12,
      y: cy,
      size: 9,
      font: regular,
      color: INK,
    });
    cy -= 13;
  }

  const infoRowY = clientBoxY - 28;
  drawLine(page, leftX, infoRowY + 14, W - M, infoRowY + 14, BORDER);
  page.drawText(t.DATE, {
    x: leftX,
    y: infoRowY,
    size: 9,
    font: bold,
    color: INK,
  });
  page.drawText(formatDate(issueDate), {
    x: leftX + 42,
    y: infoRowY,
    size: 9,
    font: regular,
    color: INK,
  });
  const invW = bold.widthOfTextAtSize(t.INVOICE_NO, 9);
  page.drawText(t.INVOICE_NO, {
    x: rightX + rightW - invW - 120,
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

  const metaBoxYTop = infoRowY - 12;
  const metaH = 58;
  const metaY = metaBoxYTop - metaH;
  page.drawRectangle({
    x: leftX,
    y: metaY,
    width: W - 2 * M,
    height: metaH,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 1,
  });
  page.drawText(t.YOUR_ORDER, {
    x: leftX + 12,
    y: metaY + 38,
    size: 8,
    font: regular,
    color: MUTED,
  });
  page.drawText(t.WEBSITE, {
    x: leftX + 12,
    y: metaY + 26,
    size: 8.5,
    font: bold,
    color: BLUE_DARK,
  });
  page.drawText(displayId, {
    x: leftX + 180,
    y: metaY + 26,
    size: 8.5,
    font: regular,
    color: INK,
  });
  const email = safeString(order.email || "");
  page.drawText(t.EMAIL, {
    x: leftX + 12,
    y: metaY + 10,
    size: 8,
    font: regular,
    color: MUTED,
  });
  page.drawText(email || "-", {
    x: leftX + 80,
    y: metaY + 10,
    size: 8.5,
    font: regular,
    color: INK,
  });

  const tableTop = metaY - 22;
  const cols = [
    { label: t.REFERENCE, w: 76 },
    { label: t.DESIGNATION, w: 220 },
    { label: t.QTY, w: 70 },
    { label: t.UNIT_PRICE, w: 95 },
    { label: t.TOTAL_PRICE, w: 92 },
  ];
  const tableX = leftX;
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  page.drawRectangle({
    x: tableX,
    y: tableTop - 18,
    width: tableW,
    height: 18,
    color: BLUE_DARK,
  });
  let cx2 = tableX;
  for (const c of cols) {
    page.drawText(c.label, {
      x: cx2 + 6,
      y: tableTop - 13,
      size: 8,
      font: bold,
      color: rgb(1, 1, 1),
    });
    cx2 += c.w;
  }

  const rowH = 22;
  let y = tableTop - 18;

  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items.map((it) => {
    const qty = Number(it.quantity || 1);
    const unit = getItemUnitPrice(it);
    return {
      name: getItemName(it),
      qty,
      unit,
      total: qty * unit,
    };
  });

  const shippingHT = getShippingPrice(order);
  if (shippingHT > 0) {
    rows.push({
      name: t.SHIPPING,
      qty: 1,
      unit: shippingHT,
      total: shippingHT,
    });
  }

  const grid = rgb(0.82, 0.86, 0.93);
  for (const r of rows) {
    y -= rowH;
    page.drawRectangle({
      x: tableX,
      y,
      width: tableW,
      height: rowH,
      borderColor: grid,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    let x = tableX;
    page.drawText("", {
      x: x + 6,
      y: y + 7,
      size: 8.5,
      font: regular,
      color: INK,
    });
    x += cols[0].w;
    page.drawText(r.name, {
      x: x + 6,
      y: y + 7,
      size: 8.5,
      font: regular,
      color: INK,
    });
    x += cols[1].w;
    page.drawText(String(r.qty), {
      x: x + 6,
      y: y + 7,
      size: 8.5,
      font: regular,
      color: INK,
    });
    x += cols[2].w;
    page.drawText(formatMoney(r.unit), {
      x: x + 6,
      y: y + 7,
      size: 8.5,
      font: regular,
      color: INK,
    });
    x += cols[3].w;
    page.drawText(formatMoney(r.total), {
      x: x + 6,
      y: y + 7,
      size: 8.5,
      font: regular,
      color: INK,
    });
  }

  const totalHT = order.totals?.totalHT ?? 0;
  const vatAmount = order.totals?.totalVAT ?? 0;
  const totalTTC = order.totals?.totalTTC ?? 0;

  const totalsX = tableX + tableW - 200;
  const totalsY = y - 20;
  const gap = 14;

  page.drawText(t.TOTAL_HT, {
    x: totalsX + 70,
    y: totalsY,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  page.drawText(formatMoney(totalHT), {
    x: totalsX + 140,
    y: totalsY,
    size: 8.5,
    font: bold,
    color: INK,
  });

  page.drawText(
    `${t.VAT} ${Math.round((order.totals?.vatRate ?? VAT) * 100)}%`,
    {
      x: totalsX + 70,
      y: totalsY - gap,
      size: 8.5,
      font: regular,
      color: MUTED,
    }
  );
  page.drawText(formatMoney(vatAmount), {
    x: totalsX + 140,
    y: totalsY - gap,
    size: 8.5,
    font: bold,
    color: INK,
  });

  page.drawText(t.TOTAL_TTC, {
    x: totalsX + 70,
    y: totalsY - 2 * gap,
    size: 9,
    font: bold,
    color: MUTED,
  });
  page.drawText(formatMoney(totalTTC), {
    x: totalsX + 140,
    y: totalsY - 2 * gap,
    size: 9,
    font: bold,
    color: INK,
  });

  const payY = totalsY - 80;
  page.drawText(t.PAYMENT_TITLE, {
    x: leftX,
    y: payY,
    size: 8.8,
    font: bold,
    color: INK,
  });
  const payLines = [
    t.PAYMENT_METHOD,
    `${t.PAYMENT_DATE} ${formatDate(issueDate)}`,
    t.EARLY_DISCOUNT,
    t.LATE_PENALTY,
    t.RECOVERY,
  ];
  let py = payY - 14;
  for (const l of payLines) {
    page.drawText(l, {
      x: leftX,
      y: py,
      size: 7.3,
      font: regular,
      color: MUTED,
    });
    py -= 10;
  }

  if (opts.paidLabel !== false) {
    const pw = bold.widthOfTextAtSize(t.PAID, 9.5);
    page.drawText(t.PAID, {
      x: rightX + rightW / 2 - pw / 2,
      y: payY - 48,
      size: 9.5,
      font: bold,
      color: GREEN,
    });
  }

  const footerY = 70;
  page.drawRectangle({
    x: M,
    y: footerY,
    width: W - 2 * M,
    height: 8,
    color: BLUE_DARK,
  });
  page.drawText(t.FOOTER_TITLE, {
    x: W / 2 - bold.widthOfTextAtSize(t.FOOTER_TITLE, 8) / 2,
    y: footerY - 18,
    size: 8,
    font: bold,
    color: INK,
  });
  page.drawText(t.FOOTER_TEXT, {
    x: M,
    y: footerY - 32,
    size: 7,
    font: regular,
    color: MUTED,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}