"use client";

import { useState } from "react";

import type { ShippingMethod } from "../page";

import {
  COUNTRY_LANGUAGE_MAP,
  CountryCode,
} from "@/lib/shipping-i18n";

import "./edit-method-panel.css";

type Props = {
  data: ShippingMethod;

  onClose: () => void;

  onSaved: () => void;
};

export default function EditMethodPanel({
  data,
  onClose,
  onSaved,
}: Props) {
  const country =
    data.country as CountryCode;

  const lang =
    COUNTRY_LANGUAGE_MAP[country];

  const [form, setForm] =
    useState<ShippingMethod>({
      ...data,
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  /* =====================================================
     SAVE
  ===================================================== */

  async function save() {
    try {
      setSaving(true);

      setError(null);

      const res = await fetch(
        `/api/admin/shipping-methods/${data.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name,

            delay:
              form.delay,

            type:
              form.type,

            relayProvider:
              form.relayProvider ??
              null,

            priceHT:
              Number(
                form.priceHT
              ),

            vatRate:
              Number(
                form.vatRate ??
                  0
              ),

            isActive:
              form.isActive,

            sortOrder:
              form.sortOrder ==
              null
                ? null
                : Number(
                    form.sortOrder
                  ),
          }),
        }
      );

      const json =
        await res
          .json()
          .catch(() => ({}));

      if (
        !res.ok ||
        !json.ok
      ) {
        setError(
          "Erreur lors de l’enregistrement."
        );

        return;
      }

      onSaved();
    } catch {
      setError(
        "Erreur réseau."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="emp">

      {/* HERO */}
      <div className="emp-head">

        <div>

          <div className="emp-kicker">
            SHIPPING METHOD
          </div>

          <h2 className="emp-title">
            Modifier la méthode
          </h2>

          <div className="emp-meta">
            {country} •{" "}
            {lang.toUpperCase()}
          </div>

        </div>

        <button
          className="emp-close"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

      </div>

      {/* FORM */}
      <div className="emp-body">

        {/* GENERAL */}
        <section className="emp-card">

          <div className="emp-card-head">

            <div className="emp-card-kicker">
              GENERAL
            </div>

            <h3>
              Informations
            </h3>

          </div>

          <div className="emp-grid">

            {/* NAME */}
            <div className="emp-field">

              <label>
                Nom
              </label>

              <input
                value={
                  form.name[
                    lang
                  ] ?? ""
                }
                onChange={(e) =>
                  setForm(
                    (f) => ({
                      ...f,

                      name: {
                        ...f.name,

                        [lang]:
                          e
                            .target
                            .value,
                      },
                    })
                  )
                }
              />

            </div>

            {/* DELAY */}
            <div className="emp-field">

              <label>
                Délai
              </label>

              <input
                value={
                  form.delay[
                    lang
                  ] ?? ""
                }
                onChange={(e) =>
                  setForm(
                    (f) => ({
                      ...f,

                      delay:
                        {
                          ...f.delay,

                          [lang]:
                            e
                              .target
                              .value,
                        },
                    })
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* TYPE */}
        <section className="emp-card">

          <div className="emp-card-head">

            <div className="emp-card-kicker">
              DELIVERY
            </div>

            <h3>
              Type
            </h3>

          </div>

          <div className="emp-field">

            <label>
              Méthode
            </label>

            <select
              value={
                form.type
              }
              onChange={(e) =>
                setForm(
                  (f) => ({
                    ...f,

                    type:
                      e.target
                        .value as any,
                  })
                )
              }
            >

              <option value="home">
                Domicile
              </option>

              <option value="relay">
                Point relais
              </option>

              <option value="local_pickup">
                Retrait
              </option>

            </select>

          </div>

        </section>

        {/* PRICING */}
        <section className="emp-card">

          <div className="emp-card-head">

            <div className="emp-card-kicker">
              PRICING
            </div>

            <h3>
              Tarification
            </h3>

          </div>

          <div className="emp-grid">

            {/* PRICE */}
            <div className="emp-field">

              <label>
                Prix HT
              </label>

              <input
                type="number"
                value={
                  form.priceHT
                }
                onChange={(e) =>
                  setForm(
                    (f) => ({
                      ...f,

                      priceHT:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  )
                }
              />

            </div>

            {/* VAT */}
            <div className="emp-field">

              <label>
                TVA
              </label>

              <input
                type="number"
                disabled={
                  country ===
                  "CH"
                }
                value={
                  form.vatRate
                }
                onChange={(e) =>
                  setForm(
                    (f) => ({
                      ...f,

                      vatRate:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* ORDER */}
        <section className="emp-card">

          <div className="emp-card-head">

            <div className="emp-card-kicker">
              PRIORITY
            </div>

            <h3>
              Affichage
            </h3>

          </div>

          <div className="emp-field">

            <label>
              Ordre
            </label>

            <input
              type="number"
              value={
                form.sortOrder ??
                ""
              }
              onChange={(e) =>
                setForm(
                  (f) => ({
                    ...f,

                    sortOrder:
                      e.target
                        .value ===
                      ""
                        ? null
                        : Number(
                            e
                              .target
                              .value
                          ),
                  })
                )
              }
            />

          </div>

        </section>

        {/* STATUS */}
        <section className="emp-card">

          <div className="emp-card-head">

            <div className="emp-card-kicker">
              STATUS
            </div>

            <h3>
              Activation
            </h3>

          </div>

          <label className="emp-toggle">

            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(e) =>
                setForm(
                  (f) => ({
                    ...f,

                    isActive:
                      e.target
                        .checked,
                  })
                )
              }
            />

            <span className="emp-switch" />

            <div className="emp-toggle-content">

              <strong>
                Méthode active
              </strong>

              <span>
                Visible dans
                le checkout
              </span>

            </div>

          </label>

        </section>

        {/* ERROR */}
        {error && (
          <div className="emp-error">
            {error}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="emp-footer">

        <button
          className="emp-btn emp-btn-ghost"
          onClick={onClose}
          type="button"
        >
          Annuler
        </button>

        <button
          className="emp-btn emp-btn-primary"
          onClick={save}
          disabled={saving}
          type="button"
        >

          {saving
            ? "Enregistrement..."
            : "Enregistrer"}

        </button>

      </div>

    </div>
  );
}