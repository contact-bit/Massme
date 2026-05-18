"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CountryCode,
} from "@/lib/shipping-i18n";

import {
  COUNTRIES,
  COUNTRY_TO_LOCALE,
} from "@/lib/countries";

import AddPaymentMethodForm from "./components/AddPaymentMethodForm";
import EditPaymentMethodModal from "./components/EditPaymentMethodModal";

import type {
  PaymentMethod,
} from "./types";

import "./payments-admin-page.css";

/* =====================================================
   HELPERS
===================================================== */

function isCountryCode(
  value: unknown
): value is CountryCode {
  return (
    typeof value ===
      "string" &&
    value in
      COUNTRY_TO_LOCALE
  );
}

function normalizeCountryCode(
  value: unknown,
  fallback: CountryCode =
    "FR"
): CountryCode {
  return isCountryCode(
    value
  )
    ? value
    : fallback;
}

/* =====================================================
   PAGE
===================================================== */

export default function PaymentsAdminPage() {

  const [methods, setMethods] =
    useState<
      PaymentMethod[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [
    editing,
    setEditing,
  ] =
    useState<string | null>(
      null
    );

  const [
    activeCountry,
    setActiveCountry,
  ] =
    useState<CountryCode>(
      "FR"
    );

  /* 🔥 NEW */
  const [
    showCreate,
    setShowCreate,
  ] =
    useState(false);

  /* =====================================================
     LOAD
  ===================================================== */

  async function reload() {
    try {

      setLoading(true);

      const res =
        await fetch(
          "/api/admin/payment-methods",
          {
            cache:
              "no-store",
          }
        );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json?.ok
      ) {
        setMethods([]);

        return;
      }

      const normalized: PaymentMethod[] =
        (
          json.methods ??
          []
        ).map(
          (m: any) => ({
            id: String(
              m?.id
            ),

            country:
              normalizeCountryCode(
                m?.country
              ),

            name:
              m?.name ??
              {},

            description:
              m?.description ??
              {},

            provider:
              m?.provider ??
              "stripe",

            config:
              m?.config ??
              {},

            isActive:
              m?.isActive ??
              true,

            sortOrder:
              m?.sortOrder ==
              null
                ? null
                : Number(
                    m.sortOrder
                  ),
          })
        );

      setMethods(
        normalized
      );

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    reload();
  }, []);

  /* =====================================================
     DELETE
  ===================================================== */

  async function handleDelete(
    id: string
  ) {

    const ok =
      confirm(
        "Supprimer cette méthode ?"
      );

    if (!ok) return;

    await fetch(
      `/api/admin/payment-methods/${id}`,
      {
        method:
          "DELETE",
      }
    );

    reload();
  }

  /* =====================================================
     FILTERED
  ===================================================== */

  const filtered =
    useMemo(() => {

      return methods
        .filter(
          (m) =>
            m.country ===
            activeCountry
        )
        .sort(
          (a, b) =>
            (a.sortOrder ??
              999) -
            (b.sortOrder ??
              999)
        );

    }, [
      methods,
      activeCountry,
    ]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="pap">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="pap-hero">

        <div className="pap-hero-grid">

          <div className="pap-hero-left">

            <div className="pap-kicker">
              PAYMENT CENTER
            </div>

            <h1 className="pap-title">
              Méthodes de paiement
            </h1>

            <p className="pap-subtitle">
              Gérez les providers,
              l’activation,
              l’ordre d’affichage
              et la configuration
              des paiements pour
              chaque pays.
            </p>

          </div>

          <div className="pap-stats">

            <div className="pap-stat">

              <div className="pap-stat-value">
                {
                  methods.length
                }
              </div>

              <div className="pap-stat-label">
                Méthodes
              </div>

            </div>

            <div className="pap-stat">

              <div className="pap-stat-value">
                {
                  methods.filter(
                    (
                      m
                    ) =>
                      m.isActive
                  ).length
                }
              </div>

              <div className="pap-stat-label">
                Actives
              </div>

            </div>

            <div className="pap-stat">

              <div className="pap-stat-value">
                {
                  COUNTRIES.length
                }
              </div>

              <div className="pap-stat-label">
                Pays
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          COUNTRIES
      ===================================================== */}

      <section className="pap-section">

        <div className="pap-section-head">

          <div className="pap-section-kicker">
            COUNTRIES
          </div>

          <h2>
            Pays disponibles
          </h2>

        </div>

        <div className="pap-tabs">

          {COUNTRIES.map(
            (country) => (
              <button
                key={
                  country.code
                }
                type="button"
                onClick={() => {

                  setActiveCountry(
                    country.code
                  );

                  setEditing(
                    null
                  );

                  setShowCreate(
                    false
                  );

                }}
                className={`pap-tab ${
                  activeCountry ===
                  country.code
                    ? "active"
                    : ""
                }`}
              >

                <span className="pap-tab-flag">
                  {
                    country.flag
                  }
                </span>

                <span className="pap-tab-content">

                  <span className="pap-tab-title">
                    {
                      country.label
                    }
                  </span>

                  <span className="pap-tab-code">
                    {
                      country.code
                    }
                  </span>

                </span>

              </button>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          CREATE
      ===================================================== */}

      <section className="pap-section">

        <div className="pap-create-head">

          <div>

            <div className="pap-section-kicker">
              CREATE
            </div>

            <h2 className="pap-section-title">
              Ajouter une méthode
            </h2>

          </div>

          <button
            type="button"
            className={`pap-create-toggle ${
              showCreate
                ? "active"
                : ""
            }`}
            onClick={() =>
              setShowCreate(
                !showCreate
              )
            }
          >

            {showCreate
              ? "Fermer"
              : "Nouvelle méthode"}

          </button>

        </div>

        {showCreate && (

          <div className="pap-card">

            <AddPaymentMethodForm
              country={
                activeCountry
              }
              onCreated={() => {

                reload();

                setShowCreate(
                  false
                );

              }}
            />

          </div>

        )}

      </section>

      {/* =====================================================
          METHODS
      ===================================================== */}

      <section className="pap-section">

        <div className="pap-section-head">

          <div className="pap-section-kicker">
            METHODS
          </div>

          <h2>
            Méthodes actives
          </h2>

        </div>

        {loading ? (

          <div className="pap-empty">
            Chargement...
          </div>

        ) : filtered.length ===
          0 ? (

          <div className="pap-empty">
            Aucune méthode
            disponible.
          </div>

        ) : (

          <div className="pap-list">

            {filtered.map(
              (method) => {

                const locale =
                  COUNTRY_TO_LOCALE[
                    method
                      .country
                  ];

                const isOpen =
                  editing ===
                  method.id;

                return (
                  <div
                    key={
                      method.id
                    }
                    className="pap-wrap"
                  >

                    {/* CARD */}
                    <div
                      className={`pap-row ${
                        isOpen
                          ? "active"
                          : ""
                      }`}
                    >

                      {/* LEFT */}
                      <div className="pap-main">

                        <div className="pap-top">

                          <div className="pap-name-wrap">

                            <div className="pap-name">

                              {
                                method
                                  .name?.[
                                  locale
                                ] ||
                                  "Sans nom"
                              }

                            </div>

                            {!method.isActive && (
                              <div className="pap-off">
                                OFF
                              </div>
                            )}

                          </div>

                          <div className="pap-provider">
                            {method.provider}
                          </div>

                        </div>

                        <div className="pap-bottom">

                          {method
                            .description?.[
                            locale
                          ] ||
                            "Aucune description"}

                        </div>

                        <div className="pap-meta">

                          <div className="pap-meta-item">

                            <span>
                              Ordre
                            </span>

                            <strong>

                              #
                              {method.sortOrder ??
                                "—"}

                            </strong>

                          </div>

                          <div className="pap-meta-item">

                            <span>
                              Pays
                            </span>

                            <strong>
                              {
                                method.country
                              }
                            </strong>

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="pap-actions">

                        <button
                          type="button"
                          onClick={() =>
                            setEditing(
                              isOpen
                                ? null
                                : method.id
                            )
                          }
                          className="pap-btn pap-btn-ghost"
                        >

                          {isOpen
                            ? "Fermer"
                            : "Modifier"}

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              method.id
                            )
                          }
                          className="pap-btn pap-btn-danger"
                        >
                          Supprimer
                        </button>

                      </div>

                    </div>

                    {/* EDIT */}
                    {isOpen && (

                      <div className="pap-edit">

                        <EditPaymentMethodModal
                          data={
                            method
                          }
                          onClose={() =>
                            setEditing(
                              null
                            )
                          }
                          onSaved={() => {

                            reload();

                            setEditing(
                              null
                            );

                          }}
                        />

                      </div>

                    )}

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}