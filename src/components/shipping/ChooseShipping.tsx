"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiClock,
  FiMapPin,
  FiTruck,
} from "react-icons/fi";

import type {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";

import { RELAY_PROVIDERS } from "@/components/shipping/relayProviders";

import type { Locale } from "@/lib/i18n";

import { computePrice } from "@/lib/pricing";

import "./ChooseShipping.css";

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
    recommended: string;
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

    recommended:
      "Recommandé",
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

    recommended:
      "Recommended",
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

    recommended:
      "Recomendado",
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

    recommended:
      "Empfohlen",
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

    recommended:
      "Consigliato",
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

    recommended:
      "Aanbevolen",
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
    <section className="choose-shipping">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="choose-shipping-header">

        <span className="choose-shipping-kicker">
          Livraison
        </span>

        <div>

          <h2 className="choose-shipping-title">
            {t.title}
          </h2>

          <p className="choose-shipping-description">
            {t.subtitle}
          </p>

        </div>

      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="choose-shipping-error">

          <p>
            {error}
          </p>

        </div>
      )}

      {/* =========================================
          METHODS
      ========================================= */}

      <div className="choose-shipping-grid">

        {visibleMethods.map(
          (
            method,
            index
          ) => {

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
                  choose-shipping-card
                  ${
                    isSelected
                      ? "choose-shipping-card-selected"
                      : ""
                  }
                `}
              >

                {/* Glow */}

                <div className="choose-shipping-card-glow" />

                {/* Recommended */}

                {index === 0 && (
                  <div className="choose-shipping-recommended">

                    <FiCheck />

                    <span>
                      {
                        t.recommended
                      }
                    </span>

                  </div>
                )}

                {/* Top */}

                <div className="choose-shipping-card-top">

                  {/* Left */}

                  <div className="choose-shipping-card-left">

                    <div className="choose-shipping-icon">

                      {method.type ===
                      "relay" ? (
                        <FiMapPin />
                      ) : (
                        <FiTruck />
                      )}

                    </div>

                    <div className="choose-shipping-card-content">

                      <div className="choose-shipping-card-title-row">

                        <h3 className="choose-shipping-card-title">
                          {
                            method.name
                          }
                        </h3>

                        {isSelected && (
                          <span className="choose-shipping-selected-badge">
                            {
                              t.selected
                            }
                          </span>
                        )}

                      </div>

                      {method.delay && (
                        <div className="choose-shipping-delay">

                          <FiClock />

                          <span>
                            {
                              method.delay
                            }
                          </span>

                        </div>
                      )}

                      {providerConfig && (
                        <div className="choose-shipping-provider">

                          {
                            providerConfig
                              .label[
                              locale
                            ]
                          }

                        </div>
                      )}

                    </div>

                  </div>

                  {/* Right */}

                  <div className="choose-shipping-price">

                    <strong>
                      {price.ttc.toFixed(
                        2
                      )} €
                    </strong>

                    {method.vatRate >
                      0 && (
                      <span>
                        {
                          t.vatIncluded
                        }
                      </span>
                    )}

                    {method.appliedWeightKg ? (
                      <span>
                        {method.appliedWeightKg.toFixed(2)} kg
                      </span>
                    ) : null}

                  </div>

                </div>

                {/* Radio */}

                <div
                  className={`
                    choose-shipping-radio
                    ${
                      isSelected
                        ? "choose-shipping-radio-active"
                        : ""
                    }
                  `}
                >

                  <div className="choose-shipping-radio-dot" />

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

          <div className="choose-shipping-relay">

            <div className="choose-shipping-relay-header">

              <h3>
                {
                  relayConfig
                    .choose[
                    locale
                  ]
                }
              </h3>

            </div>

            <div className="choose-shipping-relay-content">

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

                <div className="choose-shipping-relay-selected">

                  <p className="choose-shipping-relay-kicker">

                    {
                      t.relayPoint
                    }

                  </p>

                  <div className="choose-shipping-relay-details">

                    <strong>
                      {
                        relayPoint.name
                      }
                    </strong>

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
