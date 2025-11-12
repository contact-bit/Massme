import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { orderId, customerEmail } = await req.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    // Récupération de la commande
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // === Format produits en tableau ===
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

    // === Format adresse ===
    const address = order.shippingAddress;
    const addressBlock = `
      <div style="padding:15px; background:#f7f9fc; border-radius:8px; border:1px solid #e1e6ec;">
        <p style="margin:5px 0;"><b>Nom :</b> ${address.name}</p>
        <p style="margin:5px 0;"><b>Email :</b> ${address.email}</p>
        <p style="margin:5px 0;"><b>Adresse :</b> ${address.address}</p>
        <p style="margin:5px 0;"><b>Ville :</b> ${address.city}</p>
        <p style="margin:5px 0;"><b>Code postal :</b> ${address.postalCode}</p>
        <p style="margin:5px 0;"><b>Téléphone :</b> ${address.phone}</p>
        <p style="margin:5px 0;"><b>Mode de livraison :</b> ${address.shippingMethod}</p>
      </div>
    `;

    // === TEMPLATE PREMIUM ADMIN ===
    const htmlTemplate = `
<div style="font-family:Arial, sans-serif; background:#f5f5f5; padding:25px;">
  <div style="max-width:700px; margin:auto; background:white; border-radius:10px; padding:30px; border:1px solid #ececec;">

    <h2 style="margin:0 0 10px; font-size:24px; color:#222; font-weight:bold;">
      🛒 Nouvelle commande reçue
    </h2>

    <p style="font-size:15px; color:#444; margin-bottom:20px;">
      Une nouvelle commande vient d'être validée sur Massme.
    </p>

    <div style="padding:15px; background:#f7fafc; border-radius:8px; border:1px solid #dce3eb;">
      <p style="margin:5px 0; font-size:16px;">
        <b>ID Commande :</b> ${orderId}
      </p>
      <p style="margin:5px 0; font-size:16px;">
        <b>Client :</b> ${customerEmail}
      </p>
    </div>

    <h3 style="margin-top:30px; font-size:20px; color:#222;">📦 Articles commandés</h3>

    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:15px;">
      <tr style="background:#eef2f6;">
        <th style="text-align:left; padding:10px;">Produit</th>
        <th style="text-align:left; padding:10px;">Description</th>
        <th style="text-align:left; padding:10px;">Prix</th>
        <th style="text-align:left; padding:10px;">Qté</th>
      </tr>
      ${itemsTable}
    </table>

    <h3 style="margin-top:30px; font-size:20px; color:#222;">🚚 Adresse de livraison</h3>
    ${addressBlock}

    <p style="font-size:12px; color:#999; text-align:center; margin-top:35px;">
      Massme • Administration interne<br/>
      Email automatique — ne pas répondre
    </p>

  </div>
</div>
    `;

    // Envoi email admin
    await resend.emails.send({
      from: "Massme • Orders <contact@hdconnects.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `🛒 Nouvelle commande – #${orderId}`,
      html: htmlTemplate,
    });

    return NextResponse.json({ status: "admin email sent" });
  } catch (err) {
    console.error("❌ Error sending admin email:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
