import type { Order, LangCode } from "./types";
import { parseCreatedAt, safeLower } from "./utils";
import { buildItemsLabel, getTotal } from "./orderMath";

export function normalizeOrders(list: Order[]): Order[] {
  return list.map((o) => {
    /* =========================================================
       DATE
    ========================================================= */
    const created =
      parseCreatedAt(o.createdAt) ||
      parseCreatedAt(o.created_at) ||
      parseCreatedAt(o.created) ||
      parseCreatedAt(o.paidAt) ||
      null;

    /* =========================================================
       ITEMS
    ========================================================= */
    const items = Array.isArray(o.items) ? o.items : [];

    /* =========================================================
       🔥 TOTAL (SOURCE UNIQUE ET FIABLE)
    ========================================================= */
    const total =
      typeof o.total === "number"
        ? o.total
        : typeof o.totals?.totalTTC === "number"
        ? o.totals.totalTTC
        : getTotal(o); // fallback (sécurité)

    /* =========================================================
       EMAIL
    ========================================================= */
    const email = o.email ?? o.shippingAddress?.email ?? "—";

    /* =========================================================
       LANG
    ========================================================= */
    const rawCountry = safeLower(o.shippingAddress?.country);
    let lang: LangCode | undefined;

    if (rawCountry.startsWith("fr")) lang = "fr";
    else if (rawCountry.startsWith("en")) lang = "en";
    else if (rawCountry.startsWith("es")) lang = "es";
    else if (rawCountry.startsWith("de")) lang = "de";
    else if (rawCountry.startsWith("it")) lang = "it";
    else if (rawCountry.startsWith("nl")) lang = "nl";

    /* =========================================================
       RELAY POINT
    ========================================================= */
    const relay = o.relayPoint
      ? {
          name:
            o.relayPoint.name ||
            o.relayPoint.Nom,
          address:
            o.relayPoint.address ||
            o.relayPoint.Adresse1,
          city:
            o.relayPoint.city ||
            o.relayPoint.Ville,
          postalCode:
            o.relayPoint.postalCode ||
            o.relayPoint.CP,
          country:
            o.relayPoint.country ||
            o.relayPoint.Pays,
        }
      : null;

    /* =========================================================
       RETURN FINAL (🔥 FIX CRITIQUE ICI)
    ========================================================= */
    return {
      ...o,

      // 🔥 GARDE LES DONNÉES BACK
      totals: o.totals,

      // 🔥 NORMALISE POUR TOUT LE FRONT
      total: total,
      __total: total,

      relayPoint: relay,

      __created: created,
      __email: email,
      __itemsLabel: buildItemsLabel(items),
      __lang: lang,
    };
  });
}
