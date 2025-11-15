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

    // 📌 Récupération de la commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ============================================================
    // 📦 TABLEAU DES ARTICLES (UI premium)
    // ============================================================
    const itemsTable = order.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          ${item.name?.fr || "Produit"}
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee; color:#666;">
          ${item.description?.fr || "-"}
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          ${item.price?.eur} €
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          ${item.quantity || 1}
        </td>
      </tr>
    `
      )
      .join("");

    // ============================================================
    // 🚚 BLOC ADRESSE CLIENT
    // ============================================================
    const a = order.shippingAddress;

    const addressBlock = `
      <div style="padding:20px; background:#f8fbff; border-radius:10px; border:1px solid #e0e7f1;">
        <p style="margin:6px 0;"><b>Nom :</b> ${a.name}</p>
        <p style="margin:6px 0;"><b>Email :</b> ${a.email}</p>
        <p style="margin:6px 0;"><b>Adresse :</b> ${a.address}</p>
        <p style="margin:6px 0;"><b>Ville :</b> ${a.city}</p>
        <p style="margin:6px 0;"><b>Code postal :</b> ${a.postalCode}</p>
        <p style="margin:6px 0;"><b>Téléphone :</b> ${a.phone}</p>
        <p style="margin:6px 0;"><b>Livraison :</b> ${a.shippingMethod}</p>
      </div>
    `;

    // ============================================================
    // ✨ TEMPLATE ADMIN — Version PREMIUM
    // ============================================================
    const htmlTemplate = `
<div style="font-family:Arial, sans-serif; background:#f3f4f7; padding:25px;">
  <div style="max-width:720px; margin:auto; background:white; border-radius:12px; padding:35px; border:1px solid #e5e7eb; box-shadow:0 4px 12px rgba(0,0,0,0.04);">

    <h2 style="margin:0 0 10px; font-size:26px; color:#111; font-weight:bold;">
      🛒 Nouvelle commande confirmée
    </h2>

    <p style="font-size:15px; color:#444; margin-bottom:25px;">
      Une nouvelle commande vient d’être validée sur Massme. Ci-dessous, tous les détails.
    </p>

    <!-- Bloc résumé -->
    <div style="padding:18px; background:#f6faff; border-radius:10px; border:1px solid #d9e3f0; margin-bottom:30px;">
      <p style="margin:5px 0; font-size:16px;"><b>ID Commande :</b> ${orderId}</p>
      <p style="margin:5px 0; font-size:16px;"><b>Client :</b> ${customerEmail}</p>
    </div>

    <!-- Liste des produits -->
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

    <!-- Adresse -->
    <h3 style="margin-top:35px; font-size:20px; color:#111;">🚚 Adresse de livraison</h3>
    ${addressBlock}

    <p style="font-size:12px; color:#999; text-align:center; margin-top:40px;">
      Massme • Administration interne<br/>
      Email automatique — ne pas répondre
    </p>

  </div>
</div>
`;

    // ============================================================
    // 📤 ENVOI EMAIL ADMIN
    // ============================================================
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
