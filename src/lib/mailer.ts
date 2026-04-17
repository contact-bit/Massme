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
};

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
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function resolveLogisticsEmails() {
  const multi = safeEmailList(process.env.LOGISTICS_EMAILS);
  if (multi.length > 0) return multi;
  return safeEmailList(process.env.LOGISTICS_EMAIL);
}

function resolveOrderNumber(order: OrderEmailPayload): string {
  const fromOrderData =
    typeof order?.orderData?.orderNumber === "string" &&
    order.orderData.orderNumber.trim().length > 0
      ? order.orderData.orderNumber.trim()
      : typeof order?.orderData?.invoiceNumber === "string" &&
        order.orderData.invoiceNumber.trim().length > 0
      ? order.orderData.invoiceNumber.trim()
      : null;

  const fromRoot =
    typeof order?.orderNumber === "string" && order.orderNumber.trim().length > 0
      ? order.orderNumber.trim()
      : typeof (order as any)?.orderNumber === "string" &&
        (order as any).orderNumber.trim().length > 0
      ? (order as any).orderNumber.trim()
      : null;

  const fallbackId =
    typeof order?.id === "string" && order.id.trim().length > 0
      ? order.id.trim()
      : "UNKNOWN_ORDER";

  return fromOrderData || fromRoot || fallbackId;
}

function buildInvoiceFilename(orderNumber: string) {
  return `facture-${orderNumber}.pdf`;
}

