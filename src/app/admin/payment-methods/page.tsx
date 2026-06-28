"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type {
  CountryCode,
} from "@/lib/shipping-i18n";

import {
  COUNTRY_TO_LOCALE,
} from "@/lib/countries";
import {
  isConcreteCountry,
  useAdminScope,
} from "../context/adminScope";

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

  const { country: activeCountry } =
    useAdminScope();

  /* 🔥 NEW */
  const [
    showCreate,
    setShowCreate,
  ] =
    useState(false);

  const [
    draggedId,
    setDraggedId,
  ] =
    useState<string | null>(
      null
    );

  const [
    savingOrder,
    setSavingOrder,
  ] =
    useState(false);

  const [
    togglingId,
    setTogglingId,
  ] =
    useState<string | null>(
      null
    );

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
          (m: Record<string, unknown>) => ({
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

  async function handleToggleActive(
    method: PaymentMethod
  ) {
    setTogglingId(method.id);

    try {
      const res = await fetch(
        `/api/admin/payment-methods/${method.id}`,
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
            `/api/admin/payment-methods/${m.id}`,
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

  /* =====================================================
     FILTERED
  ===================================================== */

  const filtered =
    useMemo(() => {

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

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="pap">

      <header className="pap-page-head">
        <div>
          <h1>Moyens de paiement</h1>
          <p>
            Gérez les moyens de paiement affichés sur la boutique.
          </p>
        </div>

        <button
          type="button"
          className={`pap-create-toggle ${
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

      {/* =====================================================
          CREATE
      ===================================================== */}

      <section className="pap-section">

        {showCreate && isConcreteCountry(activeCountry) && (

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

        {showCreate && !isConcreteCountry(activeCountry) && (
          <div className="pap-empty">
            Sélectionnez un pays dans la barre admin pour créer une méthode.
          </div>
        )}

      </section>

      {/* =====================================================
          METHODS
      ===================================================== */}

      <section className="pap-section">

        <div className="pap-section-head">

          <h2>
            Ordre d’affichage
          </h2>

          <p className="pap-section-note">
            Glissez les cartes pour choisir l’ordre visible sur la boutique.
            {savingOrder ? " Enregistrement..." : ""}
          </p>

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

                return (
                    <div
                      key={
                        method.id
                      }
                      className={`pap-wrap ${
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

                            <button
                              type="button"
                              className="pap-drag-handle"
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

                            <div className="pap-order-badge">
                              {index + 1}
                            </div>

                            <div className="pap-name">

                              {
                                method
                                  .name?.[
                                  locale
                                ] ||
                                  method.name?.[
                                    fallbackLocale
                                  ] ||
                                  "Sans nom"
                              }

                            </div>

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
                            onClick={() =>
                              handleToggleActive(method)
                            }
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

                        <div className="pap-bottom">

                          {method
                            .description?.[
                            locale
                          ] ||
                            method.description?.[
                              fallbackLocale
                            ] ||
                            "Aucune description"}

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

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

      {editingMethod && createPortal(
        <div
          className="pap-edit-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Modifier la méthode de paiement"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <div className="pap-edit-dialog">
            <EditPaymentMethodModal
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
        document.querySelector<HTMLElement>(
          ".admin-font-root"
        ) ?? document.body
      )}

    </main>
  );
}
