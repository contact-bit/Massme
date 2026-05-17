"use client";

import "./DashboardOrdersSearch.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useOrders } from "./orders/hooks/useOrders";

/* =========================================================
   TYPES
========================================================= */

type Filter =
  | "all"
  | "paid"
  | "to_prepare"
  | "shipped";

/* =========================================================
   HELPERS
========================================================= */

function eur(n?: number) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(n ?? 0);
}

function shortDate(v: any) {
  if (!v) return "—";

  try {
    const d =
      typeof v?.toDate ===
      "function"
        ? v.toDate()
        : new Date(v);

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    ).format(d);
  } catch {
    return "—";
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DashboardOrdersSearch() {
  const {
    orders,
    loading,
    initOnce,
  } = useOrders(() => {});

  const [q, setQ] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* =========================================================
     FILTERED
  ========================================================= */

  const filtered = useMemo(() => {
    let base = [...orders];

    /* ================= FILTERS ================= */

    if (filter === "paid") {
      base = base.filter(
        (o: any) => {
          const payment =
            String(
              o?.paymentStatus ||
                o?.payment
                  ?.status ||
                ""
            ).toLowerCase();

          return (
            payment === "paid"
          );
        }
      );
    }

    if (
      filter === "to_prepare"
    ) {
      base = base.filter(
        (o: any) => {
          const shipping =
            String(
              o?.shippingStatus ||
                o
                  ?.fulfillment
                  ?.status ||
                ""
            ).toLowerCase();

          return (
            shipping !==
            "shipped"
          );
        }
      );
    }

    if (filter === "shipped") {
      base = base.filter(
        (o: any) => {
          const shipping =
            String(
              o?.shippingStatus ||
                o
                  ?.fulfillment
                  ?.status ||
                ""
            ).toLowerCase();

          return (
            shipping ===
            "shipped"
          );
        }
      );
    }

    /* ================= SEARCH ================= */

    const term = q
      .trim()
      .toLowerCase();

    if (!term) {
      return base;
    }

    return base.filter(
      (o: any) => {
        const itemText =
          Array.isArray(
            o?.items
          )
            ? o.items
                .map(
                  (i: any) =>
                    i?.name ||
                    i?.title ||
                    ""
                )
                .join(" ")
                .toLowerCase()
            : "";

        return (
          String(
            o?.id || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            o?.orderNumber ||
              ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            o?.email || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            o
              ?.shippingAddress
              ?.name || ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            o
              ?.shippingAddress
              ?.city || ""
          )
            .toLowerCase()
            .includes(term) ||

          itemText.includes(
            term
          )
        );
      }
    );
  }, [orders, q, filter]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="dash-panel">
      {/* HEADER */}
      <div className="dash-panel-head">
        <h2 className="dash-panel-title">
          Recherche commandes
        </h2>

        <div className="dash-panel-meta">
          {filtered.length} résultats
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="dash-orders-toolbar">
        {/* SEARCH */}
        <input
          className="dash-orders-search"
          placeholder="Commande, email, ville, produit..."
          value={q}
          onChange={(e) =>
            setQ(
              e.target.value
            )
          }
        />

        {/* FILTERS */}
        <div className="dash-orders-filters">
          <button
            className={`dash-filter ${
              filter === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("all")
            }
          >
            Tous
          </button>

          <button
            className={`dash-filter ${
              filter === "paid"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("paid")
            }
          >
            Payées
          </button>

          <button
            className={`dash-filter ${
              filter ===
              "to_prepare"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter(
                "to_prepare"
              )
            }
          >
            À préparer
          </button>

          <button
            className={`dash-filter ${
              filter ===
              "shipped"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter(
                "shipped"
              )
            }
          >
            Expédiées
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="dash-orders-table">
        {loading ? (
          <div className="dash-empty">
            Chargement...
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="dash-empty">
            Aucun résultat.
          </div>
        ) : (
          filtered
            .slice(0, 20)
            .map((o: any) => {
              const shipping =
                String(
                  o?.shippingStatus ||
                    o
                      ?.fulfillment
                      ?.status ||
                    ""
                ).toLowerCase();

              const total =
                typeof o?.total ===
                "number"
                  ? o.total
                  : typeof o
                        ?.totals
                        ?.totalTTC ===
                      "number"
                  ? o.totals
                      .totalTTC
                  : 0;

              return (
                <a
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="dash-order-row"
                >
                  {/* ORDER */}
                  <div className="mono">
                    #
                    {o?.orderNumber ||
                      o?.id?.slice(
                        0,
                        6
                      )}
                  </div>

                  {/* CLIENT */}
                  <div className="truncate">
                    {o
                      ?.shippingAddress
                      ?.name ||
                      o?.email ||
                      "—"}
                  </div>

                  {/* CITY */}
                  <div className="truncate muted">
                    {o
                      ?.shippingAddress
                      ?.city ||
                      "—"}
                  </div>

                  {/* TOTAL */}
                  <div className="strong">
                    {eur(total)}
                  </div>

                  {/* STATUS */}
                  <div
                    className={`dash-status ${
                      shipping ===
                      "shipped"
                        ? "success"
                        : "warning"
                    }`}
                  >
                    {shipping ===
                    "shipped"
                      ? "Expédiée"
                      : "Préparation"}
                  </div>

                  {/* DATE */}
                  <div className="muted">
                    {shortDate(
                      o?.createdAt
                    )}
                  </div>
                </a>
              );
            })
        )}
      </div>
    </div>
  );
}