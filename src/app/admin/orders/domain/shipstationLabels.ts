export function shipstationOrderStatusLabelFR(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "awaiting_shipment":
      return "En attente d’envoi";

    case "on_hold":
      return "En attente (bloquée)";

    case "shipped":
      return "Expédiée";

    case "cancelled":
      return "Annulée";

    // ✅ IMPORTANT → gestion du 429 / cache backoff
    case "rate_limited":
      return "Sync…";

    default:
      return status ? status : "Inconnu";
  }
}
