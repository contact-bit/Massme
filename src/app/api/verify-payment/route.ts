import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { computePrice } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    /* ---------------------------------------------------
       1️⃣ Stripe session
    --------------------------------------------------- */
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Stripe session not found" }, { status: 404 });
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing from metadata" }, { status: 400 });
    }

    /* ---------------------------------------------------
       2️⃣ Firestore (lecture seule)
    --------------------------------------------------- */
    const snap = await dbAdmin.collection("pending_orders").doc(orderId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = snap.data();
    if (!order) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 500 });
    }

    /* ---------------------------------------------------
       3️⃣ SHIPPING — ADAPTER COMPATIBILITÉ 🔥
    --------------------------------------------------- */
    const shipping = order.shippingMethod || {};

    const shippingName =
      typeof shipping.name === "string"
        ? shipping.name
        : shipping.name?.fr || shipping.name?.en || "—";

    const priceHT = Number(shipping.priceHT ?? shipping.price ?? 0);
    const vatRate = Number(shipping.vatRate ?? 0);

    const priceCalc = computePrice({
      priceHT,
      vatRate,
    });

    /* ---------------------------------------------------
       4️⃣ ITEMS — ADAPTER COMPATIBILITÉ 🔥
    --------------------------------------------------- */
    const items = Array.isArray(order.items)
      ? order.items.map((it: any) => ({
          ...it,

          // 🔥 champs legacy attendus par success + emails
          price:
            typeof it.price === "number"
              ? it.price
              : it.priceHT ?? it.price?.eur ?? 0,

          // nouveaux champs propres
          priceHT: it.priceHT ?? it.price ?? 0,
        }))
      : [];

    /* ---------------------------------------------------
       5️⃣ RÉPONSE SUCCESS (FORME COMPATIBLE)
    --------------------------------------------------- */
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        ...order,

        items,

        shippingMethod: {
          ...shipping,

          // ✅ anciens champs (OBLIGATOIRES)
          name: shippingName,
          price: priceCalc.ttc,

          // ✅ nouveaux champs
          priceHT,
          vatRate,
          priceTTC: priceCalc.ttc,
        },

        amount_total: session.amount_total,
        amount_eur: (session.amount_total || 0) / 100,

        stripe: {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        },
      },
    });
  } catch (err: any) {
    console.error("❌ verify-payment error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
