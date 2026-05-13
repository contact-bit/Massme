"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";

import { RELAY_PROVIDERS } from "@/components/shipping/relayProviders";

import type { Locale } from "@/lib/i18n";

import { computePrice } from "@/lib/pricing";

/* =====================================================
   PROPS
===================================================== */

type ChooseShippingProps = {
  methods: ShippingMethod[];

  locale: Locale;

  selectedMethod?: ShippingMethod | null;

  onMethodSelect: (
    method: ShippingMethod | null
  ) => void;

  onRelaySelect: (
    relay: RelayPoint | null
  ) => void;

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
    selected: string;
    relayPoint: string;
  }
> = {
  fr: {
    title:
      "Méthode de livraison",

    subtitle:
      "Choisissez votre mode de livraison.",

    vatIncluded:
      "TVA incluse",

    selected:
      "Sélectionnée",

    relayPoint:
      "Point relais sélectionné",
  },

  en: {
    title:
      "Shipping method",

    subtitle:
      "Choose your shipping method.",

    vatIncluded:
      "VAT included",

    selected:
      "Selected",

    relayPoint:
      "Selected pickup point",
  },

  es: {
    title:
      "Método de envío",

    subtitle:
      "Elige tu método de envío.",

    vatIncluded:
      "IVA incluido",

    selected:
      "Seleccionado",

    relayPoint:
      "Punto de recogida seleccionado",
  },

  de: {
    title:
      "Versandart",

    subtitle:
      "Wähle deine Versandart.",

    vatIncluded:
      "MwSt. enthalten",

    selected:
      "Ausgewählt",

    relayPoint:
      "Ausgewählter Abholpunkt",
  },

  it: {
    title:
      "Metodo di spedizione",

    subtitle:
      "Scegli il tuo metodo di spedizione.",

    vatIncluded:
      "IVA inclusa",

    selected:
      "Selezionato",

    relayPoint:
      "Punto di ritiro selezionato",
  },

  nl: {
    title:
      "Verzendmethode",

    subtitle:
      "Kies je verzendmethode.",

    vatIncluded:
      "BTW inbegrepen",

    selected:
      "Geselecteerd",

    relayPoint:
      "Geselecteerd afhaalpunt",
  },
};

/* =====================================================
   COMPONENT
===================================================== */

