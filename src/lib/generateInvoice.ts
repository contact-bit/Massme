import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/* ============================================================
   CONFIG
============================================================ */

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

export type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

/* ============================================================
   TYPES
============================================================ */

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
  amount_total?: number;
  total?: number;
  status?: string;
};

type GenOpts = {
  locale?: Locale;
  invoiceNumber?: string;
  issueDate?: Date;
  vatRate?: number;
  paidLabel?: boolean;
};

/* ============================================================
   I18N
============================================================ */

const I18N: Record<Locale, any> = {
  fr: {
    invoice: "FACTURE",
    client: "Client",
    date: "Date",
    invoiceNo: "N° Facture",
    yourOrder: "Votre commande",
    email: "Email client",
    reference: "Référence",
    designation: "Désignation",
    quantity: "Quantité",
    unitPrice: "Prix unitaire HT",
    totalPrice: "Prix total HT",
    shipping: "Livraison",
    totalHT: "Total HT",
    vat: "TVA",
    totalTTC: "Total TTC",
    paid: "FACTURE ACQUITTEE",
    paymentTitle: "Conditions de paiement :",
    paymentLines: [
      "Mode de paiement : Carte bancaire",
      "Escompte pour paiement anticipé : néant",
      "Pénalité de retard : 3 fois le taux légal",
      "Indemnité forfaitaire de 40 EUR pour frais de recouvrement (art. L441-5 du code de commerce).",
    ],
    paidOn: "Paiement reçu le",
    footerTitle: "Réserve de propriété",
    footerText:
      "Lazurco conserve l'entière propriété des biens jusqu'au paiement complet de la commande.",
  },

  en: {
    invoice: "INVOICE",
    client: "Customer",
    date: "Date",
    invoiceNo: "Invoice No.",
    yourOrder: "Your order",
    email: "Customer email",
    reference: "Reference",
    designation: "Description",
    quantity: "Quantity",
    unitPrice: "Unit price excl. VAT",
    totalPrice: "Total excl. VAT",
    shipping: "Shipping",
    totalHT: "Subtotal",
    vat: "VAT",
    totalTTC: "Total incl. VAT",
    paid: "PAID INVOICE",
    paymentTitle: "Payment conditions:",
    paymentLines: [
      "Payment method: Credit card",
      "Early payment discount: none",
      "Late payment penalty: 3× legal interest rate",
      "Fixed compensation of 40 EUR for recovery costs.",
    ],
    paidOn: "Paid on",
    footerTitle: "Retention of title",
    footerText:
      "Ownership of goods remains with Lazurco until full payment is received.",
  },

  es: {
    invoice: "FACTURA",
    client: "Cliente",
    date: "Fecha",
    invoiceNo: "N° Factura",
    yourOrder: "Su pedido",
    email: "Email cliente",
    reference: "Referencia",
    designation: "Descripción",
    quantity: "Cantidad",
    unitPrice: "Precio unitario sin IVA",
    totalPrice: "Total sin IVA",
    shipping: "Envío",
    totalHT: "Total sin IVA",
    vat: "IVA",
    totalTTC: "Total con IVA",
    paid: "FACTURA PAGADA",
    paymentTitle: "Condiciones de pago:",
    paymentLines: [
      "Método de pago: Tarjeta",
      "Descuento por pronto pago: ninguno",
      "Penalización por retraso: 3× interés legal",
      "Indemnización fija de 40 EUR por costes de cobro.",
    ],
    paidOn: "Pagado el",
    footerTitle: "Reserva de dominio",
    footerText:
      "Lazurco conserva la propiedad de los bienes hasta el pago completo.",
  },

  de: {
    invoice: "RECHNUNG",
    client: "Kunde",
    date: "Datum",
    invoiceNo: "Rechnungsnummer",
    yourOrder: "Ihre Bestellung",
    email: "Kunden-E-Mail",
    reference: "Referenz",
    designation: "Bezeichnung",
    quantity: "Menge",
    unitPrice: "Stückpreis netto",
    totalPrice: "Gesamt netto",
    shipping: "Lieferung",
    totalHT: "Zwischensumme",
    vat: "MwSt",
    totalTTC: "Gesamtbetrag",
    paid: "BEZAHLTE RECHNUNG",
    paymentTitle: "Zahlungsbedingungen:",
    paymentLines: [
      "Zahlungsart: Kreditkarte",
      "Skonto: keiner",
      "Verzugszinsen: 3× gesetzlicher Zinssatz",
      "Pauschale Entschädigung von 40 EUR für Inkassokosten.",
    ],
    paidOn: "Bezahlt am",
    footerTitle: "Eigentumsvorbehalt",
    footerText:
      "Die Ware bleibt bis zur vollständigen Bezahlung Eigentum von Lazurco.",
  },

  it: {
    invoice: "FATTURA",
    client: "Cliente",
    date: "Data",
    invoiceNo: "N° Fattura",
    yourOrder: "Il tuo ordine",
    email: "Email cliente",
    reference: "Riferimento",
    designation: "Descrizione",
    quantity: "Quantità",
    unitPrice: "Prezzo unitario IVA escl.",
    totalPrice: "Totale IVA escl.",
    shipping: "Spedizione",
    totalHT: "Totale IVA escl.",
    vat: "IVA",
    totalTTC: "Totale IVA incl.",
    paid: "FATTURA PAGATA",
    paymentTitle: "Condizioni di pagamento:",
    paymentLines: [
      "Metodo di pagamento: Carta",
      "Sconto per pagamento anticipato: nessuno",
      "Penale di ritardo: 3× tasso legale",
      "Indennità fissa di 40 EUR per spese di recupero.",
    ],
    paidOn: "Pagato il",
    footerTitle: "Riserva di proprietà",
    footerText:
      "La proprietà dei beni rimane a Lazurco fino al pagamento completo.",
  },

  nl: {
    invoice: "FACTUUR",
    client: "Klant",
    date: "Datum",
    invoiceNo: "Factuurnummer",
    yourOrder: "Uw bestelling",
    email: "Klant e-mail",
    reference: "Referentie",
    designation: "Omschrijving",
    quantity: "Aantal",
    unitPrice: "Stuksprijs excl. btw",
    totalPrice: "Totaal excl. btw",
    shipping: "Verzending",
    totalHT: "Subtotaal",
    vat: "BTW",
    totalTTC: "Totaal incl. btw",
    paid: "BETAALDE FACTUUR",
    paymentTitle: "Betalingsvoorwaarden:",
    paymentLines: [
      "Betaalmethode: Creditcard",
      "Korting bij vooruitbetaling: geen",
      "Boete bij te late betaling: 3× wettelijke rente",
      "Vaste vergoeding van 40 EUR voor incassokosten.",
    ],
    paidOn: "Betaald op",
    footerTitle: "Eigendomsvoorbehoud",
    footerText:
      "De goederen blijven eigendom van Lazurco tot volledige betaling.",
  },
};

