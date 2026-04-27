import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { createOrUpdateOrder } from "@/server/shipstation/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ================= HELPERS ================= */

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickFirst<T>(...values: T[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function buildShipStationBody(orderData: any, orderId: string) {
  const orderNumber =
    asString(
      pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id),
      orderId
    ) || orderId;

  const orderDate = (() => {
    const d = pickFirst(
      orderData?.createdAt,
      orderData?.created_at,
      orderData?.created
    );
    if ((d as any)?.toDate) return (d as any).toDate().toISOString();
    if (typeof d === "string") return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  })();

  const customerEmail =
    normalizeEmail(orderData?.email) ||
    normalizeEmail(orderData?.customerEmail) ||
    normalizeEmail(orderData?.customer_email) ||
    undefined;

  const ship =
    pickFirst(
      orderData?.shippingAddress,
      orderData?.shippingCustomer,
      orderData?.shipping_address,
      orderData?.shipping?.address,
      orderData?.shipTo
    ) || {};

  const bill =
    pickFirst(
      orderData?.billingAddress,
      orderData?.billingCustomer,
      orderData?.billing_address,
      orderData?.billing?.address,
      orderData?.billTo
    ) || ship || {};

  const billTo = {
    name: `${bill?.firstName || ""} ${bill?.lastName || ""}`.trim() || "Customer",
    street1: bill?.address1 || bill?.street || "",
    city: bill?.city || "",
    postalCode: bill?.postalCode || "",
    country: bill?.country || "FR",
  };

  const shipTo = {
    name: `${ship?.firstName || ""} ${ship?.lastName || ""}`.trim() || "Customer",
    street1: ship?.address1 || ship?.street || "",
    city: ship?.city || "",
    postalCode: ship?.postalCode || "",
    country: ship?.country || "FR",
  };

  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode) {
    throw new Error("ShipTo incomplete");
  }

  const items = (orderData?.items || []).map((it: any) => ({
    name: it?.name || "Produit",
    quantity: Math.max(1, Number(it?.quantity || 1)),
    unitPrice: Number(it?.price || it?.priceTTC || 0),
  }));

  return {
    orderNumber,
    orderDate,
    orderStatus: "awaiting_shipment" as const,
    customerEmail,
    billTo,
    shipTo,
    items,
  };
}

/* ================= ROUTE ================= */

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const orderRef = dbAdmin.collection("orders").doc(id);
    const snap = await orderRef.get();

    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const order = snap.data() as any;

    const alreadyPaid =
      order?.paymentStatus === "paid" ||
      order?.payment?.status === "paid" ||
      order?.status === "paid";

    if (alreadyPaid) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const customerEmail =
      normalizeEmail(order?.email) ||
      normalizeEmail(order?.billingCustomer?.email) ||
      normalizeEmail(order?.shippingCustomer?.email) ||
      null;

    /* ================= UPDATE ================= */

    await orderRef.set(
      {
        status: "paid",
        paymentStatus: "paid",
        paidAt: new Date(),
        payment: {
          ...(order?.payment || {}),
          status: "paid",
          validatedAt: new Date(),
        },
        bankTransfer: {
          ...(order?.bankTransfer || {}),
          paymentConfirmedByAdmin: true,
          paymentConfirmedAt: new Date(),
        },
      },
      { merge: true }
    );

    /* ================= FINALIZE (EMAILS ICI) ================= */

    let finalizeResult = null;

    try {
      finalizeResult = await finalizePaidOrder({
        orderId: id,
        provider: "bank_transfer",
        email: customerEmail,
        locale: order?.locale || "fr",
        payment: { manuallyValidated: true },
      });
    } catch (e) {
      console.error("FINALIZE ERROR", e);
    }

    /* ================= SHIPSTATION ================= */

    let shipstationPushed = false;

    try {
      const current = (await orderRef.get()).data();

      if (!current?.shipstation?.pushedAt) {
        const body = buildShipStationBody(current, id);
        const res = await createOrUpdateOrder(body);

        await orderRef.set(
          {
            shipstation: {
              pushedAt: new Date(),
              response: res,
            },
          },
          { merge: true }
        );
      }

      shipstationPushed = true;
    } catch (e) {
      console.error("SHIPSTATION ERROR", e);
    }

    return NextResponse.json({
      ok: true,
      finalizeResult,
      shipstationPushed,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}