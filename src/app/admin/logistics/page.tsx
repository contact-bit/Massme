"use client";

import {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useOrders } from "../orders/hooks/useOrders";
import { useToast } from "../orders/hooks/useToast";
import { usePagination } from "../orders/hooks/usePagination";

import { Toast } from "../orders/components/Toast";

import "./logistics.css";

import { getLogisticStatus } from "../orders/domain/logistics";

import LogisticsList from "./LogisticsList";

import type { Order } from "../orders/domain/types";
import {
  matchesAdminCountry,
  useAdminScope,
} from "../context/adminScope";

function orderMatchesCountry(
  order: Order,
  country: ReturnType<
    typeof useAdminScope
  >["country"]
) {
  if (country === "ALL") {
    return true;
  }

  const candidates = [
    order.totals?.country,
    order.shippingAddress?.country,
    order.billingAddress?.country,
    order.relayPoint?.country,
  ];

  return candidates.some((value) =>
    matchesAdminCountry(value, country)
  );
}

type OrderWithPayment = Order & {
  paymentStatus?: unknown;
  paymentProvider?: unknown;
  provider?: unknown;
  payment?: {
    status?: unknown;
    provider?: unknown;
  };
};

type FirestoreDateLike = {
  toDate?: () => Date;
  _seconds?: number;
};

function lowerValue(value: unknown) {
  return String(value || "").toLowerCase();
}

function orderCreatedTime(order: Order) {
  const createdAt =
    order.createdAt as FirestoreDateLike | null | undefined;

  if (
    typeof createdAt?.toDate === "function"
  ) {
    return (
      createdAt.toDate().getTime?.() ?? 0
    );
  }

  if (
    typeof createdAt?._seconds === "number"
  ) {
    return createdAt._seconds * 1000;
  }

  return 0;
}

export default function LogisticsPage() {
  const { country: activeCountry } =
    useAdminScope();

  const { toast, toastIt } =
    useToast();

  const {
    orders,
    loading,
    error,
    fetchOrders,
    initOnce,
    updateShippingStatus,
    updateShippingAddress,
  } = useOrders(toastIt);

  /* ================= INIT ================= */

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* ================= ACTION ================= */

  const handleShip =
    useCallback(
      async (order: Order) => {
        try {
          await updateShippingStatus(
            order,
            "shipped"
          );

          /* refresh global */
          await initOnce();

          toastIt(
            "Commande expédiée ✅"
          );
        } catch {
          toastIt(
            "Erreur lors de l’expédition ❌"
          );
        }
      },
      [
        updateShippingStatus,
        initOnce,
        toastIt,
      ]
    );

  /* ================= ROWS ================= */

  const logisticsEligible =
    useMemo(() => {
      return orders.filter((o) => {
        if (
          !orderMatchesCountry(
            o,
            activeCountry
          )
        ) {
          return false;
        }

        const orderWithPayment =
          o as OrderWithPayment;

        const orderStatus = lowerValue(
          orderWithPayment.status
        );

        const paymentStatus =
          lowerValue(
            orderWithPayment
              .paymentStatus ||
              orderWithPayment.payment
                ?.status
          );

        const provider = lowerValue(
          orderWithPayment
            .paymentProvider ||
            orderWithPayment.provider ||
            orderWithPayment.payment
              ?.provider
        );

        const isBankTransfer =
          provider ===
          "bank_transfer";

        const isAwaiting =
          orderStatus ===
          "awaiting_bank_transfer";

        if (
          isBankTransfer &&
          (isAwaiting ||
            paymentStatus !==
              "paid")
        ) {
          return false;
        }

        if (
          paymentStatus &&
          paymentStatus !== "paid"
        ) {
          return false;
        }

        if (
          !paymentStatus &&
          orderStatus &&
          orderStatus !== "paid" &&
          orderStatus !== "sent"
        ) {
          return false;
        }

        return true;
      });
    }, [activeCountry, orders]);

  const logisticsRows = useMemo(() => {
    return [...logisticsEligible].sort(
      (a, b) => {
        const aStatus =
          getLogisticStatus(a);
        const bStatus =
          getLogisticStatus(b);

        if (aStatus !== bStatus) {
          return aStatus ===
            "to_prepare"
            ? -1
            : 1;
        }

        const aTime = orderCreatedTime(a);
        const bTime = orderCreatedTime(b);

        return bTime - aTime;
      }
    );
  }, [logisticsEligible]);

  const pagination = usePagination(
    logisticsRows,
    12
  );

  /* ================= UI ================= */

  return (
    <>
      <Toast message={toast} />

      <div className="admin-page logistics-page">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <div>
                <div className="topbar-main">
                  Logistique
                </div>
                <div className="topbar-sub">
                  Gestion des commandes à préparer
                </div>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="btn-primary"
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading
                ? "Chargement..."
                : "Actualiser"}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="logistics-list-block">
          <div className="admin-table-list-header log-list-header">
            <div>
              <div className="admin-table-list-count log-list-count">
                {logisticsRows.length} résultat
                {logisticsRows.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            <div className="admin-table-list-header-right log-list-header-right">
              <div className="admin-table-pagination log-page-pagination">
                <button
                  className="admin-table-pagination-btn log-page-btn"
                  disabled={
                    pagination.currentPage <= 1
                  }
                  onClick={() =>
                    pagination.setPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                >
                  ←
                </button>

                <span className="admin-table-pagination-indicator log-page-indicator">
                  {pagination.currentPage} /{" "}
                  {pagination.totalPages || 1}
                </span>

                <button
                  className="admin-table-pagination-btn log-page-btn"
                  disabled={
                    pagination.currentPage >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    pagination.setPage((p) =>
                      Math.min(
                        pagination.totalPages,
                        p + 1
                      )
                    )
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="logistics-table-card">
            <LogisticsList
              orders={pagination.paged as Order[]}
              loading={loading}
              error={error}
              toastIt={toastIt}
              onShip={handleShip}
              onUpdateShippingAddress={
                updateShippingAddress
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
