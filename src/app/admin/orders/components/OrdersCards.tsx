"use client";
import React from "react";
import type { Order, ShippingStatus } from "../domain/types";
import { compactId, formatDateFR, moneyEUR } from "../domain/utils";
import { getNextActionHint, getShippingText } from "../domain/shippingText";
import { StatusPill } from "./StatusPill";

export function OrdersCards({
  orders,
  selected,
  onToggleOne,
  onOpen,
  onCopyId,
  onDelete,
  deleting,
  onUpdateShippingStatus,
}: {
  orders: Order[];
  selected: Record<string, boolean>;
  onToggleOne: (id: string) => void;
  onOpen: (id: string) => void;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;
  onUpdateShippingStatus: (order: Order, next: ShippingStatus) => void;
}) {
  return (
    <div className="showMobile">
      <div className="cards">
        {orders.map((o) => (
          <div key={o.id} className="orderCard">
            <div className="cardTop">
              <div>
                <div className="amount">{moneyEUR(o.__total ?? 0)}</div>
                <div className="date">{formatDateFR(o.__created ?? null)}</div>
                <div className="date">Langue: {o.__lang || "—"}</div>
                <div className="statusBlock" style={{ marginTop: 6 }}>
                  <div className="statusMain">{getShippingText(o.shippingStatus)}</div>
                  <div className="statusHint">{getNextActionHint(o.shippingStatus)}</div>
                </div>
              </div>
              <StatusPill status={o.status} />
            </div>

            <div className="cardBody">
              <div className="mono">{compactId(o.id)}</div>
              <div className="cardEmail">{o.__email || "—"}</div>
              <div className="cardItems">{o.__itemsLabel || "—"}</div>
            </div>

            <div className="cardBtns">
              <button className="btn btn--primary" onClick={() => onOpen(o.id)}>
                Voir
              </button>
              <button className="btn btn--ghost" onClick={() => onCopyId(o.id)}>
                Copier ID
              </button>
              <button className="btn btn--ghost" onClick={() => onUpdateShippingStatus(o, "preparing")}>
                Mettre en préparation
              </button>
              <button className="btn btn--ghost" onClick={() => onDelete(o.id)} disabled={!!deleting[o.id]}>
                Suppr
              </button>
            </div>

            <div className="selectLine">
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        ))}
      </div>
    </div>
  );
}
