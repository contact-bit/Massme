import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
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

    /* ================= UPDATE ORDER ================= */

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

    /* ================= FINALIZE (🔥 EMAILS ICI) ================= */

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
        const ssBody = {
          orderNumber: currentOrder?.orderNumber || id,
          orderDate: new Date().toISOString(),
          orderStatus: "awaiting_shipment",
          customerEmail: currentOrder?.email,
          items: currentOrder?.items || [],
        };

        const ssOrder = await createOrUpdateOrder(ssBody);

        await orderRef.set(
          {
            shipstation: {
              pushedAt: new Date(),
              response: ssOrder ?? null,
            },
          },
          { merge: true }
        );
      }

      shipstationPushed = true;
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

    /* ================= RESPONSE ================= */

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