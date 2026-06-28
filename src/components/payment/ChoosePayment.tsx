"use client";

import {
  useMemo,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

import type { PaymentMethod } from "@/types/payment";

import {
  FaPaypal,
  FaCreditCard,
  FaUniversity,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";

import {
  SiStripe,
} from "react-icons/si";

import "./ChoosePayment.css";

/* =====================================================
   PROPS
===================================================== */

type Props = {
  methods: PaymentMethod[];

  locale: Locale;

  selectedMethod?: PaymentMethod | null;

  onMethodSelect: (
    method: PaymentMethod | null
  ) => void;

  error?: string | null;
};

/* =====================================================
   UI
===================================================== */

const UI = {
  fr: {
    kicker:
      "Paiement sécurisé",

    title:
      "Comment souhaitez-vous payer ?",

    subtitle:
      "Toutes les transactions sont protégées par un chiffrement avancé pour garantir une expérience rapide, fiable et entièrement sécurisée.",

    selected:
      "Actif",

    protection:
      "Protection avancée",

    encrypted:
      "Connexion chiffrée SSL",

    instant:
      "Validation instantanée",
  },
};

/* =====================================================
   COMPONENT
===================================================== */

export default function ChoosePayment({
  methods,
  locale,
  selectedMethod:
    initialSelectedMethod,
  onMethodSelect,
  error,
}: Props) {

  const t =
    UI.fr;

  const [
    selected,
    setSelected,
  ] = useState<
    PaymentMethod | null
  >(
    initialSelectedMethod ??
      null
  );

  /* =====================================================
     METHODS
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
        .sort(
          (a, b) =>
            (a.sortOrder ??
              999) -
            (b.sortOrder ??
              999)
        );

    }, [methods]);

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
     SELECT
  ===================================================== */

  function select(
    method: PaymentMethod
  ) {

    setSelected(
      method
    );

    onMethodSelect(
      method
    );
  }

  /* =====================================================
     ICONS
  ===================================================== */

  function getIcon(
    provider: string
  ) {

    switch (provider) {

      case "paypal":
        return (
          <FaPaypal className="payment-method-logo" />
        );

      case "stripe":
        return (
          <SiStripe className="payment-method-logo" />
        );

      case "bank_transfer":
        return (
          <FaUniversity className="payment-method-logo" />
        );

      default:
        return (
          <FaCreditCard className="payment-method-logo" />
        );
    }
  }

  /* =====================================================
     PROVIDER DESCRIPTION
  ===================================================== */

  function getProviderText(
    provider: string
  ) {

    switch (provider) {

      case "paypal":
        return "Paiement sécurisé via votre compte PayPal ou carte bancaire.";

      case "stripe":
        return "Paiement ultra rapide et sécurisé par Stripe.";

      case "bank_transfer":
        return "Paiement direct depuis votre banque.";

      default:
        return "Paiement sécurisé.";
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="payment-methods">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="payment-methods-background" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="payment-methods-header">

        <div className="payment-methods-kicker">

          <FaLock />

          <span>
            {t.kicker}
          </span>

        </div>

        <div className="payment-methods-heading">

          <h2 className="payment-methods-title">
            {t.title}
          </h2>

          <p className="payment-methods-description">
            {t.subtitle}
          </p>

        </div>

      </div>

      {/* =====================================================
          TRUST
      ===================================================== */}

      <div className="payment-methods-trust">

        <div className="payment-methods-trust-item">

          <FaShieldAlt />

          <span>
            {t.protection}
          </span>

        </div>

        <div className="payment-methods-trust-item">

          <FaLock />

          <span>
            {t.encrypted}
          </span>

        </div>

        <div className="payment-methods-trust-item">

          ⚡

          <span>
            {t.instant}
          </span>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="payment-methods-error">

          {error}

        </div>
      )}

      {/* =====================================================
          METHODS
      ===================================================== */}

      <div className="payment-methods-list">

        {visibleMethods.map(
          (method) => {

            const isSelected =
              selected?.id ===
              method.id;

            const label =
              (
                method.name as Record<
                  string,
                  string
                >
              )?.[
                locale
              ] ??
              (
                method.name as Record<
                  string,
                  string
                >
              )?.fr ??
              "—";

            return (
              <button
                key={
                  method.id
                }

                type="button"

                onClick={() =>
                  select(
                    method
                  )
                }

                className={`
                  payment-method
                  ${
                    isSelected
                      ? "payment-method-active"
                      : ""
                  }
                `}
              >

                {/* GLOW */}

                <div className="payment-method-glow" />

                {/* CONTENT */}

                <div className="payment-method-left">

                  {/* ICON */}

                  <div className="payment-method-icon">

                    {getIcon(
                      method.provider
                    )}

                  </div>

                  {/* TEXT */}

                  <div className="payment-method-content">

                    <div className="payment-method-top">

                      <h3 className="payment-method-title">

                        {label}

                      </h3>

                      {isSelected && (

                        <span className="payment-method-selected">

                          {t.selected}

                        </span>
                      )}

                    </div>

                    <p className="payment-method-description">

                      {getProviderText(
                        method.provider
                      )}

                    </p>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="payment-method-right">

                  <div
                    className={`
                      payment-method-check
                      ${
                        isSelected
                          ? "payment-method-check-active"
                          : ""
                      }
                    `}
                  >

                    {isSelected && "✓"}

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
