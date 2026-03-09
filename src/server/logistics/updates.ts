import { FieldValue } from "firebase-admin/firestore";

export type ShippingMode = "manual" | "shipstation";

export type ShippingStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShippingCarrier = "mondialrelay" | "other" | string | null;

type BuildManualUpdateParams = {
  shippingStatus?: ShippingStatus;
  trackingNumber?: string | null;
  carrier?: ShippingCarrier;
  actor?: string | null;
};

type BuildShipStationPreparingParams = {
  shipstationOrderId?: string | number | null;
  shipstationOrderKey?: string | null;
};

type BuildShipStationShippedParams = {
  trackingNumber?: string | null;
  carrier?: ShippingCarrier;
  shipDate?: string | null;
  orderNumber?: string | null;
};

function cleanString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function cleanCarrier(v: unknown): string | null {
  const s = cleanString(v);
  return s ? s.toLowerCase() : null;
}

function cleanStatus(v: unknown): ShippingStatus | null {
  const s = cleanString(v)?.toLowerCase();
  if (
    s === "pending" ||
    s === "preparing" ||
    s === "shipped" ||
    s === "delivered" ||
    s === "cancelled"
  ) {
    return s;
  }
  return null;
}

function buildTrackingBlock(params: {
  trackingNumber?: string | null;
  carrier?: ShippingCarrier;
  shipDate?: string | null;
}) {
  return {
    trackingNumber: cleanString(params.trackingNumber) ?? null,
    carrier: cleanCarrier(params.carrier) ?? null,
    shipDate: cleanString(params.shipDate) ?? null,
  };
}

export function getShippingModeFromOrder(order: any): ShippingMode {
  const raw =
    cleanString(order?.shippingMode) ||
    cleanString(order?.logistics?.shippingMode) ||
    cleanString(order?.fulfillment?.shippingMode);

  return raw === "manual" ? "manual" : "shipstation";
}

export function buildManualShippingUpdate(params: BuildManualUpdateParams) {
  const status = cleanStatus(params.shippingStatus);
  const trackingNumber = cleanString(params.trackingNumber);
  const carrier = cleanCarrier(params.carrier) ?? "mondialrelay";
  const nowIso = new Date().toISOString();

  if (!status) {
    throw new Error("invalid_shipping_status");
  }

  const updates: Record<string, any> = {
    shippingMode: "manual",
    shippingStatus: status,
    trackingNumber: trackingNumber ?? null,
    carrier: carrier ?? null,

    shippingTracking: {
      trackingNumber: trackingNumber ?? null,
      carrier: carrier ?? null,
      shipDate: status === "shipped" ? nowIso : null,
    },

    fulfillment: {
      status,
      updatedAt: nowIso,
      tracking: {
        trackingNumber: trackingNumber ?? null,
        carrier: carrier ?? null,
        shipDate: status === "shipped" ? nowIso : null,
      },
    },

    logisticsAudit: {
      lastActor: cleanString(params.actor) || "admin_manual",
      lastSource: "manual",
      lastAction: `shipping_status:${status}`,
      updatedAt: nowIso,
    },
  };

  if (status === "shipped") {
    updates.shippedAt = nowIso;
  }

  if (status === "pending" || status === "preparing" || status === "cancelled") {
    updates.shippedAt = null;
  }

  return updates;
}

export function buildShipStationPreparingUpdate(
  params: BuildShipStationPreparingParams
) {
  const nowIso = new Date().toISOString();

  return {
    shippingMode: "shipstation",

    fulfillment: {
      status: "preparing",
      shipstation: {
        orderKey: cleanString(params.shipstationOrderKey) ?? null,
        orderId:
          params.shipstationOrderId === undefined
            ? null
            : params.shipstationOrderId ?? null,
      },
      updatedAt: nowIso,
    },

    logisticsAudit: {
      lastActor: "shipstation_push",
      lastSource: "shipstation",
      lastAction: "push_order",
      updatedAt: nowIso,
    },
  };
}

export function buildShipStationShippedUpdate(
  params: BuildShipStationShippedParams
) {
  const shipDate = cleanString(params.shipDate) || new Date().toISOString();
  const tracking = buildTrackingBlock({
    trackingNumber: params.trackingNumber,
    carrier: params.carrier,
    shipDate,
  });

  return {
    shippingMode: "shipstation",
    shippingStatus: "shipped",
    trackingNumber: tracking.trackingNumber,
    carrier: tracking.carrier,
    shippedAt: shipDate,

    shippingTracking: tracking,

    fulfillment: {
      status: "shipped",
      tracking,
      updatedAt: new Date().toISOString(),
    },

    shipstation: {
      lastWebhookAt: new Date().toISOString(),
      lastWebhookOrderNumber: cleanString(params.orderNumber) ?? null,
      lastWebhookTracking: tracking.trackingNumber,
      lastWebhookCarrier: tracking.carrier,
    },

    logisticsAudit: {
      lastActor: "shipstation_webhook",
      lastSource: "shipstation",
      lastAction: "shipment_update",
      updatedAt: new Date().toISOString(),
    },
  };
}