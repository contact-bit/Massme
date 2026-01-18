// src/app/api/checkout/route.ts
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
      disableVAT = false,
    } = body;

    if (!items?.length || !customerEmail || !shippingMethod) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const country = shippingAddress?.country || "FR";

    /* ------------------ PANIER HT ------------------ */
    const cleanItems = items.map((i: any) => ({
      id: String(i.id),
      name: i.name,
      priceHT: Number(i.priceHT),
      quantity: Math.max(1, Number(i.quantity || 1)),
    }));

    const itemsHT = cleanItems.reduce(
      (s, i) => s + i.priceHT * i.quantity,
      0
    );

    const shippingHT = Number(shippingMethod.priceHT ?? shippingMethod.price ?? 0);

    /* ------------------ TVA ------------------ */
    const taxItems = disableVAT
      ? { ht: itemsHT, vatAmount: 0, vatRate: 0 }
      : computeTax({ priceHT: itemsHT, country });

    const taxShipping = disableVAT
      ? { ht: shippingHT, vatAmount: 0, vatRate: 0 }
      : computeTax({ priceHT: shippingHT, country });

    const totalHT = taxItems.ht + taxShipping.ht;
    const totalVAT = taxItems.vatAmount + taxShipping.vatAmount;
    const totalTTC = totalHT + totalVAT;

    /* ------------------ FIRESTORE (SOURCE DE VÉRITÉ) ------------------ */
    const orderRef = db.collection("orders").doc();

    await orderRef.set({
      id: orderRef.id,
      email: customerEmail,
      items: cleanItems,
      shippingMethod,
      shippingAddress,
      relayPoint: relayPoint || null,
      totals: {
        country,
        vatRate: taxItems.vatRate,
        totalHT,
        totalVAT,
        totalTTC,
        vatDisabled: disableVAT,
      },
      locale,
      status: "pending_payment",
      createdAt: Timestamp.now(),
    });

    /* ------------------ STRIPE ------------------ */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const i of cleanItems) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: i.name },
          unit_amount: Math.round(i.priceHT * 100),
        },
        quantity: i.quantity,
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
          product_data: { name: `TVA ${taxItems.vatRate}%` },
          unit_amount: Math.round(totalVAT * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      metadata: {
        order_id: orderRef.id,
      },

      // 🔥 CHANGEMENT CLÉ
      success_url: `${baseUrl}/${locale}/success?order_id=${orderRef.id}`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
