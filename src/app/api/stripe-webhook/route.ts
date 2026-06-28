// src/app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { scheduleReviewEmailForOrder } from "@/server/reviewEmailScheduler";
import { sendOrderEmails, OrderEmailPayload } from "@/lib/mailer";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   EMAIL I18N (toujours utilisé pour le contenu de finalize/review, etc.)
===================================================== */
type EmailLocale = "fr" | "en" | "it" | "es" | "de" | "nl";

const EMAIL_I18N: Record<
  EmailLocale,
  { subject: string; title: (name: string) => string; intro: string; orderLabel: string }
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
   HELPERS (general)
===================================================== */
function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function isFixtureEmail(email: string | null) {
  if (!email) return false;
  return email === "stripe@example.com" || email.endsWith("@example.com");
}

async function getStripePaymentFee(
  stripe: Stripe,
  paymentIntentId: unknown
) {
  if (typeof paymentIntentId !== "string" || !paymentIntentId) {
    return null;
  }

  try {
    const fromBalanceTransaction = (
      balanceTransaction: any
    ) => {
      const feeCents =
        typeof balanceTransaction?.fee === "number"
          ? balanceTransaction.fee
          : null;

      if (feeCents === null) {
        return null;
      }

      return {
        fee: Math.round(feeCents) / 100,
        feeCurrency:
          typeof balanceTransaction?.currency === "string"
            ? balanceTransaction.currency.toUpperCase()
            : "EUR",
        feeSource: "stripe_balance_transaction",
        balanceTransactionId:
          typeof balanceTransaction?.id === "string"
            ? balanceTransaction.id
            : null,
      };
    };

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["latest_charge.balance_transaction"],
      }
    );

    const charge = paymentIntent.latest_charge as any;
    const balanceTransaction =
      charge?.balance_transaction &&
      typeof charge.balance_transaction === "object"
        ? charge.balance_transaction
        : null;

    const feeFromIntent =
      fromBalanceTransaction(balanceTransaction);

    if (feeFromIntent) {
      return feeFromIntent;
    }

    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
      expand: ["data.balance_transaction"],
    });

    const chargeFromList = charges.data[0] as any;
    const feeFromChargeList =
      fromBalanceTransaction(
        chargeFromList?.balance_transaction
      );

    return feeFromChargeList;
  } catch (err: any) {
    console.warn(
      "[stripe/webhook] fee lookup failed:",
      err?.message || err
    );

    return null;
  }
}

