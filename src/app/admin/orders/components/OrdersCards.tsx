"use client";

import type { Order } from "../domain/types";
import {
  formatDateFR,
  moneyEUR,
  getOrderLabel,
} from "../domain/utils";

import { StatusPill } from "./StatusPill";
import {
  getLogisticStatus,
  getShipDate,
} from "../domain/logistics";

type Props = {
  orders: Order[];
  selected: Record<string, boolean>;
  onToggleOne: (id: string) => void;
  onOpen: (id: string) => void;

  onCopyId: (id: string) => void;

  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;

  onMarkAsPaid: (id: string) => Promise<void>; // 💥 AJOUT
};

export function OrdersCards({
  orders,
  selected,
  onToggleOne,
  onOpen,
  onCopyId,
  onDelete,
  deleting,
  onMarkAsPaid, // 💥 IMPORTANT
}: Props) {
  if (!orders?.length) return null;

  return (
    <div className="showMobile">
      <div className="admin-cards">
        {orders.map((o) => {
          const orderLabel = getOrderLabel(o);

          const paymentStatus =
            (o as any)?.payment?.status ?? o.status;

          const logisticStatus = getLogisticStatus(o);
          const shipDate = getShipDate(o);

          const total =
            (o as any).total ??
            (o as any).__total ??
            o.totals?.totalTTC ??
            0;

          const isPaid = paymentStatus === "paid";

          return (
            <div key={o.id} className="order-card-v2">

              {/* HEADER */}
              <div className="oc-header">
                <div>
                  <div className="oc-price">{moneyEUR(total)}</div>
                  <div className="oc-date">
                    {formatDateFR(o.__created ?? null)}
                  </div>
                </div>

                <StatusPill status={paymentStatus} />
              </div>

              {/* BODY */}
              <div className="oc-body">
                <div className="oc-id">{orderLabel}</div>
                <div className="oc-email">
                  {o.__email || "—"}
                </div>

                <div className="oc-items">
                  {o.__itemsLabel || "—"}
                </div>
              </div>

              {/* LOGISTIC */}
              <div className="oc-logistic">
                <span
                  className={`oc-status ${
                    logisticStatus === "shipped"
                      ? "success"
                      : "warning"
                  }`}
                >
                  {logisticStatus === "shipped"
                    ? "Expédiée"
                    : "À préparer"}
                </span>

                <span className="oc-shipdate">
                  {logisticStatus === "shipped" && shipDate
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(shipDate))
                    : "—"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="oc-footer">
                <button
                  className="btn-primary"
                  onClick={() => onOpen(o.id)}
                >
                  Voir
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => onCopyId(o.id)}
                >
                  Copier
                </button>

                <button
                  className="btn-danger"
                  onClick={() => onDelete(o.id)}
                  disabled={!!deleting[o.id]}
                >
                  {deleting[o.id] ? "..." : "Suppr"}
                </button>

                {/* 💥 BOUTON PAIEMENT */}
                <button
                  className="btn-success"
                  onClick={() => onMarkAsPaid(o.id)}
                  disabled={isPaid}
                >
                  {isPaid ? "Payé ✓" : "Marquer payé"}
                </button>

                <input
                  type="checkbox"
                  checked={!!selected[o.id]}
                  onChange={() => onToggleOne(o.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
