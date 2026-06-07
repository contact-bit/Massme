// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { dbAdmin } from "@/lib/firebase.admin";
import { sendOrderEmails } from "@/lib/mailer"; // ⬅️ sendReviewEmail supprimé ici
import { createOrUpdateOrder } from "@/server/shipstation/client";
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

function buildShipStationBody(orderData: any, orderDocId: string) {
  const orderNumber =
    asString(pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id), orderDocId) ||
    orderDocId;

  const orderDate = (() => {
    const d = pickFirst(orderData?.createdAt, orderData?.created_at, orderData?.created);
    if (d?.toDate) return d.toDate().toISOString();
    if (typeof d === "string") return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  })();

  const customerEmail = isNonEmptyString(orderData?.email)
    ? orderData.email
    : isNonEmptyString(orderData?.customer_email)
    ? orderData.customer_email
    : undefined;

  const totalTTC = Number(
    orderData?.totals?.totalTTC ?? orderData?.total ?? orderData?.amount_total ?? 0
  );

  const ship =
    pickFirst(
      orderData?.shippingAddress,
      orderData?.shipping_address,
      orderData?.shipping?.address,
      orderData?.shipTo
    ) || {};

  const bill =
    pickFirst(
      orderData?.billingAddress,
      orderData?.billing_address,
      orderData?.billing?.address,
      orderData?.billTo
    ) || ship || {};

  const billTo = {
    name:
      asString(
        pickFirst(
          bill?.name,
          bill?.fullName,
          bill?.full_name,
          bill?.contactName,
          bill?.contact_name,
          bill?.firstName && bill?.lastName ? `${bill.firstName} ${bill.lastName}` : undefined
        ),
        ""
      ).trim() || "Customer",
    street1: asString(
      pickFirst(
        bill?.street1,
        bill?.address1,
        bill?.line1,
        bill?.addressLine1,
        bill?.address_line_1,
        bill?.address,
        bill?.street,
        bill?.streetAddress,
        bill?.street_address
      ),
      ""
    ).trim(),
    street2:
      asString(
        pickFirst(
          bill?.street2,
          bill?.address2,
          bill?.line2,
          bill?.addressLine2,
          bill?.address_line_2,
          bill?.complement,
          bill?.addressComplement
        ),
        ""
      ).trim() || undefined,
    city: asString(pickFirst(bill?.city, bill?.town, bill?.locality), "").trim(),
    state: asString(pickFirst(bill?.state, bill?.province, bill?.region), "").trim() || undefined,
    postalCode: asString(
      pickFirst(bill?.postalCode, bill?.zip, bill?.postcode, bill?.zipCode, bill?.zip_code),
      ""
    ).trim(),
    country: asString(pickFirst(bill?.country, bill?.countryCode, bill?.country_code), "FR").trim(),
    phone:
      asString(pickFirst(bill?.phone, bill?.phoneNumber, bill?.mobile), "").trim() || undefined,
  };

  const shipTo = {
    name:
      asString(
        pickFirst(
          ship?.name,
          ship?.fullName,
          ship?.full_name,
          ship?.contactName,
          ship?.contact_name,
          ship?.firstName && ship?.lastName ? `${ship.firstName} ${ship.lastName}` : undefined
        ),
        ""
      ).trim() || billTo.name || "Customer",
    street1:
      asString(
        pickFirst(
          ship?.street1,
          ship?.address1,
          ship?.line1,
          ship?.addressLine1,
          ship?.address_line_1,
          ship?.address,
          ship?.street,
          ship?.streetAddress,
          ship?.street_address
        ),
        ""
      ).trim() || billTo.street1,
    street2:
      asString(
        pickFirst(
          ship?.street2,
          ship?.address2,
          ship?.line2,
          ship?.addressLine2,
          ship?.address_line_2,
          ship?.complement,
          ship?.addressComplement
        ),
        ""
      ).trim() || undefined,
    city: asString(pickFirst(ship?.city, ship?.town, ship?.locality), "").trim() || billTo.city,
    state: asString(pickFirst(ship?.state, ship?.province, ship?.region), "").trim() || undefined,
    postalCode:
      asString(
        pickFirst(ship?.postalCode, ship?.zip, ship?.postcode, ship?.zipCode, ship?.zip_code),
        ""
      ).trim() || billTo.postalCode,
    country: asString(
      pickFirst(ship?.country, ship?.countryCode, ship?.country_code),
      billTo.country || "FR"
    ).trim(),
    phone:
      asString(pickFirst(ship?.phone, ship?.phoneNumber, ship?.mobile), "").trim() || billTo.phone,
  };

  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode || !shipTo.country) {
    throw new Error(
      `ShipTo incomplete: street1=${!!shipTo.street1}, city=${!!shipTo.city}, postalCode=${!!shipTo.postalCode}, country=${!!shipTo.country}`
    );
  }

  const rawItems =
    pickFirst(orderData?.items, orderData?.line_items, orderData?.cart?.items, orderData?.products) ??
    [];

  const items = Array.isArray(rawItems)
    ? rawItems
        .map((it: any) => {
          const q = Math.max(1, Math.floor(Number(it?.quantity ?? it?.qty ?? 1) || 1));

          const candidate =
            it?.unitPrice ??
            it?.unit_price ??
            it?.price ??
            it?.priceTTC ??
            it?.price_ttc ??
            it?.priceHT ??
            it?.amount ??
            it?.total ??
            it?.totalTTC ??
            it?.totals?.totalTTC;

          let unit = Number(candidate ?? 0) || 0;
          if (Number.isInteger(unit) && unit >= 1000) unit = unit / 100;

          return {
            sku: isNonEmptyString(it?.sku) ? it.sku : isNonEmptyString(it?.id) ? String(it.id) : undefined,
            name: asString(pickFirst(it?.name, it?.title, it?.productName), "").trim(),
            quantity: q,
            unitPrice: Math.max(0, unit),
          };
        })
        .filter((it: any) => it.name.length > 0)
    : [];

  return {
    orderNumber,
    orderDate,
    orderStatus: "awaiting_shipment" as const,
    customerEmail,
    billTo,
    shipTo,
    items,
    ...(Number.isFinite(totalTTC) && totalTTC > 0 ? { amountPaid: totalTTC } : {}),
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
        shipstationPushed: false,
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
    const alreadyPushedToShipstation = Boolean(existing?.shipstation?.pushedAt);

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

    let shipstationPushed = false;
    let shipstationError: string | null = null;

    if (!alreadyPushedToShipstation) {
      try {
        const ssBody = buildShipStationBody(orderData, orderDocId);

        if (!ssBody.items || ssBody.items.length === 0) {
          throw new Error("ShipStation payload has no items (check orderData items mapping).");
        }

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
    } else {
      shipstationPushed = true;
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
      shipstationPushed,
      shipstationError,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Capture failed" },
      { status: 500 }
    );
  }
}
