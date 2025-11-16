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

    // ---------------------------------------------------
    // 🔍 VALIDATION
    // ---------------------------------------------------
    if (!items?.length)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });

    if (!shippingMethod)
      return NextResponse.json({ error: "Missing shippingMethod" }, { status: 400 });

    if (!customerEmail)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const currencyUsed = currency || "eur";
    const localeUsed = locale || "fr";

// ---------------------------------------------------
// 🧹 NORMALISATION DES ARTICLES (Fix ULTIME)
// ---------------------------------------------------
const cleanItems = items.map((item: any) => {
  console.log("🟡 Item brut reçu :", item);

  // 🔥 NOM : supporte tous les formats possibles
  const name =
    item.name?.fr ||
    item.name?.en ||
    item.name ||
    "Produit";

  // 🔥 PRIX : supporte TOUS les formats possibles du frontend
  const price =
    Number(item.price) || // format CartContext
    Number(item.unit_price) || // format ancien checkout
    Number(item.unitPrice) ||
    Number(item.total) || // format Shopify-like
    0;

  // 🔥 QUANTITÉ
  const quantity = Number(item.quantity || 1);

  console.log("💶 Final normalisé :", { name, price, quantity });

  return {
    id: String(item.id),
    name,
    price,
    quantity,
  };
});

console.log("🧾 Items normalisés pour Firestore :", cleanItems);

    // ---------------------------------------------------
    // 💾 SHIPPING METHOD (Firestore Format)
    // ---------------------------------------------------
    const normalizedShipping = {
      name: { fr: shippingMethod.name, en: shippingMethod.name },
      price: { fr: shippingMethod.price, en: shippingMethod.price },
    };

    // ---------------------------------------------------
    // 💾 SAUVEGARDE COMMANDE
    // ---------------------------------------------------
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items: cleanItems,
      shippingAddress,
      shippingMethod: normalizedShipping,
      currency: currencyUsed,
      locale: localeUsed,
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    console.log(`✅ Commande créée : ${orderRef.id}`);

    // ---------------------------------------------------
    // 🧮 STRIPE line_items
    // ---------------------------------------------------
    const line_items = cleanItems.map((item: any) => ({
      price_data: {
        currency: currencyUsed,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // ---------------------------------------------------
    // 🚚 SHIPPING OPTION
    // ---------------------------------------------------
    const shippingOption = {
      shipping_rate_data: {
        display_name: shippingMethod.name,
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.round(shippingMethod.price * 100),
          currency: currencyUsed,
        },
      },
    };

    // ---------------------------------------------------
    // 💳 SESSION STRIPE
    // ---------------------------------------------------
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items,
      shipping_options: [shippingOption],
      metadata: { order_id: orderRef.id, email: customerEmail },
      success_url: `${process.env.NEXT_PUBLIC_URL}/${localeUsed}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${localeUsed}/checkout`,
    });

    if (!session?.url) {
      throw new Error("Stripe session invalid");
    }

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("💥 ERREUR API /checkout :", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
