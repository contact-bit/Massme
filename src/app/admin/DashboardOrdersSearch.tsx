"use client";

import "./DashboardOrdersSearch.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useOrders } from "./orders/hooks/useOrders";

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

type Props = {
  embedded?: boolean;
};

export default function DashboardOrdersSearch({
  embedded = false,
}: Props) {
  const {
    orders,
    loading,
    initOnce,
  } = useOrders(() => {});

  const [q, setQ] =
    useState("");

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
    const term = q
      .trim()
      .toLowerCase();

    if (!term) {
      return [];
    }

    return orders.filter(
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
  }, [orders, q]);

  const hasSearch =
    q.trim().length > 0;

  /* =========================================================
     UI
  ========================================================= */

  const content = (
    <>
      {/* HEADER */}
      <div className="dash-panel-head">
        <h2 className="dash-panel-title">
          Recherche commandes
        </h2>

        <div className="dash-panel-meta">
          {hasSearch
            ? `${filtered.length} résultats`
            : "Tapez pour rechercher"}
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

      </div>

      {/* TABLE */}
      {hasSearch && (
        <div className="dash-orders-table">
          <div className="dash-orders-head">
            <div>Commande</div>
            <div>Client</div>
            <div>Ville</div>
            <div>Total</div>
            <div>Statut</div>
            <div>Date</div>
          </div>

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
                  <div className="mono">
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
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="dash-panel">
      {content}
    </div>
  );
}
