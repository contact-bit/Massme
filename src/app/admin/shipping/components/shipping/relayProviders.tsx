import RelayPointMondialRelay from "./mondialrelay/RelayPointMondialRelay";

type Locale = "fr" | "en";

type RelayProviderConfig = {
  label: Record<Locale, string>;
  choose: Record<Locale, string>;
  Component: React.FC<{ onSelect: (p: any) => void }>;
};

const ComingSoon =
  (name: string): RelayProviderConfig["Component"] =>
  () =>
    (
      <div className="p-4 text-sm rounded bg-yellow-50 text-yellow-800">
        🚧 {name} bientôt disponible
      </div>
    );

export const RELAY_PROVIDERS: Record<
  string,
  RelayProviderConfig
> = {
  mondial_relay: {
    label: {
      fr: "Point relais Mondial Relay",
      en: "Mondial Relay pickup point",
    },
    choose: {
      fr: "Choisir un point relais Mondial Relay",
      en: "Choose a Mondial Relay pickup point",
    },
    Component: RelayPointMondialRelay,
  },

  ups: {
    label: {
      fr: "UPS Access Point",
      en: "UPS Access Point",
    },
    choose: {
      fr: "Choisir un point relais UPS",
      en: "Choose a UPS pickup point",
    },
    Component: ComingSoon("UPS"),
  },

  colissimo: {
    label: {
      fr: "Point relais Colissimo",
      en: "Colissimo pickup point",
    },
    choose: {
      fr: "Choisir un point relais Colissimo",
      en: "Choose a Colissimo pickup point",
    },
    Component: ComingSoon("Colissimo"),
  },
};
