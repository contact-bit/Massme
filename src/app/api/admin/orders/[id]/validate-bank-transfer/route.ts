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

/* ================= SHIPSTATION ================= */

function buildShipStationBody(orderData: any, orderId: string) {
  const orderNumber =
    asString(
      pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id),
      orderId
    ) || orderId;

  const orderDate = new Date().toISOString();

  const customerEmail =
    normalizeEmail(orderData?.email) ||
    normalizeEmail(orderData?.customerEmail) ||
    normalizeEmail(orderData?.customer_email) ||
    undefined;

  const items = Array.isArray(orderData?.items)
    ? orderData.items.map((it: any) => ({
        name: it?.name || "Produit",
        quantity: Math.max(1, Number(it?.quantity || 1)),
        unitPrice: Number(it?.price || it?.priceTTC || 0),
      }))
    : [];

  if (!items.length) {
    throw new Error("ShipStation payload has no items");
  }

  return {
    orderNumber,
    orderDate,
    orderStatus: "awaiting_shipment",
    customerEmail,
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

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const orderRef = dbAdmin.collection("orders").doc(id);
    const snap = await orderRef.get();

    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const order = snap.data() as any;

    /* ================= ALREADY PAID ================= */

    const alreadyPaid =
      order?.paymentStatus === "paid" ||
      order?.payment?.status === "paid" ||
      order?.status === "paid";

    if (alreadyPaid) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: id,
      });
    }

    /* ================= EMAIL ================= */

    const customerEmail =
      normalizeEmail(order?.email) ||
      normalizeEmail(order?.customerEmail) ||
      normalizeEmail(order?.customer_email) ||
      normalizeEmail(order?.billingCustomer?.email) ||
      normalizeEmail(order?.shippingCustomer?.email) ||
      null;

    /* ================= UPDATE ================= */

    await orderRef.set(
      {
        updatedAt: new Date(),
        status: "paid",
        paidAt: new Date(),
        paymentStatus: "paid",
        payment: {
          ...(order?.payment || {}),
          provider: "bank_transfer",
          status: "paid",
          validationMode: "manual",
          validatedAt: new Date(),
          validatedBy: "admin",
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

    let finalizeResult: any = null;

    try {
      console.log("🔥 FINALIZE BANK TRANSFER", id);

      finalizeResult = await finalizePaidOrder({
        orderId: id,
        provider: "bank_transfer",
        email: customerEmail,
        locale: order?.locale || "fr",
        payment: {
          manuallyValidated: true,
        },
      });

      await orderRef.set(
        {
          "debug.bankTransferFinalizeAt": new Date(),
          "debug.bankTransferFinalizeResult": finalizeResult ?? null,
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error("❌ FINALIZE ERROR", err);

      await orderRef.set(
        {
          "debug.bankTransferFinalizeErrorAt": new Date(),
          "debug.bankTransferFinalizeError": String(err?.message || err),
        },
        { merge: true }
      );
    }

    /* ================= SHIPSTATION ================= */

    let shipstationPushed = false;
    let shipstationError: string | null = null;

    try {
      const currentSnap = await orderRef.get();
      const currentOrder = currentSnap.data() as any;

      if (!currentOrder?.shipstation?.pushedAt) {
        const ssBody = buildShipStationBody(currentOrder, id);
        const ssOrder = await createOrUpdateOrder(ssBody);

        await orderRef.set(
          {
            shipstation: {
              pushedAt: new Date(),
              orderNumber: ssBody.orderNumber,
              response: ssOrder ?? null,
            },
          },
          { merge: true }
        );

        shipstationPushed = true;
      } else {
        shipstationPushed = true;
      }
    } catch (err: any) {
      shipstationError = String(err?.message || err);

      await orderRef.set(
        {
          shipstation: {
            pushedAt: null,
            lastErrorAt: new Date(),
            lastError: shipstationError,
          },
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: id,
      shipstationPushed,
      shipstationError,
      finalizeResult,
    });

  } catch (err: any) {
    console.error("[validate-bank-transfer] error:", err);

    return NextResponse.json(
      { ok: false, error: err?.message || "Validation failed" },
      { status: 500 }
    );
  }
}