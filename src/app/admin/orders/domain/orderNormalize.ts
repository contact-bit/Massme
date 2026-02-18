import type { Order, LangCode } from "./types";
import { parseCreatedAt, safeLower } from "./utils";
import { buildItemsLabel, getTotal } from "./orderMath";

export function normalizeOrders(list: Order[]): Order[] {
  return list.map((o) => {
    const created =
      parseCreatedAt((o as any).createdAt) ||
      parseCreatedAt((o as any).created_at) ||
      parseCreatedAt((o as any).created) ||
      parseCreatedAt((o as any).paidAt) ||
      null;

    const items = Array.isArray(o.items) ? o.items : [];
    const total = getTotal(o);
    const email = o.email ?? o.shippingAddress?.email ?? "—";

    const rawCountry = safeLower((o as any).shippingAddress?.country);
    let lang: LangCode | undefined;
    if (rawCountry.startsWith("fr")) lang = "fr";
    else if (rawCountry.startsWith("en")) lang = "en";
    else if (rawCountry.startsWith("es")) lang = "es";
    else if (rawCountry.startsWith("de")) lang = "de";
    else if (rawCountry.startsWith("it")) lang = "it";
    else if (rawCountry.startsWith("nl")) lang = "nl";

    return {
      ...o,
      __created: created,
      __total: total,
      __email: email,
      __itemsLabel: buildItemsLabel(items),
      __lang: lang,
    };
  });
}