async function buildInvoiceAttachment(order: OrderEmailPayload) {
  const orderData = order.orderData;
  if (!orderData) {
    return { attachment: null, error: "Missing orderData" };
  }

  try {
    const locale = (order.locale || orderData?.locale || "fr") as
      | "fr"
      | "en"
      | "es"
      | "de"
      | "it"
      | "nl";

    const orderNumber = resolveOrderNumber(order);

    const pdfBuffer = await generateInvoicePDF(
      {
        email: orderData?.email || order.customer_email,
        items: orderData?.items || [],
        shippingAddress: orderData?.shippingAddress || {},
        billingAddress: orderData?.billingAddress || {},
        shippingPrice:
          typeof orderData?.totals?.shipHT === "number"
            ? orderData.totals.shipHT
            : typeof orderData?.shippingMethod?.priceHT === "number"
            ? orderData.shippingMethod.priceHT
            : typeof orderData?.shippingPrice === "number"
            ? orderData.shippingPrice
            : 0,
        totals: {
          totalHT: Number(orderData?.totals?.totalHT || 0),
          totalVAT: Number(orderData?.totals?.totalVAT || orderData?.totals?.tax || 0),
          totalTTC: Number(orderData?.totals?.totalTTC || 0),
          vatRate:
            typeof orderData?.totals?.vatRate === "number"
              ? orderData.totals.vatRate > 1
                ? orderData.totals.vatRate / 100
                : orderData.totals.vatRate
              : undefined,
        },
        orderNumber,
        // customerFirstName / customerLastName retirés pour respecter le type attendu
      },
      orderNumber,
      {
        locale,
        paidLabel: true,
      }
    );

    return {
      attachment: {
        filename: buildInvoiceFilename(orderNumber),
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

function buildReviewBase(order: OrderEmailPayload, clientEmail: string) {
  const locale = order.locale || order.orderData?.locale || "fr";
  const base =
    process.env.REVIEW_BASE_URL?.trim() ||
    `https://hdconnects.com/${locale}/review`;

  return `${base}?order_id=${encodeURIComponent(order.id)}&email=${encodeURIComponent(
    clientEmail
  )}`;
}

function buildReviewUrl(base: string, rating: number) {
  return `${base}&rating=${rating}`;
}

async function sendReviewEmail({
  order,
  clientEmail,
}: {
  order: OrderEmailPayload;
  clientEmail: string;
}) {
  const sender =
    process.env.RESEND_FROM?.trim() || "Massme Support <contact@hdconnects.com>";

  const orderNumber = resolveOrderNumber(order);
  const reviewBase = buildReviewBase(order, clientEmail);

  const subject = `Votre avis sur la commande #${orderNumber}`;

  const starsRow = [1, 2, 3, 4, 5]
    .map(
      (n) => `
      <a href="${buildReviewUrl(reviewBase, n)}"
         style="text-decoration:none;font-size:32px;line-height:1;color:#f5b301;margin:0 4px;display:inline-block"
         target="_blank">★</a>`
    )
    .join("");

  const text = `
Bonjour,

Merci pour votre commande chez Massme.

Nous serions ravis d’avoir votre avis sur votre expérience.
Commande : ${orderNumber}

Donner une note :
1 étoile : ${buildReviewUrl(reviewBase, 1)}
2 étoiles : ${buildReviewUrl(reviewBase, 2)}
3 étoiles : ${buildReviewUrl(reviewBase, 3)}
4 étoiles : ${buildReviewUrl(reviewBase, 4)}
5 étoiles : ${buildReviewUrl(reviewBase, 5)}

À bientôt,
L’équipe Massme
  `.trim();

  const html = `
<div style="font-family:Arial,sans-serif;padding:24px;color:#111;text-align:center">
  <h2 style="margin:0 0 16px">Merci pour votre commande</h2>
  <p>Comment évalueriez-vous votre expérience pour la commande <strong>#${orderNumber}</strong> ?</p>
  <div style="margin:24px 0">${starsRow}</div>
  <p style="font-size:14px;color:#666">Cliquez sur une étoile pour laisser votre avis.</p>
  <p>À bientôt,<br/>L’équipe Massme</p>
</div>
  `.trim();

  const res = await resend.emails.send({
    from: sender,
    to: clientEmail,
    subject,
    text,
    html,
  });

  return {
    to: clientEmail,
    resendId: (res as any)?.data?.id || (res as any)?.id || null,
    reviewBase,
  };
}

export async function sendOrderEmails({
  order,
  clientEmail,
}: {
  order: OrderEmailPayload;
  clientEmail: string;
}) {
  const sender =
    process.env.RESEND_FROM?.trim() || "Massme Support <contact@hdconnects.com>";

  const created = toDate(order.created_at);
  const amountText = formatMoney(order.amount_total, order.currency);

  const providerLabel =
    order.provider === "stripe"
      ? "Stripe"
      : order.provider === "paypal"
      ? "PayPal"
      : order.provider === "bank_transfer"
      ? "Virement bancaire"
      : "Paiement";

  const adminEmail = (process.env.ADMIN_EMAIL || "contact@hdconnects.com").trim();
  const logisticsEmails = resolveLogisticsEmails();
  const orderNumber = resolveOrderNumber(order);

  const subjectClient = `Commande #${orderNumber} confirmée`;
  const subjectAdmin = `Nouvelle commande #${orderNumber}`;
  const subjectLogistics = `Préparer commande #${orderNumber}`;

  const textClient = `
Bonjour,

Merci pour votre commande chez Massme.
Votre paiement de ${amountText} a bien été reçu.

Moyen de paiement : ${providerLabel}
Commande : ${orderNumber}

Votre facture est jointe à cet email.

À bientôt,
L’équipe Massme
`.trim();

  const htmlClient = `
<div style="font-family:Arial,sans-serif;padding:24px;color:#111">
  <h2 style="margin:0 0 16px">Merci pour votre commande</h2>
  <p>Votre paiement de <strong>${amountText}</strong> a bien été reçu.</p>
  <p><strong>Commande :</strong> ${orderNumber}<br/>
  <strong>Moyen de paiement :</strong> ${providerLabel}</p>
  <p>Votre facture est jointe à cet email.</p>
  <p>À bientôt,<br/>L’équipe Massme</p>
</div>
`.trim();

  const textAdmin = `
Nouvelle commande reçue !

- Commande: ${orderNumber}
- Email client: ${order.customer_email}
- Montant: ${amountText}
- Statut: ${order.payment_status}
- Provider: ${providerLabel}
- Date: ${created.toLocaleString("fr-FR")}
`.trim();

  const textLogistics = `
Une nouvelle commande doit être traitée :

Commande : ${orderNumber}
Client : ${order.customer_email}
Montant : ${amountText}
Date : ${created.toLocaleString("fr-FR")}
Provider : ${providerLabel}
`.trim();

  const invoiceResult = await buildInvoiceAttachment(order);
  const attachments = invoiceResult.attachment ? [invoiceResult.attachment] : undefined;

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
    subject: subjectAdmin,
    text: textAdmin,
    attachments,
  });

  const logistics: Array<{ to: string; resendId: string | null }> = [];
  for (const email of logisticsEmails) {
    const res = await resend.emails.send({
      from: sender,
      to: email,
      subject: subjectLogistics,
      text: textLogistics,
      attachments,
    });

    logistics.push({
      to: email,
      resendId: (res as any)?.data?.id || (res as any)?.id || null,
    });
  }

  const review = await sendReviewEmail({
    order,
    clientEmail,
  });

  return {
    ok: true,
    orderNumber,
    invoice: {
      attached: Boolean(invoiceResult.attachment),
      error: invoiceResult.error,
      filename: invoiceResult.attachment?.filename ?? null,
    },
    client: {
      to: clientEmail,
      resendId: (clientRes as any)?.data?.id || (clientRes as any)?.id || null,
    },
    admin: {
      to: adminEmail,
      resendId: (adminRes as any)?.data?.id || (adminRes as any)?.id || null,
    },
    logistics,
    review,
  };
}