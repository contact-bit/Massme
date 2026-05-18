"use client";

import {
  useMemo,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

import type { PaymentMethod } from "./types";

import "./choose-payment.css";

type Props = {
  methods: PaymentMethod[];

  locale: Locale;

  onMethodSelect: (
    method: PaymentMethod | null
  ) => void;

  error?: string | null;
};

/* =====================================================
   UI
===================================================== */

const UI: Record<
  Locale,
  {
    title: string;

    subtitle: string;

    secure: string;
  }
> = {
  fr: {
    title:
      "Méthode de paiement",

    subtitle:
      "Choisissez votre mode de paiement sécurisé.",

    secure:
      "Paiement sécurisé",
  },

  en: {
    title:
      "Payment method",

    subtitle:
      "Choose your secure payment method.",

    secure:
      "Secure payment",
  },

  es: {
    title:
      "Método de pago",

    subtitle:
      "Elige tu método de pago seguro.",

    secure:
      "Pago seguro",
  },

  de: {
    title:
      "Zahlungsmethode",

    subtitle:
      "Wähle deine sichere Zahlungsmethode.",

    secure:
      "Sichere Zahlung",
  },

  it: {
    title:
      "Metodo di pagamento",

    subtitle:
      "Scegli il tuo metodo di pagamento sicuro.",

    secure:
      "Pagamento sicuro",
  },

  nl: {
    title:
      "Betaalmethode",

    subtitle:
      "Kies je veilige betaalmethode.",

    secure:
      "Veilige betaling",
  },
};

/* =====================================================
   COMPONENT
===================================================== */

export default function ChoosePayment({
  methods,
  locale,
  onMethodSelect,
  error,
}: Props) {
  const [selected, setSelected] =
    useState<PaymentMethod | null>(
      null
    );

  const t =
    UI[locale] ?? UI.fr;

  /* =====================================================
     FILTER
  ===================================================== */

  const visibleMethods =
    useMemo(
      () =>
        methods
          .filter(
            (m) =>
              m.isActive !==
              false
          )
          .slice()
          .sort(
            (a, b) =>
              (a.sortOrder ??
                999) -
              (b.sortOrder ??
                999)
          ),
      [methods]
    );

  if (
    visibleMethods.length ===
    0
  ) {
    return null;
  }

  /* =====================================================
     SELECT
  ===================================================== */

  function select(
    method: PaymentMethod
  ) {
    setSelected(method);

    onMethodSelect(method);
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="cp">

      {/* HEAD */}
      <div className="cp-head">

        <div className="cp-kicker">
          PAYMENT
        </div>

        <h2 className="cp-title">
          {t.title}
        </h2>

        <p className="cp-subtitle">
          {t.subtitle}
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="cp-error">
          {error}
        </div>
      )}

      {/* LIST */}
      <div className="cp-list">

        {visibleMethods.map(
          (method) => {
            const isSelected =
              selected?.id ===
              method.id;

            const label =
              (
                method.name as any
              )?.[locale] ??
              (
                method.name as any
              )?.fr ??
              "—";

            const description =
              (
                method.description as any
              )?.[locale] ??
              (
                method.description as any
              )?.fr ??
              "";

            return (
              <button
                key={
                  method.id
                }
                type="button"
                onClick={() =>
                  select(method)
                }
                className={`cp-card ${
                  isSelected
                    ? "active"
                    : ""
                }`}
              >

                {/* GLOW */}
                <div className="cp-glow" />

                {/* CONTENT */}
                <div className="cp-card-content">

                  {/* LEFT */}
                  <div className="cp-main">

                    <div className="cp-name-row">

                      <h3 className="cp-name">
                        {label}
                      </h3>

                      <div className="cp-badge">
                        {
                          t.secure
                        }
                      </div>

                    </div>

                    {description && (
                      <p className="cp-description">
                        {
                          description
                        }
                      </p>
                    )}

                  </div>

                  {/* RIGHT */}
                  <div className="cp-provider-wrap">

                    <div className="cp-provider">
                      {
                        method.provider
                      }
                    </div>

                    <div
                      className={`cp-radio ${
                        isSelected
                          ? "active"
                          : ""
                      }`}
                    />

                  </div>

                </div>

              </button>
            );
          }
        )}

      </div>

    </section>
  );
}