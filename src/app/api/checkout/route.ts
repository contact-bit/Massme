import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { computeTax } from "@/lib/tax";
import Stripe from "stripe";

type CartItem = {
  priceHT: number;
  quantity: number;
};

type CleanItem = CartItem & {
  id: string;
  name: string;
};

type StripeCheckoutLocale =
  | "auto"
  | "bg" | "cs" | "da" | "de" | "el"
  | "en" | "en-GB"
  | "es" | "es-419"
  | "et" | "fi" | "fr" | "fr-CA"
  | "hr" | "hu" | "id" | "it"
  | "ja" | "ko" | "lt" | "lv"
  | "ms" | "mt" | "nb" | "nl"
  | "pl" | "pt" | "pt-BR"
  | "ro" | "ru" | "sk" | "sl"
  | "sv" | "th" | "tr"
  | "vi" | "zh" | "zh-HK" | "zh-TW";

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
      return NextResponse.json({ error: "Missing billing address" }, { status: 400 });
    }

    if (!shippingAddress?.address) {
      return NextResponse.json({ error: "Missing shipping address" }, { status: 400 });
    }

    if (!shippingMethod) {
      return NextResponse.json({ error: "Missing shipping method" }, { status: 400 });
    }

    if (paymentMethod?.provider !== "stripe") {
      return NextResponse.json({ error: "Stripe required" }, { status: 400 });
    }

    const country = shippingAddress.country || "FR";

    const cleanItems: CleanItem[] = items.map((i: any) => ({
      id: String(i.id),
      name: String(i.name),
      priceHT: Number(i.priceHT) || 0,
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
      paymentMethod,
    });

    console.log("[checkout] order created:", orderRef.id);

    const stripeCustomer = await stripe.customers.create({
      email: customerEmail,
      name: billingAddress.name,
      address: {
        line1: billingAddress.address,
        postal_code: billingAddress.postalCode,
        city: billingAddress.city,
        country: billingAddress.country,
      },
      metadata: {
        order_id: orderRef.id,
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

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

    const shippingTTC = disableVAT
      ? shippingHT
      : Number(shippingMethod.priceTTC ?? taxShipping.ttc);

    if (shippingTTC > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Livraison" },
          unit_amount: Math.round(shippingTTC * 100),
        },
        quantity: 1,
      });
    }

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

    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      process.env.APP_BASE_URL;

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_URL or APP_BASE_URL");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomer.id,
      line_items,
      locale: getStripeLocale(locale),
      client_reference_id: orderRef.id,
      metadata: {
        order_id: orderRef.id,
        payment_provider: "stripe",
      },
      success_url: `${baseUrl}/${locale}/success?order_id=${orderRef.id}`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    console.log("[checkout] stripe session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 /api/checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}