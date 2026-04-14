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
} from "../domain/logistics"; // 🔥 AJOUT

type Props = {
  orders: Order[];
  selected: Record<string, boolean>;
  onToggleOne: (id: string) => void;
  onOpen: (id: string) => void;
  onCopyId: (value: string) => void;
  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;
};

export function OrdersCards({
  orders,
  selected,
  onToggleOne,
  onOpen,
  onCopyId,
  onDelete,
  deleting,
}: Props) {
  if (!orders?.length) return null;

  return (
    <div className="showMobile">
      <div className="cards">
        {orders.map((o) => {
          const orderLabel = getOrderLabel(o);

          const paymentStatus =
            (o as unknown as { payment?: { status?: string } }).payment?.status ??
            o.status;

          // 🔥 LOGISTIQUE
          const logisticStatus = getLogisticStatus(o);
          const shipDate = getShipDate(o);

          return (
            <div key={o.id} className="orderCard">
              {/* TOP */}
              <div className="cardTop">
                <div>
                  <div className="amount">
                    {moneyEUR(o.__total ?? 0)}
                  </div>

                  <div className="date">
                    {formatDateFR(o.__created ?? null)}
                  </div>

                  <div className="date">
                    Langue: {o.__lang || "—"}
                  </div>
                </div>

                <StatusPill status={paymentStatus} />
              </div>

              {/* BODY */}
              <div className="cardBody">
                <div
                  className="mono"
                  style={{ fontWeight: 700, fontSize: 13 }}
                >
                  #{orderLabel}
                </div>

                <div className="cardEmail">
                  {o.__email || "—"}
                </div>

                <div className="cardItems">
                  {o.__itemsLabel || "—"}
                </div>

                {/* 🔥 LOGISTIQUE */}
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        logisticStatus === "shipped"
                          ? "#047857"
                          : "#92400E",
                    }}
                  >
                    {logisticStatus === "shipped"
                      ? "Expédiée"
                      : "À préparer"}
                  </div>

                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {logisticStatus === "shipped" && shipDate
                      ? new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(shipDate))
                      : "—"}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="cardBtns">
                <button
                  className="btn btn--primary"
                  onClick={() => onOpen(o.id)}
                >
                  Voir
                </button>

                <button
                  className="btn btn--ghost"
                  onClick={() => onDelete(o.id)}
                  disabled={!!deleting[o.id]}
                >
                  {deleting[o.id] ? "Suppression..." : "Suppr"}
                </button>
              </div>

              {/* SELECT */}
              <div className="selectLine">
                <label
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[o.id]}
                    onChange={() => onToggleOne(o.id)}
                  />
                  <span className="muted" style={{ fontSize: 12 }}>
                    Sélectionner
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}