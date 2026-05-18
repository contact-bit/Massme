"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  CountryCode,
} from "@/lib/shipping-i18n";

import {
  COUNTRY_LANGUAGE_MAP,
} from "@/lib/shipping-i18n";

import type {
  PaymentMethodProvider,
} from "../types";

import "./add-payment-method-form.css";

type Props = {
  country: CountryCode;

  onCreated: () => void;
};

type ProviderUI =
  | PaymentMethodProvider
  | "bank_transfer";

/* =====================================================
   COMPONENT
===================================================== */

export default function AddPaymentMethodForm({
  country,
  onCreated,
}: Props) {
  const locale =
    COUNTRY_LANGUAGE_MAP[
      country
    ];

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [provider, setProvider] =
    useState<ProviderUI>(
      "stripe"
    );

  const [isActive, setIsActive] =
    useState(true);

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState<number | "">("");

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [bank, setBank] =
    useState({
      accountHolder: "",

      iban: "",

      bic: "",

      bankName: "",

      instructions: "",
    });

  /* =====================================================
     VALIDATION
  ===================================================== */

  const hasName =
    useMemo(
      () =>
        name.trim()
          .length > 0,
      [name]
    );

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (!hasName) {
      setError(
        "Ajoute un nom."
      );

      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          "/api/admin/payment-methods",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                country,

                provider,

                isActive,

                sortOrder:
                  sortOrder ===
                  ""
                    ? null
                    : Number(
                        sortOrder
                      ),

                name: {
                  [locale]:
                    name,
                },

                description:
                  {
                    [locale]:
                      description,
                  },

                config:
                  provider ===
                  "bank_transfer"
                    ? bank
                    : {},
              }
            ),
          }
        );

      if (!res.ok) {
        throw new Error();
      }

      /* RESET */
      setName("");

      setDescription("");

      setProvider(
        "stripe"
      );

      setSortOrder("");

      setBank({
        accountHolder:
          "",

        iban: "",

        bic: "",

        bankName: "",

        instructions:
          "",
      });

      onCreated();
    } catch {
      setError(
        "Erreur création"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <form
      onSubmit={submit}
      className="apmf"
    >

      {/* HERO */}
      <div className="apmf-head">

        <div>

          <div className="apmf-kicker">
            PAYMENT METHOD
          </div>

          <h2 className="apmf-title">
            Nouvelle méthode
          </h2>

          <div className="apmf-meta">

            {country} •{" "}

            {locale.toUpperCase()}

          </div>

        </div>

        {/* ACTIVE */}
        <label className="apmf-toggle">

          <input
            type="checkbox"
            checked={
              isActive
            }
            onChange={(e) =>
              setIsActive(
                e.target
                  .checked
              )
            }
          />

          <span className="apmf-switch" />

          <div className="apmf-toggle-content">

            <strong>
              Actif
            </strong>

            <span>
              Visible dans
              le checkout
            </span>

          </div>

        </label>

      </div>

      {/* PROVIDERS */}
      <section className="apmf-card">

        <div className="apmf-card-head">

          <div className="apmf-card-kicker">
            PROVIDER
          </div>

          <h3>
            Méthode
          </h3>

        </div>

        <div className="apmf-providers">

          {[
            {
              id: "stripe",

              label:
                "Stripe",
            },

            {
              id: "paypal",

              label:
                "PayPal",
            },

            {
              id: "manual",

              label:
                "Manuel",
            },

            {
              id:
                "bank_transfer",

              label:
                "Virement",
            },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setProvider(
                  p.id as ProviderUI
                )
              }
              className={`apmf-provider ${
                provider ===
                p.id
                  ? "active"
                  : ""
              }`}
            >

              <span>
                {p.label}
              </span>

            </button>
          ))}

        </div>

      </section>

      {/* CONTENT */}
      <section className="apmf-card">

        <div className="apmf-card-head">

          <div className="apmf-card-kicker">
            CONTENT
          </div>

          <h3>
            Informations
          </h3>

        </div>

        <div className="apmf-grid">

          <div className="apmf-field">

            <label>
              Nom
            </label>

            <input
              placeholder={`Nom (${locale.toUpperCase()})`}
              value={name}
              onChange={(e) =>
                setName(
                  e.target
                    .value
                )
              }
            />

          </div>

          <div className="apmf-field">

            <label>
              Description
            </label>

            <input
              placeholder={`Description (${locale.toUpperCase()})`}
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target
                    .value
                )
              }
            />

          </div>

        </div>

      </section>

      {/* BANK */}
      {provider ===
        "bank_transfer" && (
        <section className="apmf-card">

          <div className="apmf-card-head">

            <div className="apmf-card-kicker">
              BANK
            </div>

            <h3>
              Informations bancaires
            </h3>

          </div>

          <div className="apmf-grid">

            <div className="apmf-field">

              <label>
                Titulaire
              </label>

              <input
                placeholder="John Doe"
                value={
                  bank.accountHolder
                }
                onChange={(e) =>
                  setBank({
                    ...bank,

                    accountHolder:
                      e
                        .target
                        .value,
                  })
                }
              />

            </div>

            <div className="apmf-field">

              <label>
                Banque
              </label>

              <input
                placeholder="BNP"
                value={
                  bank.bankName
                }
                onChange={(e) =>
                  setBank({
                    ...bank,

                    bankName:
                      e
                        .target
                        .value,
                  })
                }
              />

            </div>

            <div className="apmf-field">

              <label>
                IBAN
              </label>

              <input
                placeholder="FR76..."
                value={
                  bank.iban
                }
                onChange={(e) =>
                  setBank({
                    ...bank,

                    iban:
                      e
                        .target
                        .value,
                  })
                }
              />

            </div>

            <div className="apmf-field">

              <label>
                BIC
              </label>

              <input
                placeholder="AGRIFRPP"
                value={
                  bank.bic
                }
                onChange={(e) =>
                  setBank({
                    ...bank,

                    bic:
                      e
                        .target
                        .value,
                  })
                }
              />

            </div>

          </div>

          <div className="apmf-field apmf-textarea-wrap">

            <label>
              Instructions
            </label>

            <textarea
              placeholder="Instructions de paiement..."
              value={
                bank.instructions
              }
              onChange={(e) =>
                setBank({
                  ...bank,

                  instructions:
                    e
                      .target
                      .value,
                })
              }
            />

          </div>

        </section>
      )}

      {/* SETTINGS */}
      <section className="apmf-card">

        <div className="apmf-card-head">

          <div className="apmf-card-kicker">
            PRIORITY
          </div>

          <h3>
            Affichage
          </h3>

        </div>

        <div className="apmf-field">

          <label>
            Ordre
          </label>

          <input
            type="number"
            placeholder="1"
            value={
              sortOrder
            }
            onChange={(e) =>
              setSortOrder(
                e.target
                  .value ===
                  ""
                  ? ""
                  : Number(
                      e
                        .target
                        .value
                    )
              )
            }
          />

        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="apmf-error">
          {error}
        </div>
      )}

      {/* SUBMIT */}
      <button
        className="apmf-submit"
        disabled={loading}
      >

        <span>

          {loading
            ? "Création..."
            : "Ajouter la méthode"}

        </span>

      </button>

    </form>
  );
}