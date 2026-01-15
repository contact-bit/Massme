export type ShippingMethod = {
  id: string;

  nameFr: string;
  nameEn: string;
  delayFr: string;
  delayEn: string;
  priceFr: number;
  priceEn: number;

  isActive: boolean;
  type: "home" | "relay" | "local_pickup";
  relayProvider?: string | null;
  country?: string;
};