/* =====================================================
   STRIPE WEBHOOK
===================================================== */
export async function POST(req: Request) {
  const stripe = getStripe();

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body!);
    const whsec = process.env.STRIPE_WEBHOOK_SECRET;
    if (!whsec) throw new Error("missing_STRIPE_WEBHOOK_SECRET");
    event = stripe.webhooks.constructEvent(rawBody, signature, whsec);
  } catch (err: any) {
    console.error("❌ Stripe signature error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "invalid_signature" }, { status: 400 });
  }

  console.log("[stripe/webhook] ✅ received", event.type, "id=", event.id);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.warn("[stripe/webhook] ⚠️ session not paid", {
      sessionId: session.id,
      payment_status: session.payment_status,
    });
    return NextResponse.json({ received: true });
  }

  const orderId =
    session.metadata?.orderDocId ||
    session.metadata?.orderId ||
    session.metadata?.order_id ||
    session.client_reference_id ||
    null;

  if (!orderId) {
    console.error("[stripe/webhook] ❌ missing orderId (metadata/client_reference_id)", {
      stripeSessionId: session.id,
      client_reference_id: session.client_reference_id,
      metadata: session.metadata,
    });
    return NextResponse.json({ received: true });
  }

  const ref = dbAdmin.collection("orders").doc(orderId);

  await ref.set(
    {
      "debug.webhookHitAt": FieldValue.serverTimestamp(),
      "debug.webhookEventId": event.id,
      "debug.webhookSessionId": session.id,
      "debug.webhookPaymentStatus": session.payment_status,
    },
    { merge: true }
  );

  let snap = await ref.get();
  let savedOrder: any = null;

  if (!snap.exists) {
    const pendingRef = dbAdmin.collection("pending_orders").doc(orderId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      console.error("[stripe/webhook] ❌ order not found in orders or pending_orders:", orderId);
      await ref.set(
        {
          "debug.webhookError": "order_not_found",
          "debug.webhookOrderLookup": "orders_and_pending_orders_missing",
        },
        { merge: true }
      );
      return NextResponse.json({ received: true });
    }

    const pendingOrder = pendingSnap.data() as any;

    await ref.set(
      {
        ...pendingOrder,
        id: orderId,
        migratedFromPendingAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await pendingRef.delete().catch(() => {});

    snap = await ref.get();
  }

  savedOrder = snap.data() as any;

  if (savedOrder?.stripeWebhook?.lastProcessedEventId === event.id) {
    console.log("[stripe/webhook] ↩️ duplicate ignored", event.id);
    return NextResponse.json({ received: true });
  }

  const stripeEmail =
    normalizeEmail((session.customer_details as any)?.email) ||
    normalizeEmail((session as any)?.customer_email);

  const firestoreEmail =
    normalizeEmail(savedOrder?.email) ||
    normalizeEmail(savedOrder?.customerEmail) ||
    normalizeEmail(savedOrder?.customer_email);

  const customerEmail =
    firestoreEmail || (stripeEmail && !isFixtureEmail(stripeEmail) ? stripeEmail : null);

  await ref.set(
    {
      "debug.resolvedEmail": customerEmail,
      "debug.resolvedEmailSource": firestoreEmail ? "firestore" : stripeEmail ? "stripe" : "none",
      "debug.stripeEmail": stripeEmail,
      "debug.firestoreEmail": firestoreEmail,
    },
    { merge: true }
  );

  console.log("[stripe/webhook] email resolution", {
    orderId,
    firestoreEmail,
    stripeEmail,
    chosen: customerEmail,
  });

  if (!customerEmail) {
    console.warn("[stripe/webhook] ⚠️ missing email (continue; finalize/scheduler may skip)", {
      orderId,
      stripeEmail,
    });
    await ref.set({ "debug.webhookWarn": "missing_email_continue" }, { merge: true });
  }

  const locale: EmailLocale = EMAIL_I18N[savedOrder?.locale as EmailLocale]
    ? savedOrder.locale
    : "fr";

  const firstName =
    savedOrder?.shippingAddress?.firstName ||
    savedOrder?.customerFirstName ||
    savedOrder?.shippingAddress?.name?.split(" ")?.[0] ||
    "";

  const lastName =
    savedOrder?.shippingAddress?.lastName ||
    savedOrder?.customerLastName ||
    "";

  await ref.set(
    {
      customerFirstName: firstName,
      customerLastName: lastName,
      stripeSessionId: session.id,
      stripeWebhook: {
        lastEventId: event.id,
        lastEventType: event.type,
        lastEventAt: new Date(),
        lastSessionId: session.id,
        lastProcessedEventId: event.id,
        lastProcessedAt: new Date(),
      },
      "debug.webhookAfterPaidAt": FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  /* =====================================================
     1) FINALIZE ORDER + REVIEW FLOW
  ===================================================== */
  try {
    console.log("[stripe/webhook] ▶ finalizePaidOrder", orderId);

    await ref.set(
      { "debug.finalizeAboutToRunAt": FieldValue.serverTimestamp() },
      { merge: true }
    );

    const stripeFee = await getStripePaymentFee(
      stripe,
      session.payment_intent
    );

    const finalizeResult = await finalizePaidOrder({
      orderId,
      provider: "stripe",
      email: customerEmail,
      locale,
      payment: {
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent ?? null,
        ...(stripeFee
          ? {
              fee: stripeFee.fee,
              feeCurrency: stripeFee.feeCurrency,
              feeSource: stripeFee.feeSource,
              feeDetectedAt: new Date(),
              balanceTransactionId:
                stripeFee.balanceTransactionId,
            }
          : {
              feeSource:
                "stripe_balance_transaction_not_detected",
              feeDetectedAt: new Date(),
            }),
      },
    });

    await ref.set(
      {
        "debug.finalizeRanAt": FieldValue.serverTimestamp(),
        "debug.finalizeResult": finalizeResult ?? null,
        "reviewEmail.debugLastScheduleAt": new Date(),
        "reviewEmail.debugLastScheduleResult": finalizeResult?.reviewResult ?? null,
      },
      { merge: true }
    );

    console.log("[stripe/webhook] ✅ finalize result", finalizeResult);
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error("[stripe/webhook] ❌ finalize failed:", msg);

    await ref.set(
      {
        "debug.finalizeErrorAt": FieldValue.serverTimestamp(),
        "debug.finalizeError": msg,
        "reviewEmail.lastErrorAt": new Date(),
        "reviewEmail.lastError": msg,
      },
      { merge: true }
    );
  }

  /* =====================================================
     1bis) REVIEW FALLBACK (sécurité Stripe)
  ===================================================== */
  try {
    const afterFinalizeSnap = await ref.get();
    const afterFinalize = afterFinalizeSnap.exists ? (afterFinalizeSnap.data() as any) : null;
    const reviewStatus = String(afterFinalize?.reviewEmail?.status || "").toLowerCase();

    if (!reviewStatus) {
      console.warn("[stripe/webhook] reviewEmail missing after finalize → fallback scheduler", {
        orderId,
      });

      const reviewFallbackResult = await scheduleReviewEmailForOrder(orderId);

      await ref.set(
        {
          "debug.reviewFallbackAt": FieldValue.serverTimestamp(),
          "debug.reviewFallbackResult": reviewFallbackResult ?? null,
          "reviewEmail.debugLastScheduleAt": new Date(),
          "reviewEmail.debugLastScheduleResult": reviewFallbackResult ?? null,
        },
        { merge: true }
      );

      console.log("[stripe/webhook] ✅ review fallback result", reviewFallbackResult);
    }
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error("[stripe/webhook] ❌ review fallback failed:", msg);

    await ref.set(
      {
        "debug.reviewFallbackErrorAt": FieldValue.serverTimestamp(),
        "debug.reviewFallbackError": msg,
        "reviewEmail.lastErrorAt": new Date(),
        "reviewEmail.lastError": msg,
      },
      { merge: true }
    );
  }

  /* =====================================================
     3) EMAIL CONFIRMATION + FACTURE (commun Stripe/PayPal)
  ===================================================== */
  try {
    const afterSnap = await ref.get();
    const after = afterSnap.exists ? (afterSnap.data() as any) : savedOrder;


    

if (after?.emails?.sent && after?.invoiceEmail?.status === "sent") {
  console.log("📧 Email déjà envoyé confirmé");
  return NextResponse.json({ received: true });
}

    const emailForInvoice = normalizeEmail(after?.email) || customerEmail;
    if (!emailForInvoice) {
      console.warn("[stripe/webhook] invoice skipped (no email)", { orderId });
      await ref.set(
        {
          invoiceEmail: {
            status: "skipped",
            reason: "missing_email",
            updatedAt: new Date(),
          },
        },
        { merge: true }
      );
      return NextResponse.json({ received: true });
    }

    const totalTTC = Number(after?.totals?.totalTTC ?? after?.amount_total ?? 0);
    const amountTotalCents = Math.round((totalTTC || 0) * 100);

    const orderNumberForEmail: string =
      (typeof after.orderNumber === "string" && after.orderNumber.length > 0
        ? after.orderNumber
        : (session.metadata?.order_number as string | undefined)) || orderId;
    const invoiceNumber =
      await ensureInvoiceNumberForOrder(ref);

    const emailOrderPayload: OrderEmailPayload = {
      id: after.id || orderId,
      amount_total: amountTotalCents,
      currency: (after?.currency || "EUR").toLowerCase(),
      customer_email: emailForInvoice,
      payment_status: "paid",
      created_at: after.createdAt || after.created_at || new Date(),
      provider: "stripe",
      orderData: {
        ...after,
        orderNumber: orderNumberForEmail,
        invoiceNumber,
      },
      locale,
      orderNumber: orderNumberForEmail,
      invoiceNumber,
    };

    const mailResult = await sendOrderEmails({
      order: emailOrderPayload,
      clientEmail: emailForInvoice,
    });

    await ref.set(
      {
        emails: {
          sent: true,
          sentAt: new Date(),
          provider: "stripe",
          client: mailResult?.client ?? null,
          admin: mailResult?.admin ?? null,
          logistics: mailResult?.logistics ?? [],
        },
        invoiceEmail: {
          status: "sent",
          sentAt: new Date(),
          provider: "stripe",
          orderNumber: mailResult?.orderNumber ?? orderNumberForEmail,
          invoiceNumber:
            mailResult?.invoiceNumber ?? invoiceNumber,
          to: emailForInvoice,
        },
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error("❌ Stripe email / invoice error:", err?.message || err);

    await ref.set(
      {
        invoiceEmail: {
          status: "error",
          lastErrorAt: new Date(),
          lastError: String(err?.message || err),
        },
      },
      { merge: true }
    );
  }

  return NextResponse.json({ received: true });
}
