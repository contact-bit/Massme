"use client";

import React from "react";
import type { RelayProvider } from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

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
      <div className="p-4 text-sm rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
        🚧 <strong>{name}</strong> bientôt disponible
      </div>
    );

export const RELAY_PROVIDERS: Record<
  RelayProvider,
  RelayProviderConfig
> = {
  mondialrelay: {
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

  pickup: {
    label: {
      fr: "Point Pickup",
      en: "Pickup point",
    },
    choose: {
      fr: "Choisir un point Pickup",
      en: "Choose a Pickup point",
    },
    Component: ComingSoon("Pickup"),
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

  "relais-colis": {
    label: {
      fr: "Relais Colis",
      en: "Relais Colis",
    },
    choose: {
      fr: "Choisir un point Relais Colis",
      en: "Choose a Relais Colis pickup point",
    },
    Component: ComingSoon("Relais Colis"),
  },
};
