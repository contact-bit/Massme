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
  existingShipDate?: string | null;
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

export function buildManualShippingUpdate(params: BuildManualUpdateParams) {
  const status = cleanStatus(params.shippingStatus);
  const trackingNumber = cleanString(params.trackingNumber);
  const carrier = cleanCarrier(params.carrier) ?? "mondialrelay";
  const nowIso = new Date().toISOString();

  if (!status) {
    throw new Error("invalid_shipping_status");
  }

  const existingShipDate = cleanString(params.existingShipDate);
  const effectiveShipDate = status === "shipped" ? nowIso : existingShipDate;

  const tracking = buildTrackingBlock({
    trackingNumber,
    carrier,
    shipDate: effectiveShipDate,
  });

  const updates: Record<string, any> = {
    shippingMode: "manual",
    shippingStatus: status,
    trackingNumber: tracking.trackingNumber,
    carrier: tracking.carrier,

    shippingTracking: tracking,

    fulfillment: {
      status,
      updatedAt: nowIso,
      tracking,
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
  } else if (existingShipDate) {
    updates.shippedAt = existingShipDate;
  }

  return updates;
}
