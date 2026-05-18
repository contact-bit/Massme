"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ShippingMethod,
  RelayPoint,
} from "@/components/shipping/types";

import RelayPointMondialRelay from "@/components/shipping/mondialrelay/RelayPointMondialRelay";

import "./choose-shipping-method.css";

type Locale =
  | "fr"
  | "en";

type Props = {
  methods: ShippingMethod[];

  onSelect: (
    m: ShippingMethod
  ) => void;

  onRelayChosen: (
    relay: RelayPoint | null
  ) => void;

  locale: Locale;

  error?: string | null;
};

/* =====================================================
   UTILS
===================================================== */

function round2(n: number) {
  return (
    Math.round(n * 100) / 100
  );
}

/* =====================================================
   COMPONENT
===================================================== */

export default function ChooseShippingMethod({
  methods,
  onSelect,
  onRelayChosen,
  locale,
  error,
}: Props) {
  const [selected, setSelected] =
    useState<ShippingMethod | null>(
      null
    );

  const [
    relayPoint,
    setRelayPoint,
  ] =
    useState<RelayPoint | null>(
      null
    );

  /* =====================================================
     SELECT
  ===================================================== */

  function selectMethod(
    method: ShippingMethod
  ) {
    setSelected(method);

    onSelect(method);

    if (
      method.type !==
      "relay"
    ) {
      setRelayPoint(null);

      onRelayChosen(null);
    }
  }

  /* =====================================================
     RELAY
  ===================================================== */

  function handleRelayChosen(
    point: RelayPoint
  ) {
    setRelayPoint(point);

    onRelayChosen(point);
  }

  /* =====================================================
     PRICE TTC
  ===================================================== */

  function priceTTC(
    method: ShippingMethod
  ) {
    if (
      !method.vatRate ||
      method.vatRate <= 0
    ) {
      return method.priceHT;
    }

    return round2(
      method.priceHT *
        (1 +
          method.vatRate /
            100)
    );
  }

  /* =====================================================
     I18N
  ===================================================== */

  const t = {
    title:
      locale === "fr"
        ? "Méthode de livraison"
        : "Shipping method",

    relay:
      locale === "fr"
        ? "Point relais"
        : "Pickup point",

    chooseRelay:
      locale === "fr"
        ? "Choisir un point relais"
        : "Choose pickup point",

    selectedRelay:
      locale === "fr"
        ? "Point relais sélectionné"
        : "Selected pickup point",

    free:
      locale === "fr"
        ? "Gratuit"
        : "Free",
  };

  /* =====================================================
     SORT
  ===================================================== */

  const orderedMethods =
    useMemo(
      () =>
        [...methods].sort(
          (a, b) =>
            (a.sortOrder ??
              999) -
            (b.sortOrder ??
              999)
        ),
      [methods]
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="csm">

      {/* HEADER */}
      <div className="csm-head">

        <div className="csm-kicker">
          SHIPPING
        </div>

        <h2 className="csm-title">
          {t.title}
        </h2>

      </div>

      {/* ERROR */}
      {error && (
        <div className="csm-error">
          {error}
        </div>
      )}

      {/* METHODS */}
      <div className="csm-list">

        {orderedMethods.map(
          (method) => {
            const isSelected =
              selected?.id ===
              method.id;

            const price =
              priceTTC(method);

            return (
              <button
                key={method.id}
                type="button"
                onClick={() =>
                  selectMethod(
                    method
                  )
                }
                className={`csm-card ${
                  isSelected
                    ? "active"
                    : ""
                }`}
              >

                {/* TOP */}
                <div className="csm-card-top">

                  <div className="csm-main">

                    <div className="csm-name-row">

                      <h3 className="csm-name">
                        {
                          method.name
                        }
                      </h3>

                      {method.type ===
                        "relay" && (
                        <div className="csm-badge">
                          {
                            t.relay
                          }
                        </div>
                      )}

                    </div>

                    <div className="csm-delay">
                      {
                        method.delay
                      }
                    </div>

                  </div>

                  {/* PRICE */}
                  <div className="csm-price-wrap">

                    <div className="csm-price">

                      {price <=
                      0
                        ? t.free
                        : `${price.toFixed(
                            2
                          )}€`}

                    </div>

                    <div className="csm-price-meta">

                      {method.priceHT.toFixed(
                        2
                      )}
                      € HT

                      {method.vatRate
                        ? ` • TVA ${method.vatRate}%`
                        : ""}

                    </div>

                  </div>

                </div>

                {/* GLOW */}
                <div className="csm-glow" />

              </button>
            );
          }
        )}

      </div>

      {/* RELAY */}
      {selected?.type ===
        "relay" && (
        <div className="csm-relay">

          <div className="csm-relay-head">

            <div className="csm-kicker">
              RELAY
            </div>

            <h3 className="csm-relay-title">
              {t.chooseRelay}
            </h3>

          </div>

          <div className="csm-relay-picker">

            <RelayPointMondialRelay
              onSelect={
                handleRelayChosen
              }
              country={
                selected.country
              }
              locale={
                locale
              }
            />

          </div>

          {/* SELECTED */}
          {relayPoint && (
            <div className="csm-relay-selected">

              <div className="csm-selected-kicker">
                {
                  t.selectedRelay
                }
              </div>

              <div className="csm-selected-name">
                {
                  relayPoint.name
                }
              </div>

              <div className="csm-selected-address">

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

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}