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

import {
  COUNTRIES,
  COUNTRY_TO_LOCALE,
} from "@/lib/countries";

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

  weightPriceTiers?: Array<{
    maxWeightKg: number;
    priceHT: number;
  }>;

  vatRate: number;

  isActive: boolean;

  sortOrder?: number | null;
};

function shippingTypeLabel(
  type: ShippingMethod["type"]
) {
  if (type === "relay") {
    return "Point relais";
  }

  if (type === "local_pickup") {
    return "Retrait";
  }

  return "À domicile";
}

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

  const [showCreate, setShowCreate] =
    useState(false);

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const [savingOrder, setSavingOrder] =
    useState(false);

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

            weightPriceTiers:
              Array.isArray(
                m.weightPriceTiers
              )
                ? m.weightPriceTiers
                : [],

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

  async function handleReorder(
    targetId: string,
    sourceId = draggedId
  ) {
    if (
      !sourceId ||
      sourceId === targetId
    ) {
      setDraggedId(null);
      return;
    }

    const current = [...filtered];
    const from = current.findIndex(
      (m) => m.id === sourceId
    );
    const to = current.findIndex(
      (m) => m.id === targetId
    );

    if (from < 0 || to < 0) {
      setDraggedId(null);
      return;
    }

    const [moved] = current.splice(
      from,
      1
    );

    current.splice(to, 0, moved);

    const ordered = current.map(
      (m, index) => ({
        ...m,
        sortOrder: index + 1,
      })
    );

    setMethods((prev) =>
      prev.map((m) => {
        const next = ordered.find(
          (o) => o.id === m.id
        );

        return next ?? m;
      })
    );

    setSavingOrder(true);

    try {
      await Promise.all(
        ordered.map((m) =>
          fetch(
            `/api/admin/shipping-methods/${m.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                sortOrder:
                  m.sortOrder,
              }),
            }
          )
        )
      );
    } finally {
      setSavingOrder(false);
      setDraggedId(null);
    }
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

      {/* CONTAINER */}
      <div className="shipping-container">

        <header className="shipping-page-head">
          <div>
            <h1>Livraison</h1>
            <p>
              Gérez les méthodes, tarifs et délais affichés sur la boutique.
            </p>
          </div>

          <button
            type="button"
            className={`shipping-create-toggle ${
              showCreate ? "active" : ""
            }`}
            onClick={() =>
              setShowCreate(!showCreate)
            }
          >
            {showCreate
              ? "Fermer"
              : "Nouvelle méthode"}
          </button>
        </header>

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

                  setShowCreate(
                    false
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

                <span className="shipping-tab-content">

                  <span className="shipping-tab-label">
                    {
                      country.label
                    }
                  </span>

                  <span className="shipping-tab-code">
                    {
                      country.code
                    }
                  </span>

                </span>

              </button>
            )
          )}

        </section>

        {/* CREATE */}
        <section className="shipping-create-section">

          {showCreate && (
            <div className="shipping-card">

              <div className="shipping-card-body">

                <AddMethodForm
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

            </div>
          )}

        </section>

        {/* LIST */}
        <section className="shipping-list-section">

          <div className="shipping-section-head">

            <div>

              <div className="shipping-card-kicker">
                Méthodes
              </div>

              <h2>
                Ordre d’affichage
              </h2>

              <p className="shipping-section-note">
                Glissez les cartes pour choisir l’ordre visible sur la boutique.
                {savingOrder
                  ? " Enregistrement..."
                  : ""}
              </p>

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
                (method, index) => {
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
                      className={`shipping-method-wrap ${
                        draggedId ===
                        method.id
                          ? "dragging"
                          : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect =
                          "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        handleReorder(
                          method.id,
                          e.dataTransfer.getData(
                            "text/plain"
                          )
                        );
                      }}
                      onDragEnd={() =>
                        setDraggedId(null)
                      }
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

                              <button
                                type="button"
                                className="shipping-drag-handle"
                                title="Déplacer"
                                draggable
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  e.dataTransfer.effectAllowed =
                                    "move";
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    method.id
                                  );
                                  setDraggedId(
                                    method.id
                                  );
                                }}
                                onDragEnd={() =>
                                  setDraggedId(
                                    null
                                  )
                                }
                              >
                                ≡
                              </button>

                              <span className="shipping-order-badge">
                                {index + 1}
                              </span>

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
                                shippingTypeLabel(
                                  method.type
                                )
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
