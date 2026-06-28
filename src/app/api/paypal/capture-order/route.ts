// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { dbAdmin } from "@/lib/firebase.admin";
import { sendOrderEmails } from "@/lib/mailer"; // ⬅️ sendReviewEmail supprimé ici
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { generateOrderNumber } from "@/server/orders/generateOrderNumber";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCents(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100);
}

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function getPayPalCaptureFee(captureObj: any) {
  const fee =
    captureObj?.seller_receivable_breakdown?.paypal_fee;

  const value = Number(fee?.value);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    fee: Math.round(value * 100) / 100,
    feeCurrency:
      typeof fee?.currency_code === "string"
        ? fee.currency_code.toUpperCase()
        : "EUR",
    feeSource: "paypal_capture",
  };
}

export async function POST(req: Request) {
  const reqId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const orderId = body?.orderId;
    const fallbackOrderDocId = body?.orderDocId || body?.customId || null;

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "orderId manquant" }, { status: 400 });
    }

    const client = getPayPalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    const capture = await client.execute(captureRequest);

    const purchaseUnit = capture?.result?.purchase_units?.[0];
    const captureObj = purchaseUnit?.payments?.captures?.[0];

    const captureId = captureObj?.id;
    const captureStatus = captureObj?.status;
    const capturedValue = captureObj?.amount?.value;
    const capturedCurrency = captureObj?.amount?.currency_code;
    const paypalFee = getPayPalCaptureFee(captureObj);

    const customId = purchaseUnit?.custom_id || null;
    const orderDocId = customId || fallbackOrderDocId;

    if (!captureId) {
      return NextResponse.json({ ok: false, error: "captureId manquant" }, { status: 500 });
    }

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json(
        {
          ok: false,
          error: `Capture non complétée (status=${captureStatus})`,
          captureId,
          captureStatus,
        },
        { status: 400 }
      );
    }

    if (!orderDocId) {
      return NextResponse.json({
        ok: true,
        reqId,
        orderId,
        captureId,
        captureStatus,
        capturedValue: capturedValue ?? null,
        capturedCurrency: capturedCurrency ?? null,
        orderDocId: null,
        emailSent: false,
        warning: "orderDocId introuvable, commande non mise à jour et email non envoyé",
      });
    }

    const orderRef = dbAdmin.collection("orders").doc(orderDocId);

    const snapBefore = await orderRef.get();
    const existing = snapBefore.exists ? (snapBefore.data() as any) : null;

    const existingEmail =
      normalizeEmail(existing?.email) ||
      normalizeEmail(existing?.customerEmail) ||
      normalizeEmail(existing?.customer_email);

    const alreadySent = Boolean(existing?.emails?.sent);

    await orderRef.set(
      {
        "debug.paypalCaptureHitAt": new Date(),
        "debug.paypalCaptureOrderId": orderId,
        "debug.paypalCaptureId": captureId,
        "debug.paypalCaptureStatus": captureStatus,
      },
      { merge: true }
    );

    try {
      const finalizeResult = await finalizePaidOrder({
        orderId: orderDocId,
        provider: "paypal",
        email: existingEmail,
        locale: existing?.locale || "fr",
        payment: {
          providerOrderId: orderId,
          captureId,
          capturedAmount: {
            value: capturedValue ?? null,
            currency: capturedCurrency ?? null,
          },
          ...(paypalFee
            ? {
                fee: paypalFee.fee,
                feeCurrency: paypalFee.feeCurrency,
                feeSource: paypalFee.feeSource,
                feeDetectedAt: new Date(),
              }
            : {
                feeSource: "paypal_capture_not_detected",
                feeDetectedAt: new Date(),
              }),
        },
      });

      await orderRef.set(
        {
          "debug.paypalFinalizeAt": new Date(),
          "debug.paypalFinalizeResult": finalizeResult ?? null,
        },
        { merge: true }
      );
    } catch (err: any) {
      await orderRef.set(
        {
          "debug.paypalFinalizeErrorAt": new Date(),
          "debug.paypalFinalizeError": String(err?.message || err),
        },
        { merge: true }
      );
    }

    let snapAfter = await orderRef.get();
    let orderData = snapAfter.exists ? (snapAfter.data() as any) : null;

    let orderNumber = orderData?.orderNumber;
    if (!orderNumber) {
      orderNumber = await generateOrderNumber();
      await orderRef.set({ orderNumber }, { merge: true });
      snapAfter = await orderRef.get();
      orderData = snapAfter.exists ? (snapAfter.data() as any) : null;
    }

    let emailSent = false;

    const clientEmail = normalizeEmail(orderData?.email) || existingEmail;

    if (clientEmail && orderData) {
      const invoiceNumber =
        await ensureInvoiceNumberForOrder(
          orderRef
        );
      const totalTTC = Number(orderData?.totals?.totalTTC ?? 0);
      const amountTotalCents = totalTTC > 0 ? toCents(totalTTC) : toCents(capturedValue);

      const emailOrderPayload = {
        id: orderData.id || orderDocId,
        amount_total: amountTotalCents,
        currency: (orderData?.currency || "EUR").toLowerCase(),
        customer_email: clientEmail,
        payment_status: "paid",
        created_at: orderData.createdAt || orderData.created_at || new Date(),
        provider: "paypal" as const,
        orderData: {
          ...orderData,
          invoiceNumber,
        },
        locale: orderData?.locale || "fr",
        orderNumber,
        invoiceNumber,
      };

      if (!alreadySent) {
        try {
          const mailResult = await sendOrderEmails({
            order: emailOrderPayload,
            clientEmail,
          });

          emailSent = true;

          await orderRef.set(
            {
              emails: {
                sent: true,
                sentAt: new Date(),
                provider: "paypal",
                client: mailResult?.client ?? null,
                admin: mailResult?.admin ?? null,
                logistics: mailResult?.logistics ?? [],
              },
              invoiceEmail: {
                status: "sent",
                sentAt: new Date(),
                provider: "paypal",
                orderNumber: mailResult?.orderNumber ?? orderNumber,
                invoiceNumber:
                  mailResult?.invoiceNumber ??
                  invoiceNumber,
              },
            },
            { merge: true }
          );
        } catch (mailErr: any) {
          await orderRef.set(
            {
              emails: {
                sent: false,
                lastErrorAt: new Date(),
                lastError: String(mailErr?.message || mailErr),
                provider: "paypal",
              },
              invoiceEmail: {
                status: "error",
                lastErrorAt: new Date(),
                lastError: String(mailErr?.message || mailErr),
                provider: "paypal",
              },
            },
            { merge: true }
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      reqId,
      orderId,
      captureId,
      captureStatus,
      capturedValue: capturedValue ?? null,
      capturedCurrency: capturedCurrency ?? null,
      orderDocId,
      emailSent,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Capture failed" },
      { status: 500 }
    );
  }
}
