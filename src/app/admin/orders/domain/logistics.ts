import type { Order, ShippingStatus } from "./types";

export type LogisticsSource = "shipstation" | "manual";

export function getEffectiveShippingStatus(order: Order): ShippingStatus {
  const raw = String(order.shippingStatus || "").toLowerCase();

  if (
    raw === "pending" ||
    raw === "preparing" ||
    raw === "shipped" ||
    raw === "delivered" ||
    raw === "cancelled"
  ) {
    return raw;
  }

  const fulfillmentStatus = String((order as any)?.fulfillment?.status || "").toLowerCase();

  if (fulfillmentStatus === "preparing") return "preparing";
  if (fulfillmentStatus === "shipped") return "shipped";
  if (fulfillmentStatus === "delivered") return "delivered";
  if (fulfillmentStatus === "cancelled") return "cancelled";

  return "pending";
}

export function getShippingStatusLabel(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return "En attente";
    case "preparing":
      return "Préparation";
    case "shipped":
      return "Expédiée";
    case "delivered":
      return "Livrée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

export function getShippingStatusHint(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return "Commande prête à entrer en préparation.";
    case "preparing":
      return "Commande en cours de préparation logistique.";
    case "shipped":
      return "Colis expédié, en attente de livraison.";
    case "delivered":
      return "Commande livrée au client.";
    case "cancelled":
      return "Flux logistique interrompu.";
    default:
      return "";
  }
}

export function getShippingStatusUi(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
    case "preparing":
      return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
    case "shipped":
      return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "delivered":
      return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" };
    case "cancelled":
      return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" };
    default:
      return { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB" };
  }
}

export function getTrackingNumber(order: Order): string | null {
  return (
    order.trackingNumber ||
    (order as any)?.shippingTracking?.trackingNumber ||
    (order as any)?.fulfillment?.tracking?.trackingNumber ||
    null
  );
}

export function getCarrier(order: Order): string | null {
  return (
    order.carrier ||
    (order as any)?.shippingTracking?.carrier ||
    (order as any)?.fulfillment?.tracking?.carrier ||
    null
  );
}

export function getShipDate(order: Order): string | null {
  return (
    (order as any)?.shippingTracking?.shipDate ||
    (order as any)?.fulfillment?.tracking?.shipDate ||
    (typeof (order as any)?.shippedAt === "string" ? (order as any).shippedAt : null) ||
    null
  );
}

export function hasShipStationLink(order: Order): boolean {
  return !!(
    (order as any)?.fulfillment?.shipstation?.orderId ||
    (order as any)?.fulfillment?.shipstation?.orderKey ||
    (order as any)?.shipstation?.lastWebhookAt
  );
}

export function getLogisticsSource(order: Order): LogisticsSource {
  return hasShipStationLink(order) ? "shipstation" : "manual";
}

export function getLogisticsSourceLabel(source: LogisticsSource) {
  return source === "shipstation" ? "ShipStation" : "Interne";
}

export function getLogisticsSourceUi(source: LogisticsSource) {
  return source === "shipstation"
    ? { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" }
    : { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB" };
}