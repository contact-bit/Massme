// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { getPayPalClient } from "@/lib/paypal-client";
import { dbAdmin } from "@/lib/firebase.admin";
import { sendOrderEmails } from "@/lib/mailer";
import { createOrUpdateOrder } from "@/server/shipstation/client";

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
  for (const v of values) if (v !== undefined && v !== null) return v;
  return undefined;
}

// Build ShipStation payload from your Firestore order shape (best-effort)
function buildShipStationBody(orderData: any, orderDocId: string) {
  const orderNumber =
    asString(pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id), orderDocId) ||
    orderDocId;

  const orderDate = (() => {
    const d = pickFirst(orderData?.createdAt, orderData?.created_at, orderData?.created);
    if (d?.toDate) return d.toDate().toISOString(); // Firestore Timestamp
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
        bill?.address, // ✅ ton format
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

    phone: asString(pickFirst(bill?.phone, bill?.phoneNumber, bill?.mobile), "").trim() || undefined,
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
          ship?.address, // ✅ ton format
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

    phone: asString(pickFirst(ship?.phone, ship?.phoneNumber, ship?.mobile), "").trim() || billTo.phone,
  };

  // ✅ Validation explicite (sinon ShipStation 400 opaque)
  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode || !shipTo.country) {
    throw new Error(
      `ShipTo incomplete: street1=${!!shipTo.street1}, city=${!!shipTo.city}, postalCode=${!!shipTo.postalCode}, country=${!!shipTo.country}`
    );
  }

  // Items
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

          // si c'est un int "grand" (ex: 11100) on suppose centimes
          if (Number.isInteger(unit) && unit >= 1000) unit = unit / 100;

          return {
            sku: isNonEmptyString(it?.sku)
              ? it.sku
              : isNonEmptyString(it?.id)
              ? String(it.id)
              : undefined,
            name: asString(pickFirst(it?.name, it?.title, it?.productName), "").trim(),
            quantity: q,
            unitPrice: Math.max(0, unit),
          };
        })
        .filter((it: any) => it.name.length > 0)
    : [];

  const orderStatus: "awaiting_shipment" = "awaiting_shipment";

  return {
    orderNumber,
    orderDate,
    orderStatus,
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
      console.warn("[paypal/capture-order] orderDocId introuvable", {
        orderId,
        customId,
        fallbackOrderDocId,
      });

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

    // 1) Lire la commande
    const snapBefore = await orderRef.get();
    const existing = snapBefore.exists ? (snapBefore.data() as any) : null;

    const alreadySent = Boolean(existing?.emails?.sent);
    const alreadyPushedToShipstation = Boolean(existing?.shipstation?.pushedAt);

    // 2) Update Firestore paid
    await orderRef.set(
      {
        status: "paid",
        payment: {
          provider: "paypal",
          providerOrderId: orderId,
          captureId,
          status: captureStatus,
          capturedAmount: {
            value: capturedValue ?? null,
            currency: capturedCurrency ?? null,
          },
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // 3) Relire après update
    const snapAfter = await orderRef.get();
    const orderData = snapAfter.exists ? (snapAfter.data() as any) : null;

    console.log("[paypal/capture-order] finalized", {
      reqId,
      orderDocId,
      hasOrderData: !!orderData,
      orderKeys: orderData ? Object.keys(orderData) : [],
      alreadyPushedToShipstation,
    });

    // 4) Push ShipStation (non bloquant)
    let shipstationPushed = false;
    let shipstationError: string | null = null;

    if (!alreadyPushedToShipstation) {
      try {
        // ⚠️ Tu peux enlever ce log plus tard (il contient des infos perso)
        console.log("[shipstation] shippingAddress sample", {
          shippingAddress: orderData?.shippingAddress,
          billingAddress: orderData?.billingAddress,
        });

        const ssBody = buildShipStationBody(orderData, orderDocId);

        console.log("[shipstation] build summary", {
          reqId,
          orderNumber: ssBody.orderNumber,
          itemsLen: ssBody.items?.length ?? 0,
          hasShipTo: !!ssBody.shipTo?.street1,
          env: {
            hasKey: !!process.env.SHIPSTATION_API_KEY,
            hasSecret: !!process.env.SHIPSTATION_API_SECRET,
          },
        });

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
        console.log("[shipstation] push OK", { reqId, ssOrderId: (ssOrder as any)?.orderId });
      } catch (err: any) {
        shipstationError = String(err?.message || err);
        console.error("[shipstation] push ERROR (non bloquant):", shipstationError);

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
      console.log("[shipstation] already pushed, skip", { reqId, orderDocId });
      shipstationPushed = true;
    }

    // 5) Envoi email (non bloquant)
    let emailSent = false;

    if (!alreadySent && orderData?.email) {
      const totalTTC = Number(orderData?.totals?.totalTTC ?? 0);
      const amountTotalCents = totalTTC > 0 ? toCents(totalTTC) : toCents(capturedValue);

      try {
        await sendOrderEmails({
          order: {
            id: orderData.id || orderDocId,
            amount_total: amountTotalCents,
            currency: (orderData?.currency || "EUR").toLowerCase(),
            customer_email: orderData.email,
            payment_status: "paid",
            created_at: orderData.createdAt,
            provider: "paypal",
            orderData,
            locale: orderData?.locale || "fr",
          },
          clientEmail: orderData.email,
        });

        emailSent = true;

        await orderRef.set(
          { emails: { sent: true, sentAt: new Date(), provider: "paypal" } },
          { merge: true }
        );
      } catch (mailErr: any) {
        console.error("[paypal/capture-order] EMAIL ERROR (non bloquant):", mailErr);

        await orderRef.set(
          {
            emails: {
              sent: false,
              lastErrorAt: new Date(),
              lastError: String(mailErr?.message || mailErr),
              provider: "paypal",
            },
          },
          { merge: true }
        );
      }
    } else if (alreadySent) {
      console.log("[paypal/capture-order] email déjà envoyé, skip", { orderDocId });
    } else {
      console.warn("[paypal/capture-order] Email non envoyé: orderData/email manquant", {
        orderDocId,
        hasOrderData: !!orderData,
      });
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
    console.error("[paypal/capture-order] ERROR:", e);

    return NextResponse.json({ ok: false, error: e?.message ?? "Capture failed" }, { status: 500 });
  }
}
