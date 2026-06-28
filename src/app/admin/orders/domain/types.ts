export type LangCode = "fr" | "en" | "es" | "de" | "it" | "nl";

export type FirestoreDateValue =
  | Date
  | string
  | number
  | {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    }
  | null;

export type LocalizedText =
  | string
  | Partial<Record<LangCode, string>>;

export type OrderAddress = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type OrderItem = {
  id?: string;
  sku?: string;
  productCode?: string;
  name?: LocalizedText;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  photo?: string;

  // 🔥 TON FORMAT FIRESTORE
  priceHT?: number;

  // compat anciens formats
  price?: number | { eur?: number };

  weightKg?: number;
  deliveryPackageCount?: number;

  quantity?: number;
  description?: string;
};

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
  Nom?: string;
  Adresse1?: string;
  Ville?: string;
  CP?: string;
  Pays?: string;
  raw?: unknown;
};

/* =========================================================
   ORDER
========================================================= */
export type Order = {
  id: string;

  email?: string;
  status?: string;
  createdAt?: FirestoreDateValue;
  created_at?: FirestoreDateValue;
  created?: FirestoreDateValue;
  paidAt?: FirestoreDateValue;
  shippedAt?: FirestoreDateValue;

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
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;

  relayPoint?: RelayPoint | null;

  deliveryNote?: {
    packageCount?: number | string | null;
    weight?: string | null;
    instructions?: string | null;
    updatedAt?: FirestoreDateValue;
    updatedBy?: string | null;
  } | null;

  shippingStatus?: ShippingStatus;
  trackingNumber?: string | null;
  carrier?: "mondialrelay" | "other" | null;

  shippingTracking?: {
    trackingNumber?: string | null;
    carrier?: string | null;
    shipDate?: string | null;
  };

  fulfillment?: {
    status?: string | null;
    tracking?: {
      trackingNumber?: string | null;
      carrier?: string | null;
      shipDate?: string | null;
    };
  };

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
