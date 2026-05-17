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
};

export default function LogisticsList({
  orders,
  loading,
  error,
  toastIt,
  onShip,
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

  /* ================= GROUPS ================= */

  const toPrepare = useMemo(
    () =>
      logisticsEligible.filter(
        (o) =>
          getLogisticStatus(o) ===
          "to_prepare"
      ),
    [logisticsEligible]
  );

  const shipped = useMemo(
    () =>
      logisticsEligible.filter(
        (o) =>
          getLogisticStatus(o) ===
          "shipped"
      ),
    [logisticsEligible]
  );

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

        <div className="log-th">
          Livraison
        </div>

        <div className="log-th">
          Tarif
        </div>

        <div className="log-th status">
          Statut
        </div>

        <div className="log-th arrow">
          +
        </div>
      </div>

      {/* TO PREPARE */}
      <div className="log-section">
        <div className="log-section-title">
          À préparer (
          {toPrepare.length})
        </div>

        {toPrepare.length === 0 ? (
          <div className="log-empty">
            Rien à préparer.
          </div>
        ) : (
          toPrepare.map((o) => (
            <LogisticsItem
              key={o.id}
              order={o}
              toastIt={toastIt}
              onShip={onShip}
            />
          ))
        )}
      </div>

      {/* SHIPPED */}
      <div className="log-section">
        <div className="log-section-title">
          Expédiées (
          {shipped.length})
        </div>

        {shipped.length === 0 ? (
          <div className="log-empty">
            Aucune expédition.
          </div>
        ) : (
          shipped.map((o) => (
            <LogisticsItem
              key={o.id}
              order={o}
              toastIt={toastIt}
              onShip={onShip}
            />
          ))
        )}
      </div>
    </div>
  );
}
