"use client";
import React, { useMemo } from "react";
import type { Order } from "../domain/types";
import { compactId, formatDateFR, moneyEUR } from "../domain/utils";
import { StatusPill } from "./StatusPill";
import { ActionIconButton } from "./ActionIconButton";
import { IconCopy, IconEye, IconTrash } from "./icons";
import { LogisticsStatusBadge } from "./LogisticsStatusBadge";
import { getTrackingNumber } from "../domain/logistics";

export function OrdersTable({
  orders,
  selected,
  onToggleOne,
  onToggleAll,
  onOpen,
  onCopyId,
  onDelete,
  deleting,
}: {
  orders: Order[];
  selected: Record<string, boolean>;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  onOpen: (id: string) => void;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;
}) {
  const allPageSelected = useMemo(() => {
    if (orders.length === 0) return false;
    return orders.every((o) => selected[o.id]);
  }, [orders, selected]);

  return (
    <div className="hideMobile">
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>
                <label
                  style={{
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={onToggleAll}
                  />
                  <span>Sélect.</span>
                </label>
              </th>
              <th>ID / Logistique</th>
              <th>Date</th>
              <th>Email</th>
              <th>Langue</th>
              <th>Paiement</th>
              <th>Produits</th>
              <th>Total</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const tracking = getTrackingNumber(o);
              const paymentStatus = (o as any)?.payment?.status || o.status;

              return (
                <tr key={o.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[o.id]}
                      onChange={() => onToggleOne(o.id)}
                    />
                  </td>

                  <td>
                    <div className="mono">{compactId(o.id)}</div>

                    <div
                      className="statusBlock"
                      style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}
                    >
                      <div className="statusMain">
                        <LogisticsStatusBadge order={o} />
                      </div>

                      {tracking ? (
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                          Tracking : {tracking}
                        </div>
                      ) : null}
                    </div>
                  </td>

                  <td>{formatDateFR(o.__created ?? null)}</td>
                  <td>{o.__email || "—"}</td>
                  <td>{o.__lang || "—"}</td>

                  <td>
                    <StatusPill status={paymentStatus} />
                  </td>

                  <td>{o.__itemsLabel || "—"}</td>
                  <td>{moneyEUR(o.__total ?? 0)}</td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionIconButton
                          title="Détails"
                          onClick={() => onOpen(o.id)}
                          icon={<IconEye />}
                          variant="primary"
                        />

                        <ActionIconButton
                          title="Copier ID"
                          onClick={() => onCopyId(o.id)}
                          icon={<IconCopy />}
                        />
                      </div>

                      <ActionIconButton
                        title="Supprimer"
                        onClick={() => onDelete(o.id)}
                        icon={<IconTrash />}
                        variant="danger"
                        disabled={!!deleting[o.id]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}