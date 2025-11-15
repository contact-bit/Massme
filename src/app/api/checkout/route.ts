import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin as db } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🧾 [API /checkout] Body reçu :", JSON.stringify(body, null, 2));

    const {
      items,
      currency = "eur",
      shippingMethod,
      customerEmail,
      shippingAddress,
      locale = "fr",
    } = body;

    // ----------------------------------
    // 🧠 Vérifications
    // ----------------------------------
    if (!items?.length)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });

    if (!shippingMethod?.name || typeof shippingMethod.price !== "number")
      return NextResponse.json(
        { error: "Invalid or missing shippingMethod" },
        { status: 400 }
      );

    if (!customerEmail)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // ----------------------------------
    // 📦 Normalisation shippingMethod pour Firestore
    // ----------------------------------
    const normalizedShipping = {
      name: { fr: shippingMethod.name, en: shippingMethod.name },
      price: { fr: shippingMethod.price, en: shippingMethod.price },
    };

    console.log("🚚 Shipping enregistré Firestore :", normalizedShipping);

    // ----------------------------------
    // 💾 Sauvegarde de la commande
    // ----------------------------------
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items,
      shippingAddress,
      shippingMethod: normalizedShipping,
      currency,
      locale,
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    console.log(`✅ Commande Firestore créée : ${orderRef.id}`);

    // ----------------------------------
    // 🧮 Stripe line_items
    // ----------------------------------
    const line_items = items.map((item: any, index: number) => ({
      price_data: {
        currency,
        product_data: {
          name:
            item.name?.fr ||
            item.name?.en ||
            `Produit ${index + 1}`,
        },
        unit_amount: Math.round((item.price?.eur || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    // ----------------------------------
    // 💳 Session Stripe Checkout
    // ----------------------------------
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      payment_method_types: ["card"],
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: shippingMethod.name,
            fixed_amount: {
              amount: Math.round(shippingMethod.price * 100),
              currency,
            },
            type: "fixed_amount",
          },
        },
      ],
      metadata: {
        order_id: orderRef.id,
        email: customerEmail,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/checkout`,
    });

    if (!session?.url) {
      console.error("❌ Session Stripe invalide :", session);
      return NextResponse.json(
        { error: "Stripe session creation failed" },
        { status: 500 }
      );
    }

    console.log("💳 Session Stripe ok :", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 ERREUR /checkout :", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
