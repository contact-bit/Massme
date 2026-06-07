// src/lib/mailer.ts
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const resend = new Resend(process.env.RESEND_API_KEY);

export type OrderEmailPayload = {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_status: string;
  provider?: "stripe" | "paypal" | "bank_transfer";
  created_at?: any;
  orderData?: any;
  locale?: "fr" | "en" | "es" | "de" | "it" | "nl";
  orderNumber?: string;
  invoiceNumber?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(cents: number, currency: string) {
  const value = (Number(cents || 0) / 100).toFixed(2);
  return `${value} ${String(currency || "EUR").toUpperCase()}`;
}

function toDate(created_at: any) {
  if (!created_at) return new Date();
  if (created_at?._seconds) return new Date(created_at._seconds * 1000);
  if (created_at?.toDate) return created_at.toDate();
  const d = new Date(created_at);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function safeEmailList(raw?: string) {
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim()).filter(Boolean);
}

function resolveLogisticsEmails() {
  const multi = safeEmailList(process.env.LOGISTICS_EMAILS);
  if (multi.length > 0) return multi;
  return safeEmailList(process.env.LOGISTICS_EMAIL);
}

function resolveOrderNumber(order: OrderEmailPayload): string {
  const fromOrderData =
    typeof order?.orderData?.orderNumber === "string" &&
    order.orderData.orderNumber.trim()
      ? order.orderData.orderNumber.trim()
      : null;

  const fromRoot =
    typeof order?.orderNumber === "string" && order.orderNumber.trim()
      ? order.orderNumber.trim()
      : null;

  return fromOrderData || fromRoot || order.id || "UNKNOWN_ORDER";
}

function resolveInvoiceNumber(order: OrderEmailPayload) {
  const invoiceEmail =
    order?.orderData?.invoiceEmail &&
    typeof order.orderData.invoiceEmail === "object"
      ? order.orderData.invoiceEmail
      : {};

  const candidates = [
    order?.orderData?.invoiceNumber,
    invoiceEmail?.invoiceNumber,
    order?.invoiceNumber,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      /^FID\d{5,}$/.test(candidate.trim())
    ) {
      return candidate.trim();
    }
  }

  return resolveOrderNumber(order);
}

function buildInvoiceFilename(invoiceNumber: string) {
  return `facture-${invoiceNumber}.pdf`;
}

/* =========================================================
   INVOICE
========================================================= */

async function buildInvoiceAttachment(order: OrderEmailPayload) {
  const orderData = order.orderData;
  if (!orderData) return { attachment: null, error: "Missing orderData" };

  try {
    const locale = (order.locale || orderData?.locale || "fr") as any;
    const orderNumber = resolveOrderNumber(order);
    const invoiceNumber = resolveInvoiceNumber(order);

    const pdfBuffer = await generateInvoicePDF(
      {
        email: orderData?.email || order.customer_email,
        items: orderData?.items || [],
        shippingAddress: orderData?.shippingAddress || {},
        billingAddress: orderData?.billingAddress || {},
        shippingPrice:
          orderData?.totals?.shipHT ??
          orderData?.shippingMethod?.priceHT ??
          orderData?.shippingPrice ??
          0,
        totals: {
          totalHT: Number(orderData?.totals?.totalHT || 0),
          totalVAT: Number(orderData?.totals?.totalVAT || 0),
          totalTTC: Number(orderData?.totals?.totalTTC || 0),
        },
        orderNumber,
        invoiceNumber,
      },
      orderNumber,
      {
        locale,
        invoiceNumber,
        paidLabel: true,
      }
    );

    return {
      attachment: {
        filename: buildInvoiceFilename(invoiceNumber),
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
      error: null,
    };
  } catch (e: any) {
    return {
      attachment: null,
      error: String(e?.message || e),
    };
  }
}

/* =========================================================
   MAIN
========================================================= */

export async function sendOrderEmails({
  order,
  clientEmail,
}: {
  order: OrderEmailPayload;
  clientEmail: string;
}) {
  const sender =
    process.env.RESEND_FROM || "Vitrectomed Support <contact@hdconnects.com>";

  const created = toDate(order.created_at);
  const amountText = formatMoney(order.amount_total, order.currency);
  const orderNumber = resolveOrderNumber(order);
  const invoiceNumber = resolveInvoiceNumber(order);

  const providerLabel =
    order.provider === "stripe"
      ? "Stripe"
      : order.provider === "paypal"
      ? "PayPal"
      : order.provider === "bank_transfer"
      ? "Virement bancaire"
      : "Paiement";

  const adminEmail = process.env.ADMIN_EMAIL || "contact@hdconnects.com";
  const logisticsEmails = resolveLogisticsEmails();

  /* =========================================================
     CLIENT EMAIL
  ========================================================= */

  const subjectClient = `Commande ${orderNumber} confirmée`;

  const htmlClient = `
<div style="font-family:Arial,sans-serif;padding:24px;color:#111">
  <h2>Merci pour votre commande</h2>
  <p>Votre paiement de <strong>${amountText}</strong> a bien été reçu.</p>
  <p><strong>Commande :</strong> ${orderNumber}</p>
  <p><strong>Moyen de paiement :</strong> ${providerLabel}</p>
  <p>Votre facture est jointe à cet email.</p>
</div>
`;

  const textClient = `
Merci pour votre commande

Commande: ${orderNumber}
Montant: ${amountText}
Paiement: ${providerLabel}
`.trim();

  /* =========================================================
     ADMIN
  ========================================================= */

  const textAdmin = `
Nouvelle commande

Commande: ${orderNumber}
Email: ${order.customer_email}
Montant: ${amountText}
`.trim();

  /* =========================================================
     LOGISTICS
  ========================================================= */

  const textLogistics = `
Préparer commande

Commande: ${orderNumber}
Client: ${order.customer_email}
Montant: ${amountText}
`.trim();

  const invoiceResult = await buildInvoiceAttachment(order);
  const attachments = invoiceResult.attachment ? [invoiceResult.attachment] : undefined;

  /* =========================================================
     SEND
  ========================================================= */

  const clientRes = await resend.emails.send({
    from: sender,
    to: clientEmail,
    subject: subjectClient,
    text: textClient,
    html: htmlClient,
    attachments,
  });

  const adminRes = await resend.emails.send({
    from: sender,
    to: adminEmail,
    subject: `Nouvelle commande ${orderNumber}`,
    text: textAdmin,
    attachments,
  });

  const logistics = [];

  for (const email of logisticsEmails) {
    const res = await resend.emails.send({
      from: sender,
      to: email,
      subject: `Préparer commande ${orderNumber}`,
      text: textLogistics,
      attachments,
    });

    logistics.push({
      to: email,
      resendId: (res as any)?.data?.id || null,
    });
  }

  /* =========================================================
     ❌ PLUS AUCUN EMAIL AVIS ICI
  ========================================================= */

  return {
    ok: true,
    orderNumber,
    invoiceNumber,
    invoice: {
      attached: Boolean(invoiceResult.attachment),
      error: invoiceResult.error,
    },
    client: {
      resendId: (clientRes as any)?.data?.id || null,
    },
    admin: {
      resendId: (adminRes as any)?.data?.id || null,
    },
    logistics,
  };
}
