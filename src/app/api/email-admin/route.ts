import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { orderId, customerEmail } = await req.json();

  const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
  const order = snap.data();

  await resend.emails.send({
    from: "Massme <contact@hdconnects.com>",
    to: process.env.ADMIN_EMAIL!,
    subject: `🛒 Nouvelle commande #${orderId}`,
    html: `
      <h2>Nouvelle commande reçue</h2>
      <p><b>ID commande :</b> ${orderId}</p>
      <p><b>Client :</b> ${customerEmail}</p>

      <h3>Détails commande :</h3>
      <pre>${JSON.stringify(order, null, 2)}</pre>
    `,
  });

  return NextResponse.json({ status: "admin email sent" });
}
