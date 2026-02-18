// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { computeTax } from "@/lib/tax";
import Stripe from "stripe";

/* =====================================================
   TYPES
===================================================== */
type CartItem = {
  priceHT: number;
  quantity: number;
};

type CleanItem = CartItem & {
  id: string;
  name: string;
};

type AddressPayload = {
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

/* =====================================================
   STRIPE LOCALE (SAFE)
===================================================== */
// Stripe Checkout locale (liste stricte) + "auto"
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

/* =====================================================
   API
===================================================== */
export async function POST(req: Request) {
  try {
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

    /* ------------------ VALIDATION ------------------ */
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!billingAddress || !billingAddress.address) {
      return NextResponse.json(
        { error: "Missing billing address" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.address) {
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

    if (!paymentMethod || !paymentMethod.provider) {
      return NextResponse.json(
        { error: "Missing payment method" },
        { status: 400 }
      );
    }

    if (paymentMethod.provider !== "stripe") {
      return NextResponse.json(
        { error: "Payment provider not supported yet" },
        { status: 400 }
      );
    }

    const country = shippingAddress?.country || "FR";

    /* ------------------ PANIER (HT) ------------------ */
    const cleanItems: CleanItem[] = items.map((i: any) => ({
      id: String(i.id),
      name: String(i.name),
      priceHT: Number(i.priceHT) || 0,
      quantity: Math.max(1, Number(i.quantity || 1)),
    }));

    const itemsHT = cleanItems.reduce(
      (sum: number, item: CartItem) => sum + item.priceHT * item.quantity,
      0
    );

    // Livraison HT
    const shippingHT = Number(shippingMethod.priceHT ?? 0);

    /* ------------------ TVA (SOURCE DE VÉRITÉ) ------------------ */
    const taxItems = disableVAT
      ? {
          ht: itemsHT,
          vatAmount: 0,
          vatRate: 0,
          ttc: itemsHT,
          country,
          applied: false,
        }
      : computeTax({ priceHT: itemsHT, country });

    const taxShipping = disableVAT
      ? {
          ht: shippingHT,
          vatAmount: 0,
          vatRate: 0,
          ttc: shippingHT,
          country,
          applied: false,
        }
      : computeTax({
          priceHT: shippingHT,
          country,
          vatRate: shippingMethod.vatRate,
        });

    const totalHT = taxItems.ht + taxShipping.ht;
    const totalVAT = taxItems.vatAmount + taxShipping.vatAmount;
    const totalTTC = totalHT + totalVAT;

    /* ------------------ FIRESTORE (SOURCE DE VÉRITÉ) ------------------ */
    const orderRef = db.collection("orders").doc();

    await orderRef.set({
      id: orderRef.id,
      email: customerEmail,
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
      createdAt: Timestamp.now(),

      paymentMethod: {
        id: paymentMethod.id,
        provider: paymentMethod.provider,
        country: paymentMethod.country,
        name: paymentMethod.name || {},
        description: paymentMethod.description || {},
        config: paymentMethod.config || {},
      },
    });

    /* ------------------ STRIPE CUSTOMER ------------------ */
    const stripeCustomer = await stripe.customers.create({
      email: customerEmail,
      name: billingAddress.name,
      address: {
        line1: billingAddress.address,
        postal_code: billingAddress.postalCode,
        city: billingAddress.city,
        country: billingAddress.country,
      },
      shipping: {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.address,
          postal_code: shippingAddress.postalCode,
          city: shippingAddress.city,
          country: shippingAddress.country,
        },
      },
      metadata: {
        order_id: orderRef.id,
        heardFrom: heardFrom || "",
        heardFromOther: heardFromOther || "",
      },
    });

    /* ------------------ STRIPE LINE ITEMS ------------------ */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Produits (HT)
    for (const item of cleanItems) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.priceHT * 100),
        },
        quantity: item.quantity,
      });
    }

    // Livraison TTC
    const shippingTTC = disableVAT
      ? shippingHT
      : Number(shippingMethod.priceTTC ?? taxShipping.ttc);

    if (shippingTTC > 0) {
      const shippingName =
        typeof shippingMethod.name === "string"
          ? shippingMethod.name
          : shippingMethod.name?.[locale] ||
            shippingMethod.name?.fr ||
            "Livraison";

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: shippingName },
          unit_amount: Math.round(shippingTTC * 100),
        },
        quantity: 1,
      });
    }

    // TVA produits uniquement
    if (!disableVAT && taxItems.vatAmount > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: `TVA ${taxItems.vatRate}%` },
          unit_amount: Math.round(taxItems.vatAmount * 100),
        },
        quantity: 1,
      });
    }

    const stripeTotalCents = line_items.reduce((sum, li) => {
      const amount = li.price_data?.unit_amount ?? 0;
      const qty = li.quantity ?? 1;
      return sum + amount * qty;
    }, 0);

    console.log("DEBUG Stripe vs totals", {
      stripeTotal: stripeTotalCents / 100,
      totalHT,
      totalVAT,
      totalTTC,
      itemsHT,
      shippingHT,
      shippingTTC,
      locale,
      stripeLocale: getStripeLocale(locale),
    });

    /* ------------------ STRIPE SESSION ------------------ */
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_URL missing");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomer.id,
      line_items,
      locale: getStripeLocale(locale), // ✅ ICI : Stripe dans la bonne langue
      metadata: {
        order_id: orderRef.id,
        payment_provider: paymentMethod.provider,
      },
      success_url: `${baseUrl}/${locale}/success?order_id=${orderRef.id}`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 /api/checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
