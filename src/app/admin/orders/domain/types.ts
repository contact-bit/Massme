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

// 🔥 NEW TYPE RELAY
export type RelayPoint = {
  id?: string;
  name?: string;
  address?: string;
  address2?: string | null;
  city?: string;
  postalCode?: string;
  country?: string;
  raw?: any;
};

export type Order = {
  id: string;

  email?: string;
  status?: string;
  createdAt?: any;

  // ✅ NUMÉRO
  orderNumber?: string;
  __orderNumber?: string;

  amount_total?: number;
  total?: number;

  // 🔥 FIX SHIPPING METHOD COMPLET
  shippingMethod?: {
    name?: string;
    type?: string; // 🔥 IMPORTANT
    relayProvider?: string; // 🔥 IMPORTANT
    price?: number | { eur?: number };
  };

  shippingPrice?: number;

  items?: OrderItem[];
  shippingAddress?: any;

  // 🔥 AJOUT RELAY (CRITIQUE)
  relayPoint?: RelayPoint | null;

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

export type SortKey =
  | "date_desc"
  | "date_asc"
  | "total_desc"
  | "total_asc";