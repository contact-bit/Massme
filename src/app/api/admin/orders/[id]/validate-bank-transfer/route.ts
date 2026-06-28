import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown): string | null {
  const email = typeof value === "string"
    ? value.trim().toLowerCase()
    : "";

  return email.includes("@") ? email : null;
}

function getProvider(order: Record<string, any>) {
  return String(
    order?.payment?.provider ||
      order?.paymentProvider ||
      order?.provider ||
      ""
  ).toLowerCase();
}

function isPaid(order: Record<string, any>) {
  return [
    order?.status,
    order?.paymentStatus,
    order?.payment?.status,
  ].some((value) =>
    ["paid", "validated"].includes(
      String(value || "").toLowerCase()
    )
  );
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin(req);
  if (auth) return auth;

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Identifiant de commande manquant." },
      { status: 400 }
    );
  }

  const orderRef = dbAdmin.collection("orders").doc(id);

  try {
    const claim = await dbAdmin.runTransaction(async (transaction) => {
      const snap = await transaction.get(orderRef);

      if (!snap.exists) {
        return { state: "missing" as const, order: null };
      }

      const order = snap.data() as Record<string, any>;
      const provider = getProvider(order);

      if (
        provider !== "bank_transfer" &&
        String(order.status || "").toLowerCase() !==
          "awaiting_bank_transfer"
      ) {
        return { state: "wrong_provider" as const, order };
      }

      if (isPaid(order)) {
        return { state: "already_paid" as const, order };
      }

      if (order?.payment?.validationInProgress === true) {
        return { state: "busy" as const, order };
      }

      transaction.update(orderRef, {
        "payment.validationInProgress": true,
        "payment.validationStartedAt": new Date(),
        updatedAt: new Date(),
      });

      return { state: "claimed" as const, order };
    });

    if (claim.state === "missing") {
      return NextResponse.json(
        { ok: false, error: "Commande introuvable." },
        { status: 404 }
      );
    }

    if (claim.state === "wrong_provider") {
      return NextResponse.json(
        {
          ok: false,
          error: "Cette action est réservée aux virements bancaires.",
        },
        { status: 409 }
      );
    }

    if (claim.state === "already_paid") {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: id,
      });
    }

    if (claim.state === "busy") {
      return NextResponse.json(
        {
          ok: false,
          error: "La validation de ce virement est déjà en cours.",
        },
        { status: 409 }
      );
    }

    const order = claim.order;
    const customerEmail =
      normalizeEmail(order?.email) ||
      normalizeEmail(order?.customerEmail) ||
      normalizeEmail(order?.customer_email) ||
      normalizeEmail(order?.billingCustomer?.email) ||
      normalizeEmail(order?.shippingCustomer?.email);

    const finalizeResult = await finalizePaidOrder({
      orderId: id,
      provider: "bank_transfer",
      email: customerEmail,
      locale: order?.locale || "fr",
      payment: {
        providerOrderId:
          order?.reference || order?.orderNumber || id,
        providerRef:
          order?.reference || order?.orderNumber || id,
        validationMode: "manual",
        manuallyValidated: true,
        validatedBy: "admin",
      },
    });

    const confirmedAt = new Date();

    await orderRef.update({
      paymentStatus: "paid",
      paymentProvider: "bank_transfer",
      provider: "bank_transfer",
      "payment.validationInProgress": false,
      "payment.validatedAt": confirmedAt,
      "payment.validatedBy": "admin",
      "bankTransfer.paymentConfirmedByAdmin": true,
      "bankTransfer.paymentConfirmedAt": confirmedAt,
      shippingStatus: "preparing",
      "fulfillment.status": "preparing",
      logisticsAvailableAt: confirmedAt,
      updatedAt: confirmedAt,
    });

    return NextResponse.json({
      ok: true,
      orderId: id,
      invoiceSent: Boolean(finalizeResult?.emailResult),
      logisticsStarted: true,
      finalizeResult,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Échec de la validation du virement.";

    await orderRef
      .update({
        "payment.validationInProgress": false,
        "payment.validationError": message,
        "payment.validationErrorAt": new Date(),
        updatedAt: new Date(),
      })
      .catch(() => undefined);

    console.error("[validate-bank-transfer] error:", error);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
