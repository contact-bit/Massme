import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🧾 Body reçu :", JSON.stringify(body, null, 2));

    const {
      items,
      currency,
      shippingMethod,
      customerEmail,
      shippingAddress,
    } = body;

    // ⚠️ Vérifications de base
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("🚫 ERREUR: items manquant ou vide");
      return NextResponse.json({ error: "Missing or empty items" }, { status: 400 });
    }

    if (!customerEmail) {
      console.error("🚫 ERREUR: customerEmail manquant");
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!db) {
      console.error("🔥 ERREUR: Firestore non initialisé !");
      return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });
    }

    const currencyUsed = currency || "eur";

    console.log("💾 Sauvegarde commande Firestore...");
    const orderRef = await addDoc(collection(db, "pending_orders"), {
      email: customerEmail,
      items,
      shippingMethod,
      shippingAddress,
      currency: currencyUsed,
      createdAt: serverTimestamp(),
      status: "pending_payment",
    });
    console.log("✅ Commande sauvegardée avec ID:", orderRef.id);

    const line_items = items.map((item: any, index: number) => ({
      price_data: {
        currency: currencyUsed,
        product_data: {
          name: item.name?.fr || item.name?.en || `Produit ${index + 1}`,
        },
        unit_amount: Math.round((item.price?.eur || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    console.log("💳 Création session Stripe...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name:
              shippingMethod?.name?.fr ??
              (currencyUsed === "eur" ? "Livraison" : "Shipping"),
            fixed_amount: {
              amount: Math.round((shippingMethod?.price?.fr || 0) * 100),
              currency: currencyUsed,
            },
            type: "fixed_amount",
          },
        },
      ],
      metadata: {
        order_id: orderRef.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/fr/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/fr/checkout`,
    });

    console.log("✅ Session Stripe créée avec URL:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Erreur checkout:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 400 });
  }
}
