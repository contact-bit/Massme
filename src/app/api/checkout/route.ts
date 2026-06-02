import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { computeTax } from "@/lib/tax";
import Stripe from "stripe";
import { generateOrderNumber } from "@/server/orders/generateOrderNumber";

type CartItem = {
  priceHT: number;
  weightKg?: number;
  deliveryPackageCount?: number;
  quantity: number;
};

type CleanItem = CartItem & {
  id: string;
  sku?: string;
  productCode?: string;
  name: string;
};

type StripeCheckoutLocale =
  | "auto"
  | "bg"
  | "cs"
  | "da"
  | "de"
  | "el"
  | "en"
  | "en-GB"
  | "es"
  | "es-419"
  | "et"
  | "fi"
  | "fr"
  | "fr-CA"
  | "hr"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "lt"
  | "lv"
  | "ms"
  | "mt"
  | "nb"
  | "nl"
  | "pl"
  | "pt"
  | "pt-BR"
  | "ro"
  | "ru"
  | "sk"
  | "sl"
  | "sv"
  | "th"
  | "tr"
  | "vi"
  | "zh"
  | "zh-HK"
  | "zh-TW";

const STRIPE_LOCALE_BY_APP_LOCALE: Record<string, StripeCheckoutLocale> = {
  fr: "fr",
  en: "en",
  es: "es",
  de: "de",
  it: "it",
  nl: "nl",
};

function getStripeLocale(appLocale: unknown): StripeCheckoutLocale {
  const l = String(appLocale || "").trim();
  return STRIPE_LOCALE_BY_APP_LOCALE[l] ?? "auto";
}

function normalizeEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

/* =========================================================
   FINGERPRINT
========================================================= */

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();

  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

function buildOrderFingerprint(input: {
  email: string;
  locale: string;
  items: CleanItem[];
  billingAddress: any;
  shippingAddress: any;
  shippingMethod: any;
  relayPoint: any;
  disableVAT: boolean;
  heardFrom: any;
  heardFromOther: any;
  paymentMethod: any;
}) {
  const normalizedItems = [...input.items]
    .map((item) => ({
      id: String(item.id),
      sku: String((item as any).sku || (item as any).productCode || "").trim(),
      name: String(item.name),
      priceHT: Number(item.priceHT) || 0,
      weightKg: Number((item as any).weightKg) || 0,
      deliveryPackageCount:
        (item as any).deliveryPackageCount == null
          ? 1
          : Math.max(
              0,
              Number((item as any).deliveryPackageCount) || 0
            ),
      quantity: Math.max(1, Number(item.quantity || 1)),
    }))
    .sort((a, b) => {
      const ak = `${a.id}__${a.name}`;
      const bk = `${b.id}__${b.name}`;
      return ak.localeCompare(bk);
    });

  const payload = {
    email: normalizeEmail(input.email),
    locale: String(input.locale || "fr"),
    items: normalizedItems,
    billingAddress: input.billingAddress || null,
    shippingAddress: input.shippingAddress || null,
    shippingMethod: input.shippingMethod || null,
    relayPoint: input.relayPoint || null,
    disableVAT: !!input.disableVAT,
    heardFrom: input.heardFrom || null,
    heardFromOther: input.heardFromOther || null,
    paymentProvider: input.paymentMethod?.provider || null,
    paymentMethodId: input.paymentMethod?.id || null,
  };

  return stableStringify(payload);
}

/* =========================================================
   REUSE
========================================================= */

function isRecentEnough(createdAt: any, maxAgeMs: number): boolean {
  try {
    const date =
      createdAt?.toDate?.() instanceof Date
        ? createdAt.toDate()
        : typeof createdAt === "string" || typeof createdAt === "number"
        ? new Date(createdAt)
        : null;

    if (!date || Number.isNaN(date.getTime())) return false;
    return Date.now() - date.getTime() <= maxAgeMs;
  } catch {
    return false;
  }
}

