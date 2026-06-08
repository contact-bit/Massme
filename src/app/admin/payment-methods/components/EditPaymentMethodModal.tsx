"use client";

import {
  useState,
} from "react";

import {
  COUNTRY_LANGUAGE_MAP,
} from "@/lib/shipping-i18n";

import type {
  PaymentMethod,
  PaymentMethodProvider,
} from "../types";

import "./edit-payment-method-panel.css";

type Props = {
  data: PaymentMethod;

  onClose: () => void;

  onSaved: () => void;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function EditPaymentMethodPanel({
  data,
  onClose,
  onSaved,
}: Props) {
  const locale =
    COUNTRY_LANGUAGE_MAP[
      data.country
    ];

  const [provider, setProvider] =
    useState<PaymentMethodProvider>(
      data.provider
    );

  const [isActive, setIsActive] =
    useState(
      data.isActive
    );

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState<number | "">(
      data.sortOrder ??
        ""
    );

  const [name, setName] =
    useState(
      data.name?.[
        locale
      ] ?? ""
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      data
        .description?.[
        locale
      ] ?? ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  /* =====================================================
     SAVE
  ===================================================== */

  async function save(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (
      !name.trim()
    ) {
      setError(
        "Ajoute un nom."
      );

      return;
    }

    try {
      setLoading(true);

      const res =
        await fetch(
          `/api/admin/payment-methods/${data.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
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
                  ...data.name,

                  [locale]:
                    name,
                },

                description:
                  {
                    ...data.description,

                    [locale]:
                      description,
                  },
              }
            ),
          }
        );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.ok
      ) {
        throw new Error();
      }

      onSaved();
    } catch {
      setError(
        "Erreur sauvegarde"
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
      onSubmit={save}
      className="epmp"
    >

      {/* HEADER */}
      <div className="epmp-head">

        <div>

          <h2 className="epmp-title">
            Modification
          </h2>

          <div className="epmp-meta">

            {data.country} •{" "}

            {locale.toUpperCase()}

          </div>

        </div>

        <button
          type="button"
          className="epmp-close"
          onClick={onClose}
        >
          ✕
        </button>

      </div>

      {/* PROVIDER */}
      <section className="epmp-card">

        <div className="epmp-providers">

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
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setProvider(
                  p.id as PaymentMethodProvider
                )
              }
              className={`epmp-provider ${
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
      <section className="epmp-card">

        <div className="epmp-card-head">

          <div className="epmp-card-kicker">
            CONTENT
          </div>

          <h3>
            Informations
          </h3>

        </div>

        <div className="epmp-grid">

          <div className="epmp-field">

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

          <div className="epmp-field">

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

      {/* SETTINGS */}
      <section className="epmp-card">

        <div className="epmp-card-head">

          <div className="epmp-card-kicker">
            SETTINGS
          </div>

          <h3>
            Configuration
          </h3>

        </div>

        <div className="epmp-grid">

          <div className="epmp-field">

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

          <div className="epmp-toggle-wrap">

            <label className="epmp-toggle">

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

              <span className="epmp-switch" />

              <div className="epmp-toggle-content">

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

        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="epmp-error">
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="epmp-actions">

        <button
          type="button"
          className="epmp-btn epmp-btn-ghost"
          onClick={onClose}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="epmp-btn epmp-btn-primary"
          disabled={loading}
        >

          {loading
            ? "Sauvegarde..."
            : "Sauvegarder"}

        </button>

      </div>

    </form>
  );
}
