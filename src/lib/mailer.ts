// src/lib/mailer.ts
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const resend = new Resend(process.env.RESEND_API_KEY);

export type OrderEmailPayload = {
  id: string;

  // Toujours en centimes (minor units)
  amount_total: number;

  currency: string;
  customer_email: string;

  payment_status: string;
  provider?: "stripe" | "paypal";

  created_at?: any;

  // ✅ IMPORTANT : on passe aussi la commande Firestore complète
  // pour générer la facture (items, totals, addresses, shippingPrice…)
  orderData?: any;

  // optionnel
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

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function buildInvoiceFilename(orderId: string) {
  return `facture-${orderId}.pdf`;
}

/**
 * ✅ Prépare la facture PDF (base64) pour Resend attachments
 * Resend accepte: attachments: [{ filename, content }]
 * content = base64 string
 */
async function buildInvoiceAttachment(order: OrderEmailPayload) {
  const orderData = order.orderData;
  if (!orderData) return null;

  // On essaie de récupérer un locale
  const locale = (order.locale ||
    orderData?.locale ||
    "fr") as "fr" | "en" | "es" | "de" | "it" | "nl";

  // generateInvoicePDF attend:
  // order: { email, items, shippingAddress, billingAddress, shippingPrice, totals }
  // orderId: string
  const pdfBuffer = await generateInvoicePDF(
    {
      email: orderData?.email || order.customer_email,
      items: orderData?.items || [],
      shippingAddress: orderData?.shippingAddress || {},
      billingAddress: orderData?.billingAddress || {},
      // ✅ Dans ton PDF tu lis shippingPrice (HT)
      shippingPrice:
        typeof orderData?.totals?.shipHT === "number"
          ? orderData.totals.shipHT
          : typeof orderData?.shippingPrice === "number"
          ? orderData.shippingPrice
          : typeof orderData?.shippingMethod?.priceHT === "number"
          ? orderData.shippingMethod.priceHT
          : 0,
      totals: {
        totalHT: Number(orderData?.totals?.totalHT || 0),
        totalVAT: Number(orderData?.totals?.totalVAT || 0),
        totalTTC: Number(orderData?.totals?.totalTTC || 0),
        // ⚠️ ton PDF utilise vatRate au format 0.2 (et pas 20)
        vatRate:
          typeof orderData?.totals?.vatRate === "number"
            ? orderData.totals.vatRate > 1
              ? orderData.totals.vatRate / 100
              : orderData.totals.vatRate
            : undefined,
      },
    },
    orderData?.id || order.id,
    {
      locale,
      paidLabel: true,
    }
  );

  const base64 = pdfBuffer.toString("base64");

  return {
    filename: buildInvoiceFilename(orderData?.id || order.id),
    content: base64,
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
    process.env.RESEND_FROM?.trim() || "Massme <contact@hdconnects.com>";

  const created = toDate(order.created_at);

  const amountText = formatMoney(order.amount_total, order.currency);
  const providerLabel = String(order.provider || "paypal").toUpperCase();

  const adminEmail = (process.env.ADMIN_EMAIL || "contact@hdconnects.com").trim();
  const logisticsEmails = safeEmailList(process.env.LOGISTICS_EMAILS);

  console.log("🔑 Resend key loaded:", !!process.env.RESEND_API_KEY);
  console.log("📧 Email debug", {
    from: sender,
    clientEmail,
    order_customer_email: order.customer_email,
    adminEmail,
    logisticsCount: logisticsEmails.length,
    provider: order.provider,
    hasOrderDataForInvoice: !!order.orderData,
  });

  const subjectClient = "🧘 Votre commande Massme est confirmée";
  const subjectAdmin = "🛍️ Nouvelle commande reçue";
  const subjectLogistics = "📦 Commande à préparer";

  const textClient = `
Bonjour,

Merci pour votre commande chez Massme 💆‍♀️
Votre paiement de ${amountText} a bien été reçu.

Moyen de paiement : ${providerLabel}
ID commande : ${order.id}

Vous trouverez votre facture en pièce jointe.

À bientôt,
L’équipe Massme
`;

  const textAdmin = `
Nouvelle commande reçue !

- ID: ${order.id}
- Email client: ${order.customer_email}
- Montant: ${amountText}
- Statut: ${order.payment_status}
- Provider: ${providerLabel}
- Date: ${created.toLocaleString("fr-FR")}
`;

  const textLogistics = `
Une nouvelle commande doit être traitée :

Client : ${order.customer_email}
Montant : ${amountText}
Date : ${created.toLocaleString("fr-FR")}
Provider : ${providerLabel}
ID : ${order.id}
`;

  try {
    console.log("📎 Génération facture PDF…");
    const invoiceAttachment = await buildInvoiceAttachment(order);

    const attachments = invoiceAttachment ? [invoiceAttachment] : undefined;

    if (!invoiceAttachment) {
      console.warn("⚠️ Pas de facture jointe: order.orderData manquant");
    } else {
      console.log("✅ Facture prête:", invoiceAttachment.filename);
    }

    console.log("📮 Envoi des e-mails (Resend)…");

    // Client
    const rClient = await resend.emails.send({
      from: sender,
      to: clientEmail,
      subject: subjectClient,
      text: textClient,
      attachments, // ✅ facture
    });

    if ((rClient as any)?.error) console.error("❌ Resend error (Client)", (rClient as any).error);
    else console.log("✅ Resend ok (Client) id=", (rClient as any)?.data?.id || rClient);

    // Admin
    const rAdmin = await resend.emails.send({
      from: sender,
      to: adminEmail,
      subject: subjectAdmin,
      text: textAdmin,
      attachments, // ✅ facture aussi (optionnel)
    });

    if ((rAdmin as any)?.error) console.error("❌ Resend error (Admin)", (rAdmin as any).error);
    else console.log("✅ Resend ok (Admin) id=", (rAdmin as any)?.data?.id || rAdmin);

    // Logistique
    for (const logEmail of logisticsEmails) {
      const rLog = await resend.emails.send({
        from: sender,
        to: logEmail,
        subject: subjectLogistics,
        text: textLogistics,
        attachments, // ✅ facture aussi (optionnel)
      });

      if ((rLog as any)?.error)
        console.error(`❌ Resend error (Logistique: ${logEmail})`, (rLog as any).error);
      else console.log(`✅ Resend ok (Logistique: ${logEmail}) id=`, (rLog as any)?.data?.id || rLog);
    }

    console.log("✅ Envoi terminé");
  } catch (err) {
    console.error("💥 Erreur critique Resend :", err);
  }
}
