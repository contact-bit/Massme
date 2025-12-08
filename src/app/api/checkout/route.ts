import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";

type Locale = "fr" | "en";

type CleanItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ShippingMethodType = "relay" | "home" | "local_pickup";

type ShippingMethod = {
  id: string;
  name: string;
  delay: string;
  price: number;
  type: ShippingMethodType;
};

type RelayPoint = {
  id: string;
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  raw?: any;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      currency = "eur",
      locale = "fr",
      customerEmail,
      shippingAddress,
      shippingMethod,
      relayPoint,
    } = body as {
      items: any[];
      currency: string;
      locale: Locale;
      customerEmail: string;
      shippingAddress: any;
      shippingMethod: ShippingMethod;
      relayPoint?: RelayPoint | null;
    };

    // ----------------- VALIDATIONS -----------------
    if (!items?.length) {
      return NextResponse.json(
        { error: "Missing items" },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Missing shipping method" },
        { status: 400 }
      );
    }

    if (shippingMethod.type === "relay" && !relayPoint) {
      return NextResponse.json(
        { error: "Missing relay point for relay shipping" },
        { status: 400 }
      );
    }

    // ----------------- NORMALISATION ITEMS -----------------
    const cleanItems: CleanItem[] = items.map((item) => ({
      id: String(item.id),
      name:
        item?.name?.fr ||
        item?.name?.en ||
        item?.name ||
        "Produit",
      price:
        typeof item.price === "number"
          ? item.price
          : Number(item.price?.eur || 0),
      quantity: Number(item.quantity || 1),
    }));

    // ----------------- TOTALS -----------------
    const subtotal = cleanItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingPrice = shippingMethod.price ?? 0;
    const total = subtotal + shippingPrice;

    // ----------------- FIRESTORE SAVE -----------------
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items: cleanItems,
      shippingMethod,
      shippingAddress,
      relayPoint: relayPoint || null,
      subtotal,
      shippingPrice,
      total,
      currency,
      locale,
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    // ----------------- STRIPE LINE ITEMS -----------------
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cleanItems.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    // Shipping line
    const shippingOption: Stripe.Checkout.SessionCreateParams.ShippingOption = {
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: shippingMethod.name,
        fixed_amount: {
          amount: Math.round(shippingPrice * 100),
          currency,
        },
      },
    };

    // ----------------- METADATA -----------------
    const metadata: Record<string, string> = {
      order_id: orderRef.id,
      shipping_method_id: shippingMethod.id,
      shipping_method_type: shippingMethod.type,
      shipping_method_name: shippingMethod.name,
    };

    if (relayPoint) {
      metadata.relay_id = relayPoint.id;
      metadata.relay_name = relayPoint.name;
      metadata.relay_address = relayPoint.address;
      metadata.relay_city = relayPoint.city;
      metadata.relay_postalCode = relayPoint.postalCode;
      metadata.relay_country = relayPoint.country;
    }

    // ----------------- STRIPE SESSION -----------------
    const successBase = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [shippingOption],
      metadata,
      success_url: `${successBase}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successBase}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 ERREUR /api/checkout :", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
