export const SHIPPING_METHODS = [
  {
    id: "home_standard",
    type: "home",
    relayProvider: null,
    name: {
      fr: "Livraison Standard à domicile",
      en: "Home Delivery",
    },
    delay: {
      fr: "48-72h",
      en: "48-72h",
    },
    price: {
      fr: 5.90,
      en: 5.90,
    },
  },

  {
    id: "relay_mondialrelay",
    type: "relay",
    relayProvider: "mondialrelay",
    name: {
      fr: "Mondial Relay – Point Relais",
      en: "Mondial Relay – Pickup Point",
    },
    delay: {
      fr: "3-5 jours",
      en: "3-5 days",
    },
    price: {
      fr: 4.90,
      en: 4.90,
    },
  },

  {
    id: "relay_pickup",
    type: "relay",
    relayProvider: "pickup",
    name: {
      fr: "Pickup Shop2Shop",
      en: "Pickup Shop2Shop",
    },
    delay: {
      fr: "2-4 jours",
      en: "2-4 days",
    },
    price: {
      fr: 4.50,
      en: 4.50,
    },
  },
];