async function findReusablePendingOrder(params: {
  email: string;
  fingerprint: string;
}) {
  const email = normalizeEmail(params.email);

  const snap = await db
    .collection("orders")
    .where("email", "==", email)
    .where("status", "==", "pending_payment")
    .limit(10)
    .get();

  if (snap.empty) return null;

  const candidates = snap.docs
    .map((doc) => ({ id: doc.id, ref: doc.ref, data: doc.data() as any }))
    .filter((entry) => {
      const sameFingerprint =
        entry.data?.checkoutFingerprint === params.fingerprint;
      const recent = isRecentEnough(entry.data?.createdAt, 30 * 60 * 1000);
      return sameFingerprint && recent;
    })
    .sort((a, b) => {
      const da = a.data?.createdAt?.toMillis?.() ?? 0;
      const db = b.data?.createdAt?.toMillis?.() ?? 0;
      return db - da;
    });

  return candidates[0] || null;
}

/* =========================================================
   STRIPE ITEMS
========================================================= */

function buildLineItems(params: {
  items: CleanItem[];
  disableVAT: boolean;
  shippingMethod: any;
  taxItems: { vatRate: number; vatAmount: number };
  taxShipping: { ttc: number };
  shippingHT: number;
}) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of params.items) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          metadata: item.sku
            ? {
                sku: item.sku,
              }
            : undefined,
        },
        unit_amount: Math.round(item.priceHT * 100),
      },
      quantity: item.quantity,
    });
  }

  const shippingTTC = params.disableVAT
    ? params.shippingHT
    : Number(params.shippingMethod?.priceTTC ?? params.taxShipping.ttc);

  if (shippingTTC > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Livraison",
        },
        unit_amount: Math.round(shippingTTC * 100),
      },
      quantity: 1,
    });
  }

  if (!params.disableVAT && params.taxItems.vatAmount > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: `TVA ${params.taxItems.vatRate}%`,
        },
        unit_amount: Math.round(params.taxItems.vatAmount * 100),
      },
      quantity: 1,
    });
  }

  return lineItems;
}

