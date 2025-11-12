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

    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    await resend.emails.send({
      from: "Massme • Orders <contact@hdconnects.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `🛒 Nouvelle commande – #${orderId}`,
      html: `
        <div style="font-family:Arial, sans-serif; padding:20px;">
          <h2 style="color:#222;">Nouvelle commande reçue</h2>

          <p><b>ID Commande :</b> ${orderId}</p>
          <p><b>Client :</b> ${customerEmail}</p>

          <h3 style="margin-top:25px;">📦 Articles :</h3>
          <pre style="font-size:13px; background:#f7f7f7; padding:15px; border-radius:8px;">
${JSON.stringify(order?.items, null, 2)}
          </pre>

          <h3>🚚 Adresse de livraison :</h3>
          <pre style="font-size:13px; background:#f7f7f7; padding:15px; border-radius:8px;">
${JSON.stringify(order?.shippingAddress, null, 2)}
          </pre>

          <p style="font-size:12px; color:#aaa; margin-top:25px;">
            Massme Admin • Ne pas transférer
          </p>
        </div>
      `,
    });

    return NextResponse.json({ status: "admin email sent" });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
