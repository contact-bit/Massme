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

    // 📌 Récupération commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ============================================================
    // 📄 Génération de la facture PDF
    // ============================================================
    let pdfBase64 = "";

    try {
      const pdfBuffer = await generateInvoicePDF(order, orderId);
      pdfBase64 = pdfBuffer.toString("base64");
    } catch (err) {
      console.error("❌ Erreur génération facture PDF (logistique) :", err);
    }

    // ============================================================
    // 🛍 Formatage des produits
    // ============================================================
    const itemsTable = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #ddd;">${item.name?.fr || "Produit"}</td>
          <td style="padding:8px; border-bottom:1px solid #ddd;">${item.description?.fr || "-"}</td>
          <td style="padding:8px; border-bottom:1px solid #ddd;">${item.price?.eur} €</td>
          <td style="padding:8px; border-bottom:1px solid #ddd;">${item.quantity || 1}</td>
        </tr>
      `
      )
      .join("");

    // ============================================================
    // 🚚 Formatage de l'adresse
    // ============================================================
    const address = order.shippingAddress;
    const addressBlock = `
      <div style="padding:15px; background:#eef3f7; border-radius:8px; border:1px solid #d0dae3;">
        <p style="margin:5px 0;"><b>Nom :</b> ${address.name}</p>
        <p style="margin:5px 0;"><b>Email :</b> ${address.email}</p>
        <p style="margin:5px 0;"><b>Adresse :</b> ${address.address}</p>
        <p style="margin:5px 0;"><b>Ville :</b> ${address.city}</p>
        <p style="margin:5px 0;"><b>Code postal :</b> ${address.postalCode}</p>
        <p style="margin:5px 0;"><b>Téléphone :</b> ${address.phone}</p>
        <p style="margin:5px 0;"><b>Livraison :</b> ${address.shippingMethod}</p>
      </div>
    `;

    // ============================================================
    // ✉️ TEMPLATE EMAIL LOGISTIQUE
    // ============================================================
    const htmlTemplate = `
<div style="font-family:Arial, sans-serif; background:#f0f4f7; padding:25px;">
  <div style="max-width:700px; margin:auto; background:white; border-radius:10px; padding:30px; border:1px solid #e5e8eb;">

    <h2 style="margin:0; font-size:24px; color:#0a3d62; font-weight:bold;">
      📦 Préparation de commande
    </h2>

    <p style="font-size:16px; margin-top:10px; color:#333;">
      Merci de préparer la commande suivante :
    </p>

    <div style="margin-top:15px; background:#f7fafc; padding:15px; border-radius:8px; border:1px solid #d9e2ec;">
      <p style="margin:0; font-size:17px;">
        <b>ID Commande :</b> ${orderId}
      </p>
      <p style="margin:0; font-size:17px;">
        <b>Client :</b> ${customerEmail}
      </p>
    </div>

    <h3 style="margin-top:30px; font-size:20px; color:#0a3d62;">🛍 Produits à préparer</h3>

    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:15px;">
      <tr style="background:#e8eff5;">
        <th style="text-align:left; padding:10px;">Produit</th>
        <th style="text-align:left; padding:10px;">Description</th>
        <th style="text-align:left; padding:10px;">Prix</th>
        <th style="text-align:left; padding:10px;">Qté</th>
      </tr>
      ${itemsTable}
    </table>

    <h3 style="margin-top:30px; font-size:20px; color:#0a3d62;">🚚 Adresse de livraison</h3>
    ${addressBlock}

    <p style="font-size:14px; color:#555; margin-top:25px;">
      La facture au format PDF est jointe à cet email pour vérification.
    </p>

    <p style="font-size:12px; color:#777; text-align:center; margin-top:35px;">
      Massme • Service Logistique<br/>
      Email automatique — ne pas répondre
    </p>

  </div>
</div>
    `;

    // ============================================================
    // 📤 ENVOI EMAIL + FACTURE PDF
    // ============================================================
    await resend.emails.send({
      from: "Massme • Logistique <contact@hdconnects.com>",
      to: process.env.LOGISTICS_EMAIL!,
      subject: `📦 Préparer la commande #${orderId}`,
      html: htmlTemplate,
      attachments:
        pdfBase64
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
