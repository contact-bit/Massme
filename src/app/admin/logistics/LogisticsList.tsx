"use client";

import { useMemo } from "react";

import type { Order } from "../orders/domain/types";

import { getLogisticStatus } from "../orders/domain/logistics";

import LogisticsItem from "./LogisticsItem";

type Props = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  toastIt: (msg: string) => void;
  onShip: (
    order: Order
  ) => Promise<void>;
  onUpdateShippingAddress: (
    order: Order,
    shippingAddress: Record<string, unknown>
  ) => Promise<void>;
};

export default function LogisticsList({
  orders,
  loading,
  error,
  toastIt,
  onShip,
  onUpdateShippingAddress,
}: Props) {
  /* ================= ELIGIBLE ================= */

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

  /* ================= TABLE ORDER ================= */

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

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="log-state">
        Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="log-error">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="log-list">
      {/* TABLE HEADER */}
      <div className="log-table-header">
        <div className="log-th order">
          Commande
        </div>

        <div className="log-th">
          Date
        </div>

        <div className="log-th">
          Client
        </div>

        <div className="log-th">
          Pays
        </div>

        <div className="log-th log-delay-head">
          Service de livraison
        </div>

        <div className="log-th">
          Tarif TTC
        </div>

        <div className="log-th status">
          Statut
        </div>

        <div className="log-th log-doc-head">
          Bon de livraison
        </div>

        <div className="log-th log-action-head">
          Action
        </div>
      </div>

      {logisticsRows.length === 0 ? (
        <div className="log-empty">
          Aucune commande logistique.
        </div>
      ) : (
        logisticsRows.map((o) => (
          <LogisticsItem
            key={o.id}
            order={o}
            toastIt={toastIt}
            onShip={onShip}
            onUpdateShippingAddress={
              onUpdateShippingAddress
            }
          />
        ))
      )}
    </div>
  );
}
