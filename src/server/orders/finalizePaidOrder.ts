// src/server/orders/finalizePaidOrder.ts
import "server-only";
import { dbAdmin } from "@/lib/firebase.admin";
import { FieldValue } from "firebase-admin/firestore";
import { scheduleReviewEmailForOrder } from "@/server/reviewEmailScheduler";

type FinalizePaidOrderInput = {
  orderId: string;
  provider: "stripe" | "paypal" | "bank_transfer";
  email?: string | null;
  locale?: string | null;
  payment: Record<string, any>;
};

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function normalizeLocale(v: unknown): string {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return s || "fr";
}

function shouldSkipReviewScheduling(reviewStatus: unknown) {
  const status = String(reviewStatus || "").toLowerCase();
  return (
    status === "scheduled" ||
    status === "sent" ||
    status === "sending" ||
    status === "submitted"
  );
}

export async function finalizePaidOrder(input: FinalizePaidOrderInput) {
  const { orderId, provider, payment } = input;

  if (!orderId) {
    throw new Error("Missing orderId");
  }

  const ref = dbAdmin.collection("orders").doc(orderId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const order = snap.data() as any;

  const existingEmail =
    normalizeEmail(order?.email) ||
    normalizeEmail(order?.customerEmail) ||
    normalizeEmail(order?.customer_email);

  const email = normalizeEmail(input.email) || existingEmail || null;
  const locale = normalizeLocale(input.locale || order?.locale || "fr");

  const currentOrderStatus = String(order?.status || "").toLowerCase();
  const currentPaymentStatus = String(order?.payment?.status || "").toLowerCase();
  const currentReviewStatus = String(order?.reviewEmail?.status || "").toLowerCase();

  const alreadyPaid =
    currentOrderStatus === "paid" &&
    currentPaymentStatus === "paid";

  const orderNumber =
    typeof order?.orderNumber === "string" && order.orderNumber.trim().length > 0
      ? order.orderNumber.trim()
      : typeof order?.invoiceNumber === "string" && order.invoiceNumber.trim().length > 0
      ? order.invoiceNumber.trim()
      : null;

  console.log("FINALIZE DEBUG", {
    orderId,
    provider,
    orderNumber,
    invoiceNumber: order?.invoiceNumber ?? null,
    currentOrderStatus,
    currentPaymentStatus,
    currentReviewStatus,
  });

  await ref.set(
    {
      status: "paid",
      paidAt: order?.paidAt || FieldValue.serverTimestamp(),
      locale,
      ...(email ? { email } : {}),
      ...(orderNumber ? { orderNumber } : {}),
      payment: {
        ...(order?.payment || {}),
        ...payment,
        provider,
        status: "paid",
      },
      updatedAt: FieldValue.serverTimestamp(),
      "payment.finalizedAt": FieldValue.serverTimestamp(),
      "payment.finalizedProvider": provider,

      debug: {
        ...(order?.debug || {}),
        finalizePaidOrderAt: FieldValue.serverTimestamp(),
        finalizePaidOrderProvider: provider,
        finalizePaidOrderAlreadyPaid: alreadyPaid,
        finalizePaidOrderReviewStatusBefore: currentReviewStatus || null,
        finalizePaidOrderOrderNumber: orderNumber,
        finalizePaidOrderInvoiceNumber: order?.invoiceNumber ?? null,
      },
    },
    { merge: true }
  );

  let reviewResult: any = null;
  let reviewSkippedReason: string | null = null;

  if (shouldSkipReviewScheduling(currentReviewStatus)) {
    reviewSkippedReason = `already_${currentReviewStatus}`;
    reviewResult = {
      ok: true,
      skipped: true,
      reason: reviewSkippedReason,
    };
  } else {
    try {
      reviewResult = await scheduleReviewEmailForOrder(orderId);
    } catch (err: any) {
      const message = String(err?.message || err);

      await ref.set(
        {
          "reviewEmail.lastError": message,
          "reviewEmail.lastErrorAt": FieldValue.serverTimestamp(),
          "reviewEmail.updatedAt": FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      reviewResult = {
        ok: false,
        error: message,
      };
    }
  }

  await ref.set(
    {
      "debug.finalizePaidOrderReviewSkippedReason": reviewSkippedReason,
    },
    { merge: true }
  );

  return {
    ok: true,
    alreadyPaid,
    orderId,
    orderNumber,
    email,
    locale,
    provider,
    reviewResult,
  };
}