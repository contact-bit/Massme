import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import { getStripe } from "@/lib/stripe";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { assertAdmin } from "@/server/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

type FeeResult =
  | {
      detected: true;
      fee: number;
      feeCurrency: string;
      feeSource: string;
      balanceTransactionId: string | null;
    }
  | {
      detected: false;
      reason: string;
    };

async function findOrder(orderId: string) {
  for (const collection of ["orders", "pending_orders"]) {
    const ref = dbAdmin.collection(collection).doc(orderId);
    const snap = await ref.get();

    if (snap.exists) {
      return { ref, snap };
    }
  }

  return null;
}

function getProvider(order: Record<string, unknown>) {
  const payment = asRecord(order.payment);
  const paymentMethod = asRecord(order.paymentMethod);
  const invoiceEmail = asRecord(order.invoiceEmail);

  return (
    asString(payment.provider) ||
    asString(payment.finalizedProvider) ||
    asString(paymentMethod.provider) ||
    asString(invoiceEmail.provider) ||
    asString(order.paymentProvider)
  ).toLowerCase();
}

async function getStripeFee(
  order: Record<string, unknown>
): Promise<FeeResult> {
  const stripe = getStripe();
  const payment = asRecord(order.payment);

  let paymentIntentId =
    asString(payment.paymentIntentId) ||
    asString(order.paymentIntentId);

  const sessionId =
    asString(payment.checkoutSessionId) ||
    asString(order.stripeSessionId);

  if (!paymentIntentId && sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : "";
  }

  if (!paymentIntentId) {
    return {
      detected: false,
      reason: "stripe_payment_intent_missing",
    };
  }

  const fromBalanceTransaction = (
    balanceTransaction: Record<string, unknown>
  ): FeeResult | null => {
    const feeCents = Number(balanceTransaction.fee);

    if (!Number.isFinite(feeCents) || feeCents <= 0) {
      return null;
    }

    return {
      detected: true as const,
      fee: round2(feeCents / 100),
      feeCurrency:
        asString(balanceTransaction.currency).toUpperCase() || "EUR",
      feeSource: "stripe_balance_transaction",
      balanceTransactionId:
        asString(balanceTransaction.id) || null,
    };
  };

  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    {
      expand: ["latest_charge.balance_transaction"],
    }
  );

  const latestCharge = asRecord(paymentIntent.latest_charge);
  const balanceTransaction = asRecord(
    latestCharge.balance_transaction
  );

  const directFee = fromBalanceTransaction(balanceTransaction);

  if (directFee) {
    return directFee;
  }

  const charges = await stripe.charges.list({
    payment_intent: paymentIntentId,
    limit: 1,
    expand: ["data.balance_transaction"],
  });

  const charge = asRecord(charges.data[0]);

  return (
    fromBalanceTransaction(
      asRecord(charge.balance_transaction)
    ) || {
      detected: false,
      reason: "stripe_balance_transaction_fee_missing",
    }
  );
}

async function getPayPalFee(
  order: Record<string, unknown>
): Promise<FeeResult> {
  const payment = asRecord(order.payment);
  const captureId =
    asString(payment.captureId) ||
    asString(asRecord(order.debug).paypalCaptureId);

  if (!captureId) {
    return {
      detected: false,
      reason: "paypal_capture_id_missing",
    };
  }

  const client = getPayPalClient();
  const request = new paypal.payments.CapturesGetRequest(captureId);
  const capture = await client.execute(request);
  const result = asRecord(capture.result);
  const breakdown = asRecord(result.seller_receivable_breakdown);
  const fee = asRecord(breakdown.paypal_fee);
  const value = Number(fee.value);

  if (!Number.isFinite(value) || value <= 0) {
    return {
      detected: false,
      reason: "paypal_fee_missing",
    };
  }

  return {
    detected: true,
    fee: round2(value),
    feeCurrency: asString(fee.currency_code).toUpperCase() || "EUR",
    feeSource: "paypal_capture",
    balanceTransactionId: null,
  };
}

export async function POST(req: Request) {
  const auth = assertAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const orderId = asString(body?.orderId);

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "missing_orderId" },
        { status: 400 }
      );
    }

    const source = await findOrder(orderId);

    if (!source) {
      return NextResponse.json(
        { ok: false, error: "order_not_found" },
        { status: 404 }
      );
    }

    const order = asRecord(source.snap.data());
    const provider = getProvider(order);
    const fee: FeeResult =
      provider === "stripe"
        ? await getStripeFee(order)
        : provider === "paypal"
        ? await getPayPalFee(order)
        : {
            detected: false,
            reason: "payment_provider_not_supported",
          };

    if (fee.detected === false) {
      await source.ref.set(
        {
          "payment.feeSource": fee.reason,
          "payment.feeDetectedAt": new Date(),
        },
        { merge: true }
      );

      return NextResponse.json({
        ok: true,
        detected: false,
        provider,
        reason: fee.reason,
      });
    }

    const update = {
      "payment.fee": fee.fee,
      "payment.feeCurrency": fee.feeCurrency,
      "payment.feeSource": fee.feeSource,
      "payment.feeDetectedAt": new Date(),
      "payment.balanceTransactionId": fee.balanceTransactionId,
    };

    await source.ref.set(update, { merge: true });

    return NextResponse.json({
      ok: true,
      detected: true,
      provider,
      ...fee,
    });
  } catch (e: unknown) {
    console.error("[admin/detect-payment-fee] error:", e);

    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "server_error",
      },
      { status: 500 }
    );
  }
}
