import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { orderId, customerEmail } = await req.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    // 🔍 Récupération commande
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const rawOrder = snap.data();

    if (!rawOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 🧹 NORMALISATION (identique webhook & admin)
    // ---------------------------------------------------------
    const order = {
      ...rawOrder,
      items: rawOrder.items.map((item: any) => ({
        name: item.name || "Produit",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        description: item.description || "",
      })),
      shippingMethod: {
        price:
          typeof rawOrder.shippingMethod?.price === "number"
            ? rawOrder.shippingMethod.price
            : Number(rawOrder.shippingMethod?.price?.fr) ||
              Number(rawOrder.shippingMethod?.price?.en) ||
              0,
      },
    };

    // ---------------------------------------------------------
    // 📄 Génération PDF
    // ---------------------------------------------------------
    let pdfBase64 = "";
    try {
      const pdfBuffer = await generateInvoicePDF(order, orderId);
      pdfBase64 = pdfBuffer.toString("base64");
    } catch (err) {
      console.error("❌ Erreur génération facture PDF (logistique) :", err);
    }

    // ---------------------------------------------------------
    // 🧾 Tableau Produits
    // ---------------------------------------------------------
    const itemsTable = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${item.description || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${item.price.toFixed(2)} €</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${item.quantity}</td>
        </tr>
      `
      )
      .join("");

    // ---------------------------------------------------------
    // 🚚 Adresse (avec pays)
    // ---------------------------------------------------------
    const a = rawOrder.shippingAddress;

    const addressBlock = `
      <div style="padding:15px; background:#eef3f7; border-radius:8px; border:1px solid #d0dae3;">
        <p><b>Nom :</b> ${a.name}</p>
        <p><b>Email :</b> ${a.email}</p>
        <p><b>Adresse :</b> ${a.address}</p>
        <p><b>Ville :</b> ${a.city}</p>
        <p><b>Code postal :</b> ${a.postalCode}</p>
        ${a.country ? `<p><b>Pays :</b> ${a.country}</p>` : ""}
        <p><b>Téléphone :</b> ${a.phone}</p>
      </div>
    `;

    // ---------------------------------------------------------
    // ✉️ TEMPLATE HTML
    // ---------------------------------------------------------
    const htmlTemplate = `
<div style="font-family:Arial;background:#f0f4f7;padding:25px;">
  <div style="max-width:700px;margin:auto;background:white;border-radius:10px;padding:30px;border:1px solid #e5e8eb;">
    
    <h2 style="font-size:24px;color:#0a3d62;font-weight:bold;margin:0 0 10px;">
      📦 Préparation de commande
    </h2>

    <p style="font-size:16px;color:#333;">
      Merci de préparer la commande suivante :
    </p>

    <div style="margin-top:15px;background:#f7fafc;padding:15px;border-radius:8px;border:1px solid #d9e2ec;">
      <p><b>ID Commande :</b> ${orderId}</p>
      <p><b>Client :</b> ${customerEmail}</p>
    </div>

    <h3 style="margin-top:30px;font-size:20px;color:#0a3d62;">🛍 Produits à préparer</h3>

    <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:15px;">
      <tr style="background:#e8eff5;">
        <th style="padding:10px;text-align:left;">Produit</th>
        <th style="padding:10px;text-align:left;">Description</th>
        <th style="padding:10px;text-align:left;">Prix</th>
        <th style="padding:10px;text-align:left;">Qté</th>
      </tr>
      ${itemsTable}
    </table>

    <h3 style="margin-top:30px;font-size:20px;color:#0a3d62;">🚚 Adresse de livraison</h3>
    ${addressBlock}

    <p style="font-size:14px;color:#555;margin-top:25px;">
      La facture PDF est jointe pour vérification.
    </p>

    <p style="font-size:12px;color:#777;text-align:center;margin-top:35px;">
      Massme • Service Logistique<br>Ne pas répondre à cet email.
    </p>

  </div>
</div>
`;

    // ---------------------------------------------------------
    // 📤 Envoi Email Logistique
    // ---------------------------------------------------------
    await resend.emails.send({
      from: "Massme • Logistique <contact@hdconnects.com>",
      to: process.env.LOGISTICS_EMAIL!,
      subject: `📦 Préparer la commande #${orderId}`,
      html: htmlTemplate,
      attachments: pdfBase64
        ? [
            {
              filename: `facture-${orderId}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });

    return NextResponse.json({ status: "logistics email sent" });

  } catch (err) {
    console.error("❌ Erreur email logistique :", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
