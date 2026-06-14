"use client";

import "./DashboardOrdersSearch.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

import { useOrders } from "./orders/hooks/useOrders";
import { StatusPill } from "./orders/components/StatusPill";
import { ShippingStatusPill } from "./orders/components/ShippingStatusPill";
import { IconEye } from "./orders/components/icons";

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

function getTotal(o: any) {
  if (typeof o?.total === "number") return o.total;
  if (typeof o?.__total === "number") return o.__total;
  if (typeof o?.totals?.totalTTC === "number") return o.totals.totalTTC;
  return 0;
}

function getCustomerName(o: any) {
  const firstName = o?.shippingAddress?.firstName || "";
  const lastName = o?.shippingAddress?.lastName || "";
  return (
    `${firstName} ${lastName}`.trim() ||
    o?.shippingAddress?.name ||
    o?.email ||
    "—"
  );
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
  const searchParams =
    useSearchParams();

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

  useEffect(() => {
    const term =
      searchParams.get("search") || "";

    if (term) {
      setQ(term);
    }
  }, [searchParams]);

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
            o?.invoiceNumber ||
              ""
          )
            .toLowerCase()
            .includes(term) ||

          String(
            o?.invoiceEmail
              ?.invoiceNumber ||
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
      {!embedded && (
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
      )}

      {/* TOOLBAR */}
      <div className="dash-orders-toolbar">
        <div className={`dash-orders-searchbox ${hasSearch ? "has-value" : ""}`}>
          <FiSearch aria-hidden="true" />
          <input
            className="dash-orders-search"
            type="search"
            aria-label="Rechercher une commande"
            placeholder="N° commande, client, email, ville ou produit"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQ("");
              }
            }}
          />
          <span className="dash-orders-search-status" aria-live="polite">
            {loading && hasSearch
              ? "Recherche…"
              : hasSearch
                ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}`
                : `${orders.length} commande${orders.length > 1 ? "s" : ""}`}
          </span>
          {hasSearch && (
            <button
              type="button"
              className="dash-orders-search-clear"
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
              onClick={() => setQ("")}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      {hasSearch && (
        <div className="dash-orders-table orders-table-wrap">
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
            <table className="orders-table-v2 dash-search-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Ville</th>
                  <th>Total</th>
                  <th>Paiement</th>
                  <th>Livraison</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filtered
                  .slice(0, 20)
                  .map((o: any) => {
                    const displayId =
                      o?.orderNumber ||
                      o?.id?.slice(
                        0,
                        6
                      );
                    const invoiceNumber =
                      o?.invoiceNumber ||
                      o?.invoiceEmail
                        ?.invoiceNumber ||
                      "";

                    const paymentStatus =
                      o?.payment
                        ?.status ||
                      o?.status;

                    const createdAt =
                      o?.__created ||
                      o?.createdAt;

                    return (
                      <tr key={o.id}>
                        <td>
                          <div className="cell-command">
                            <span className="dash-command-ids">
                              <span className="cell-main mono">
                                {displayId}
                              </span>

                              {invoiceNumber && (
                                <span className="cell-sub mono">
                                  {invoiceNumber}
                                </span>
                              )}
                            </span>

                            <a
                              className="admin-icon-btn btn-primary dash-search-eye"
                              href={`/admin/orders?open=${encodeURIComponent(
                                o.id
                              )}`}
                              title="Voir la commande"
                              aria-label="Voir la commande"
                            >
                              <IconEye />
                            </a>
                          </div>
                        </td>

                        <td>
                          <div className="cell-main truncate">
                            {getCustomerName(
                              o
                            )}
                          </div>

                          <div className="cell-sub truncate">
                            {o?.email ||
                              "—"}
                          </div>
                        </td>

                        <td>
                          <div className="cell-main truncate">
                            {o
                              ?.shippingAddress
                              ?.city ||
                              "—"}
                          </div>
                        </td>

                        <td className="cell-strong">
                          {eur(getTotal(o))}
                        </td>

                        <td>
                          <StatusPill
                            status={
                              paymentStatus
                            }
                          />
                        </td>

                        <td>
                          <ShippingStatusPill
                            order={o as any}
                          />
                        </td>

                        <td>
                          <div className="cell-sub">
                            {shortDate(
                              createdAt
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
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
