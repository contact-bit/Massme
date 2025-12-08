"use client";

import { useState } from "react";
import {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

type Locale = "fr" | "en";

type ChooseShippingProps = {
  methods: ShippingMethod[];
  onMethodSelect: (method: ShippingMethod) => void;
  onRelaySelect: (relay: RelayPoint | null) => void;
  /** Message d’erreur global (déjà localisé par le parent) */
  error?: string | null;
  locale: Locale;
};

export default function ChooseShipping({
  methods,
  onMethodSelect,
  onRelaySelect,
  error,
  locale,
}: ChooseShippingProps) {
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(
    null
  );
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);

  function selectMethod(method: ShippingMethod) {
    setSelectedMethod(method);
    onMethodSelect(method);

    // si on quitte le mode "relay", on nettoie le point relais
    if (method.type !== "relay") {
      setRelayPoint(null);
      onRelaySelect(null);
    }
  }

  function handleRelaySelect(point: RelayPoint) {
    setRelayPoint(point);
    onRelaySelect(point);
  }

  const t = {
    title: locale === "fr" ? "Méthode de livraison" : "Shipping method",
    subtitle:
      locale === "fr"
        ? "Choisissez votre mode de livraison :"
        : "Choose your shipping method:",
    relayBadge:
      locale === "fr"
        ? "Point relais Mondial Relay"
        : "Mondial Relay pickup point",
    mbeLink:
      locale === "fr"
        ? "+ d'infos sur le point MBE"
        : "More info about the MBE point",
    relayBlockTitle:
      locale === "fr"
        ? "Choisir un point relais Mondial Relay"
        : "Choose a Mondial Relay pickup point",
  };

  return (
    <div className="space-y-4">
      {/* TITRE GLOBAL */}
      <div>
        <h2 className="font-semibold text-lg">{t.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* MESSAGE ERREUR GLOBAL */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* LISTE DES MÉTHODES */}
      <div className="space-y-3">
        {methods
          .filter((m) => m.isActive !== false)
          .map((m) => {
            const isSelected = selectedMethod?.id === m.id;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMethod(m)}
                className={`w-full flex items-start justify-between gap-3 border p-4 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <div className="flex-1">
                  {/* Ligne ex: "Point relais — 6,75 €" */}
                  <p className="font-semibold">
                    {m.name} — {m.price.toFixed(2)} €
                  </p>
                  <p className="text-sm text-gray-600">{m.delay}</p>

                  {m.type === "relay" && (
                    <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded mt-2 inline-block">
                      {t.relayBadge}
                    </span>
                  )}

                  {/* Cas particulier : retrait MBE avec lien d’info */}
                  {m.id === "pickup_mbe" && m.moreInfoUrl && (
                    <a
                      href={m.moreInfoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline mt-2 inline-block"
                    >
                      {t.mbeLink}
                    </a>
                  )}
                </div>

                {/* Petit rond radio-style */}
                <span
                  className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-blue-600" : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                  )}
                </span>
              </button>
            );
          })}
      </div>

      {/* BLOC POINT RELAIS MONDIAL RELAY */}
      {selectedMethod?.type === "relay" && (
        <div className="border p-4 rounded-lg mt-2 bg-white shadow-sm">
          <h3 className="font-semibold mb-2">{t.relayBlockTitle}</h3>

          {/* Widget Mondial Relay */}
          <RelayPointMondialRelay onSelect={handleRelaySelect} />

          {/* Récap du point sélectionné */}
          {relayPoint && (
            <div className="mt-3 text-sm bg-gray-100 p-3 rounded">
              <p className="font-bold">{relayPoint.name}</p>
              <p>{relayPoint.address}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
              {relayPoint.country && <p>{relayPoint.country}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
