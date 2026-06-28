"use client";

import React from "react";
import type { RelayProvider, RelayPoint } from "@/components/shipping/types";
import type { Locale } from "@/lib/i18n";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

/* =====================================================
   TYPES
===================================================== */

type RelayProviderComponent = React.FC<{
  onSelect: (relay: RelayPoint) => void;
  country: string;
  locale: Locale;
}>;

type RelayProviderConfig = {
  label: Record<Locale, string>;
  choose: Record<Locale, string>;
  selected: Record<Locale, string>;
  Component: RelayProviderComponent;
};



/* =====================================================
   PLACEHOLDER
===================================================== */

const ComingSoon = (
  name: string
): RelayProviderComponent => {
  const ComingSoonProvider = () => (
    <div className="p-4 text-sm rounded bg-yellow-50 text-yellow-800">
      🚧 {name} bientôt disponible
    </div>
  );

  ComingSoonProvider.displayName = `ComingSoon(${name})`;
  return ComingSoonProvider;
};

/* =====================================================
   REGISTRY — 🔑 DOIT MATCH RelayProvider
===================================================== */

export const RELAY_PROVIDERS: Record<RelayProvider, RelayProviderConfig> = {
  mondialrelay: {
    label: {
      fr: "Point relais Mondial Relay",
      en: "Mondial Relay pickup point",
      es: "Punto Mondial Relay",
      de: "Mondial Relay Abholstelle",
      it: "Punto di ritiro Mondial Relay",
      nl: "Mondial Relay afhaalpunt",
    },
    choose: {
      fr: "Choisir un point relais Mondial Relay",
      en: "Choose a Mondial Relay pickup point",
      es: "Elegir un punto Mondial Relay",
      de: "Mondial Relay Abholstelle auswählen",
      it: "Scegli un punto Mondial Relay",
      nl: "Kies een Mondial Relay afhaalpunt",
    },
    selected: {
      fr: "Point relais sélectionné",
      en: "Selected pickup point",
      es: "Punto seleccionado",
      de: "Ausgewählte Abholstelle",
      it: "Punto selezionato",
      nl: "Gekozen afhaalpunt",
    },
    Component: RelayPointMondialRelay,
  },

  pickup: {
    label: {
      fr: "Point relais Pickup",
      en: "Pickup point",
      es: "Punto Pickup",
      de: "Pickup Abholstelle",
      it: "Punto Pickup",
      nl: "Pickup afhaalpunt",
    },
    choose: {
      fr: "Choisir un point relais Pickup",
      en: "Choose a Pickup point",
      es: "Elegir un punto Pickup",
      de: "Pickup Abholstelle auswählen",
      it: "Scegli un punto Pickup",
      nl: "Kies een Pickup afhaalpunt",
    },
    selected: {
      fr: "Point relais sélectionné",
      en: "Selected pickup point",
      es: "Punto seleccionado",
      de: "Ausgewählte Abholstelle",
      it: "Punto selezionato",
      nl: "Gekozen afhaalpunt",
    },
    Component: ComingSoon("Pickup"),
  },

  colissimo: {
    label: {
      fr: "Point relais Colissimo",
      en: "Colissimo pickup point",
      es: "Punto Colissimo",
      de: "Colissimo Abholstelle",
      it: "Punto Colissimo",
      nl: "Colissimo afhaalpunt",
    },
    choose: {
      fr: "Choisir un point relais Colissimo",
      en: "Choose a Colissimo pickup point",
      es: "Elegir un punto Colissimo",
      de: "Colissimo Abholstelle auswählen",
      it: "Scegli un punto Colissimo",
      nl: "Kies een Colissimo afhaalpunt",
    },
    selected: {
      fr: "Point relais sélectionné",
      en: "Selected pickup point",
      es: "Punto seleccionado",
      de: "Ausgewählte Abholstelle",
      it: "Punto selezionato",
      nl: "Gekozen afhaalpunt",
    },
    Component: ComingSoon("Colissimo"),
  },

  "relais-colis": {
    label: {
      fr: "Relais Colis",
      en: "Relais Colis",
      es: "Relais Colis",
      de: "Relais Colis",
      it: "Relais Colis",
      nl: "Relais Colis",
    },
    choose: {
      fr: "Choisir un point Relais Colis",
      en: "Choose a Relais Colis pickup point",
      es: "Elegir un punto Relais Colis",
      de: "Relais Colis Abholstelle auswählen",
      it: "Scegli un punto Relais Colis",
      nl: "Kies een Relais Colis afhaalpunt",
    },
    selected: {
      fr: "Point relais sélectionné",
      en: "Selected pickup point",
      es: "Punto seleccionado",
      de: "Ausgewählte Abholstelle",
      it: "Punto selezionato",
      nl: "Gekozen afhaalpunt",
    },
    Component: ComingSoon("Relais Colis"),
  },
};
