import { NextResponse } from "next/server";
import { createOrUpdateOrder } from "@/server/shipstation/client";
import { dbAdmin } from "@/lib/firebase.admin";

// --- ShipStation orderStatus: union stricte + sanitizer ---
const allowedStatuses = [
  "awaiting_shipment",
  "on_hold",
  "shipped",
  "cancelled",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

function toShipStationStatus(value: unknown): AllowedStatus {
  return allowedStatuses.includes(value as AllowedStatus)
    ? (value as AllowedStatus)
    : "awaiting_shipment";
}

// --- Helpers ---
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type IncomingItem = {
  sku?: unknown;
  name?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
};

function normalizeItems(items: unknown) {
  const arr = Array.isArray(items) ? (items as IncomingItem[]) : [];
  return arr
    .map((it) => ({
      sku: isNonEmptyString(it.sku) ? it.sku : undefined,
      name: asString(it.name, "").trim(),
      quantity: Math.max(1, Math.floor(asNumber(it.quantity, 1))),
      unitPrice: Math.max(0, asNumber(it.unitPrice, 0)),
    }))
    .filter((it) => it.name.length > 0);
}

// --- Route ---
export async function POST(req: Request) {
  const reqId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  try {
    console.log(`[push-order][${reqId}] HIT`, new Date().toISOString());

    const payload = await req.json();

    console.log(`[push-order][${reqId}] payload keys:`, Object.keys(payload || {}));

    // On accepte soit { orderId, ... } soit { order: { ... } }
    const data = payload?.order ?? payload;

    console.log(`[push-order][${reqId}] data keys:`, Object.keys(data || {}));
    console.log(`[push-order][${reqId}] summary:`, {
      orderId: data?.orderId ?? data?.id ?? data?.orderKey,
      orderNumber: data?.orderNumber,
      hasBillTo: !!data?.billTo,
      hasShipTo: !!data?.shipTo,
      itemsType: Array.isArray(data?.items) ? "array" : typeof data?.items,
      itemsLen: Array.isArray(data?.items) ? data.items.length : null,
      env: {
        hasShipstationKey: !!process.env.SHIPSTATION_API_KEY,
        hasShipstationSecret: !!process.env.SHIPSTATION_API_SECRET,
      },
    });

    const orderId = data?.orderId ?? data?.id ?? data?.orderKey;
    if (!isNonEmptyString(orderId)) {
      console.log(`[push-order][${reqId}] ERROR missing orderId`, { orderId });
      return NextResponse.json(
        { ok: false, reqId, step: "validate", error: "Missing orderId (orderId/id/orderKey)." },
        { status: 400 }
      );
    }

    // Champs “métier”
    const orderNumber = asString(data?.orderNumber ?? orderId, orderId);
    const customerEmail = isNonEmptyString(data?.customerEmail)
      ? data.customerEmail
      : undefined;

    const orderDate = isNonEmptyString(data?.orderDate)
      ? data.orderDate
      : new Date().toISOString();

    const orderStatus = toShipStationStatus(data?.orderStatus);

    const billTo = {
      name: asString(data?.billTo?.name, "").trim() || "Customer",
      street1: asString(data?.billTo?.street1, "").trim(),
      city: asString(data?.billTo?.city, "").trim(),
      postalCode: asString(data?.billTo?.postalCode, "").trim(),
      country: asString(data?.billTo?.country, "").trim() || "FR",
      phone: asString(data?.billTo?.phone, "").trim(),
    };

    const shipTo = {
      name: asString(data?.shipTo?.name, "").trim() || billTo.name || "Customer",
      street1: asString(data?.shipTo?.street1, "").trim() || billTo.street1,
      city: asString(data?.shipTo?.city, "").trim() || billTo.city,
      postalCode: asString(data?.shipTo?.postalCode, "").trim() || billTo.postalCode,
      country: asString(data?.shipTo?.country, "").trim() || billTo.country || "FR",
      phone: asString(data?.shipTo?.phone, "").trim() || billTo.phone,
    };

    const items = normalizeItems(data?.items);
    if (items.length === 0) {
      console.log(`[push-order][${reqId}] ERROR items invalid`, {
        rawItemsType: Array.isArray(data?.items) ? "array" : typeof data?.items,
        rawItems: data?.items,
      });
      return NextResponse.json(
        {
          ok: false,
          reqId,
          step: "validate",
          error: "Missing/invalid items (needs at least 1 item with a name).",
        },
        { status: 400 }
      );
    }

    // Montants (optionnels)
    const amountPaid = data?.amountPaid ?? data?.total ?? data?.amount_total;
    const amountPaidNumber = typeof amountPaid === "number" ? amountPaid : undefined;

    // Payload ShipStation
    const body = {
      orderNumber,
      orderDate,
      orderStatus,
      customerEmail,
      billTo,
      shipTo,
      items,
      ...(typeof amountPaidNumber === "number" ? { amountPaid: amountPaidNumber } : {}),
    };

    console.log(`[push-order][${reqId}] calling ShipStation`, {
      orderNumber,
      orderStatus,
      items: items.length,
    });

    // 1) Push ShipStation
    const ssOrder = await createOrUpdateOrder(body);

    console.log(`[push-order][${reqId}] ShipStation OK`, {
      orderId: (ssOrder as any)?.orderId,
      orderKey: (ssOrder as any)?.orderKey,
    });

    // 2) Sauvegarde Firestore
    await dbAdmin.collection("orders").doc(orderId).set(
      {
        shipstation: {
          pushedAt: new Date().toISOString(),
          orderNumber,
          orderStatus,
          response: ssOrder ?? null,
        },
      },
      { merge: true }
    );

    console.log(`[push-order][${reqId}] Firestore OK`, { orderId });

    return NextResponse.json({ ok: true, reqId, shipstation: ssOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.log(`[push-order][${reqId}] ERROR`, message, err);
    return NextResponse.json({ ok: false, reqId, step: "exception", error: message }, { status: 500 });
  }
}
