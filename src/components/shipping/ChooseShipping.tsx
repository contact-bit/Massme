"use client";

import { useMemo, useState } from "react";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";
import type { Locale } from "@/lib/i18n"; // ✅ ton type global

type ChooseShippingProps = {
  methods: ShippingMethod[];
  onMethodSelect: (method: ShippingMethod) => void;
  onRelaySelect: (relay: RelayPoint | null) => void;
  error?: string | null;
  locale: Locale;
};

/** ✅ UI textes (6 langues) */
const UI: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    relayBadge: string;
    mbeLink: string;
    relayBlockTitle: string;
    selectedRelayTitle: string;
  }
> = {
  fr: {
    title: "Méthode de livraison",
    subtitle: "Choisissez votre mode de livraison :",
    relayBadge: "Point relais Mondial Relay",
    mbeLink: "+ d'infos sur le point MBE",
    relayBlockTitle: "Choisir un point relais Mondial Relay",
    selectedRelayTitle: "Point relais sélectionné",
  },
  en: {
    title: "Shipping method",
    subtitle: "Choose your shipping method:",
    relayBadge: "Mondial Relay pickup point",
    mbeLink: "More info about the MBE point",
    relayBlockTitle: "Choose a Mondial Relay pickup point",
    selectedRelayTitle: "Selected pickup point",
  },
  es: {
    title: "Método de envío",
    subtitle: "Elige tu método de envío:",
    relayBadge: "Punto de recogida Mondial Relay",
    mbeLink: "Más info sobre el punto MBE",
    relayBlockTitle: "Elegir un punto de recogida Mondial Relay",
    selectedRelayTitle: "Punto seleccionado",
  },
  de: {
    title: "Versandart",
    subtitle: "Wähle deine Versandart:",
    relayBadge: "Mondial Relay Abholstelle",
    mbeLink: "Mehr Infos zum MBE-Punkt",
    relayBlockTitle: "Mondial Relay Abholstelle auswählen",
    selectedRelayTitle: "Ausgewählte Abholstelle",
  },
  it: {
    title: "Metodo di spedizione",
    subtitle: "Scegli il tuo metodo di spedizione:",
    relayBadge: "Punto di ritiro Mondial Relay",
    mbeLink: "Maggiori info sul punto MBE",
    relayBlockTitle: "Scegli un punto di ritiro Mondial Relay",
    selectedRelayTitle: "Punto selezionato",
  },
  nl: {
    title: "Verzendmethode",
    subtitle: "Kies je verzendmethode:",
    relayBadge: "Mondial Relay afhaalpunt",
    mbeLink: "Meer info over het MBE-punt",
    relayBlockTitle: "Kies een Mondial Relay afhaalpunt",
    selectedRelayTitle: "Gekozen afhaalpunt",
  },
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

  // ✅ fallback si jamais locale inattendue
  const t = UI[locale] ?? UI.fr;

  const visibleMethods = useMemo(
    () => methods.filter((m) => m.isActive !== false),
    [methods]
  );

  function selectMethod(method: ShippingMethod) {
    setSelectedMethod(method);
    onMethodSelect(method);

    if (method.type !== "relay") {
      setRelayPoint(null);
      onRelaySelect(null);
    }
  }

  function handleRelaySelect(point: RelayPoint) {
    setRelayPoint(point);
    onRelaySelect(point);
  }

  return (
    <div className="space-y-4">
      {/* TITRE GLOBAL */}
      <div>
        <h2 className="font-semibold text-lg">{t.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* MESSAGE ERREUR GLOBAL */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* LISTE DES MÉTHODES */}
      <div className="space-y-3">
        {visibleMethods.map((m) => {
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
              <div className="flex-1 text-left">
                <p className="font-semibold">
                  {m.name} — {m.price.toFixed(2)} €
                </p>

                {m.delay ? (
                  <p className="text-sm text-gray-600">{m.delay}</p>
                ) : null}

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
                    onClick={(e) => e.stopPropagation()} // ✅ évite de re-cliquer le bouton
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
              <p className="font-semibold mb-1">{t.selectedRelayTitle}</p>
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
