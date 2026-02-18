import type { ShippingStatus } from "./types";

export function getShippingText(status?: ShippingStatus) {
  if (status === "pending")
    return "Commande bien reçue, à préparer dès que possible.";
  if (status === "preparing")
    return "Commande en cours de préparation, prête à être expédiée.";
  if (status === "shipped") return "Colis expédié, en cours d’acheminement.";
  if (status === "delivered") return "Colis livré au client.";
  if (status === "cancelled") return "Commande / livraison annulée.";
  return "Statut livraison non défini.";
}

export function getNextActionHint(status?: ShippingStatus) {
  if (status === "pending")
    return "→ Cliquez sur “Mettre en préparation” dès que vous commencez à préparer la commande.";
  if (status === "preparing")
    return "→ Lorsque le colis part, marquez-le comme “Expédié”.";
  if (status === "shipped")
    return "→ Une fois le colis livré, marquez la commande comme “Livrée”.";
  if (status === "delivered") return "Aucune action nécessaire.";
  if (status === "cancelled") return "Commande clôturée.";
  return "";
}
