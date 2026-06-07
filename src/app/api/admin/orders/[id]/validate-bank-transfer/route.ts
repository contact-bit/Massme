import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { assertAdmin } from "@/server/adminAuth";
import { finalizePaidOrder } from "@/server/orders/finalizePaidOrder";
import { sendOrderEmails } from "@/lib/mailer";
import { createOrUpdateOrder } from "@/server/shipstation/client";
import { ensureInvoiceNumberForOrder } from "@/server/orders/generateInvoiceNumber";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
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

function toCentsFromTotals(orderData: any): number {
  const totalTTC = Number(
    orderData?.totals?.totalTTC ??
      orderData?.total ??
      orderData?.amount_total ??
      0
  );
  if (!Number.isFinite(totalTTC)) return 0;
  return Math.round(totalTTC * 100);
}

function buildShipStationBody(orderData: any, orderId: string) {
  const orderNumber =
    asString(
      pickFirst(orderData?.orderNumber, orderData?.number, orderData?.id),
      orderId
    ) || orderId;

  const orderDate = (() => {
    const d = pickFirst(
      orderData?.createdAt,
      orderData?.created_at,
      orderData?.created
    );
    if ((d as any)?.toDate) return (d as any).toDate().toISOString();
    if (typeof d === "string") return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  })();

  const customerEmail =
    normalizeEmail(orderData?.email) ||
    normalizeEmail(orderData?.customerEmail) ||
    normalizeEmail(orderData?.customer_email) ||
    undefined;

  const ship =
    pickFirst(
      orderData?.shippingAddress,
      orderData?.shippingCustomer,
      orderData?.shipping_address,
      orderData?.shipping?.address,
      orderData?.shipTo
    ) || {};

  const bill =
    pickFirst(
      orderData?.billingAddress,
      orderData?.billingCustomer,
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
          bill?.firstName && bill?.lastName
            ? `${bill.firstName} ${bill.lastName}`
            : undefined
        ),
        ""
      ).trim() || "Customer",
    street1: asString(
      pickFirst(
        bill?.street1,
        bill?.address1,
        bill?.line1,
        bill?.addressLine1,
        bill?.address,
        bill?.street
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
          bill?.complement
        ),
        ""
      ).trim() || undefined,
    city: asString(pickFirst(bill?.city, bill?.town, bill?.locality), "").trim(),
    state:
      asString(pickFirst(bill?.state, bill?.province, bill?.region), "").trim() ||
      undefined,
    postalCode: asString(
      pickFirst(bill?.postalCode, bill?.zip, bill?.postcode, bill?.zipCode),
      ""
    ).trim(),
    country: asString(pickFirst(bill?.country, bill?.countryCode), "FR").trim(),
    phone:
      asString(pickFirst(bill?.phone, bill?.phoneNumber, bill?.mobile), "").trim() ||
      undefined,
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
          ship?.firstName && ship?.lastName
            ? `${ship.firstName} ${ship.lastName}`
            : undefined
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
          ship?.address,
          ship?.street
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
          ship?.complement
        ),
        ""
      ).trim() || undefined,
    city:
      asString(pickFirst(ship?.city, ship?.town, ship?.locality), "").trim() ||
      billTo.city,
    state:
      asString(pickFirst(ship?.state, ship?.province, ship?.region), "").trim() ||
      undefined,
    postalCode:
      asString(
        pickFirst(ship?.postalCode, ship?.zip, ship?.postcode, ship?.zipCode),
        ""
      ).trim() || billTo.postalCode,
    country: asString(
      pickFirst(ship?.country, ship?.countryCode),
      billTo.country || "FR"
    ).trim(),
    phone:
      asString(pickFirst(ship?.phone, ship?.phoneNumber, ship?.mobile), "").trim() ||
      billTo.phone,
  };

  if (!shipTo.street1 || !shipTo.city || !shipTo.postalCode || !shipTo.country) {
    throw new Error(
      `ShipTo incomplete: street1=${!!shipTo.street1}, city=${!!shipTo.city}, postalCode=${!!shipTo.postalCode}, country=${!!shipTo.country}`
    );
  }

  const rawItems =
    pickFirst(
      orderData?.items,
      orderData?.line_items,
      orderData?.cart?.items,
      orderData?.products
    ) ?? [];

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

  if (!items.length) {
    throw new Error("ShipStation payload has no items");
  }

  const totalTTC = Number(
    orderData?.totals?.totalTTC ?? orderData?.total ?? orderData?.amount_total ?? 0
  );

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

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // const auth = assertAdmin(req);
  // if (auth) return auth;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const orderRef = dbAdmin.collection("orders").doc(id);
    const snap = await orderRef.get();

    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const order = snap.data() as any;

    const alreadyPaid =
      order?.paymentStatus === "paid" ||
      order?.payment?.status === "paid" ||
      order?.payment?.status === "validated" ||
      order?.status === "paid";

    if (alreadyPaid) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: id,
      });
    }

    const customerEmail =
      normalizeEmail(order?.email) ||
      normalizeEmail(order?.customerEmail) ||
      normalizeEmail(order?.customer_email) ||
      normalizeEmail(order?.billingCustomer?.email) ||
      normalizeEmail(order?.shippingCustomer?.email) ||
      null;

    await orderRef.set(
      {
        updatedAt: new Date(),
        status: "paid",
        paidAt: new Date(),
        paymentStatus: "paid",
        provider: order?.provider || order?.paymentProvider || "bank_transfer",
        paymentProvider: order?.paymentProvider || "bank_transfer",
        payment: {
          ...(order?.payment || {}),
          provider: "bank_transfer",
          status: "paid",
          validationMode: "manual",
          validatedAt: new Date(),
          validatedBy: "admin",
        },
        bankTransfer: {
          ...(order?.bankTransfer || {}),
          paymentConfirmedByAdmin: true,
          paymentConfirmedAt: new Date(),
        },
      },
      { merge: true }
    );

    let finalizeResult: any = null;
    try {
      finalizeResult = await finalizePaidOrder({
        orderId: id,
        provider: "bank_transfer",
        email: customerEmail,
        locale: order?.locale || "fr",
        payment: {
          providerOrderId: order?.reference || order?.orderNumber || id,
          providerRef: order?.reference || order?.orderNumber || id,
          manuallyValidated: true,
        },
      });

      await orderRef.set(
        {
          "debug.bankTransferFinalizeAt": new Date(),
          "debug.bankTransferFinalizeResult": finalizeResult ?? null,
        },
        { merge: true }
      );
    } catch (err: any) {
      await orderRef.set(
        {
          "debug.bankTransferFinalizeErrorAt": new Date(),
          "debug.bankTransferFinalizeError": String(err?.message || err),
        },
        { merge: true }
      );
    }

    const refreshedSnap = await orderRef.get();
    const refreshedOrder = refreshedSnap.data() as any;

    let emailSent = false;
    if (!refreshedOrder?.emails?.sent && customerEmail) {
      try {
        const amountTotalCents = toCentsFromTotals(refreshedOrder);
        const invoiceNumber =
          refreshedOrder?.invoiceNumber ||
          (await ensureInvoiceNumberForOrder(
            orderRef
          ));

        const mailResult = await sendOrderEmails({
          order: {
            id,
            amount_total: amountTotalCents,
            currency: (refreshedOrder?.currency || "EUR").toLowerCase(),
            customer_email: customerEmail,
            payment_status: "paid",
            provider: "bank_transfer",
            created_at: refreshedOrder?.createdAt || new Date(),
            orderData: {
              ...refreshedOrder,
              invoiceNumber,
            },
            locale: refreshedOrder?.locale || "fr",
            orderNumber:
              refreshedOrder?.orderNumber || refreshedOrder?.reference || id,
            invoiceNumber,
          },
          clientEmail: customerEmail,
        });

        emailSent = true;

        await orderRef.set(
          {
            emails: {
              sent: true,
              sentAt: new Date(),
              provider: "bank_transfer",
              client: mailResult?.client ?? null,
              admin: mailResult?.admin ?? null,
              logistics: mailResult?.logistics ?? [],
            },
            invoiceEmail: {
              status: "sent",
              sentAt: new Date(),
              provider: "bank_transfer",
              orderNumber:
                mailResult?.orderNumber ?? refreshedOrder?.orderNumber ?? id,
              invoiceNumber:
                mailResult?.invoiceNumber ?? invoiceNumber,
            },
          },
          { merge: true }
        );
      } catch (err: any) {
        await orderRef.set(
          {
            emails: {
              sent: false,
              lastErrorAt: new Date(),
              lastError: String(err?.message || err),
              provider: "bank_transfer",
            },
            invoiceEmail: {
              status: "error",
              lastErrorAt: new Date(),
              lastError: String(err?.message || err),
              provider: "bank_transfer",
            },
          },
          { merge: true }
        );
      }
    }

    let shipstationPushed = false;
    let shipstationError: string | null = null;

    try {
      const currentSnap = await orderRef.get();
      const currentOrder = currentSnap.data() as any;

      if (!currentOrder?.shipstation?.pushedAt) {
        const ssBody = buildShipStationBody(currentOrder, id);
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
      } else {
        shipstationPushed = true;
      }
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

    return NextResponse.json({
      ok: true,
      orderId: id,
      emailSent,
      shipstationPushed,
      shipstationError,
      finalizeResult: finalizeResult ?? null,
    });
  } catch (err: any) {
    console.error("[validate-bank-transfer] error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Validation failed" },
      { status: 500 }
    );
  }
}
