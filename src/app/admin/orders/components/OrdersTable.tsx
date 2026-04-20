"use client";

import React, { useState } from "react";
import type { Order } from "../domain/types";
import { compactId, formatDateFR, moneyEUR } from "../domain/utils";
import { StatusPill } from "./StatusPill";
import { ActionIconButton } from "./ActionIconButton";
import { IconCopy, IconEye, IconTrash } from "./icons";
import { getLogisticStatus, getShipDate } from "../domain/logistics";
import { OrderDetails } from "./OrderDetails";

type Props = {
  orders: Order[];

  /* ACTIONS */
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: Record<string, boolean>;
  onMarkAsPaid: (id: string) => Promise<void>;

  /* OPEN */
  onOpen: (id: string) => void;
};

export default function OrdersTable({
  orders,
  onCopyId,
  onDelete,
  deleting,
  onOpen,
  onMarkAsPaid,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    onOpen(id);
  };

  return (
    <div className="orders-table-wrap">
      <table className="orders-table-v2">
        <thead>
          <tr>
            {/* ❌ CHECKBOX SUPPRIMÉ */}
            <th>Commande</th>
            <th>Client</th>
            <th>Paiement</th>
            <th>Livraison</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => {
            const isOpen = openId === o.id;

            const paymentStatus =
              (o as any)?.payment?.status ?? o.status;

            const displayId =
              (o as any)?.orderNumber ||
              (o as any)?.number ||
              compactId(o.id);

            const logisticStatus = getLogisticStatus(o);
            const shipDate = getShipDate(o);

            const total =
              (o as any).total ??
              (o as any).__total ??
              (o as any).totals?.totalTTC ??
              0;

            return (
              <React.Fragment key={o.id}>
                <tr
                  className={`row ${isOpen ? "open" : ""}`}
                  onClick={() => toggle(o.id)}
                >
                  {/* ❌ CHECKBOX SUPPRIMÉ */}
                  <td>
                    <div className="cell-main">#{displayId}</div>
                    <div className="cell-sub">
                      {formatDateFR(o.__created ?? null)}
                    </div>
                  </td>

                  <td>
                    <div className="cell-main">{o.__email || "—"}</div>
                    <div className="cell-sub">
                      {o.__itemsLabel || "—"}
                    </div>
                  </td>

                  <td>
                    <StatusPill status={paymentStatus} />
                  </td>

                  <td>
                    <div className="logistic-cell">
                      <span
                        className={
                          logisticStatus === "shipped"
                            ? "ok"
                            : "pending"
                        }
                      >
                        {logisticStatus === "shipped"
                          ? "Expédiée"
                          : "Prépa"}
                      </span>

                      <span className="cell-sub">
                        {shipDate
                          ? new Intl.DateTimeFormat("fr-FR", {
                              dateStyle: "short",
                            }).format(new Date(shipDate))
                          : "—"}
                      </span>
                    </div>
                  </td>

                  <td className="cell-strong">
                    {moneyEUR(total)}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="actions">
                      <ActionIconButton
                        title="Voir"
                        onClick={() => toggle(o.id)}
                        icon={<IconEye />}
                        variant="primary"
                      />

                      <ActionIconButton
                        title="Copier"
                        onClick={() => onCopyId(o.id)}
                        icon={<IconCopy />}
                      />

                      <ActionIconButton
                        title="Supprimer"
                        onClick={() => onDelete(o.id)}
                        icon={<IconTrash />}
                        variant="danger"
                        disabled={!!deleting[o.id]}
                      />

                      <ActionIconButton
                        title="Marquer comme payé"
                        onClick={() => onMarkAsPaid(o.id)}
                        icon={"💳"}
                      />
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr className="row-expanded">
                    {/* ⚠️ 6 colonnes maintenant */}
                    <td colSpan={6}>
                      <div className="expanded-content">
                        <OrderDetails
                          order={o}
                          onCopyId={() => onCopyId(o.id)}
                          onCopyEmail={() => {}}
                          onCopyAddress={() => {}}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}