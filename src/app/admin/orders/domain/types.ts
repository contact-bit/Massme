export type OrderItem = {
  name?: any;

  // 🔥 TON FORMAT FIRESTORE
  priceHT?: number;

  // compat anciens formats
  price?: number | { eur?: number };

  weightKg?: number;
  deliveryPackageCount?: number;

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

/* =========================================================
   RELAY POINT
========================================================= */
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

/* =========================================================
   ORDER
========================================================= */
export type Order = {
  id: string;

  email?: string;
  status?: string;
  createdAt?: any;
  paidAt?: any;

  // NUMÉRO
  orderNumber?: string;
  __orderNumber?: string;
  invoiceNumber?: string;

  /* =========================================================
     🔥 STRIPE / LEGACY
  ========================================================= */
  amount_total?: number;

  /* =========================================================
     🔥 TOTAL NORMALISÉ API
  ========================================================= */
  total?: number;

  /* =========================================================
     🔥 SOURCE FIRESTORE (CRITIQUE)
  ========================================================= */
  totals?: {
    totalHT?: number;
    totalTTC?: number;
    totalVAT?: number;
    vatRate?: number;
    vatDisabled?: boolean;
    country?: string;
  };

  /* =========================================================
     SHIPPING
  ========================================================= */
  shippingMethod?: {
    name?: string;
    type?: string;
    relayProvider?: string;

    // 🔥 TES CHAMPS RÉELS
    priceHT?: number;
    priceTTC?: number;

    // compat ancien
    price?: number | { eur?: number };
  };

  shippingPrice?: number;

  items?: OrderItem[];
  shippingAddress?: any;
  billingAddress?: any;

  relayPoint?: RelayPoint | null;

  deliveryNote?: {
    packageCount?: number | string | null;
    weight?: string | null;
    instructions?: string | null;
    updatedAt?: any;
    updatedBy?: string | null;
  } | null;

  shippingStatus?: ShippingStatus;
  trackingNumber?: string | null;
  carrier?: "mondialrelay" | "other" | null;

  /* =========================================================
     🔥 NORMALIZED (FRONT)
  ========================================================= */
  __created?: Date | null;
  __total?: number;
  __email?: string;
  __itemsLabel?: string;
  __lang?: LangCode;
};

/* =========================================================
   FILTERS
========================================================= */
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