export default function ChooseShipping({
  methods,
  locale,
  selectedMethod:
    initialSelectedMethod,
  onMethodSelect,
  onRelaySelect,
  error,
}: ChooseShippingProps) {
  const t =
    UI[locale] ??
    UI.fr;

  const [
    selectedMethod,
    setSelectedMethod,
  ] = useState<
    ShippingMethod | null
  >(
    initialSelectedMethod ??
      null
  );

  const [
    relayPoint,
    setRelayPoint,
  ] = useState<
    RelayPoint | null
  >(null);

  /* =====================================================
     SORT METHODS
  ===================================================== */

  const visibleMethods =
    useMemo(() => {
      return methods
        .filter(
          (method) =>
            method.isActive !==
            false
        )
        .slice()
        .sort((a, b) => {
          const aOrder =
            a.sortOrder ??
            999;

          const bOrder =
            b.sortOrder ??
            999;

          return (
            aOrder - bOrder
          );
        });
    }, [methods]);

  /* =====================================================
     RELAY CONFIG
  ===================================================== */

  const relayConfig =
    selectedMethod?.type ===
      "relay" &&
    selectedMethod
      .relayProvider
      ? RELAY_PROVIDERS[
          selectedMethod
            .relayProvider
        ]
      : null;

  const RelayComponent =
    relayConfig?.Component;

  /* =====================================================
     HANDLERS
  ===================================================== */

  function selectMethod(
    method: ShippingMethod
  ) {
    setSelectedMethod(
      method
    );

    onMethodSelect(
      method
    );

    if (
      method.type !==
      "relay"
    ) {
      setRelayPoint(
        null
      );

      onRelaySelect(
        null
      );
    }
  }

  function handleRelaySelect(
    point: RelayPoint
  ) {
    setRelayPoint(
      point
    );

    onRelaySelect(
      point
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (
    visibleMethods.length ===
    0
  ) {
    return null;
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="space-y-6">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {t.title}
        </h2>

        <p className="text-sm text-neutral-500">
          {t.subtitle}
        </p>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =========================================
          METHODS
      ========================================= */}

      <div className="space-y-4">
        {visibleMethods.map(
          (method) => {
            const isSelected =
              selectedMethod?.id ===
              method.id;

            const price =
              computePrice({
                priceHT:
                  method.priceHT,

                vatRate:
                  method.vatRate,
              });

            const providerConfig =
              method.type ===
                "relay" &&
              method.relayProvider
                ? RELAY_PROVIDERS[
                    method
                      .relayProvider
                  ]
                : null;

            return (
              <button
                key={
                  method.id
                }
                type="button"
                onClick={() =>
                  selectMethod(
                    method
                  )
                }
                className={`
                  group
                  relative
                  w-full
                  overflow-hidden
                  rounded-3xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-300
                  ${
                    isSelected
                      ? `
                        border-blue-500
                        bg-blue-50/80
                        shadow-[0_10px_40px_rgba(59,130,246,0.12)]
                      `
                      : `
                        border-neutral-200
                        bg-white
                        hover:border-neutral-300
                        hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                      `
                  }
                `}
              >

                {/* Glow */}
                <div
                  className={`
                    absolute
                    inset-0
                    opacity-0
                    transition-opacity
                    duration-300
                    ${
                      isSelected
                        ? "opacity-100"
                        : ""
                    }
                  `}
                >
                  <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
                </div>

                <div className="relative flex items-start justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-base font-semibold text-neutral-950">
                        {
                          method.name
                        }
                      </h3>

                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          {
                            t.selected
                          }
                        </span>
                      )}

                      {providerConfig && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                          {
                            providerConfig
                              .label[
                              locale
                            ]
                          }
                        </span>
                      )}
                    </div>

                    {method.delay && (
                      <p className="mt-2 text-sm text-neutral-500">
                        {
                          method.delay
                        }
                      </p>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end text-right">

                    <span className="text-xl font-bold tracking-tight text-neutral-950">
                      {price.ttc.toFixed(
                        2
                      )}{" "}
                      €
                    </span>

                    {method.vatRate >
                      0 && (
                      <span className="mt-1 text-xs text-neutral-500">
                        {
                          t.vatIncluded
                        }{" "}
                        (
                        {
                          method.vatRate
                        }
                        %)
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* =========================================
          RELAY
      ========================================= */}

      {selectedMethod?.type ===
        "relay" &&
        relayConfig &&
        RelayComponent && (
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

            <div className="border-b border-neutral-100 px-6 py-5">
              <h3 className="text-lg font-semibold text-neutral-950">
                {
                  relayConfig
                    .choose[
                    locale
                  ]
                }
              </h3>
            </div>

            <div className="p-6">
              <RelayComponent
                onSelect={
                  handleRelaySelect
                }
                country={
                  selectedMethod.country
                }
                locale={
                  locale
                }
              />

              {relayPoint && (
                <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    {
                      t.relayPoint
                    }
                  </p>

                  <div className="space-y-1 text-sm text-neutral-700">

                    <p className="text-base font-semibold text-neutral-950">
                      {
                        relayPoint.name
                      }
                    </p>

                    <p>
                      {
                        relayPoint.address
                      }
                    </p>

                    <p>
                      {
                        relayPoint.postalCode
                      }{" "}
                      {
                        relayPoint.city
                      }
                    </p>

                    {relayPoint.country && (
                      <p>
                        {
                          relayPoint.country
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </section>
  );
}