"use client";

import { useMemo, useState } from "react";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";
import type { Locale } from "@/lib/i18n";
import { computePrice } from "@/lib/pricing";

/* =====================================================
   PROPS
===================================================== */
type ChooseShippingProps = {
  methods: ShippingMethod[];
  locale: Locale;

  onMethodSelect: (method: ShippingMethod | null) => void;
  onRelaySelect: (relay: RelayPoint | null) => void;

  error?: string | null;
};

/* =====================================================
   UI TEXT
===================================================== */
const UI: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    relayBadge: string;
    relayBlockTitle: string;
    selectedRelayTitle: string;
    vatIncluded: string;
  }
> = {
  fr: {
    title: "Méthode de livraison",
    subtitle: "Choisissez votre mode de livraison :",
    relayBadge: "Point relais Mondial Relay",
    relayBlockTitle: "Choisir un point relais Mondial Relay",
    selectedRelayTitle: "Point relais sélectionné",
    vatIncluded: "TVA incluse",
  },
  en: {
    title: "Shipping method",
    subtitle: "Choose your shipping method:",
    relayBadge: "Mondial Relay pickup point",
    relayBlockTitle: "Choose a Mondial Relay pickup point",
    selectedRelayTitle: "Selected pickup point",
    vatIncluded: "VAT included",
  },
  es: {
    title: "Método de envío",
    subtitle: "Elige tu método de envío:",
    relayBadge: "Punto de recogida Mondial Relay",
    relayBlockTitle: "Elegir un punto de recogida Mondial Relay",
    selectedRelayTitle: "Punto seleccionado",
    vatIncluded: "IVA incluido",
  },
  de: {
    title: "Versandart",
    subtitle: "Wähle deine Versandart:",
    relayBadge: "Mondial Relay Abholstelle",
    relayBlockTitle: "Mondial Relay Abholstelle auswählen",
    selectedRelayTitle: "Ausgewählte Abholstelle",
    vatIncluded: "MwSt. enthalten",
  },
  it: {
    title: "Metodo di spedizione",
    subtitle: "Scegli il tuo metodo di spedizione:",
    relayBadge: "Punto di ritiro Mondial Relay",
    relayBlockTitle: "Scegli un punto di ritiro Mondial Relay",
    selectedRelayTitle: "Punto selezionato",
    vatIncluded: "IVA inclusa",
  },
  nl: {
    title: "Verzendmethode",
    subtitle: "Kies je verzendmethode:",
    relayBadge: "Mondial Relay afhaalpunt",
    relayBlockTitle: "Kies een Mondial Relay afhaalpunt",
    selectedRelayTitle: "Gekozen afhaalpunt",
    vatIncluded: "BTW inbegrepen",
  },
};

/* =====================================================
   COMPONENT
===================================================== */
export default function ChooseShipping({
  methods,
  locale,
  onMethodSelect,
  onRelaySelect,
  error,
}: ChooseShippingProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] =
    useState<RelayPoint | null>(null);

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

  if (visibleMethods.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {visibleMethods.map((m) => {
          const isSelected = selectedMethod?.id === m.id;

          const price = computePrice({
            priceHT: m.priceHT,
            vatRate: m.vatRate,
          });

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMethod(m)}
              className={`w-full flex justify-between gap-4 border rounded-lg p-4 text-left transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">{m.name}</p>

                {m.delay && (
                  <p className="text-sm text-gray-600">{m.delay}</p>
                )}

                {m.vatRate && m.vatRate > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.vatIncluded} ({m.vatRate}%)
                  </p>
                )}

                {m.type === "relay" && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                    {t.relayBadge}
                  </span>
                )}
              </div>

              {/* ✅ PRIX TTC CALCULÉ (TVA SAFE) */}
              <div className="font-semibold whitespace-nowrap">
                {price.ttc.toFixed(2)} €
              </div>
            </button>
          );
        })}
      </div>

      {selectedMethod?.type === "relay" && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-2">
            {t.relayBlockTitle}
          </h3>

          <RelayPointMondialRelay onSelect={handleRelaySelect} />

          {relayPoint && (
            <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
              <p className="font-semibold">
                {t.selectedRelayTitle}
              </p>
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
    </section>
  );
}
