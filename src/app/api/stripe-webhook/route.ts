// src/app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";import { dbAdmin } from "@/lib/firebase.admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { computePrice } from "@/lib/pricing";
import { createOrUpdateOrder } from "@/server/shipstation/client";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { scheduleReviewEmailForOrder } from "@/server/reviewEmailScheduler";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   EMAIL I18N
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
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickFirst<T>(...values: T[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function isFixtureEmail(email: string | null) {
  if (!email) return false;
  return email === "stripe@example.com" || email.endsWith("@example.com");
}

/* =====================================================
   HELPERS (ShipStation mapping)
===================================================== */
function buildShipStationBody(orderData: any, orderId: string) {
  const orderNumber =
    asString(pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id), orderId) || orderId;

  const orderDate = (() => {
    const d = pickFirst(orderData?.createdAt, orderData?.created_at, orderData?.created);
    if ((d as any)?.toDate) return (d as any).toDate().toISOString();
    if (typeof d === "string") return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  })();

  const customerEmail =
    normalizeEmail(orderData?.email) || normalizeEmail(orderData?.customer_email) || undefined;

  const ship = orderData?.shippingAddress || orderData?.shipTo || {};
  const bill = orderData?.billingAddress || orderData?.billTo || ship || {};

  const billTo = {
    name:
      asString(
        pickFirst(
          bill?.name,
          bill?.fullName,
          bill?.firstName && bill?.lastName ? `${bill.firstName} ${bill.lastName}` : undefined
        ),
        ""
      ).trim() || "Customer",
    street1: asString(pickFirst(bill?.street1, bill?.address1, bill?.line1, bill?.address), "").trim(),
    city: asString(pickFirst(bill?.city, bill?.town), "").trim(),
    postalCode: asString(pickFirst(bill?.postalCode, bill?.zip, bill?.postcode), "").trim(),
    country: asString(pickFirst(bill?.country, bill?.countryCode), "FR").trim(),
    phone: asString(pickFirst(bill?.phone, bill?.phoneNumber), "").trim(),
  };

  const shipTo = {
    name:
      asString(
        pickFirst(
          ship?.name,
          ship?.fullName,
          ship?.firstName && ship?.lastName ? `${ship.firstName} ${ship.lastName}` : undefined
        ),
        ""
      ).trim() || billTo.name || "Customer",
    street1:
      asString(pickFirst(ship?.street1, ship?.address1, ship?.line1, ship?.address), "").trim() ||
      billTo.street1,
    city: asString(pickFirst(ship?.city, ship?.town), "").trim() || billTo.city,
    postalCode:
      asString(pickFirst(ship?.postalCode, ship?.zip, ship?.postcode), "").trim() || billTo.postalCode,
    country: asString(pickFirst(ship?.country, ship?.countryCode), billTo.country || "FR").trim(),
    phone: asString(pickFirst(ship?.phone, ship?.phoneNumber), "").trim() || billTo.phone,
  };

  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode || !shipTo.country) {
    throw new Error(
      `ShipTo incomplete: street1=${!!shipTo.street1}, city=${!!shipTo.city}, postalCode=${!!shipTo.postalCode}, country=${!!shipTo.country}`
    );
  }

  const rawItems = Array.isArray(orderData?.items) ? orderData.items : [];
  const items = rawItems
    .map((it: any) => {
      const q = Math.max(1, Math.floor(Number(it?.quantity ?? 1) || 1));
      const candidate =
        it?.unitPrice ??
        it?.unit_price ??
        it?.priceHT ??
        it?.price_ht ??
        it?.price ??
        it?.amount ??
        it?.total ??
        0;

      let unit = Number(candidate ?? 0) || 0;
      if (Number.isInteger(unit) && unit >= 1000) unit = unit / 100;

      const imageUrl =
        (isNonEmptyString(it?.imageUrl) && it.imageUrl) ||
        (isNonEmptyString(it?.image_url) && it.image_url) ||
        (isNonEmptyString(it?.image) && it.image) ||
        (isNonEmptyString(it?.thumbnail) && it.thumbnail) ||
        (isNonEmptyString(it?.photoUrl) && it.photoUrl) ||
        (Array.isArray(it?.images) && isNonEmptyString(it.images?.[0]) ? it.images[0] : undefined) ||
        (Array.isArray(it?.images) && isNonEmptyString(it.images?.[0]?.url) ? it.images[0].url : undefined) ||
        undefined;

      return {
        sku: isNonEmptyString(it?.sku) ? it.sku : isNonEmptyString(it?.id) ? String(it.id) : undefined,
        name: asString(pickFirst(it?.name, it?.title, it?.productName), "Produit").trim(),
        quantity: q,
        unitPrice: Math.max(0, unit),
        ...(imageUrl ? { imageUrl } : {}),
      };
    })
    .filter((x: any) => x.name && x.quantity > 0);

  if (items.length === 0) {
    throw new Error("ShipStation payload has no items (check orderData.items mapping).");
  }

  const amountPaidTTC = Number(orderData?.totals?.totalTTC ?? orderData?.totalTTC ?? orderData?.amount_total ?? 0);
  const shippingAmount = Number(orderData?.totals?.shipping ?? orderData?.shippingMethod?.priceTTC ?? 0);
  const taxAmount = Number(orderData?.totals?.tax ?? orderData?.totals?.vat ?? 0);

  return {
    orderNumber,
    orderDate,
    orderStatus: "awaiting_shipment" as const,
    customerEmail,
    billTo,
    shipTo,
    items,
    ...(Number.isFinite(amountPaidTTC) && amountPaidTTC > 0 ? { amountPaid: amountPaidTTC } : {}),
    ...(Number.isFinite(shippingAmount) && shippingAmount > 0 ? { shippingAmount } : {}),
    ...(Number.isFinite(taxAmount) && taxAmount > 0 ? { taxAmount } : {}),
  };
}

