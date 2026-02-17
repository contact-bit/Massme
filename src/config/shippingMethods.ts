// src/config/shippingMethods.ts

import { ShippingMethod } from "@/components/shipping/types";

export const shippingMethods: ShippingMethod[] = [
  // Mondial Relay – France
  {
    id: "relay_mr_fr",
    name: "Point Relais Mondial Relay",
    delay: "3 à 5 jours ouvrés",
    priceHT: 6.75,
    vatRate: 20,
    type: "relay",
    relayProvider: "mondialrelay",
    country: "FR",
    isActive: true,
  },
  // Mondial Relay – Espagne
  {
    id: "relay_mr_es",
    name: "Punto de recogida Mondial Relay",
    delay: "3 a 5 días laborables",
    priceHT: 6.75,
    vatRate: 21,
    type: "relay",
    relayProvider: "mondialrelay",
    country: "ES",
    isActive: true,
  },
  // Mondial Relay – Pays-Bas
  {
    id: "relay_mr_nl",
    name: "Mondial Relay afhaalpunt",
    delay: "3–5 werkdagen",
    priceHT: 6.75,
    vatRate: 21,
    type: "relay",
    relayProvider: "mondialrelay",
    country: "NL",
    isActive: true,
  },

  {
    id: "home_standard",
    name: "Livraison à domicile",
    delay: "2 à 3 jours ouvrés",
    priceHT: 11.75,
    vatRate: 20,
    type: "home",
    country: "FR",
    isActive: true,
  },
  {
    id: "home_express",
    name: "Livraison Express 24H",
    delay: "24H ouvrées si commande avant 14H",
    priceHT: 19.67,
    vatRate: 20,
    type: "home",
    country: "FR",
    isActive: true,
  },
  {
    id: "pickup_mbe",
    name: "Retrait gratuit chez MBE (St Laurent du Var)",
    delay: "Retrait boutique",
    priceHT: 0,
    vatRate: 0,
    type: "local_pickup",
    country: "FR",
    moreInfoUrl: "https://share.google/8x4GHOORKMuT3vx2v",
    isActive: true,
  },
];
