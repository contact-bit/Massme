import { ShippingMethod } from "@/components/shipping/types";

export const shippingMethods: ShippingMethod[] = [
  {
    id: "relay_mr",
    name: "Point Relais Mondial Relay",
    delay: "3 à 5 jours ouvrés",
    price: 6.75,
    type: "relay",
    isActive: true,
  },
  {
    id: "home_standard",
    name: "Livraison à domicile",
    delay: "2 à 3 jours ouvrés",
    price: 11.75,
    type: "home",
    isActive: true,
  },
  {
    id: "home_express",
    name: "Livraison Express 24H",
    delay: "24H ouvrées si commande avant 14H",
    price: 19.67,
    type: "home",
    isActive: true,
  },
  {
    id: "pickup_mbe",
    name: "Retrait gratuit chez MBE (St Laurent du Var)",
    delay: "Retrait boutique",
    price: 0,
    type: "local_pickup",
    moreInfoUrl: "https://share.google/8x4GHOORKMuT3vx2v",
    isActive: true,
  },
];
