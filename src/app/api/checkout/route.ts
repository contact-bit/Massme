import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";

type CleanItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      currency,
      shippingMethod,
      customerEmail,
      shippingAddress,
      locale,
    } = body;

    if (!items?.length)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });

    if (!shippingMethod)
      return NextResponse.json(
        { error: "Missing shippingMethod" },
        { status: 400 }
      );

    if (!customerEmail)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const currencyUsed = currency || "eur";
    const localeUsed = locale || "fr";

    // ---------------------------------------------------
    // 1️⃣ NORMALISATION PRODUITS
    // ---------------------------------------------------
    const cleanItems: CleanItem[] = items.map((item: any) => {
      const name =
        item?.name?.fr ||
        item?.name?.en ||
        item?.name ||
        "Produit";

      const rawPrice =
        typeof item.price === "number"
          ? item.price
          : typeof item.price === "object"
          ? Number(item.price.eur)
          : 0;

      return {
        id: String(item.id),
        name,
        price: Number(rawPrice),
        quantity: Number(item.quantity || 1),
      };
    });

    // ---------------------------------------------------
    // 2️⃣ CALCULS PRIX
    // ---------------------------------------------------
    const subtotal = cleanItems.reduce(
      (acc: number, item: CleanItem) =>
        acc + item.price * item.quantity,
      0
    );

    const shippingPrice = Number(shippingMethod.price || 0);

    const total = subtotal + shippingPrice;

    // ---------------------------------------------------
    // 3️⃣ ENREGISTREMENT FIREBASE
    // ---------------------------------------------------
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items: cleanItems,
      shippingAddress,
      shippingMethod,

      subtotal,
      shippingPrice,
      total,

      currency: currencyUsed,
      locale: localeUsed,

      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    // ---------------------------------------------------
    // 4️⃣ STRIPE - préparation des line_items
    // ---------------------------------------------------
    const line_items = cleanItems.map((item: CleanItem) => ({
      price_data: {
        currency: currencyUsed,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const shippingOption: Stripe.Checkout.SessionCreateParams.ShippingOption = {
      shipping_rate_data: {
        display_name:
          typeof shippingMethod.name === "string"
            ? shippingMethod.name
            : shippingMethod.name?.fr ||
              shippingMethod.name?.en ||
              "Livraison",
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.round(shippingPrice * 100),
          currency: currencyUsed,
        },
      },
    };

    // ---------------------------------------------------
    // 5️⃣ CRÉATION SESSION CHECKOUT STRIPE
    // ---------------------------------------------------
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [shippingOption],
      payment_method_types: ["card"],
      metadata: {
        order_id: orderRef.id,
        email: customerEmail,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/${localeUsed}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${localeUsed}/checkout`,
    });

    if (!session?.url) throw new Error("Stripe session invalid");

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("💥 ERREUR API /checkout :", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
