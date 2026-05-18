"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AddMethodForm from "./components/AddMethodForm";

import EditMethodPanel from "./components/EditMethodModal";

import {
  CountryCode,
  ShippingLocale,
} from "@/lib/shipping-i18n";

import "./shipping-admin.css";

/* =========================================================
   TYPES
========================================================= */

export type ShippingMethod = {
  id: string;

  country: CountryCode;

  name: Partial<
    Record<ShippingLocale, string>
  >;

  delay: Partial<
    Record<ShippingLocale, string>
  >;

  type:
    | "home"
    | "relay"
    | "local_pickup";

  relayProvider?: string | null;

  priceHT: number;

  vatRate: number;

  isActive: boolean;

  sortOrder?: number | null;
};

/* =========================================================
   CONST
========================================================= */

const COUNTRIES = [
  {
    code: "FR",
    label: "France",
    flag: "🇫🇷",
  },

  {
    code: "GB",
    label: "United Kingdom",
    flag: "🇬🇧",
  },

  {
    code: "ES",
    label: "Espagne",
    flag: "🇪🇸",
  },

  {
    code: "DE",
    label: "Deutschland",
    flag: "🇩🇪",
  },

  {
    code: "IT",
    label: "Italia",
    flag: "🇮🇹",
  },

  {
    code: "NL",
    label: "Nederland",
    flag: "🇳🇱",
  },
] as const;

const COUNTRY_TO_LOCALE: Record<
  CountryCode,
  ShippingLocale
> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  ES: "es",
  IT: "it",
  NL: "nl",
  CH: "fr",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ShippingAdminPage() {
  const [methods, setMethods] =
    useState<ShippingMethod[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState<ShippingMethod | null>(
      null
    );

  const [activeCountry, setActiveCountry] =
    useState<CountryCode>("FR");

  /* =========================================================
     LOAD
  ========================================================= */

  const reload = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/shipping-methods",
        {
          cache: "no-store",
        }
      );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.ok
      ) {
        setMethods([]);
        return;
      }

      setMethods(
        json.methods.map(
          (m: any) => ({
            id: m.id,

            country: m.country,

            name:
              m.name ?? {},

            delay:
              m.delay ?? {},

            type:
              m.type ||
              "home",

            relayProvider:
              m.relayProvider ??
              null,

            priceHT: Number(
              m.priceHT ?? 0
            ),

            vatRate: Number(
              m.vatRate ?? 0
            ),

            isActive:
              m.isActive ??
              true,

            sortOrder:
              m.sortOrder ==
              null
                ? null
                : Number(
                    m.sortOrder
                  ),
          })
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(
    id: string
  ) {
    if (
      !confirm(
        "Supprimer cette méthode ?"
      )
    ) {
      return;
    }

    await fetch(
      `/api/admin/shipping-methods/${id}`,
      {
        method: "DELETE",
      }
    );

    reload();
  }

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = useMemo(() => {
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="shipping-page">

      {/* BG */}
      <div className="shipping-grid" />

      <div className="shipping-glow glow-1" />

      <div className="shipping-glow glow-2" />

      {/* CONTAINER */}
      <div className="shipping-container">

        {/* HERO */}
        <section className="shipping-hero">

          <div className="shipping-kicker">
            SHIPPING MANAGEMENT
          </div>

          <div className="shipping-hero-head">

            <div>

              <h1 className="shipping-title">
                Livraison
              </h1>

              <p className="shipping-description">
                Gestion avancée des
                méthodes de livraison,
                des zones et de la
                logistique internationale.
              </p>

            </div>

            <div className="shipping-stats">

              <div className="shipping-stat">

                <span>
                  Méthodes
                </span>

                <strong>
                  {
                    filtered.length
                  }
                </strong>

              </div>

              <div className="shipping-stat">

                <span>
                  Pays
                </span>

                <strong>
                  {
                    COUNTRIES.length
                  }
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* COUNTRIES */}
        <section className="shipping-tabs">

          {COUNTRIES.map(
            (country) => (
              <button
                key={
                  country.code
                }
                onClick={() => {
                  setActiveCountry(
                    country.code
                  );

                  setEditing(
                    null
                  );
                }}
                className={`shipping-tab ${
                  activeCountry ===
                  country.code
                    ? "active"
                    : ""
                }`}
              >

                <span className="shipping-tab-flag">
                  {country.flag}
                </span>

                <span className="shipping-tab-label">
                  {
                    country.label
                  }
                </span>

              </button>
            )
          )}

        </section>

        {/* CREATE */}
        <section className="shipping-card">

          <div className="shipping-card-head">

            <div>

              <div className="shipping-card-kicker">
                CREATE METHOD
              </div>

              <h2>
                Nouvelle méthode
              </h2>

            </div>

          </div>

          <div className="shipping-card-body">

            <AddMethodForm
              country={
                activeCountry
              }
              onCreated={
                reload
              }
            />

          </div>

        </section>

        {/* LIST */}
        <section className="shipping-list-section">

          <div className="shipping-section-head">

            <div>

              <div className="shipping-card-kicker">
                SHIPPING METHODS
              </div>

              <h2>
                Méthodes actives
              </h2>

            </div>

          </div>

          {loading ? (
            <div className="shipping-empty">

              <div className="shipping-loader" />

              <span>
                Chargement des
                méthodes...
              </span>

            </div>
          ) : filtered.length ===
            0 ? (
            <div className="shipping-empty">

              <div className="shipping-empty-icon">
                📦
              </div>

              <h3>
                Aucune méthode
              </h3>

              <p>
                Aucune méthode
                de livraison
                configurée pour
                ce pays.
              </p>

            </div>
          ) : (
            <div className="shipping-list">

              {filtered.map(
                (method) => {
                  const locale =
                    COUNTRY_TO_LOCALE[
                      method
                        .country
                    ];

                  const isOpen =
                    editing?.id ===
                    method.id;

                  return (
                    <div
                      key={
                        method.id
                      }
                      className="shipping-method-wrap"
                    >

                      {/* METHOD */}
                      <div
                        className={`shipping-method ${
                          isOpen
                            ? "active"
                            : ""
                        }`}
                      >

                        {/* LEFT */}
                        <div
                          className="shipping-method-left"
                          onClick={() =>
                            setEditing(
                              isOpen
                                ? null
                                : method
                            )
                          }
                        >

                          <div className="shipping-method-top">

                            <div className="shipping-method-title-wrap">

                              <h3 className="shipping-method-title">
                                {method
                                  .name?.[
                                  locale
                                ] ||
                                  "Méthode"}
                              </h3>

                              {!method.isActive && (
                                <span className="shipping-off-badge">
                                  OFF
                                </span>
                              )}

                            </div>

                            <div className="shipping-method-type">

                              {
                                method.type
                              }

                            </div>

                          </div>

                          <div className="shipping-method-bottom">

                            <span>
                              {
                                method.priceHT
                              }
                              € HT
                            </span>

                            <span>
                              TVA{" "}
                              {
                                method.vatRate
                              }
                              %
                            </span>

                            {method.sortOrder !=
                              null && (
                              <span>
                                Priorité #
                                {
                                  method.sortOrder
                                }
                              </span>
                            )}

                          </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="shipping-method-actions">

                          <button
                            className="shipping-btn shipping-btn-ghost"
                            onClick={() =>
                              setEditing(
                                isOpen
                                  ? null
                                  : method
                              )
                            }
                          >
                            {isOpen
                              ? "Fermer"
                              : "Modifier"}
                          </button>

                          <button
                            className="shipping-btn shipping-btn-danger"
                            onClick={() =>
                              handleDelete(
                                method.id
                              )
                            }
                          >
                            Supprimer
                          </button>

                        </div>

                      </div>

                      {/* EDIT */}
                      {isOpen && (
                        <div className="shipping-edit-panel">

                          <EditMethodPanel
                            data={
                              method
                            }
                            onClose={() =>
                              setEditing(
                                null
                              )
                            }
                            onSaved={
                              reload
                            }
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

      </div>

    </main>
  );
}