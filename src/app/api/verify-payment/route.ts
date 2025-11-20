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

    /* ---------------------------------------------------
       1️⃣ Récupération session Stripe
    --------------------------------------------------- */
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Stripe session not found" },
        { status: 404 }
      );
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID missing from metadata",
      });
    }

    /* ---------------------------------------------------
       2️⃣ Récup Firestore
    --------------------------------------------------- */
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();

    if (!snap.exists) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
      });
    }

    const order = snap.data();
    if (!order) {
      return NextResponse.json({
        success: false,
        error: "Invalid order data",
      });
    }

    /* ---------------------------------------------------
       3️⃣ SHIPPING METHOD Normalisation (multi-langue)
    --------------------------------------------------- */
    const shipping = order.shippingMethod || {};

    // Nom normalisé
    const shippingName =
      typeof shipping.name === "string"
        ? shipping.name
        : shipping.name?.fr ||
          shipping.name?.en ||
          "—";

    // Prix normalisé
    const shippingPrice =
      typeof shipping.price === "number"
        ? shipping.price
        : shipping.price?.fr ||
          shipping.price?.en ||
          0;

    /* ---------------------------------------------------
       4️⃣ Marquer comme payé si Stripe confirme
    --------------------------------------------------- */
    if (session.payment_status === "paid") {
      await dbAdmin.collection("pending_orders").doc(orderId).update({
        status: "paid",
        paidAt: new Date(),
        stripeSessionId: session.id,
      });
    }

    /* ---------------------------------------------------
       5️⃣ Renvoi complet pour SuccessPage (🔥 très important)
       ➜ NE PAS ÉCRASER shippingMethod NI relayPoint
    --------------------------------------------------- */
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        ...order, // garde shippingMethod complet + relayPoint complet

        shippingMethod: {
          ...shipping,
          name: shippingName,
          price: shippingPrice,
        },

        amount_total: session.amount_total,
        amount_eur: (session.amount_total || 0) / 100,
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
