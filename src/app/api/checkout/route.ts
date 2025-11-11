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
    } = body;

    // 🧠 Vérifications de base
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("🚫 ERREUR: items manquant ou vide");
      return NextResponse.json({ error: "Missing or empty items" }, { status: 400 });
    }

    if (!customerEmail) {
      console.error("🚫 ERREUR: customerEmail manquant");
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const currencyUsed = currency || "eur";

    // 💾 Enregistre la commande Firestore
    console.log("💾 Sauvegarde de la commande dans Firestore...");
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items,
      shippingMethod,
      shippingAddress,
      currency: currencyUsed,
      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    console.log(`✅ Commande créée dans Firestore : ${orderRef.id}`);

    // 💳 Prépare les produits pour Stripe
    const line_items = items.map((item: any, index: number) => {
      const price = Math.round((item.price?.eur || 0) * 100);
      const name = item.name?.fr || item.name?.en || `Produit ${index + 1}`;
      return {
        price_data: {
          currency: currencyUsed,
          product_data: { name },
          unit_amount: price,
        },
        quantity: item.quantity || 1,
      };
    });

    // 💰 Calcul du total attendu
    const total = line_items.reduce(
      (sum, i) => sum + (i.price_data.unit_amount || 0) * (i.quantity || 1),
      0
    );
    console.log("💶 Total calculé (centimes):", total);

    // 💳 Crée la session Stripe
    console.log("💳 Création de la session Stripe...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: shippingMethod
        ? [
            {
              shipping_rate_data: {
                display_name:
                  shippingMethod?.name?.fr ??
                  (currencyUsed === "eur" ? "Livraison standard" : "Shipping"),
                fixed_amount: {
                  amount: Math.round((shippingMethod?.price?.fr || 0) * 100),
                  currency: currencyUsed,
                },
                type: "fixed_amount",
              },
            },
          ]
        : undefined,
      metadata: {
        order_id: orderRef.id,
        email: customerEmail,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/fr/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/fr/checkout`,
    });

    if (!session?.url) {
      console.error("⚠️ Session Stripe invalide :", session);
      return NextResponse.json(
        { error: "Stripe session creation failed" },
        { status: 500 }
      );
    }

    console.log("✅ Session Stripe créée :", session.id);

    // ✅ Retourne le lien Stripe Checkout
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 ERREUR API /checkout :", err);

    // Si Stripe ou Firebase donne un message d'erreur clair, on le renvoie
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
