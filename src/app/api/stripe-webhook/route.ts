import { NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "node:stream/consumers";
import { adminDB } from "@/lib/firebase.admin";
import { sendOrderEmails } from "@/lib/mailer";

// ✅ Stripe : version d’API mise à jour pour compatibilité SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: Request) {
  try {
    // 🧾 Lecture du corps brut requis par Stripe
    const rawBody = await buffer(req.body as any);
    const sig = req.headers.get("stripe-signature");

    // 🧩 Vérification de la signature Stripe
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("⚡ Webhook Stripe reçu :", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const order = {
        id: session.id,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        customer_email: session.customer_email,
        payment_status: session.payment_status,
        created_at: new Date().toISOString(),
      };

      console.log("🧾 Nouvelle commande reçue :", order);

      // ✅ Enregistrer dans Firestore avec ID unique
      await adminDB
        .collection("orders")
        .doc(`${session.id}_${Date.now()}`)
        .set(order);
      console.log("🔥 Commande enregistrée dans Firestore");

      // 📨 Envoi des e-mails
      try {
        console.log("📬 Début envoi e-mails webhook…");
        await sendOrderEmails({
          order,
          clientEmail: session.customer_email,
        });
        console.log("✅ E-mails envoyés depuis webhook !");
      } catch (emailErr) {
        console.error("❌ Erreur lors de l’envoi d’e-mails :", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Stripe webhook error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
