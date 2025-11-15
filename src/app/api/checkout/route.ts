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
      currency,
      shippingMethod,
      customerEmail,
      shippingAddress,
      locale,
    } = body;

    // ----------------------------------
    // 🧠 Vérifications
    // ----------------------------------
    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });

    if (!shippingMethod)
      return NextResponse.json({ error: "Missing shippingMethod" }, { status: 400 });

    if (!customerEmail)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const currencyUsed = currency || "eur";

    // ----------------------------------
    // 📦 Correction shippingMethod pour Firestore
    // ----------------------------------
    const normalizedShipping = {
      name: {
        fr: shippingMethod.name, // tu n'as que 1 valeur, donc je l'applique aux deux langues
        en: shippingMethod.name,
      },
      price: {
        fr: shippingMethod.price,
        en: shippingMethod.price,
      },
    };

    console.log("🚚 Méthode envoyée à Firestore :", normalizedShipping);

    // ----------------------------------
    // 💾 Enregistrer la commande dans Firestore
    // ----------------------------------
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items,
      shippingAddress,
      shippingMethod: normalizedShipping,
      currency: currencyUsed,
      locale: locale || "fr",
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    console.log(`✅ Commande créée : ${orderRef.id}`);

    // ----------------------------------
    // 🧮 Préparer les produits pour Stripe
    // ----------------------------------
    const line_items = items.map((item: any, index: number) => ({
      price_data: {
        currency: currencyUsed,
        product_data: { name: item.name?.fr || item.name?.en || `Produit ${index + 1}` },
        unit_amount: Math.round((item.price?.eur || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    // ----------------------------------
    // 💳 Session Stripe Checkout
    // ----------------------------------
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: shippingMethod.name,
            fixed_amount: {
              amount: Math.round(shippingMethod.price * 100),
              currency: currencyUsed,
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
      return NextResponse.json({ error: "Stripe session creation failed" }, { status: 500 });
    }

    console.log("✅ Session Stripe créée :", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 ERREUR API /checkout :", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
