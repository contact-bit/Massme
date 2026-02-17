// src/components/shipping/types.ts

export type ShippingMethodType =
  | "home"
  | "relay"
  | "local_pickup";

export type RelayProvider =
  | "mondialrelay"
  | "pickup"
  | "colissimo"
  | "relais-colis";

export type ShippingMethod = {
  id: string;

  /** Nom affiché (déjà localisé) */
  name: string;

  /** Délai indicatif */
  delay: string;

  /** Prix hors taxes — source de vérité */
  priceHT: number;

  /** Taux de TVA (ex: 20). Undefined ou 0 = pas de TVA */
  vatRate?: number;

  /**
   * Prix TTC calculé dynamiquement
   * ❗ Ne jamais le stocker en dur
   */
  priceTTC?: number;

  type: ShippingMethodType;

  /** Spécifique aux livraisons relais */
  relayProvider?: RelayProvider | null;

  /** Activation / désactivation */
  isActive?: boolean;

  /** Lien info (pickup, point relais, etc.) */
  moreInfoUrl?: string;

  /** Ordre d'affichage (1, 2, 3…) */
  sortOrder?: number | null;

  /** Pays de la méthode (FR, IT, ES, DE, NL, …) */
  country: string;
};

/* --------------------------------------------------
   POINT RELAIS (Mondial Relay, etc.)
-------------------------------------------------- */

export type RelayPoint = {
  id: string;
  name: string;

  address: string;
  address2?: string | null;

  city: string;
  postalCode: string;
  country: string;

  latitude?: number | null;
  longitude?: number | null;

  /** Données brutes API transporteur */
  raw?: any;
};
