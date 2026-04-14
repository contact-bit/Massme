"use client";

import React, { useMemo } from "react";
import type { Order } from "../domain/types";
import { compactId, formatDateFR, moneyEUR } from "../domain/utils";
import { StatusPill } from "./StatusPill";
import { ActionIconButton } from "./ActionIconButton";
import { IconCopy, IconEye, IconTrash } from "./icons";
import {
  getLogisticStatus,
  getShipDate,
} from "../domain/logistics";

type Props = {
  orders: Order[];
  selected: Record<string, boolean>;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  onOpen: (id: string) => void;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;
};

type OrderWithPayment = Order & {
  payment?: {
    status?: string;
  };
};

export default function OrdersTable({
  orders,
  selected,
  onToggleOne,
  onToggleAll,
  onOpen,
  onCopyId,
  onDelete,
  deleting,
}: Props) {
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

              <th>Commande</th> {/* 🔥 renommé */}
              <th>Date</th>
              <th>Email</th>
              <th>Langue</th>
              <th>Paiement</th>
              <th>Logistique</th>
              <th>Produits</th>
              <th>Total</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const order = o as OrderWithPayment;

              const paymentStatus =
                order.payment?.status ?? order.status;

              // 🔥 NUMÉRO PROPRE
              const displayId =
                (order as any)?.orderNumber ||
                (order as any)?.number ||
                compactId(order.id);

              // 🔥 LOGISTIQUE
              const logisticStatus = getLogisticStatus(order);
              const shipDate = getShipDate(order);

              return (
                <tr key={order.id}>
                  {/* SELECT */}
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[order.id]}
                      onChange={() => onToggleOne(order.id)}
                    />
                  </td>

                  {/* 🔥 ID PROPRE */}
                  <td>
                    <div className="mono" style={{ fontWeight: 700 }}>
                      #{displayId}
                    </div>
                  </td>

                  {/* DATE */}
                  <td>{formatDateFR(order.__created ?? null)}</td>

                  {/* EMAIL */}
                  <td>{order.__email || "—"}</td>

                  {/* LANG */}
                  <td>{order.__lang || "—"}</td>

                  {/* PAYMENT */}
                  <td>
                    <StatusPill status={paymentStatus} />
                  </td>

                  {/* 🔥 LOGISTIQUE + HEURE */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontSize: 12,
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
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                        }}
                      >
                        {logisticStatus === "shipped" && shipDate
                          ? new Intl.DateTimeFormat("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(shipDate))
                          : "—"}
                      </span>
                    </div>
                  </td>

                  {/* ITEMS */}
                  <td>{order.__itemsLabel || "—"}</td>

                  {/* TOTAL */}
                  <td>{moneyEUR(order.__total ?? 0)}</td>

                  {/* ACTIONS */}
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
                          onClick={() => onOpen(order.id)}
                          icon={<IconEye />}
                          variant="primary"
                        />

                        <ActionIconButton
                          title="Copier ID"
                          onClick={() => onCopyId(order.id)}
                          icon={<IconCopy />}
                        />
                      </div>

                      <ActionIconButton
                        title="Supprimer"
                        onClick={() => onDelete(order.id)}
                        icon={<IconTrash />}
                        variant="danger"
                        disabled={!!deleting[order.id]}
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