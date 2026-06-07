import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function asRecord(
  value: unknown
): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function pickRecord(
  record: Record<string, unknown>,
  key: string
) {
  return asRecord(record[key]);
}

function getInvoiceNumber(
  order: Record<string, unknown>
) {
  const invoiceEmail =
    pickRecord(order, "invoiceEmail");

  const invoiceNumber =
    asString(order.invoiceNumber) ||
    asString(invoiceEmail.invoiceNumber);

  return /^FID\d{5,}$/.test(invoiceNumber)
    ? invoiceNumber
    : "";
}

async function findOrderSource(orderId: string) {
  for (const collection of [
    "orders",
    "pending_orders",
  ]) {
    const ref = dbAdmin
      .collection(collection)
      .doc(orderId);
    const snap = await ref.get();

    if (snap.exists) {
      return { ref, snap };
    }
  }

  for (const collection of [
    "orders",
    "pending_orders",
  ]) {
    for (const field of [
      "orderNumber",
      "invoiceNumber",
    ]) {
      const query = await dbAdmin
        .collection(collection)
        .where(field, "==", orderId)
        .limit(1)
        .get();

      if (!query.empty) {
        const snap = query.docs[0];

        return {
          ref: snap.ref,
          snap,
        };
      }
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = asString(
      url.searchParams.get("orderId")
    );

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "missing_orderId" },
        { status: 400 }
      );
    }

    const source = await findOrderSource(orderId);

    if (!source) {
      return NextResponse.json(
        { ok: false, error: "order_not_found" },
        { status: 404 }
      );
    }

    const order = asRecord(source.snap.data());
    const invoiceNumber =
      getInvoiceNumber(order) ||
      (await ensureInvoiceNumberForOrder(
        source.ref
      ));

    return NextResponse.json({
      ok: true,
      invoiceNumber,
    });
  } catch (e: unknown) {
    console.error("[admin/invoice-number] error:", e);

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
