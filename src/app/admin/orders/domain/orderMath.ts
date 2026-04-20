import type { Order, OrderItem } from "./types";

/* =========================================================
   ITEM PRICE
========================================================= */
export function getItemPrice(it: OrderItem): number {
  // 🔥 PRIORITÉ À TON FORMAT FIRESTORE
  if (typeof (it as any)?.priceHT === "number") {
    return (it as any).priceHT;
  }

  const p = (it as any)?.price;

  if (typeof p === "number") return p;

  if (p && typeof p === "object" && typeof p.eur === "number") {
    return p.eur;
  }

  return 0;
}

/* =========================================================
   SUBTOTAL
========================================================= */
export function getSubtotal(o: Order): number {
  const items = Array.isArray(o.items) ? o.items : [];

  return items.reduce(
    (sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1),
    0
  );
}

/* =========================================================
   SHIPPING
========================================================= */
export function getShipping(o: Order): number {
  // 🔥 TON FORMAT
  if (typeof (o as any)?.shippingMethod?.priceHT === "number") {
    return (o as any).shippingMethod.priceHT;
  }

  if (typeof (o as any)?.shippingMethod?.priceTTC === "number") {
    return (o as any).shippingMethod.priceTTC;
  }

  if (typeof o.shippingPrice === "number") return o.shippingPrice;

  return 0;
}

/* =========================================================
   TOTAL
========================================================= */
export function getTotal(o: Order): number {
  // 🔥 PRIORITÉ FIRESTORE (LE PLUS IMPORTANT)
  if (typeof (o as any)?.totals?.totalTTC === "number") {
    return (o as any).totals.totalTTC;
  }

  if (typeof o.total === "number") return o.total;

  if (typeof (o as any)?.amount_total === "number") {
    return (o as any).amount_total / 100;
  }

  // fallback
  return getSubtotal(o) + getShipping(o);
}

/* =========================================================
   LABEL
========================================================= */
export function buildItemsLabel(items: OrderItem[]) {
  if (!items?.length) return "—";

  return (
    items
      .map((it: any) => {
        const n =
          typeof it?.name === "string"
            ? it.name
            : it?.name?.fr || it?.name?.en || "Produit";

        const q = it?.quantity ?? 1;

        return `${n} x${q}`;
      })
      .slice(0, 2)
      .join(" • ") + (items.length > 2 ? " …" : "")
  );
}