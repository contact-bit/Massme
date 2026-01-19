import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/* ===================== CONFIG ===================== */

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

/* ===================== I18N ===================== */

export type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const I18N: Record<Locale, Record<string, string>> = {
  fr: {
    FACTURE: "FACTURE",
    CLIENT: "Client",
    DATE: "Date :",
    INVOICE_NO: "N° Facture :",
    YOUR_ORDER: "Votre commande",
    EMAIL: "Email client :",
    REFERENCE: "Reference",
    DESIGNATION: "Designation",
    QTY: "Quantite",
    UNIT_PRICE: "Prix unitaire HT",
    TOTAL_PRICE: "Prix Total HT",
    SHIPPING: "Livraison",
    TOTAL_HT: "Total HT",
    VAT: "TVA",
    TOTAL_TTC: "Total TTC",
    PAYMENT_TITLE: "Conditions de paiement :",
    PAYMENT_METHOD: "Mode de paiement : Carte bancaire",
    PAYMENT_DATE: "Paiement recu le :",
    EARLY_DISCOUNT: "Escompte pour paiement anticipe : neant",
    LATE_PENALTY: "Penalite de retard : 3 fois le taux legal",
    RECOVERY:
      "Indemnite forfaitaire de 40 EUR pour frais de recouvrement (art. L441-5 du code de commerce).",
    PAID: "FACTURE ACQUITTEE",
    FOOTER_TITLE: "Reserve de propriete",
    FOOTER_TEXT:
      "Lazurco conserve l'entière propriete des biens jusqu'au paiement complet de la commande (loi 80335 du 12 mai 1980).",
  },

  en: {
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
    FACTURE: "FACTURA",
    CLIENT: "Cliente",
    DATE: "Fecha:",
    INVOICE_NO: "N° Factura:",
    YOUR_ORDER: "Su pedido",
    EMAIL: "Email cliente:",
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
      "Lazurco conserva la propiedad de los bienes hasta el pago completo.",
  },

  de: {
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
    LATE_PENALTY: "Penale di ritardo: 3× tasso legale",
    RECOVERY: "Indennità fissa di 40 EUR per spese di recupero.",
    PAID: "FATTURA PAGATA",
    FOOTER_TITLE: "Riserva di proprietà",
    FOOTER_TEXT:
      "La proprietà dei beni rimane a Lazurco fino al pagamento completo.",
  },

  nl: {
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

/* ===================== TYPES ===================== */

type OrderItem = {
  name?: any;
  description?: string;
  price?: number | { eur?: number };
  quantity?: number;
};

type Order = {
  email?: string;
  items?: OrderItem[];
  shippingAddress?: any;
  shippingMethod?: { price?: number | { eur?: number } };
  shippingPrice?: number;
};

type GenOpts = {
  locale?: Locale;
  invoiceNumber?: string;
  issueDate?: Date;
  vatRate?: number;
  paidLabel?: boolean;
};

/* ===================== HELPERS ===================== */

const safeString = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const formatMoney = (n: number) =>
  `${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)} €`;

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(d.getFullYear()).slice(-2)}`;

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

/* ===================== MAIN ===================== */

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

  const BLUE_DARK = rgb(0.05, 0.18, 0.55);
  const INK = rgb(0.06, 0.07, 0.1);
  const MUTED = rgb(0.4, 0.45, 0.55);
  const BORDER = rgb(0.86, 0.89, 0.93);
  const GREEN = rgb(0.06, 0.63, 0.42);

  const M = 42;
  const leftX = M;
  const rightX = W / 2;
  const rightW = W - rightX - M;

  const issueDate = opts.issueDate ?? new Date();
  const VAT = opts.vatRate ?? 0.2;

  const invoiceNumber =
    opts.invoiceNumber ??
    `F${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(issueDate.getDate()).padStart(2, "0")}`;

  /* ===== HEADER ===== */

  const factSize = 11;
  const factW = bold.widthOfTextAtSize(t.FACTURE, factSize);

  page.drawText(t.FACTURE, {
    x: rightX + rightW - factW,
    y: H - M - 20,
    size: factSize,
    font: bold,
    color: INK,
  });

  /* ===== DATE / INVOICE ===== */

  page.drawText(t.DATE, { x: leftX, y: H - M - 80, size: 9, font: bold });
  page.drawText(formatDate(issueDate), {
    x: leftX + 42,
    y: H - M - 80,
    size: 9,
    font: regular,
  });

  page.drawText(t.INVOICE_NO, {
    x: rightX,
    y: H - M - 80,
    size: 9,
    font: bold,
  });
  page.drawText(invoiceNumber, {
    x: rightX + 90,
    y: H - M - 80,
    size: 9,
    font: bold,
  });

  /* ===== TOTALS ===== */

  const items = order.items ?? [];
  const totalHT = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (it.quantity || 1),
    0
  );
  const vatAmount = totalHT * VAT;
  const totalTTC = totalHT + vatAmount;

  page.drawText(t.TOTAL_HT, { x: rightX, y: 200, size: 9, font: regular });
  page.drawText(formatMoney(totalHT), {
    x: rightX + 120,
    y: 200,
    size: 9,
    font: bold,
  });

  page.drawText(`${t.VAT} ${Math.round(VAT * 100)}%`, {
    x: rightX,
    y: 180,
    size: 9,
    font: regular,
  });
  page.drawText(formatMoney(vatAmount), {
    x: rightX + 120,
    y: 180,
    size: 9,
    font: bold,
  });

  page.drawText(t.TOTAL_TTC, { x: rightX, y: 160, size: 9, font: bold });
  page.drawText(formatMoney(totalTTC), {
    x: rightX + 120,
    y: 160,
    size: 9,
    font: bold,
  });

  /* ===== PAID ===== */

  if (opts.paidLabel !== false) {
    page.drawText(t.PAID, {
      x: rightX,
      y: 120,
      size: 10,
      font: bold,
      color: GREEN,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
