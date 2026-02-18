export type OrderItem = {
  name?: any;
  price?: number | { eur?: number };
  quantity?: number;
  description?: string;
};

export type LangCode = "fr" | "en" | "es" | "de" | "it" | "nl";

export type ShippingStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  email?: string;
  status?: string;
  createdAt?: any;

  amount_total?: number; // stripe cents
  total?: number; // eur

  shippingMethod?: { name?: string; price?: number | { eur?: number } };
  shippingPrice?: number;

  items?: OrderItem[];
  shippingAddress?: any;

  shippingStatus?: ShippingStatus;
  trackingNumber?: string | null;
  carrier?: "mondialrelay" | "other" | null;

  __created?: Date | null;
  __total?: number;
  __email?: string;
  __itemsLabel?: string;
  __lang?: LangCode;
};

export type StatusFilter =
  | "all"
  | "paid"
  | "pending_payment"
  | "refunded"
  | "canceled"
  | "other";

export type SortKey = "date_desc" | "date_asc" | "total_desc" | "total_asc";
