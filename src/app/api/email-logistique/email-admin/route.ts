import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";
import { assertAdmin } from "@/server/adminAuth";

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";

function resolveOrderNumber(rawOrder: any, orderId: string) {
  if (typeof rawOrder?.orderNumber === "string" && rawOrder.orderNumber.trim().length > 0) {
    return rawOrder.orderNumber.trim();
  }

  return orderId;
}

export async function POST(req: Request) {
  const auth = await assertAdmin(req);
  if (auth) return auth;

  try {
    const { orderId, customerEmail } = await req.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const ref = dbAdmin.collection("pending_orders").doc(orderId);
    const snap = await ref.get();
    const rawOrder = snap.data();

    if (!rawOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderNumber = resolveOrderNumber(rawOrder, orderId);
    const invoiceNumber =
      await ensureInvoiceNumberForOrder(ref);

    console.log("ADMIN ORDER DEBUG", {
      orderId,
      orderNumber,
      rawOrderOrderNumber: rawOrder?.orderNumber ?? null,
      rawOrderInvoiceNumber: rawOrder?.invoiceNumber ?? null,
    });

    const order = {
      ...rawOrder,
      orderNumber,
      invoiceNumber,
      items: Array.isArray(rawOrder.items)
        ? rawOrder.items.map((item: any) => ({
            name: item.name || "Produit",
            price: Number(item.price ?? item.priceHT ?? 0) || 0,
            quantity: Number(item.quantity) || 1,
            description: item.description || "",
          }))
        : [],
      shippingMethod: {
        ...rawOrder.shippingMethod,
        price:
          typeof rawOrder.shippingMethod?.price === "number"
            ? rawOrder.shippingMethod.price
            : Number(rawOrder.shippingMethod?.price?.fr) ||
              Number(rawOrder.shippingMethod?.price?.en) ||
              Number(rawOrder.shippingMethod?.priceHT) ||
              0,
      },
    };

    const heardFrom: string | null = rawOrder.heardFrom || null;
    const heardFromOther: string | null = rawOrder.heardFromOther || null;

    let heardFromLabel = "Non renseigné";

    if (heardFrom === "internet") heardFromLabel = "Internet";
    else if (heardFrom === "social") heardFromLabel = "Réseaux sociaux";
    else if (heardFrom === "medical") heardFromLabel = "Recommandation médicale";
    else if (heardFrom === "other") heardFromLabel = "Autre";

    const heardFromLine =
      heardFrom === "other" && heardFromOther
        ? `${heardFromLabel} – ${heardFromOther}`
        : heardFromLabel;

    let pdfBase64 = "";

    try {
      const pdfBuffer = await generateInvoicePDF(
        order,
        orderNumber,
        { invoiceNumber }
      );
      pdfBase64 = pdfBuffer.toString("base64");
    } catch (err) {
      console.error("❌ Erreur génération facture PDF :", err);
    }

    const itemsTable = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; color:#666;">${item.description || "-"}</td>
          <td style="padding:10px; border-bottom:1px solid #eee;">${item.price.toFixed(2)} €</td>
          <td style="padding:10px; border-bottom:1px solid #eee;">${item.quantity}</td>
        </tr>
      `
      )
      .join("");

    const a = rawOrder.shippingAddress || {};

    const addressBlock = `
      <div style="padding:20px; background:#f8fbff; border-radius:10px; border:1px solid #e0e7f1;">
        <p><b>Nom :</b> ${a.name || "-"}</p>
        <p><b>Email :</b> ${a.email || customerEmail}</p>
        <p><b>Adresse :</b> ${a.address || "-"}</p>
        <p><b>Ville :</b> ${a.city || "-"}</p>
        <p><b>Code postal :</b> ${a.postalCode || "-"}</p>
        ${a.country ? `<p><b>Pays :</b> ${a.country}</p>` : ""}
        <p><b>Téléphone :</b> ${a.phone || "-"}</p>
      </div>
    `;

    const htmlTemplate = `
<div style="font-family:Arial, sans-serif; background:#f3f4f7; padding:25px;">
  <div style="max-width:720px; margin:auto; background:white; border-radius:12px; padding:35px; border:1px solid #e5e7eb; box-shadow:0 4px 12px rgba(0,0,0,0.04);">

    <h2 style="margin:0 0 10px; font-size:26px; color:#111; font-weight:bold;">
      🛒 Nouvelle commande confirmée
    </h2>

    <p style="font-size:15px; color:#444; margin-bottom:25px;">
      Une nouvelle commande vient d’être validée sur Vitrectomed.
    </p>

    <div style="padding:18px; background:#f6faff; border-radius:10px; border:1px solid #d9e3f0; margin-bottom:20px;">
      <p style="margin:0; font-size:16px;"><b>Commande :</b> ${orderNumber}</p>
      <p style="margin:0; font-size:14px; color:#666;"><b>ID interne :</b> ${orderId}</p>
      <p style="margin:0; font-size:16px;"><b>Client :</b> ${customerEmail}</p>
    </div>

    <div style="padding:14px 18px; background:#fefce8; border-radius:10px; border:1px solid #facc15; margin-bottom:30px;">
      <p style="margin:0; font-size:14px; color:#854d0e;">
        <b>Comment il nous a connus :</b> ${heardFromLine}
      </p>
    </div>

    <h3 style="margin-top:10px; font-size:20px; color:#111;">📦 Articles commandés</h3>

    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
      <tr style="background:#eef2f6;">
        <th style="text-align:left; padding:12px;">Produit</th>
        <th style="text-align:left; padding:12px;">Description</th>
        <th style="text-align:left; padding:12px;">Prix</th>
        <th style="text-align:left; padding:12px;">Qté</th>
      </tr>
      ${itemsTable}
    </table>

    <h3 style="margin-top:35px; font-size:20px; color:#111;">🚚 Adresse de livraison</h3>
    ${addressBlock}

    <p style="font-size:12px; color:#999; text-align:center; margin-top:40px;">
      Vitrectomed • Administration interne<br/>
      Email automatique — ne pas répondre
    </p>

  </div>
</div>
`;

    await resend.emails.send({
      from: "Vitrectomed • Orders <contact@hdconnects.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `🛒 Nouvelle commande – ${orderNumber}`,
      html: htmlTemplate,
      attachments: pdfBase64
        ? [
            {
              filename: `facture-${invoiceNumber}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });

    return NextResponse.json({ status: "admin email sent" });
  } catch (err) {
    console.error("❌ Error sending admin email:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
