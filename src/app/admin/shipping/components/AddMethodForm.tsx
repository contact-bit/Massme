"use client";

import { useState } from "react";

import type {
  ShippingMethodType,
  RelayProvider,
} from "@/components/shipping/types";

import { RELAY_PROVIDERS } from "@/components/shipping/relayProviders";

import {
  COUNTRY_LANGUAGE_MAP,
  CountryCode,
} from "@/lib/shipping-i18n";

import "./add-method-form.css";

type Props = {
  country: CountryCode;
  onCreated: () => void;
};

export default function AddMethodForm({
  country,
  onCreated,
}: Props) {
  const lang =
    COUNTRY_LANGUAGE_MAP[country];

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [form, setForm] =
    useState({
      name: "",

      delay: "",

      type:
        "home" as ShippingMethodType,

      relayProvider:
        null as RelayProvider | null,

      priceHT: "",

      vatRate:
        country === "CH"
          ? "0"
          : "",

      sortOrder: "",
    });

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (
      form.type ===
        "relay" &&
      !form.relayProvider
    ) {
      setError(
        "Choisissez un transporteur relais."
      );

      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/shipping-methods",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            country,

            name: {
              [lang]:
                form.name,
            },

            delay: {
              [lang]:
                form.delay,
            },

            type:
              form.type,

            relayProvider:
              form.type ===
              "relay"
                ? form.relayProvider
                : null,

            priceHT: Number(
              form.priceHT
            ),

            vatRate: Number(
              form.vatRate ||
                0
            ),

            isActive: true,

            sortOrder:
              form.sortOrder !==
              ""
                ? Number(
                    form.sortOrder
                  )
                : undefined,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      /* RESET */
      setForm({
        name: "",

        delay: "",

        type: "home",

        relayProvider:
          null,

        priceHT: "",

        vatRate:
          country === "CH"
            ? "0"
            : "",

        sortOrder: "",
      });

      onCreated();
    } catch {
      setError(
        "Erreur lors de la création."
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
      className="amf"
    >

      {/* HERO */}
      <div className="amf-head">

        <div>

          <div className="amf-kicker">
            CREATE METHOD
          </div>

          <h3 className="amf-title">
            Nouvelle méthode
          </h3>

        </div>

        <div className="amf-country">

          <span>
            {country}
          </span>

          <strong>
            {lang.toUpperCase()}
          </strong>

        </div>

      </div>

      {/* BASIC */}
      <section className="amf-card">

        <div className="amf-card-head">

          <div className="amf-card-kicker">
            BASIC INFO
          </div>

          <h4>
            Informations
          </h4>

        </div>

        <div className="amf-grid">

          {/* NAME */}
          <div className="amf-field">

            <label>
              Nom
            </label>

            <input
              placeholder="Ex: Livraison Express"
              value={
                form.name
              }
              onChange={(e) =>
                setForm({
                  ...form,

                  name:
                    e.target
                      .value,
                })
              }
              required
            />

          </div>

          {/* DELAY */}
          <div className="amf-field">

            <label>
              Délai
            </label>

            <input
              placeholder="2-3 jours"
              value={
                form.delay
              }
              onChange={(e) =>
                setForm({
                  ...form,

                  delay:
                    e.target
                      .value,
                })
              }
            />

          </div>

        </div>

      </section>

      {/* TYPE */}
      <section className="amf-card">

        <div className="amf-card-head">

          <div className="amf-card-kicker">
            DELIVERY TYPE
          </div>

          <h4>
            Type de livraison
          </h4>

        </div>

        <div className="amf-types">

          {[
            {
              id: "home",

              label:
                "Domicile",

              desc:
                "Livraison standard à domicile",
            },

            {
              id: "relay",

              label:
                "Point relais",

              desc:
                "Retrait en relais partenaire",
            },

            {
              id:
                "local_pickup",

              label:
                "Retrait",

              desc:
                "Retrait local en boutique",
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setForm({
                  ...form,

                  type:
                    t.id as ShippingMethodType,

                  relayProvider:
                    null,
                })
              }
              className={`amf-type ${
                form.type ===
                t.id
                  ? "active"
                  : ""
              }`}
            >

              <div className="amf-type-title">
                {t.label}
              </div>

              <div className="amf-type-desc">
                {t.desc}
              </div>

            </button>
          ))}

        </div>

      </section>

      {/* RELAY */}
      {form.type ===
        "relay" && (
        <section className="amf-card">

          <div className="amf-card-head">

            <div className="amf-card-kicker">
              RELAY PROVIDER
            </div>

            <h4>
              Transporteur
            </h4>

          </div>

          <div className="amf-relays">

            {(
              Object.keys(
                RELAY_PROVIDERS
              ) as RelayProvider[]
            ).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,

                    relayProvider:
                      p,
                  })
                }
                className={`amf-relay ${
                  form.relayProvider ===
                  p
                    ? "active"
                    : ""
                }`}
              >

                <span className="amf-relay-dot" />

                <span>
                  {
                    RELAY_PROVIDERS[
                      p
                    ].label.fr
                  }
                </span>

              </button>
            ))}

          </div>

        </section>
      )}

      {/* PRICING */}
      <section className="amf-card">

        <div className="amf-card-head">

          <div className="amf-card-kicker">
            PRICING
          </div>

          <h4>
            Tarification
          </h4>

        </div>

        <div className="amf-grid">

          {/* PRICE */}
          <div className="amf-field">

            <label>
              Prix HT
            </label>

            <input
              type="number"
              placeholder="4.90"
              value={
                form.priceHT
              }
              onChange={(e) =>
                setForm({
                  ...form,

                  priceHT:
                    e.target
                      .value,
                })
              }
              required
            />

          </div>

          {/* VAT */}
          <div className="amf-field">

            <label>
              TVA %
            </label>

            <input
              type="number"
              placeholder="20"
              value={
                form.vatRate
              }
              disabled={
                country ===
                "CH"
              }
              onChange={(e) =>
                setForm({
                  ...form,

                  vatRate:
                    e.target
                      .value,
                })
              }
            />

          </div>

        </div>

      </section>

      {/* SORT */}
      <section className="amf-card">

        <div className="amf-card-head">

          <div className="amf-card-kicker">
            PRIORITY
          </div>

          <h4>
            Ordre d’affichage
          </h4>

        </div>

        <div className="amf-field">

          <label>
            Priorité
          </label>

          <input
            type="number"
            placeholder="1"
            value={
              form.sortOrder
            }
            onChange={(e) =>
              setForm({
                ...form,

                sortOrder:
                  e.target
                    .value,
              })
            }
          />

        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="amf-error">
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        className="amf-submit"
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