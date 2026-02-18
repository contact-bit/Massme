import type { Order, OrderItem } from "./types";

export function getItemPrice(it: OrderItem): number {
  const p = it?.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object" && typeof (p as any).eur === "number")
    return (p as any).eur;
  return 0;
}

export function getSubtotal(o: Order): number {
  const items = Array.isArray(o.items) ? o.items : [];
  return items.reduce(
    (sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1),
    0
  );
}

export function getShipping(o: Order): number {
  const m = o.shippingMethod?.price;
  if (typeof m === "number") return m;
  if (m && typeof m === "object" && typeof (m as any).eur === "number")
    return (m as any).eur;
  if (typeof o.shippingPrice === "number") return o.shippingPrice;
  return 0;
}

export function getTotal(o: Order): number {
  if (typeof o.amount_total === "number") return o.amount_total / 100;
  if (typeof o.total === "number") return o.total;
  return getSubtotal(o) + getShipping(o);
}

export function buildItemsLabel(items: OrderItem[]) {
  if (!items?.length) return "—";
  const txt =
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
      .join(" • ") + (items.length > 2 ? " …" : "");
  return txt || "—";
}
