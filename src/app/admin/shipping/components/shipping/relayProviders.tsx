"use client";

import React from "react";

// ✅ IMPORT ABSOLU (IMPORTANT)
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

/* =====================================================
   TYPES
===================================================== */

type Locale = "fr" | "en";

export type RelayProviderKey =
  | "mondialrelay"
  | "ups"
  | "colissimo";

type RelayProviderConfig = {
  label: Record<Locale, string>;
  choose: Record<Locale, string>;
  Component: React.FC<{ onSelect: (p: any) => void }>;
};

/* =====================================================
   PLACEHOLDER (UPS / COLISSIMO)
===================================================== */

const ComingSoon =
  (name: string): RelayProviderConfig["Component"] =>
  () =>
    (
      <div className="p-4 text-sm rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
        🚧 <strong>{name}</strong> bientôt disponible
      </div>
    );

/* =====================================================
   PROVIDERS
===================================================== */

export const RELAY_PROVIDERS: Record<
  RelayProviderKey,
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
