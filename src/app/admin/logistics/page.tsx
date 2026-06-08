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

export default function LogisticsPage() {
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
        const orderStatus = String(
          (o as any)?.status || ""
        ).toLowerCase();

        const paymentStatus =
          String(
            (o as any)
              ?.paymentStatus ||
              (o as any)?.payment
                ?.status ||
              ""
          ).toLowerCase();

        const provider = String(
          (o as any)
            ?.paymentProvider ||
            (o as any)?.provider ||
            (o as any)?.payment
              ?.provider ||
            ""
        ).toLowerCase();

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
    }, [orders]);

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

        const aTime =
          (a as any)?.createdAt?.toDate?.()
            ?.getTime?.() ??
          ((a as any)?.createdAt?._seconds
            ? (a as any).createdAt
                ._seconds * 1000
            : 0);

        const bTime =
          (b as any)?.createdAt?.toDate?.()
            ?.getTime?.() ??
          ((b as any)?.createdAt?._seconds
            ? (b as any).createdAt
                ._seconds * 1000
            : 0);

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
