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
  provider?: "stripe" | "paypal";
  created_at?: any;
  orderData?: any;
  locale?: "fr" | "en" | "es" | "de" | "it" | "nl";
};

function formatMoney(cents: number, currency: string) {
  const value = (Number(cents || 0) / 100).toFixed(2);
  return `${value} ${String(currency || "EUR").toUpperCase()}`;
}

function toDate(created_at: any) {
  if (!created_at) return new Date();
  if (created_at?._seconds) return new Date(created_at._seconds * 1000);
  const d = new Date(created_at);
  return isNaN(d.getTime()) ? new Date() : d;
}

function safeEmailList(raw: string | undefined) {
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim()).filter(Boolean);
}

function resolveOrderNumber(order: OrderEmailPayload): string {
  const fromOrderData =
    typeof order?.orderData?.orderNumber === "string" && order.orderData.orderNumber.trim().length > 0
      ? order.orderData.orderNumber.trim()
      : typeof order?.orderData?.invoiceNumber === "string" &&
        order.orderData.invoiceNumber.trim().length > 0
      ? order.orderData.invoiceNumber.trim()
      : null;

  const fromRoot =
    typeof (order as any)?.orderNumber === "string" && (order as any).orderNumber.trim().length > 0
      ? (order as any).orderNumber.trim()
      : null;

  const fallbackId =
    typeof order?.id === "string" && order.id.trim().length > 0
      ? order.id.trim()
      : "UNKNOWN_ORDER";

  const resolved = fromOrderData || fromRoot || fallbackId;

  console.log("MAILER ORDER DEBUG", {
    orderId: order?.id,
    orderDataOrderNumber: order?.orderData?.orderNumber ?? null,
    orderDataInvoiceNumber: order?.orderData?.invoiceNumber ?? null,
    rootOrderNumber: (order as any)?.orderNumber ?? null,
    resolvedOrderNumber: resolved,
  });

  return resolved;
}

/* =========================================================
   FACTURE PDF
========================================================= */
function buildInvoiceFilename(orderNumber: string) {
  return `facture-${orderNumber}.pdf`;
}

async function buildInvoiceAttachment(order: OrderEmailPayload) {
  const orderData = order.orderData;
  if (!orderData) return null;

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
          : 0,
      totals: {
        totalHT: Number(orderData?.totals?.totalHT || 0),
        totalVAT: Number(orderData?.totals?.totalVAT || 0),
        totalTTC: Number(orderData?.totals?.totalTTC || 0),
        vatRate:
          typeof orderData?.totals?.vatRate === "number"
            ? orderData.totals.vatRate > 1
              ? orderData.totals.vatRate / 100
              : orderData.totals.vatRate
            : undefined,
      },
      orderNumber,
      invoiceNumber: orderNumber,
    },
    orderNumber,
    {
      locale,
      paidLabel: true,
    }
  );

  return {
    filename: buildInvoiceFilename(orderNumber),
    content: pdfBuffer.toString("base64"),
  };
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
    process.env.RESEND_FROM?.trim() || "Vitectromed <contact@hdconnects.com>";

  const created = toDate(order.created_at);
  const amountText = formatMoney(order.amount_total, order.currency);
  const providerLabel = String(order.provider || "paypal").toUpperCase();

  const adminEmail = (process.env.ADMIN_EMAIL || "contact@hdconnects.com").trim();
  const logisticsEmails = safeEmailList(process.env.LOGISTICS_EMAILS);

  const orderNumber = resolveOrderNumber(order);

  const subjectClient = `🧘 Commande #${orderNumber} confirmée`;
  const subjectAdmin = `🛍️ Nouvelle commande #${orderNumber}`;
  const subjectLogistics = `📦 Préparer commande #${orderNumber}`;

  const textClient = `
Bonjour,

Merci pour votre commande chez Vitectromed 💆‍♀️
Votre paiement de ${amountText} a bien été reçu.

Moyen de paiement : ${providerLabel}
Commande : ${orderNumber}

Vous trouverez votre facture en pièce jointe.

À bientôt,
L’équipe Vitectromed
`;

  const textAdmin = `
Nouvelle commande reçue !

- Commande: ${orderNumber}
- Email client: ${order.customer_email}
- Montant: ${amountText}
- Statut: ${order.payment_status}
- Provider: ${providerLabel}
- Date: ${created.toLocaleString("fr-FR")}
`;

  const textLogistics = `
Une nouvelle commande doit être traitée :

Commande : ${orderNumber}
Client : ${order.customer_email}
Montant : ${amountText}
Date : ${created.toLocaleString("fr-FR")}
Provider : ${providerLabel}
`;

  try {
    console.log("📎 Génération facture PDF…");
    const invoiceAttachment = await buildInvoiceAttachment(order);
    const attachments = invoiceAttachment ? [invoiceAttachment] : undefined;

    console.log("📮 Envoi emails…");

    await resend.emails.send({
      from: sender,
      to: clientEmail,
      subject: subjectClient,
      text: textClient,
      attachments,
    });

    await resend.emails.send({
      from: sender,
      to: adminEmail,
      subject: subjectAdmin,
      text: textAdmin,
      attachments,
    });

    for (const logEmail of logisticsEmails) {
      await resend.emails.send({
        from: sender,
        to: logEmail,
        subject: subjectLogistics,
        text: textLogistics,
        attachments,
      });
    }

    console.log("✅ Emails envoyés");
  } catch (err) {
    console.error("💥 Erreur email :", err);
  }
}