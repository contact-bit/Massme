// src/components/shipping/relayProviders.tsx

import type { RelayProvider } from "@/components/shipping/types";
import type { Locale } from "@/lib/i18n";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

/* =====================================================
   TYPES
===================================================== */
type RelayProviderConfig = {
  label: Record<Locale, string>;
  choose: Record<Locale, string>;
  selected: Record<Locale, string>;
  Component: React.FC<{ onSelect: (relay: any) => void }>;
};

/* =====================================================
   REGISTRY
===================================================== */
export const RELAY_PROVIDERS: Record<
  RelayProvider,
  RelayProviderConfig
> = {
  mondial_relay: {
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

  /* ----------------------------------
     PROVIDERS À VENIR
  ---------------------------------- */
  ups: {
    label: {
      fr: "UPS Access Point",
      en: "UPS Access Point",
      es: "UPS Access Point",
      de: "UPS Access Point",
      it: "UPS Access Point",
      nl: "UPS Access Point",
    },
    choose: {
      fr: "Choisir un point relais UPS",
      en: "Choose a UPS pickup point",
      es: "Elegir un punto UPS",
      de: "UPS Abholstelle auswählen",
      it: "Scegli un punto UPS",
      nl: "Kies een UPS afhaalpunt",
    },
    selected: {
      fr: "Point relais sélectionné",
      en: "Selected pickup point",
      es: "Punto seleccionado",
      de: "Ausgewählte Abholstelle",
      it: "Punto selezionato",
      nl: "Gekozen afhaalpunt",
    },
    Component: () => (
      <div className="p-4 text-sm rounded bg-yellow-50 text-yellow-800">
        🚧 UPS bientôt disponible
      </div>
    ),
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
    Component: () => (
      <div className="p-4 text-sm rounded bg-yellow-50 text-yellow-800">
        🚧 Colissimo bientôt disponible
      </div>
    ),
  },

  relais_colis: {
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
    Component: () => (
      <div className="p-4 text-sm rounded bg-yellow-50 text-yellow-800">
        🚧 Relais Colis bientôt disponible
      </div>
    ),
  },
};