/* ============================================================
   HELPERS
============================================================ */

const safeString = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const formatMoney = (n: number) =>
  `${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)} €`;

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;

const getItemName = (it: OrderItem, locale: Locale) =>
  typeof it?.name === "string"
    ? it.name
    : it?.name?.[locale] || it?.name?.fr || it?.name?.en || "Product";

const getUnitPrice = (it: OrderItem) =>
  typeof it?.price === "number" ? it.price : it?.price?.eur || 0;

/* ============================================================
   PDF GENERATOR (LAYOUT IDENTIQUE)
============================================================ */

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

  const INK = rgb(0.06, 0.07, 0.1);
  const MUTED = rgb(0.4, 0.45, 0.55);
  const BLUE = rgb(0.14, 0.35, 0.86);
  const BLUE_DARK = rgb(0.05, 0.18, 0.55);
  const GREEN = rgb(0.06, 0.63, 0.42);

  const issueDate = opts.issueDate ?? new Date();
  const VAT = opts.vatRate ?? 0.2;

  /* ================= HEADER ================= */

  page.drawText(t.invoice, {
    x: W - 160,
    y: H - 60,
    size: 16,
    font: bold,
    color: INK,
  });

  page.drawText(`${t.date} : ${formatDate(issueDate)}`, {
    x: W - 220,
    y: H - 85,
    size: 9,
    font: regular,
    color: MUTED,
  });

  page.drawText(`${t.invoiceNo} : ${opts.invoiceNumber ?? orderId}`, {
    x: W - 220,
    y: H - 100,
    size: 9,
    font: regular,
    color: MUTED,
  });

  /* ================= ITEMS ================= */

  let y = H - 170;
  let totalHT = 0;

  for (const it of order.items ?? []) {
    const qty = it.quantity ?? 1;
    const unit = getUnitPrice(it);
    const total = qty * unit;
    totalHT += total;

    page.drawText(getItemName(it, locale), {
      x: 50,
      y,
      size: 9,
      font: regular,
      color: INK,
    });

    page.drawText(String(qty), { x: 320, y, size: 9, font: regular });
    page.drawText(formatMoney(unit), { x: 370, y, size: 9, font: regular });
    page.drawText(formatMoney(total), { x: 460, y, size: 9, font: regular });

    y -= 18;
  }

  /* ================= TOTALS ================= */

  const vatAmount = totalHT * VAT;
  const totalTTC = totalHT + vatAmount;

  y -= 20;
  page.drawText(`${t.totalHT} : ${formatMoney(totalHT)}`, {
    x: 350,
    y,
    size: 9,
    font: regular,
  });

  y -= 14;
  page.drawText(`${t.vat} ${VAT * 100}% : ${formatMoney(vatAmount)}`, {
    x: 350,
    y,
    size: 9,
    font: regular,
  });

  y -= 16;
  page.drawText(`${t.totalTTC} : ${formatMoney(totalTTC)}`, {
    x: 350,
    y,
    size: 10,
    font: bold,
  });

  /* ================= PAYMENT ================= */

  y -= 40;
  page.drawText(t.paymentTitle, {
    x: 50,
    y,
    size: 9,
    font: bold,
  });

  y -= 14;
  for (const l of t.paymentLines) {
    page.drawText(l, { x: 50, y, size: 7.5, font: regular, color: MUTED });
    y -= 11;
  }

  page.drawText(`${t.paidOn} : ${formatDate(issueDate)}`, {
    x: 50,
    y,
    size: 7.5,
    font: regular,
    color: MUTED,
  });

  if (opts.paidLabel !== false) {
    page.drawText(t.paid, {
      x: W / 2 - 80,
      y: 110,
      size: 11,
      font: bold,
      color: GREEN,
    });
  }

  /* ================= FOOTER ================= */

  page.drawText(t.footerTitle, {
    x: W / 2 - bold.widthOfTextAtSize(t.footerTitle, 8) / 2,
    y: 80,
    size: 8,
    font: bold,
    color: INK,
  });

  page.drawText(t.footerText, {
    x: 50,
    y: 65,
    size: 7,
    font: regular,
    color: MUTED,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
