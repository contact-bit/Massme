"use client";

import { useMemo, useState } from "react";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import { RELAY_PROVIDERS } from "@/components/shipping/relayProviders";
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
    vatIncluded: string;
  }
> = {
  fr: {
    title: "Méthode de livraison",
    subtitle: "Choisissez votre mode de livraison :",
    vatIncluded: "TVA incluse",
  },
  en: {
    title: "Shipping method",
    subtitle: "Choose your shipping method:",
    vatIncluded: "VAT included",
  },
  es: {
    title: "Método de envío",
    subtitle: "Elige tu método de envío:",
    vatIncluded: "IVA incluido",
  },
  de: {
    title: "Versandart",
    subtitle: "Wähle deine Versandart:",
    vatIncluded: "MwSt. enthalten",
  },
  it: {
    title: "Metodo di spedizione",
    subtitle: "Scegli il tuo metodo di spedizione:",
    vatIncluded: "IVA inclusa",
  },
  nl: {
    title: "Verzendmethode",
    subtitle: "Kies je verzendmethode:",
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
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);

  const t = UI[locale] ?? UI.fr;

  /* Méthodes visibles (triées) */
  const visibleMethods = useMemo(
    () =>
      methods
        .filter((m) => m.isActive !== false)
        .slice()
        .sort((a, b) => {
          const aOrder = a.sortOrder ?? 999;
          const bOrder = b.sortOrder ?? 999;
          return aOrder - bOrder;
        }),
    [methods]
  );

  /* Provider relay sélectionné */
  const relayConfig =
    selectedMethod?.type === "relay" && selectedMethod.relayProvider
      ? RELAY_PROVIDERS[selectedMethod.relayProvider]
      : null;

  const RelayComponent = relayConfig?.Component;

  /* Handlers */
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
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* LISTE DES MÉTHODES */}
      <div className="space-y-3">
        {visibleMethods.map((m) => {
          const isSelected = selectedMethod?.id === m.id;

          const price = computePrice({
            priceHT: m.priceHT,
            vatRate: m.vatRate,
          });

          const providerConfig =
            m.type === "relay" && m.relayProvider
              ? RELAY_PROVIDERS[m.relayProvider]
              : null;

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
              {/* Colonne gauche : nom, délai, badge relay */}
              <div className="flex-1">
                <p className="font-semibold">{m.name}</p>

                {m.delay && (
                  <p className="text-sm text-gray-600">{m.delay}</p>
                )}

                {providerConfig && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                    {providerConfig.label[locale]}
                  </span>
                )}
              </div>

              {/* Colonne droite : prix TTC + TVA dessous */}
              <div className="shipping-price-col">
                <span className="shipping-price-ttc">
                  {price.ttc.toFixed(2)} €
                </span>

                {m.vatRate && m.vatRate > 0 && (
                  <span className="shipping-price-vat">
                    {t.vatIncluded} ({m.vatRate}%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* BLOC POINT RELAIS */}
      {selectedMethod?.type === "relay" &&
        relayConfig &&
        RelayComponent && (
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">
              {relayConfig.choose[locale]}
            </h3>

            <RelayComponent onSelect={handleRelaySelect} />

            {relayPoint && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                <p className="font-semibold">
                  {relayConfig.selected[locale]}
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