/* =====================================================
   STRIPE WEBHOOK
===================================================== */
export async function POST(req: Request) {
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

  const customerEmail = firestoreEmail || (stripeEmail && !isFixtureEmail(stripeEmail) ? stripeEmail : null);

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

  const mail = EMAIL_I18N[locale];

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

    const finalizeResult = await finalizePaidOrder({
      orderId,
      provider: "stripe",
      email: customerEmail,
      locale,
      payment: {
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent ?? null,
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
     2) SHIPSTATION (non bloquant)
  ===================================================== */
  try {
    const snapAfter = await ref.get();
    const orderDataAfter = snapAfter.exists ? (snapAfter.data() as any) : savedOrder;

    const pushedAt = Boolean(orderDataAfter?.shipstation?.pushedAt);
    const pushedWithImages = Boolean(orderDataAfter?.shipstation?.pushedWithImages);

    const hasAnyImage =
      Array.isArray(orderDataAfter?.items) &&
      orderDataAfter.items.some((it: any) => {
        const url =
          it?.imageUrl ||
          it?.image_url ||
          it?.image ||
          it?.thumbnail ||
          it?.photoUrl ||
          (Array.isArray(it?.images) ? it.images?.[0] : null) ||
          (Array.isArray(it?.images) ? it.images?.[0]?.url : null);

        return typeof url === "string" && url.trim().length > 0;
      });

    const shouldPush = !pushedAt || (!pushedWithImages && hasAnyImage);

    if (shouldPush) {
      const ssBody = buildShipStationBody(orderDataAfter, orderId);
      const ssOrder = await createOrUpdateOrder(ssBody);

      const bodyHasImages =
        Array.isArray((ssBody as any)?.items) &&
        (ssBody as any).items.some((x: any) => typeof x?.imageUrl === "string" && x.imageUrl.trim().length > 0);

      await ref.set(
        {
          shipstation: {
            pushedAt: new Date(),
            pushedWithImages: bodyHasImages,
            orderNumber: ssBody.orderNumber,
            response: ssOrder ?? null,
          },
        },
        { merge: true }
      );
    }
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error("[stripe/webhook] shipstation push ERROR (non bloquant):", msg);

    await ref.set(
      {
        shipstation: {
          pushedAt: null,
          lastErrorAt: new Date(),
          lastError: msg,
        },
      },
      { merge: true }
    );
  }

  /* =====================================================
     3) INVOICE PDF + EMAIL (non bloquant + anti-doublon)
  ===================================================== */
  try {
    const after = (await ref.get()).data() as any;

    if (after?.invoiceEmail?.status === "sent") {
      console.log("[stripe/webhook] invoice already sent, skip", orderId);
      return NextResponse.json({ received: true });
    }

    const emailForInvoice = normalizeEmail(after?.email) || customerEmail;
    if (!emailForInvoice) {
      console.warn("[stripe/webhook] invoice skipped (no email)", { orderId });
      return NextResponse.json({ received: true });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error("missing_RESEND_API_KEY");

    const resend = new Resend(resendKey);

    const latest = after || savedOrder || {};
    const items = (latest.items || []).map((it: any) => {
      const priceHT = Number(it?.priceHT ?? it?.price ?? 0);
      return {
        name: it?.name || "Produit",
        description: it?.description || "",
        quantity: Number(it?.quantity || 1),
        price: priceHT,
        priceHT,
      };
    });

    const sm = latest.shippingMethod || {};
    const shippingHT = Number(sm?.priceHT ?? sm?.price ?? 0);
    const vatRate = Number(sm?.vatRate ?? 0);
    const shippingCalc = computePrice({ priceHT: shippingHT, vatRate });

    const shippingMethod = {
      ...sm,
      price: shippingCalc.ttc,
      priceHT: shippingHT,
      vatRate,
      priceTTC: shippingCalc.ttc,
      type: sm?.type || "home",
      relayProvider: sm?.relayProvider || null,
    };

    const normalizedOrder = {
      ...latest,
      items,
      shippingMethod,
      shippingPrice: shippingHT,
      customerFirstName: latest?.customerFirstName || firstName,
      customerLastName: latest?.customerLastName || lastName,
    };

    const pdfBuffer = await generateInvoicePDF(normalizedOrder, orderId, { locale });

    const sent = await resend.emails.send({
      from: "Massme • Support <contact@hdconnects.com>",
      to: emailForInvoice,
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

    await ref.set(
      {
        invoiceEmail: {
          status: "sent",
          sentAt: new Date(),
          resendId: (sent as any)?.data?.id || (sent as any)?.id || null,
        },
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error("❌ PDF / invoice email error:", err?.message || err);

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