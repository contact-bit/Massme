import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { computePrice } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const dynamic = "force-dynamic";

function asNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Stripe session not found" }, { status: 404 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          payment_status: session.payment_status,
        },
        { status: 402 }
      );
    }

    const orderId =
      session.metadata?.orderDocId ||
      session.metadata?.orderId ||
      session.metadata?.order_id ||
      session.client_reference_id ||
      null;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const ordersRef = dbAdmin.collection("orders").doc(orderId);
    const orderSnap = await ordersRef.get();

    // 1) Cas normal: la commande a déjà été finalisée par le webhook
    if (orderSnap.exists) {
      const order = orderSnap.data() as any;
      const shipping = order.shippingMethod || {};

      const priceHT = asNumber(shipping.priceHT ?? shipping.price, 0);
      const vatRate = asNumber(shipping.vatRate, 0);
      const priceCalc = computePrice({ priceHT, vatRate });

      const shippingName =
        typeof shipping.name === "string"
          ? shipping.name
          : shipping.name?.fr || shipping.name?.en || "—";

      const items = Array.isArray(order.items)
        ? order.items.map((it: any) => ({
            ...it,
            price:
              typeof it.price === "number"
                ? it.price
                : it.priceHT ?? it.price?.eur ?? 0,
            priceHT: it.priceHT ?? it.price ?? 0,
          }))
        : [];

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          ...order,
          items,
          shippingAddress: {
            ...order.shippingAddress,
            name: order.shippingAddress?.name || "Client",
          },
          shippingMethod: {
            ...shipping,
            name: shippingName,
            price: priceCalc.ttc,
            priceHT,
            vatRate,
            priceTTC: priceCalc.ttc,
          },
          amount_total: order.amount_total ?? session.amount_total,
        },
        finalized: true,
        source: "orders",
      });
    }

    // 2) Fallback: le webhook n'a peut-être pas encore fini
    const pendingRef = dbAdmin.collection("pending_orders").doc(orderId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json(
        {
          error: "Order not found",
          finalized: false,
        },
        { status: 404 }
      );
    }

    const pending = pendingSnap.data() as any;
    const shipping = pending.shippingMethod || {};

    const priceHT = asNumber(shipping.priceHT ?? shipping.price, 0);
    const vatRate = asNumber(shipping.vatRate, 0);
    const priceCalc = computePrice({ priceHT, vatRate });

    const shippingName =
      typeof shipping.name === "string"
        ? shipping.name
        : shipping.name?.fr || shipping.name?.en || "—";

    const items = Array.isArray(pending.items)
      ? pending.items.map((it: any) => ({
          ...it,
          price:
            typeof it.price === "number"
              ? it.price
              : it.priceHT ?? it.price?.eur ?? 0,
          priceHT: it.priceHT ?? it.price ?? 0,
        }))
      : [];

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        ...pending,
        items,
        shippingAddress: {
          ...pending.shippingAddress,
          name: pending.shippingAddress?.name || "Client",
        },
        shippingMethod: {
          ...shipping,
          name: shippingName,
          price: priceCalc.ttc,
          priceHT,
          vatRate,
          priceTTC: priceCalc.ttc,
        },
        amount_total: session.amount_total,
      },
      finalized: false,
      source: "pending_orders",
      message: "Commande payée, finalisation en cours.",
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}