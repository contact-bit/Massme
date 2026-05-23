import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

import { dbAdmin } from "@/lib/firebase.admin";
import {
  generateInvoicePDF,
  type Locale,
} from "@/lib/generateInvoice";

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

    const ref = dbAdmin.collection("orders").doc(orderId);
    let snap = await ref.get();
    let sourceRef = ref;

    if (!snap.exists) {
      sourceRef = dbAdmin.collection("pending_orders").doc(orderId);
      snap = await sourceRef.get();
    }

    if (!snap.exists) {
      return NextResponse.json(
        { ok: false, error: "order_not_found" },
        { status: 404 }
      );
    }

    const order = asRecord(snap.data());
    const email = getOrderEmail(order);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    const orderNumber = getOrderNumber(order, orderId);
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
      },
      orderNumber,
      {
        locale,
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
        },
      },
      { merge: true }
    );

    const res = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from,
      to: email,
      subject: `Votre facture - Commande ${orderNumber}`,
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
          filename: `facture-${orderNumber}.pdf`,
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
        resendId,
        lastError: null,
        resendCount: FieldValue.increment(1),
      },
    };

    await sourceRef.set(update, { merge: true });

    if (sourceRef.path !== ref.path) {
      await ref.set(update, { merge: true }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      resendId,
      email,
      orderNumber,
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
