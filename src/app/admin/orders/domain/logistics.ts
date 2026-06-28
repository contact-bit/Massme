import type { Order, ShippingStatus } from "./types";

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

  const fulfillmentStatus = String(order.fulfillment?.status || "").toLowerCase();

  if (fulfillmentStatus === "preparing") return "preparing";
  if (fulfillmentStatus === "shipped") return "shipped";
  if (fulfillmentStatus === "delivered") return "delivered";
  if (fulfillmentStatus === "cancelled") return "cancelled";

  return "pending";
}

export function getShippingStatusLabel(status: ShippingStatus) {
  switch (status) {
    case "pending":
      return "En attente d’expédition";
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
      return "Commande payée, en attente de prise en charge logistique.";
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
    order.shippingTracking?.trackingNumber ||
    order.fulfillment?.tracking?.trackingNumber ||
    null
  );
}

export function getCarrier(order: Order): string | null {
  return (
    order.carrier ||
    order.shippingTracking?.carrier ||
    order.fulfillment?.tracking?.carrier ||
    null
  );
}

export function getShipDate(order: Order): string | null {
  return (
    order.shippingTracking?.shipDate ||
    order.fulfillment?.tracking?.shipDate ||
    (typeof order.shippedAt === "string" ? order.shippedAt : null) ||
    null
  );
}

export function getLogisticStatus(order: Order): "to_prepare" | "shipped" {
  const status = getEffectiveShippingStatus(order);

  // ✅ déjà expédié / livré
  if (status === "shipped" || status === "delivered") {
    return "shipped";
  }

  // 🔥 TOUT LE RESTE = à préparer
  return "to_prepare";
}
