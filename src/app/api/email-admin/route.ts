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

    // 📌 Récupération détaillée de la commande
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ---------------------------------------
    // ✨ TEMPLATE PREMIUM ADMIN
    // ---------------------------------------
    const htmlTemplate = `
    <div style="font-family:Arial, sans-serif; background:#f5f5f5; padding:25px;">
      <div style="max-width:650px; margin:auto; background:white; border-radius:10px; padding:30px;">

        <h2 style="margin:0 0 20px; font-size:22px; color:#111;">
          🛒 Nouvelle commande reçue
        </h2>

        <p style="font-size:15px; color:#444;">
          Une nouvelle commande vient d'être confirmée.
        </p>

        <p style="font-size:16px; margin-top:20px;">
          <b>ID Commande :</b> ${orderId}<br/>
          <b>Client :</b> ${customerEmail}
        </p>

        <hr style="border:0; border-top:1px solid #eee; margin:30px 0;" />

        <h3 style="font-size:18px; margin-bottom:10px; color:#111;">📦 Articles commandés</h3>
        <pre style="white-space:pre-wrap; font-size:14px; background:#fafafa; padding:15px; border-radius:8px; border:1px solid #eee;">
${JSON.stringify(order.items, null, 2)}
        </pre>

        <h3 style="font-size:18px; margin-top:30px; color:#111;">🚚 Adresse de livraison</h3>
        <pre style="white-space:pre-wrap; font-size:14px; background:#fafafa; padding:15px; border-radius:8px; border:1px solid #eee;">
${JSON.stringify(order.shippingAddress, null, 2)}
        </pre>

        <p style="font-size:12px; color:#999; text-align:center; margin-top:35px;">
          Massme • Administration interne<br/>
          Email automatique — ne pas répondre
        </p>

      </div>
    </div>
    `;

    // ---------------------------------------
    // 📧 ENVOI DE L’EMAIL
    // ---------------------------------------
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
