import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

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

function getResendId(value: unknown) {
  const result = asRecord(value);
  const data = asRecord(result.data);

  return (
    asString(data.id) ||
    asString(result.id) ||
    null
  );
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = asString(body?.orderId);

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

    const { ref: sourceRef, snap } = source;
    const order = asRecord(snap.data());

    if (isUnvalidatedBankTransfer(order)) {
      return NextResponse.json(
        {
          ok: false,
          error: "bank_transfer_not_validated",
          message: "La facture sera envoyée après validation du virement.",
        },
        { status: 409 }
      );
    }

    const email = getOrderEmail(order);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    const orderNumber = getOrderNumber(order, orderId);
    const invoiceNumber =
      getInvoiceNumber(order) ||
      (await ensureInvoiceNumberForOrder(
        sourceRef
      ));
    const rawLocale = asString(order.locale);
    const locale = isLocale(rawLocale)
      ? rawLocale
      : "fr";
    const from =
      process.env.RESEND_FROM ||
      "Vitrectomed Support <contact@hdconnects.com>";

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

    await sourceRef.set(
      {
        invoiceEmail: {
          status: "sending",
          lastAttemptAt: FieldValue.serverTimestamp(),
          email,
          orderNumber,
          invoiceNumber,
        },
      },
      { merge: true }
    );

    const res = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from,
      to: email,
      subject: `Votre facture ${invoiceNumber} - Commande ${orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;color:#111">
          <h2>Votre facture Vitrectomed</h2>
          <p>Bonjour,</p>
          <p>Vous trouverez votre facture pour la commande <strong>${orderNumber}</strong> en pièce jointe.</p>
          <p>Merci pour votre confiance.</p>
        </div>
      `,
      attachments: [
        {
          filename: `facture-${invoiceNumber}.pdf`,
          content: pdf.toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });

    const resendId = getResendId(res);

    const update = {
      invoiceEmail: {
        status: "sent",
        sentAt: new Date(),
        lastSentAt: new Date(),
        email,
        orderNumber,
        invoiceNumber,
        resendId,
        lastError: null,
        resendCount: FieldValue.increment(1),
      },
    };

    await sourceRef.set(update, { merge: true });

    return NextResponse.json({
      ok: true,
      resendId,
      email,
      orderNumber,
      invoiceNumber,
    });
  } catch (e: unknown) {
    console.error("[admin/send-invoice] error:", e);

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
