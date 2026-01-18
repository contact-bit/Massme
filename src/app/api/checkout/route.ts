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
      shippingAddress,
      shippingMethod,
      relayPoint,
      disableVAT = false,
    } = body;

    /* ------------------ VALIDATION ------------------ */
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Missing shipping method" },
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
      (sum: number, item: CartItem) =>
        sum + item.priceHT * item.quantity,
      0
    );

    const shippingHT = Number(
      shippingMethod.priceHT ?? shippingMethod.price ?? 0
    );

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

      shippingAddress,
      shippingMethod,
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

    /* ------------------ STRIPE LINE ITEMS ------------------ */
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

    /* ------------------ STRIPE SESSION ------------------ */
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_URL missing");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      metadata: {
        order_id: orderRef.id,
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
