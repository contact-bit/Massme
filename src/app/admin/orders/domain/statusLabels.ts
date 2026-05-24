import type { ShippingStatus } from "./types";

/* ============================
   PAIEMENT
============================ */

export function paymentStatusLabelFR(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "Payé";
    case "pending_payment":
      return "En attente de paiement";
    case "awaiting_bank_transfer":
      return "En attente de virement";
    case "refunded":
      return "Remboursé";
    case "failed":
    case "refused":
    case "declined":
      return "Paiement refusé";
    case "canceled":
    case "cancelled":
      return "Annulé";
    default:
      return "En attente";
  }
}

/* ============================
   LIVRAISON
============================ */

export function shippingStatusLabelFR(status?: ShippingStatus) {
  switch (status) {
    case "pending":
      return "En attente";
    case "preparing":
      return "En préparation";
    case "shipped":
      return "Expédié";
    case "delivered":
      return "Livré";
    case "cancelled":
      return "Annulé";
    default:
      return "En attente";
  }
}
