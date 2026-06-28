"use client";

import {
  useState,
} from "react";
import AdminNumberInput from "@/app/admin/components/AdminNumberInput";

import {
  COUNTRY_LANGUAGE_MAP,
} from "@/lib/shipping-i18n";

import type {
  PaymentMethod,
  PaymentMethodProvider,
} from "../types";

import "./edit-payment-method-panel.css";
import "../../styles/settings-editor.css";

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
      className="epmp settings-editor"
    >

      {/* HEADER */}
      <div className="epmp-head">

        <div>

          <h2 className="epmp-title">
            Modifier « {name || "Méthode de paiement"} »
          </h2>

          <div className="epmp-meta">

            Paiement • {data.country} • {locale.toUpperCase()}

          </div>

        </div>

        <button
          type="button"
          className="epmp-close"
          onClick={onClose}
          aria-label="Fermer le formulaire"
        >
          ✕
        </button>

      </div>

      {/* PROVIDER */}
      <section className="epmp-card">

        <div className="epmp-card-head">
          <div className="epmp-card-kicker">
            PAIEMENT
          </div>
          <h3>Fournisseur</h3>
        </div>

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
            INFORMATIONS
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

            <textarea
              rows={3}
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

            <textarea
              rows={3}
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
            AFFICHAGE
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

            <AdminNumberInput
              integer
              min={0}
              placeholder="1"
              value={
                sortOrder
              }
              onValueChange={(value) =>
                setSortOrder(value ?? "")
              }
            />

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
