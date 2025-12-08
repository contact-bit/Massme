// src/components/shipping/types.ts

export type ShippingMethodType = "home" | "relay" | "local_pickup";

export type ShippingMethod = {
  id: string;
  name: string;                // déjà localisé (FR ou EN)
  delay: string;
  price: number;
  type: ShippingMethodType;
  relayProvider?: "mondialrelay" | "pickup" | "colissimo" | "relais-colis" | null;
  isActive?: boolean;
  moreInfoUrl?: string;
};

export type RelayPoint = {
  id: string;
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  raw?: any;
};
