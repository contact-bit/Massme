"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import AddMethodForm from "./components/AddMethodForm";

import EditMethodPanel from "./components/EditMethodModal";

import {
  CountryCode,
  ShippingLocale,
} from "@/lib/shipping-i18n";

import {
  COUNTRY_TO_LOCALE,
} from "@/lib/countries";
import {
  isConcreteCountry,
  useAdminScope,
} from "../context/adminScope";

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
    useState<string | null>(
      null
    );

  const { country: activeCountry } =
    useAdminScope();

  const [showCreate, setShowCreate] =
    useState(false);

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const [savingOrder, setSavingOrder] =
    useState(false);

  const [togglingId, setTogglingId] =
    useState<string | null>(null);

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
        (json.methods ?? []).map(
          (m: Record<string, unknown>) => ({
            id: String(m.id),

            country:
              m.country as CountryCode,

            name:
              m.name ?? {},

            delay:
              m.delay ?? {},

            type:
              (m.type as ShippingMethod["type"]) ||
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

  useEffect(() => {
    setEditing(null);
    setShowCreate(false);
  }, [activeCountry]);

  useEffect(() => {
    if (!editing) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [editing]);

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

  async function handleToggleActive(
    method: ShippingMethod
  ) {
    setTogglingId(method.id);

    try {
      const res = await fetch(
        `/api/admin/shipping-methods/${method.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !method.isActive,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        throw new Error();
      }

      setMethods((current) =>
        current.map((item) =>
          item.id === method.id
            ? {
                ...item,
                isActive: !method.isActive,
              }
            : item
        )
      );
    } catch {
      alert("Impossible de modifier la visibilité de cette méthode.");
    } finally {
      setTogglingId(null);
    }
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
          activeCountry === "ALL" ||
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

  const editingMethod = editing
    ? methods.find(
        (method) => method.id === editing
      ) ?? null
    : null;

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

        {/* CREATE */}
        <section className="shipping-create-section">

          {showCreate && isConcreteCountry(activeCountry) && (
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

          {showCreate && !isConcreteCountry(activeCountry) && (
            <div className="shipping-empty">
              Sélectionnez un pays dans la barre admin pour créer une méthode.
            </div>
          )}

        </section>

        {/* LIST */}
        <section className="shipping-list-section">

          <div className="shipping-section-head">

            <div>

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
                  const fallbackLocale =
                    COUNTRY_TO_LOCALE[
                      method.country
                    ];

                  const isOpen =
                    editing ===
                    method.id;

                  const priceTTC =
                    method.priceHT *
                    (1 + method.vatRate / 100);

                  const delay =
                    method.delay?.[locale] ||
                    "Délai non renseigné";

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
                        <div className="shipping-method-left">

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
                                  method.name?.[
                                    fallbackLocale
                                  ] ||
                                  "Méthode"}
                              </h3>

                            </div>

                            <button
                              type="button"
                              className={`method-visibility-switch ${
                                method.isActive
                                  ? "is-active"
                                  : ""
                              }`}
                              role="switch"
                              aria-checked={method.isActive}
                              disabled={togglingId === method.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleToggleActive(method);
                              }}
                            >
                              <span className="method-visibility-switch-text">
                                <strong>Visible sur la boutique</strong>
                                <small>
                                  {togglingId === method.id
                                    ? "Enregistrement..."
                                    : method.isActive
                                    ? "Visible"
                                    : "Masqué"}
                                </small>
                              </span>
                              <span className="method-visibility-switch-track">
                                <span />
                              </span>
                            </button>

                          </div>

                          <p className="shipping-method-delay">
                            {method.delay?.[locale] ||
                              method.delay?.[fallbackLocale] ||
                              delay}
                          </p>

                          <div className="shipping-method-bottom">

                            <span className="method-detail">
                              <small>Type</small>
                              <strong>{shippingTypeLabel(method.type)}</strong>
                            </span>

                            <span className="method-detail">
                              <small>Prix HT</small>
                              <strong>{method.priceHT.toFixed(2)} €</strong>
                            </span>

                            <span className="method-detail">
                              <small>TVA</small>
                              <strong>{method.vatRate} %</strong>
                            </span>

                            <span className="method-detail">
                              <small>Prix TTC</small>
                              <strong>{priceTTC.toFixed(2)} €</strong>
                            </span>

                            {method.type === "relay" &&
                              method.relayProvider && (
                                <span className="method-detail">
                                  <small>Réseau relais</small>
                                  <strong>{method.relayProvider}</strong>
                                </span>
                              )}

                          </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="shipping-method-actions">

                          <button
                            type="button"
                            className="shipping-btn shipping-btn-ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(
                                isOpen
                                  ? null
                                  : method.id
                              );
                            }}
                          >
                            {isOpen
                              ? "Fermer"
                              : "Modifier"}
                          </button>

                          <button
                            type="button"
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

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

      {editingMethod && createPortal(
        <div
          className={`${
            document.querySelector<HTMLElement>(
              ".admin-font-root"
            )?.className || "admin-font-root"
          } shipping-edit-overlay`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483000,
            display: "grid",
            placeItems: "center",
            padding: "clamp(1rem, 3vw, 2.5rem)",
            background: "rgba(2, 6, 23, .76)",
            backdropFilter: "blur(10px)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Modifier la méthode de livraison"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <div
            className="shipping-edit-dialog"
            style={{
              width: "min(1080px, 100%)",
              maxHeight: "calc(100dvh - 2rem)",
              overflowY: "auto",
              padding: "clamp(1rem, 2.5vw, 1.75rem)",
              border: "1px solid rgba(125, 211, 252, .18)",
              borderRadius: "18px",
              background:
                "linear-gradient(180deg, rgba(15, 23, 42, .99), rgba(2, 6, 23, .99))",
              boxShadow:
                "0 30px 100px rgba(0, 0, 0, .58), 0 0 0 1px rgba(255, 255, 255, .03)",
            }}
          >
            <EditMethodPanel
              key={editingMethod.id}
              data={editingMethod}
              onClose={() => setEditing(null)}
              onSaved={() => {
                reload();
                setEditing(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}

    </main>
  );
}
