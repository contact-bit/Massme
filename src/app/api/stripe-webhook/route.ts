import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as any,
});


const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Convert RAW stream → Buffer (obligatoire pour webhook Stripe)
async function buffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // --------------------------------------------------------------------
  // 🎯 PAIEMENT VALIDÉ
  // --------------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail = session.customer_details?.email || session.customer_email;

    if (!orderId || !customerEmail) {
      console.error("⚠️ Missing order_id or email");
      return NextResponse.json({ received: true });
    }

    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const savedOrder = snap.data();

    if (!savedOrder) {
      console.error("⚠️ Commande introuvable");
      return NextResponse.json({ received: true });
    }

    // --------------------------------------------------------------------
    // 🧹 NORMALISATION
    // --------------------------------------------------------------------
    const items = savedOrder.items.map((it: any) => ({
      name: it.name || "Produit",
      price: Number(it.price) || 0,
      quantity: Number(it.quantity || 1),
      description: it.description || "",
    }));

    const shippingPrice =
      typeof savedOrder.shippingMethod?.price === "number"
        ? savedOrder.shippingMethod.price
        : Number(savedOrder.shippingMethod?.price?.fr) ||
          Number(savedOrder.shippingMethod?.price?.en) ||
          0;

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod: { price: shippingPrice },
    };

    // --------------------------------------------------------------------
    // 💾 Update Firestore
    // --------------------------------------------------------------------
    await dbAdmin.collection("pending_orders").doc(orderId).update({
      status: "paid",
      stripeSessionId: session.id,
      paidAt: new Date(),
    });

    // --------------------------------------------------------------------
    // 📄 PDF (Font locale, pas PDFKit)
    // --------------------------------------------------------------------
    try {
      const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId);
      const pdfBase64 = pdfBuffer.toString("base64");

      // --------------------------------------------------------------------
      // ✉️ EMAIL CLIENT
      // --------------------------------------------------------------------
      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre achat — Votre facture",
        html: `
          <div style="font-family:Arial; padding:20px;">
            <h2>🎉 Merci pour votre commande !</h2>
            <p>Votre facture est jointe à cet e-mail.</p>
            <p><b>Numéro de commande :</b> ${orderId}</p>
          </div>
        `,
        attachments: [
          {
            filename: `facture-${orderId}.pdf`,
            content: pdfBase64,
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📧 Email client envoyé ✔");
    } catch (err) {
      console.error("❌ Erreur génération/envoi PDF client :", err);
    }

    // --------------------------------------------------------------------
    // 📮 EMAILS Admin + Logistique (asynchrone)
    // --------------------------------------------------------------------
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
      method: "POST",
      body: JSON.stringify({ orderId, customerEmail }),
      headers: { "Content-Type": "application/json" },
    });

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
      method: "POST",
      body: JSON.stringify({ orderId, customerEmail }),
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.json({ received: true });
}
