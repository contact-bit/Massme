import type { Order, LangCode } from "./types";
import { parseCreatedAt, safeLower } from "./utils";
import { buildItemsLabel, getTotal } from "./orderMath";

export function normalizeOrders(list: Order[]): Order[] {
  return list.map((o) => {
    /* =========================================================
       DATE
    ========================================================= */
    const created =
      parseCreatedAt((o as any).createdAt) ||
      parseCreatedAt((o as any).created_at) ||
      parseCreatedAt((o as any).created) ||
      parseCreatedAt((o as any).paidAt) ||
      null;

    /* =========================================================
       ITEMS
    ========================================================= */
    const items = Array.isArray(o.items) ? o.items : [];

    /* =========================================================
       🔥 TOTAL (SOURCE UNIQUE ET FIABLE)
    ========================================================= */
    const total =
      typeof (o as any)?.total === "number"
        ? (o as any).total
        : typeof (o as any)?.totals?.totalTTC === "number"
        ? (o as any).totals.totalTTC
        : getTotal(o); // fallback (sécurité)

    /* =========================================================
       EMAIL
    ========================================================= */
    const email = o.email ?? o.shippingAddress?.email ?? "—";

    /* =========================================================
       LANG
    ========================================================= */
    const rawCountry = safeLower((o as any).shippingAddress?.country);
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
    const relay = (o as any)?.relayPoint
      ? {
          name:
            (o as any).relayPoint.name ||
            (o as any).relayPoint.Nom ||
            null,
          address:
            (o as any).relayPoint.address ||
            (o as any).relayPoint.Adresse1 ||
            null,
          city:
            (o as any).relayPoint.city ||
            (o as any).relayPoint.Ville ||
            null,
          postalCode:
            (o as any).relayPoint.postalCode ||
            (o as any).relayPoint.CP ||
            null,
          country:
            (o as any).relayPoint.country ||
            (o as any).relayPoint.Pays ||
            null,
        }
      : null;

    /* =========================================================
       RETURN FINAL (🔥 FIX CRITIQUE ICI)
    ========================================================= */
    return {
      ...o,

      // 🔥 GARDE LES DONNÉES BACK
      totals: (o as any)?.totals ?? null,

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