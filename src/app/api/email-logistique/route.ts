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
    to: process.env.LOGISTICS_EMAIL!,
    subject: `📦 Préparer commande #${orderId}`,
    html: `
      <h2>Préparation logistique</h2>

      <p><b>ID commande :</b> ${orderId}</p>
      <p><b>Client :</b> ${customerEmail}</p>

      <h3>Adresse de livraison :</h3>
      <pre>${JSON.stringify(order?.shippingAddress, null, 2)}</pre>

      <h3>Produits :</h3>
      <pre>${JSON.stringify(order?.items, null, 2)}</pre>
    `,
  });

  return NextResponse.json({ status: "logistics email sent" });
}
