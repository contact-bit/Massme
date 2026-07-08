import { NextResponse } from "next/server";

import { dbAdmin } from "@/lib/firebase.admin";
import {
  generateInvoicePDF,
  type Locale,
} from "@/lib/generateInvoice";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
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

function getOrderNumber(
  order: Record<string, unknown>,
  orderId: string
) {
  const invoiceEmail =
    pickRecord(order, "invoiceEmail");

  return (
    asString(order.orderNumber) ||
    asString(order.invoiceNumber) ||
    asString(invoiceEmail.orderNumber) ||
    orderId
  );
}

function getOrderEmail(
  order: Record<string, unknown>
) {
  const shippingAddress =
    pickRecord(order, "shippingAddress");

  const billingAddress =
    pickRecord(order, "billingAddress");

  return (
    asString(order.email) ||
    asString(order.customerEmail) ||
    asString(order.customer_email) ||
    asString(shippingAddress.email) ||
    asString(billingAddress.email)
  ).toLowerCase();
}

function isUnvalidatedBankTransfer(
  order: Record<string, unknown>
) {
  const payment = pickRecord(order, "payment");
  const provider = (
    asString(payment.provider) ||
    asString(order.paymentProvider) ||
    asString(order.provider)
  ).toLowerCase();
  const status = (
    asString(payment.status) ||
    asString(order.paymentStatus) ||
    asString(order.status)
  ).toLowerCase();

  return (
    provider === "bank_transfer" &&
    status !== "paid" &&
    status !== "validated"
  );
}

function isLocale(value: string): value is Locale {
  return ["fr", "en", "es", "de", "it", "nl"].includes(value);
}

function contentDisposition(
  mode: string,
  filename: string
) {
  const type =
    mode === "download"
      ? "attachment"
      : "inline";

  return `${type}; filename="${filename}"`;
}

async function findOrderSource(orderId: string) {
  for (const collection of ["orders", "pending_orders"]) {
    const ref = dbAdmin.collection(collection).doc(orderId);
    const snap = await ref.get();

    if (snap.exists) {
      return { ref, snap };
    }
  }

  for (const collection of ["orders", "pending_orders"]) {
    for (const field of ["orderNumber", "invoiceNumber"]) {
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

    if (isUnvalidatedBankTransfer(order)) {
      return NextResponse.json(
        {
          ok: false,
          error: "bank_transfer_not_validated",
          message: "La facture sera créée après validation du virement.",
        },
        { status: 409 }
      );
    }

    const orderNumber = getOrderNumber(order, orderId);
    const invoiceNumber =
      await ensureInvoiceNumberForOrder(source.ref);
    const email = getOrderEmail(order);
    const rawLocale = asString(order.locale);
    const locale = isLocale(rawLocale)
      ? rawLocale
      : "fr";

    const pdf = await generateInvoicePDF(
      {
        ...order,
        email,
        orderNumber,
        invoiceNumber,
      },
      orderNumber,
      {
        locale,
        invoiceNumber,
        paidLabel: true,
      }
    );

    const filename = `facture-${invoiceNumber}.pdf`;
    const body = new Uint8Array(pdf);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": contentDisposition(
          asString(url.searchParams.get("mode")),
          filename
        ),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    console.error("[admin/invoice] error:", e);

    const message =
      e instanceof Error
        ? e.message
        : "server_error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
