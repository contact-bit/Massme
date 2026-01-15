import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { computeTax } from "@/lib/tax";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      locale = "fr",
      customerEmail,
      shippingAddress,
      shippingMethod,
      relayPoint,
      disableVAT = false, // ✅ B2B / intracom
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!shippingMethod) {
      return NextResponse.json({ error: "Missing shipping method" }, { status: 400 });
    }

    const country = shippingAddress?.country || "FR";

    /* ------------------------------------
       PANIER (HT UNIQUEMENT)
    ------------------------------------ */
    const cleanItems = items.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      priceHT: Number(item.priceHT),
      quantity: Math.max(1, Number(item.quantity || 1)),
    }));

    const itemsHT = cleanItems.reduce(
      (sum: number, i: any) => sum + i.priceHT * i.quantity,
      0
    );

    const shippingHT = Number(shippingMethod.price ?? 0);

    /* ------------------------------------
       TVA (CENTRALISÉE)
    ------------------------------------ */
    const taxItems = disableVAT
      ? { ht: itemsHT, vatAmount: 0, vatRate: 0, ttc: itemsHT }
      : computeTax({ priceHT: itemsHT, country });

    const taxShipping = disableVAT
      ? { ht: shippingHT, vatAmount: 0, vatRate: 0, ttc: shippingHT }
      : computeTax({ priceHT: shippingHT, country });

    const totalHT = taxItems.ht + taxShipping.ht;
    const totalVAT = taxItems.vatAmount + taxShipping.vatAmount;
    const totalTTC = totalHT + totalVAT;

    /* ------------------------------------
       FIRESTORE (COMPTABLE)
    ------------------------------------ */
    const orderRef = await db.collection("orders").add({
      email: customerEmail,
      items: cleanItems,
      shippingMethod,
      shippingAddress,
      relayPoint: relayPoint || null,

      totals: {
        country,
        vatRate: taxItems.vatRate,
        itemsHT: taxItems.ht,
        shippingHT: taxShipping.ht,
        vatAmount: totalVAT,
        totalHT,
        totalTTC,
        vatDisabled: disableVAT,
      },

      locale,
      status: "pending_payment",
      createdAt: Timestamp.now(),
    });

    /* ------------------------------------
       STRIPE LINE ITEMS
    ------------------------------------ */
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

    if (shippingHT > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: shippingMethod.name },
          unit_amount: Math.round(shippingHT * 100),
        },
        quantity: 1,
      });
    }

    if (!disableVAT && totalVAT > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `TVA ${taxItems.vatRate}%`,
          },
          unit_amount: Math.round(totalVAT * 100),
        },
        quantity: 1,
      });
    }

    /* ------------------------------------
       STRIPE SESSION
    ------------------------------------ */
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      metadata: {
        order_id: orderRef.id,
        vat_disabled: String(disableVAT),
      },
      success_url: `${baseUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 /api/checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