/* =========================================================
   MAIN
========================================================= */

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();

    const {
      items,
      locale = "fr",
      customerEmail,
      billingAddress,
      shippingAddress,
      shippingMethod,
      relayPoint,
      disableVAT = false,
      heardFrom,
      heardFromOther,
      paymentMethod,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!billingAddress?.address) {
      return NextResponse.json(
        { error: "Missing billing address" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.address) {
      return NextResponse.json(
        { error: "Missing shipping address" },
        { status: 400 }
      );
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Missing shipping method" },
        { status: 400 }
      );
    }

    if (paymentMethod?.provider !== "stripe") {
      return NextResponse.json({ error: "Stripe required" }, { status: 400 });
    }

    const email = normalizeEmail(customerEmail);
    const country = shippingAddress.country || "FR";

    const cleanItems: CleanItem[] = items.map((i: any) => ({
      id: String(i.id),
      sku: String(i.sku || i.productCode || "").trim() || undefined,
      productCode: String(i.productCode || i.sku || "").trim() || undefined,
      name: String(i.name),
      priceHT: Number(i.priceHT) || 0,
      weightKg: Number(i.weightKg) || 0,
      deliveryPackageCount:
        (i as any).deliveryPackageCount == null
          ? 1
          : Math.max(
              0,
              Number((i as any).deliveryPackageCount) || 0
            ),
      quantity: Math.max(1, Number(i.quantity || 1)),
    }));

    const itemsHT = cleanItems.reduce(
      (sum, item) => sum + item.priceHT * item.quantity,
      0
    );

    const shippingHT = Number(shippingMethod.priceHT ?? 0);

    const taxItems = disableVAT
      ? { ht: itemsHT, vatAmount: 0, vatRate: 0, ttc: itemsHT }
      : computeTax({ priceHT: itemsHT, country });

    const taxShipping = disableVAT
      ? { ht: shippingHT, vatAmount: 0, vatRate: 0, ttc: shippingHT }
      : computeTax({
          priceHT: shippingHT,
          country,
          vatRate: shippingMethod.vatRate,
        });

    const totalHT = taxItems.ht + taxShipping.ht;
    const totalVAT = taxItems.vatAmount + taxShipping.vatAmount;
    const totalTTC = totalHT + totalVAT;

    const checkoutFingerprint = buildOrderFingerprint({
      email,
      locale,
      items: cleanItems,
      billingAddress,
      shippingAddress,
      shippingMethod,
      relayPoint,
      disableVAT,
      heardFrom,
      heardFromOther,
      paymentMethod,
    });

    const reusable = await findReusablePendingOrder({
      email,
      fingerprint: checkoutFingerprint,
    });

    const orderRef = reusable?.ref ?? db.collection("orders").doc();
    const orderId = reusable?.id ?? orderRef.id;

    let orderNumber: string =
      reusable?.data?.orderNumber || reusable?.data?.invoiceNumber || "";

    if (reusable) {
      console.log("[checkout] reusing pending order:", orderId, orderNumber);
    } else {
      orderNumber = await generateOrderNumber();

      await orderRef.set({
        id: orderId,
        orderNumber,
        email,
        items: cleanItems,
        billingAddress,
        shippingAddress,
        shippingMethod,
        relayPoint: relayPoint || null,
        shippingPrice: shippingHT,
        totals: {
          country,
          vatRate: taxItems.vatRate,
          totalHT,
          totalVAT,
          totalTTC,
          vatDisabled: disableVAT,
        },
        heardFrom: heardFrom || null,
        heardFromOther: heardFromOther || null,
        locale,
        status: "pending_payment",
        payment: {
          provider: "stripe",
          status: "pending",
        },
        paymentMethod,
        checkoutFingerprint,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log("[checkout] order created:", orderId, orderNumber);
    }

    const existingSessionId =
      (reusable?.data?.payment?.checkoutSessionId as string | undefined) ||
      (reusable?.data?.stripeSessionId as string | undefined);

    if (existingSessionId) {
      try {
        const existingSession =
          await stripe.checkout.sessions.retrieve(existingSessionId);

        if (existingSession?.url && existingSession.status === "open") {
          console.log("[checkout] reusing stripe session:", existingSession.id);
          return NextResponse.json({
            url: existingSession.url,
            orderId,
            orderNumber,
          });
        }
      } catch (e) {
        console.warn("[checkout] existing session reuse failed:", e);
      }
    }

    const stripeCustomer = await stripe.customers.create({
      email,
      name: billingAddress.name,
      address: {
        line1: billingAddress.address,
        postal_code: billingAddress.postalCode,
        city: billingAddress.city,
        country: billingAddress.country,
      },
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        customer_email: email,
      },
    });

    const line_items = buildLineItems({
      items: cleanItems,
      disableVAT,
      shippingMethod,
      taxItems: {
        vatRate: taxItems.vatRate,
        vatAmount: taxItems.vatAmount,
      },
      taxShipping: {
        ttc: taxShipping.ttc,
      },
      shippingHT,
    });

    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.APP_BASE_URL;

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_URL or APP_BASE_URL");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomer.id,
      line_items,
      locale: getStripeLocale(locale),
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        payment_provider: "stripe",
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          payment_provider: "stripe",
        },
      },
      success_url: `${baseUrl}/${locale}/success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    await orderRef.set(
      {
        updatedAt: Timestamp.now(),
        stripeCustomerId: stripeCustomer.id,
        stripeSessionId: session.id,
        payment: {
          provider: "stripe",
          status: "pending",
          checkoutSessionId: session.id,
        },
      },
      { merge: true }
    );

    console.log("[checkout] stripe session created:", session.id, orderNumber);

    return NextResponse.json({
      url: session.url,
      orderId,
      orderNumber,
    });
  } catch (err: any) {
    console.error("💥 /api/checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
