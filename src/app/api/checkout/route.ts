import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";

/* ----------------------------------------------
   Types
---------------------------------------------- */

type CleanItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type RelayPoint = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country?: string;
};

/* ----------------------------------------------
   POST /api/checkout (VERSION SENDCLOUD)
---------------------------------------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      currency = "eur",
      locale = "fr",
      customerEmail,
      shippingAddress,
      relayPoint,
    } = body as {
      items: any[];
      currency: string;
      locale: "fr" | "en";
      customerEmail: string;
      shippingAddress: any;
      relayPoint?: RelayPoint | null;
    };

    /* ----------------------------------------------
       VALIDATIONS
    ---------------------------------------------- */
    if (!items?.length)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });

    if (!customerEmail)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    if (!relayPoint)
      return NextResponse.json(
        { error: "Missing Sendcloud relay/delivery selection" },
        { status: 400 }
      );

    /* ----------------------------------------------
       NORMALISATION ITEMS
    ---------------------------------------------- */
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

    /* ----------------------------------------------
       TOTALS
    ---------------------------------------------- */
    const subtotal = cleanItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 🔥 shipping en dur (Sendcloud)
    const shippingMethod = {
      id: "sendcloud",
      name: locale === "fr" ? "Livraison" : "Shipping",
      price: 4.9,
      delay: locale === "fr" ? "2-4 jours" : "2-4 days",
    };

    const total = subtotal + shippingMethod.price;

    /* ----------------------------------------------
       SAVE Firestore → pending_orders
    ---------------------------------------------- */
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items: cleanItems,
      shippingMethod,
      shippingAddress,
      relayPoint,
      subtotal,
      shippingPrice: shippingMethod.price,
      total,
      currency,
      locale,
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    /* ----------------------------------------------
       STRIPE LINE ITEMS
    ---------------------------------------------- */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cleanItems.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    /* ----------------------------------------------
       STRIPE SHIPPING LINE
    ---------------------------------------------- */
    const shippingOption: Stripe.Checkout.SessionCreateParams.ShippingOption = {
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: shippingMethod.name,
        fixed_amount: {
          amount: Math.round(shippingMethod.price * 100),
          currency,
        },
      },
    };

    /* ----------------------------------------------
       METADATA (propre & court)
    ---------------------------------------------- */
    const metadata: Record<string, string> = {
      order_id: orderRef.id,
      sendcloud_relay_name: relayPoint.name,
      sendcloud_relay_street: relayPoint.street,
      sendcloud_relay_city: relayPoint.city,
      sendcloud_relay_postalCode: relayPoint.postalCode,
      sendcloud_relay_country: relayPoint.country || "FR",
    };

    /* ----------------------------------------------
       STRIPE SESSION
    ---------------------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [shippingOption],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/checkout`,
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
