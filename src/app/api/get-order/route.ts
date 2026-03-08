// src/app/api/get-order/route.ts
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeCreatedAt(data: any) {
  const createdAt =
    data?.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : data?.createdAt?._seconds
        ? new Date(data.createdAt._seconds * 1000).toISOString()
        : null;

  return createdAt;
}

async function getOrderDocById(orderId: string) {
  const ref = dbAdmin.collection("orders").doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: normalizeCreatedAt(data),
  };
}

async function findOrderByProviderRef(refValue: string) {
  const ordersCol = dbAdmin.collection("orders");

  const candidates: Array<{ field: string; value: string }> = [
    { field: "paypal.orderId", value: refValue },
    { field: "payment.paypalOrderId", value: refValue },
    { field: "payment.providerOrderId", value: refValue },
    { field: "payment.providerRef", value: refValue },
  ];

  for (const c of candidates) {
    try {
      const q = await ordersCol.where(c.field as any, "==", c.value).limit(1).get();
      if (!q.empty) {
        const snap = q.docs[0];
        const data = snap.data();
        return {
          id: snap.id,
          ...data,
          createdAt: normalizeCreatedAt(data),
        };
      }
    } catch {
      // on tente le champ suivant
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const stripe = getStripe();
    const { searchParams } = new URL(req.url);

    const order_id = searchParams.get("order_id");
    const session_id = searchParams.get("session_id");

    if (!order_id && !session_id) {
      return NextResponse.json(
        { ok: false, error: "Missing order_id or session_id" },
        { status: 400 }
      );
    }

    if (order_id) {
      const byId = await getOrderDocById(order_id);
      if (byId) {
        const res = NextResponse.json({ ok: true, order: byId });
        res.headers.set("Cache-Control", "private, max-age=10");
        return res;
      }

      const byRef = await findOrderByProviderRef(order_id);
      if (byRef) {
        const res = NextResponse.json({ ok: true, order: byRef });
        res.headers.set("Cache-Control", "private, max-age=10");
        return res;
      }

      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id!);
    const internalOrderId = session.metadata?.order_id || "";

    if (!internalOrderId) {
      return NextResponse.json(
        { ok: false, error: "Order not found in Stripe metadata" },
        { status: 404 }
      );
    }

    const byId = await getOrderDocById(internalOrderId);
    if (!byId) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const res = NextResponse.json({ ok: true, order: byId });
    res.headers.set("Cache-Control", "private, max-age=10");
    return res;
  } catch (err: any) {
    console.error("❌ /api/get-order error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}