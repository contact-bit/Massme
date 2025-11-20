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

type ShippingMethod = {
  id: string;
  name: any; // string ou { fr, en }
  delay: any;
  price: any;
  type: "home" | "relay";
  relayProvider?: "mondialrelay" | "pickup";
};

type RelayPoint = {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country?: string;
};

/* ----------------------------------------------
   POST /api/checkout
---------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      currency = "eur",
      locale = "fr",
      shippingMethod,
      customerEmail,
      shippingAddress,
      relayPoint,
    } = body as {
      items: any[];
      currency: string;
      locale: "fr" | "en";
      shippingMethod: ShippingMethod;
      customerEmail: string;
      shippingAddress: any;
      relayPoint?: RelayPoint | null;
    };

    /* ----------------------------------------------
       1️⃣ VALIDATIONS
    ---------------------------------------------- */
    if (!items?.length) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Missing shippingMethod" },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const isRelay = shippingMethod.type === "relay";

    if (isRelay && !relayPoint) {
      return NextResponse.json(
        { error: "Relay point missing for relay shipping method" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------
       2️⃣ NORMALISATION DES ITEMS
    ---------------------------------------------- */
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

    /* ----------------------------------------------
       3️⃣ CALCUL DES TOTAUX
    ---------------------------------------------- */
    const subtotal = cleanItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // shippingMethod.price peut être number ou { fr, en }
    let shippingPrice = 0;
    if (typeof shippingMethod.price === "number") {
      shippingPrice = shippingMethod.price;
    } else if (shippingMethod.price?.[locale]) {
      shippingPrice = Number(shippingMethod.price[locale]);
    } else if (shippingMethod.price?.fr || shippingMethod.price?.en) {
      shippingPrice = Number(
        shippingMethod.price.fr || shippingMethod.price.en
      );
    }

    if (Number.isNaN(shippingPrice)) shippingPrice = 0;

    const total = subtotal + shippingPrice;

    /* ----------------------------------------------
       4️⃣ SAUVEGARDE Firestore (pending_orders)
       (source de vérité pour SuccessPage)
    ---------------------------------------------- */
    const orderRef = await db.collection("pending_orders").add({
      email: customerEmail,
      items: cleanItems,

      shippingMethod, // on garde type + relayProvider
      shippingAddress,
      relayPoint: relayPoint || null,

      subtotal,
      shippingPrice,
      total,
      currency,
      locale,

      createdAt: Timestamp.now(),
      status: "pending_payment",
    });

    /* ----------------------------------------------
       5️⃣ LINE ITEMS STRIPE
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
       6️⃣ SHIPPING OPTION STRIPE
    ---------------------------------------------- */
    let shippingDisplayName: string;

    if (typeof shippingMethod.name === "string") {
      shippingDisplayName = shippingMethod.name;
    } else if (shippingMethod.name?.[locale]) {
      shippingDisplayName = shippingMethod.name[locale];
    } else {
      shippingDisplayName =
        shippingMethod.name?.fr ||
        shippingMethod.name?.en ||
        "Livraison";
    }

    const shippingOption: Stripe.Checkout.SessionCreateParams.ShippingOption = {
      shipping_rate_data: {
        display_name: shippingDisplayName,
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.round(shippingPrice * 100),
          currency,
        },
      },
    };

    /* ----------------------------------------------
       7️⃣ SESSION STRIPE
    ---------------------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items,
      shipping_options: [shippingOption],
      payment_method_types: ["card"],

      // 🔎 Métadonnées utiles (relay inclus)
      metadata: {
        order_id: orderRef.id,
        isRelay: isRelay ? "true" : "false",
        relayProvider: shippingMethod.relayProvider || "",
        relayPoint: relayPoint ? JSON.stringify(relayPoint) : "",
        relay_name: relayPoint?.name || "",
        relay_address: relayPoint?.address || "",
        relay_postalCode: relayPoint?.postalCode || "",
        relay_city: relayPoint?.city || "",
        relay_country: relayPoint?.country || "",
      },

      success_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${locale}/checkout`,
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
