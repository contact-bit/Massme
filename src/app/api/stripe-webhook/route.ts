import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";

// =============================================================
// 🚀 INITIALISATION
// =============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

// Stripe exige la lecture du RAW body
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

// =============================================================
// 📌 WEBHOOK STRIPE — TRAITEMENT PRINCIPAL
// =============================================================
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  // Vérification authentique Stripe
  try {
    const rawBody = await buffer(req.body!);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // =============================================================
  // ✅ 1. PAIEMENT VALIDÉ
  // =============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail = session.customer_details?.email || session.customer_email;

    if (!orderId || !customerEmail) {
      console.error("⚠️ Missing order_id or customerEmail");
      return NextResponse.json({ received: true });
    }

    // 🗂️ Récupération de la commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    const order = snap.data();

    if (!order) {
      console.error("⚠️ Commande introuvable dans Firestore");
      return NextResponse.json({ received: true });
    }

    // 🔄 Mise à jour Firestore
    await dbAdmin.collection("pending_orders").doc(orderId).update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
    });

    // =============================================================
// 2️⃣ Email Client PREMIUM + Facture PDF en pièce jointe
// =============================================================

// 🔥 Génération de la facture PDF
const pdfBuffer = await generateInvoicePDF(order, orderId);
const pdfBase64 = pdfBuffer.toString("base64");

await resend.emails.send({
  from: "Massme • Support <contact@hdconnects.com>",
  replyTo: "contact@hdconnects.com",
  to: customerEmail,
  subject: "🎉 Merci pour votre commande - Massme",
  html: `
<div style="font-family:Arial, sans-serif; padding:20px; background:#f7f7f7;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:30px;">

    <h1 style="color:#111; font-size:24px; margin-top:0;">
      🎉 Merci pour votre commande !
    </h1>

    <p style="font-size:16px; color:#444;">
      Bonjour,<br/><br/>
      Nous avons bien reçu votre commande et votre paiement a été confirmé.
      Merci de votre confiance !
    </p>

    <p style="font-size:18px; margin-top:20px;">
      <b>ID de commande :</b> ${orderId}
    </p>

    <p style="font-size:16px; color:#444; margin-top:20px;">
      Votre facture est jointe à cet e-mail au format PDF.<br/>
      Vous recevrez un second e-mail lors de l’expédition.
    </p>

    <p style="font-size:12px; color:#999; margin-top:30px; text-align:center;">
      Massme • hdconnects.com<br/>
      Cet email est envoyé automatiquement, merci de ne pas répondre directement.
    </p>

  </div>
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


    // =============================================================
    // ✉️ 3. EMAIL ADMIN → endpoint séparé
    // =============================================================
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    }).catch(() => {});

    // =============================================================
    // ✉️ 4. EMAIL LOGISTIQUE → endpoint séparé
    // =============================================================
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/email-logistique`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, customerEmail }),
    }).catch(() => {});
  }

  // =============================================================
  // ⚠️ AUTRES ÉVÉNEMENTS
  // =============================================================
  else if (event.type === "checkout.session.expired") {
    console.log("⚠️ Session expirée :", event.id);
  } else if (event.type === "payment_intent.payment_failed") {
    console.log("💸 Paiement échoué :", event.id);
  }

  return NextResponse.json({ received: true });
}
