// src/app/api/get-order/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldPath } from "firebase-admin/firestore";

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

  // On tente plusieurs emplacements possibles (tu peux adapter selon ton schéma)
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
      // si le champ n'existe pas / index manquant / typo -> on tente le suivant
    }
  }

  // Fallback ultime: si tu stockes l'ID provider dans un champ "payment"
  // on essaye un scan léger via FieldPath si tu as un champ map (optionnel)
  // (on évite un vrai scan complet, donc pas de list() ici)
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const order_id = searchParams.get("order_id"); // peut être internal OU PayPal orderId selon ton flow actuel
    const session_id = searchParams.get("session_id"); // Stripe fallback

    if (!order_id && !session_id) {
      return NextResponse.json(
        { ok: false, error: "Missing order_id or session_id" },
        { status: 400 }
      );
    }

    // 1) Si on a un order_id -> on essaie d'abord comme ID interne Firestore
    if (order_id) {
      const byId = await getOrderDocById(order_id);
      if (byId) {
        const res = NextResponse.json({ ok: true, order: byId });
        res.headers.set("Cache-Control", "private, max-age=10");
        return res;
      }

      // 2) Sinon, on tente de le résoudre comme "provider ref" (ex: PayPal orderID)
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

    // 3) Fallback Stripe: session_id -> metadata.order_id (ID interne)
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
