// src/components/shipping/types.ts
export type RelayPoint = {
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  provider?: "mondialrelay" | "colissimo" | "pickup" | "ups";
  raw?: any; // données brutes
};
