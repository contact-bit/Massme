import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // 🔍 Récup session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Stripe session not found" },
        { status: 404 }
      );
    }

    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID missing from Stripe metadata",
      });
    }

    // 📌 Récup commande Firestore
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = snap.data();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order data missing" },
        { status: 500 }
      );
    }

    // 🧩 SHIPPING METHOD — normalisation
    const shipping = order.shippingMethod ?? {};

    let shippingName = "—";
    let shippingPrice: number | null = null;

    // name
    if (typeof shipping.name === "string") {
      shippingName = shipping.name;
    } else if (shipping.name?.fr || shipping.name?.en) {
      shippingName = shipping.name.fr || shipping.name.en;
    }

    // price
    if (typeof shipping.price === "number") {
      shippingPrice = shipping.price;
    } else if (typeof shipping.price?.fr === "number") {
      shippingPrice = shipping.price.fr;
    } else if (typeof shipping.price?.en === "number") {
      shippingPrice = shipping.price.en;
    }

    // 🟢 Mise à jour Firestore si payé
    if (session.payment_status === "paid") {
      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });
    }

    // 🧮 TOTAL en € (Stripe renvoie en centimes)
    const stripeAmount = session.amount_total || 0;
    const amountEuro = stripeAmount / 100;

    // 🔥 Réponse pour SuccessPage
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        ...order,
        shippingMethod: {
          name: shippingName,
          price: shippingPrice,
        },
        amount_total: stripeAmount,
        amount_eur: amountEuro,
      },
    });

  } catch (err: any) {
    console.error("❌ verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
