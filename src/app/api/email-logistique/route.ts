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

    // 📌 Récupération de la commande
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 📦 TEMPLATE PREMIUM LOGISTIQUE
    const htmlTemplate = `
<div style="font-family:Arial, sans-serif; background:#f0f4f7; padding:25px;">
  <div style="max-width:650px; margin:auto; background:white; border-radius:10px; padding:30px;">

    <h2 style="margin:0; font-size:22px; color:#0a3d62;">
      📦 Préparation commande
    </h2>

    <p style="font-size:15px; color:#444; margin-top:10px;">
      Merci de préparer la commande suivante :
    </p>

    <p style="font-size:18px; margin-top:20px;">
      <b>ID Commande :</b> ${orderId}<br/>
      <b>Client :</b> ${customerEmail}
    </p>

    <h3 style="margin-top:30px; font-size:18px;">🛍 Produits à préparer</h3>
    <pre style="white-space:pre-wrap; font-size:14px; background:#eef2f3; padding:15px; border-radius:8px; border:1px solid #d0d7dc;">
${JSON.stringify(order.items, null, 2)}
    </pre>

    <h3 style="margin-top:30px; font-size:18px;">🚚 Adresse de livraison</h3>
    <pre style="white-space:pre-wrap; font-size:14px; background:#eef2f3; padding:15px; border-radius:8px; border:1px solid #d0d7dc;">
${JSON.stringify(order.shippingAddress, null, 2)}
    </pre>

    <p style="font-size:12px; color:#777; text-align:center; margin-top:35px;">
      Massme • Service Logistique<br/>
      Email automatique — ne pas répondre
    </p>

  </div>
</div>
    `;

    // 📧 Envoi email logistique
    await resend.emails.send({
      from: "Massme • Logistique <contact@hdconnects.com>",
      to: process.env.LOGISTICS_EMAIL!,
      subject: `📦 Préparation de commande – #${orderId}`,
      html: htmlTemplate,
    });

    return NextResponse.json({ status: "logistics email sent" });
  } catch (err) {
    console.error("❌ Logistique email error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
