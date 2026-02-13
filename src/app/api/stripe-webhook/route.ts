import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { computePrice } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* =====================================================
   EMAIL I18N
===================================================== */

type EmailLocale = "fr" | "en" | "it" | "es" | "de" | "nl";

const EMAIL_I18N: Record<
  EmailLocale,
  {
    subject: string;
    title: (name: string) => string;
    intro: string;
    orderLabel: string;
  }
> = {
  fr: {
    subject: "🎉 Merci pour votre commande — Facture jointe",
    title: (name) => `Merci ${name} pour votre commande 🎉`,
    intro: "Votre facture est jointe à cet email.",
    orderLabel: "Commande",
  },
  en: {
    subject: "🎉 Thank you for your order — Invoice attached",
    title: (name) => `Thank you ${name} for your order 🎉`,
    intro: "Your invoice is attached to this email.",
    orderLabel: "Order",
  },
  it: {
    subject: "🎉 Grazie per il tuo ordine — Fattura allegata",
    title: (name) => `Grazie ${name} per il tuo ordine 🎉`,
    intro: "La tua fattura è allegata a questa email.",
    orderLabel: "Ordine",
  },
  es: {
    subject: "🎉 Gracias por tu pedido — Factura adjunta",
    title: (name) => `Gracias ${name} por tu pedido 🎉`,
    intro: "Tu factura está adjunta a este correo.",
    orderLabel: "Pedido",
  },
  de: {
    subject: "🎉 Vielen Dank für Ihre Bestellung — Rechnung beigefügt",
    title: (name) => `Vielen Dank ${name} für Ihre Bestellung 🎉`,
    intro: "Ihre Rechnung ist dieser E-Mail beigefügt.",
    orderLabel: "Bestellung",
  },
  nl: {
    subject: "🎉 Bedankt voor je bestelling — Factuur bijgevoegd",
    title: (name) => `Bedankt ${name} voor je bestelling 🎉`,
    intro: "Je factuur is bijgevoegd bij deze e-mail.",
    orderLabel: "Bestelling",
  },
};

/* =====================================================
   RAW BODY → BUFFER (Stripe requirement)
===================================================== */

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

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

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
    console.error("❌ Stripe signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  /* =====================================================
     CHECKOUT SESSION COMPLETED
  ===================================================== */

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const customerEmail =
      session.customer_details?.email || session.customer_email || null;

    if (!orderId || !customerEmail) {
      console.error("⚠️ order_id ou email manquant");
      return NextResponse.json({ received: true });
    }

    /* ---------------- SOURCE DE VÉRITÉ ---------------- */
    const ref = dbAdmin.collection("orders").doc(orderId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.error("❌ Commande introuvable:", orderId);
      return NextResponse.json({ received: true });
    }

    const savedOrder = snap.data()!;

    /* ---------------- LANGUE CLIENT ---------------- */
    const locale: EmailLocale =
      EMAIL_I18N[savedOrder.locale as EmailLocale]
        ? savedOrder.locale
        : "fr";

    const mail = EMAIL_I18N[locale];

    /* ---------------- CLIENT ---------------- */
    const firstName =
      savedOrder.shippingAddress?.firstName ||
      savedOrder.customerFirstName ||
      savedOrder.shippingAddress?.name?.split(" ")[0] ||
      "";

    const lastName =
      savedOrder.shippingAddress?.lastName ||
      savedOrder.customerLastName ||
      "";

    /* ---------------- ITEMS ---------------- */
    const items = (savedOrder.items || []).map((it: any) => {
      const priceHT = Number(it.priceHT ?? it.price ?? 0);
      return {
        name: it.name || "Produit",
        description: it.description || "",
        quantity: Number(it.quantity || 1),
        price: priceHT,
        priceHT,
      };
    });

    /* ---------------- SHIPPING (HT / TTC) ---------------- */
    const sm = savedOrder.shippingMethod || {};
    const shippingHT = Number(sm.priceHT ?? sm.price ?? 0);
    const vatRate = Number(sm.vatRate ?? 0);

    const shippingCalc = computePrice({
      priceHT: shippingHT,
      vatRate,
    });

    const shippingMethod = {
      ...sm,
      price: shippingCalc.ttc,
      priceHT: shippingHT,
      vatRate,
      priceTTC: shippingCalc.ttc,
      type: sm.type || "home",
      relayProvider: sm.relayProvider || null,
    };

    const normalizedOrder = {
      ...savedOrder,
      items,
      shippingMethod,

      // ✅ Prix HT de la livraison utilisé par generateInvoicePDF
      shippingPrice: shippingHT,

      customerFirstName: firstName,
      customerLastName: lastName,
    };

    /* ---------------- UPDATE ORDER ---------------- */
    await ref.update({
      status: "paid",
      paidAt: new Date(),
      stripeSessionId: session.id,
      customerFirstName: firstName,
      customerLastName: lastName,
    });

    /* ---------------- PDF + EMAIL ---------------- */
    try {
      const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId, {
        locale,
      });

      await resend.emails.send({
        from: "Massme • Support <contact@hdconnects.com>",
        to: customerEmail,
        subject: mail.subject,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>${mail.title(firstName)}</h2>
            <p>${mail.intro}</p>
            <p><b>${mail.orderLabel} :</b> ${orderId}</p>
          </div>
        `,
        attachments: [
          {
            filename: `invoice-${orderId}.pdf`,
            content: pdfBuffer.toString("base64"),
            contentType: "application/pdf",
          },
        ],
      });

      console.log("📧 Email client envoyé");
    } catch (err) {
      console.error("❌ PDF / email client:", err);
    }
  }

  return NextResponse.json({ received: true });
}
