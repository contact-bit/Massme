import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe"; // ✅ On réutilise la même instance que partout
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // --------------------------------------------------------------------
  // 🎯 PAIEMENT VALIDÉ (checkout.session.completed)
  // --------------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    const orderId = metadata.order_id;
    const isRelay = metadata.isRelay === "true";
    const relayProvider = metadata.relayProvider || "";
    const customerEmail =
      session.customer_details?.email || session.customer_email;

    let relayPointFromMetadata: any = null;
    if (metadata.relayPoint) {
      try {
        relayPointFromMetadata = JSON.parse(metadata.relayPoint);
      } catch (e) {
        console.warn("⚠️ Impossible de parser relayPoint metadata", e);
      }
    }

    if (!orderId || !customerEmail) {
      console.error("⚠️ Missing order_id or email in session metadata");
      return NextResponse.json({ received: true });
    }

    // --------------------------------------------------------------------
    // 🔎 RÉCUPÉRER LA COMMANDE DANS Firestore
    // --------------------------------------------------------------------
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const savedOrder = snap.data();

    if (!savedOrder) {
      console.error("⚠️ Commande introuvable pour orderId:", orderId);
      return NextResponse.json({ received: true });
    }

    // --------------------------------------------------------------------
    // 🧹 NORMALISATION DE LA COMMANDE (pour PDF & mails)
    // --------------------------------------------------------------------
    const items = (savedOrder.items || []).map((it: any) => ({
      name: it.name || "Produit",
      price: Number(it.price) || 0,
      quantity: Number(it.quantity || 1),
      description: it.description || "",
    }));

    const rawShippingMethod = savedOrder.shippingMethod || {};
    const shippingPrice =
      typeof rawShippingMethod.price === "number"
        ? rawShippingMethod.price
        : Number(rawShippingMethod?.price?.fr) ||
          Number(rawShippingMethod?.price?.en) ||
          0;

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod: {
        ...rawShippingMethod,
        price: shippingPrice,
        type: rawShippingMethod.type || "home",
        relayProvider: rawShippingMethod.relayProvider || relayProvider || null,
      },
      relayPoint:
        relayPointFromMetadata || savedOrder.relayPoint || null,
      isRelay,
    };

    // --------------------------------------------------------------------
    // 💾 UPDATE Firestore (statut payé)
    // --------------------------------------------------------------------
    await dbAdmin.collection("pending_orders").doc(orderId).update({
      status: "paid",
      stripeSessionId: session.id,
      paidAt: new Date(),
      relayPoint: normalizedOrder.relayPoint,
    });

    // --------------------------------------------------------------------
    // 📄 GÉNÉRATION PDF FACTURE
    // --------------------------------------------------------------------
    try {
      const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId);
      const pdfBase64 = pdfBuffer.toString("base64");

      // --------------------------------------------------------------------
      // ✉️ EMAIL CLIENT (facture en PJ)
      // --------------------------------------------------------------------
      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: "🎉 Merci pour votre achat — Votre facture",
        html: `
          <div style="font-family:Arial, sans-serif; padding:20px;">
            <h2>🎉 Merci pour votre commande !</h2>
            <p>Votre facture est jointe à cet e-mail.</p>
            <p><b>Numéro de commande :</b> ${orderId}</p>
            ${
              normalizedOrder.isRelay && normalizedOrder.relayPoint
                ? `<p><b>Point relais :</b> ${
                    normalizedOrder.relayPoint.Nom ||
                    normalizedOrder.relayPoint.name ||
                    ""
                  }</p>`
                : ""
            }
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
    // 📮 EMAILS Admin + Logistique (fire-and-forget)
    // --------------------------------------------------------------------
    try {
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
        method: "POST",
        body: JSON.stringify({ orderId, customerEmail }),
        headers: { "Content-Type": "application/json" },
      });

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
        method: "POST",
        body: JSON.stringify({
          orderId,
          customerEmail,
          isRelay,
          relayProvider,
        }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("⚠️ Erreur envoi emails admin/logistique :", err);
    }
  }

  return NextResponse.json({ received: true });
}
