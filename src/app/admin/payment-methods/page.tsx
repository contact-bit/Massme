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

function providerLabel(
  provider: PaymentMethod["provider"]
) {
  if (provider === "stripe") {
    return "Carte bancaire";
  }

  if (provider === "paypal") {
    return "PayPal";
  }

  return "Manuel";
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
          COUNTRIES
      ===================================================== */}

      <section className="pap-section">



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
            Méthodes
          </div>

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
                            {providerLabel(
                              method.provider
                            )}
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
