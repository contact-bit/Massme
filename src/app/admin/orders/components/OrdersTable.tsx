"use client";

import React, { useState } from "react";

import type { Order } from "../domain/types";

import {
  compactId,
  formatDateFR,
  moneyEUR,
} from "../domain/utils";

import { StatusPill } from "./StatusPill";

import {
  ActionIconButton,
} from "./ActionIconButton";

import {
  IconEye,
  IconTrash,
} from "./icons";

import {
  getLogisticStatus,
  getShipDate,
} from "../domain/logistics";

import { OrderDetails } from "./OrderDetails";

type Props = {
  orders: Order[];

  onMarkAsPaid: (
    id: string
  ) => Promise<void>;

  onDelete: (id: string) => void;

  deleting: Record<string, boolean>;

  /* OPEN */
  onOpen: (id: string) => void;
};

export default function OrdersTable({
  orders,
  onOpen,
  onDelete,
  deleting,
}: Props) {
  const [openId, setOpenId] =
    useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) =>
      prev === id ? null : id
    );

    onOpen(id);
  }

  return (
    <div className="orders-table-wrap">

      <table className="orders-table-v2">

        {/* =====================================================
           HEAD
        ===================================================== */}

        <thead>
          <tr>

            <th>Commande</th>

            <th>Date</th>

            <th>Nom</th>

            <th>Pays</th>

            <th>Paiement</th>

            <th>Livraison</th>

            <th>CA HT</th>

            <th></th>

          </tr>
        </thead>

        {/* =====================================================
           BODY
        ===================================================== */}

        <tbody>

          {orders.map((o) => {
            const isOpen =
              openId === o.id;

            const paymentStatus =
              (o as any)?.payment
                ?.status || o.status;

            const displayId =
              (o as any)?.orderNumber ||
              (o as any)?.number ||
              compactId(o.id);

            const logisticStatus =
              getLogisticStatus(o);

            const shipDate =
              getShipDate(o);

            const total =
              (o as any).total ??
              (o as any).__total ??
              (o as any)?.totals
                ?.totalTTC ??
              0;

            /* =====================================
               HT
            ===================================== */

            const totalHT =
              total / 1.2;

            /* =====================================
               COUNTRY
            ===================================== */

            const country =
              (o as any)
                ?.shippingAddress
                ?.country ||
              (o as any)
                ?.billingAddress
                ?.country ||
              "—";

            /* =====================================
               CUSTOMER NAME
            ===================================== */

            const firstName =
              (o as any)
                ?.shippingAddress
                ?.firstName || "";

            const lastName =
              (o as any)
                ?.shippingAddress
                ?.lastName || "";

            const customerName =
              `${firstName} ${lastName}`.trim() ||
              o.__email ||
              "—";

            return (
              <React.Fragment
                key={o.id}
              >

                {/* =================================
                   ROW
                ================================= */}

                <tr
                  className={`row ${
                    isOpen
                      ? "open"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(o.id)
                  }
                >

                  {/* COMMAND */}

                  <td>

                    <div className="cell-command">
                      <div className="cell-main">
                        {displayId}
                      </div>

                      <span
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <ActionIconButton
                          title="Voir"
                          onClick={() =>
                            toggle(o.id)
                          }
                          icon={<IconEye />}
                          variant="primary"
                        />
                      </span>
                    </div>

                  </td>

                  {/* DATE */}

                  <td>

                    <div className="cell-sub">
                      {formatDateFR(
                        o.__created ??
                          null
                      )}
                    </div>

                  </td>

                  {/* NAME */}

                  <td>

                    <div className="cell-main">
                      {customerName}
                    </div>

                    <div className="cell-sub">
                      {o.__itemsLabel ||
                        "—"}
                    </div>

                  </td>

                  {/* COUNTRY */}

                  <td>

                    <div className="cell-main">
                      {country}
                    </div>

                  </td>

                  {/* PAYMENT */}

                  <td>

                    <StatusPill
                      status={
                        paymentStatus
                      }
                    />

                  </td>

                  {/* SHIPPING */}

                  <td>

                    <div className="logistic-cell">

                      <span
                        className={
                          logisticStatus ===
                          "shipped"
                            ? "ok"
                            : "pending"
                        }
                      >
                        {logisticStatus ===
                        "shipped"
                          ? "Expédiée"
                          : "Préparation"}
                      </span>

                      <span className="cell-sub">

                        {shipDate
                          ? new Intl.DateTimeFormat(
                              "fr-FR",
                              {
                                dateStyle:
                                  "short",
                              }
                            ).format(
                              new Date(
                                shipDate
                              )
                            )
                          : "—"}

                      </span>

                    </div>

                  </td>

                  {/* HT */}

                  <td className="cell-strong">

                    {moneyEUR(totalHT)}

                  </td>

                  {/* ACTIONS */}

                  <td
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <div className="actions">

                      <ActionIconButton
                        title="Supprimer"
                        onClick={() =>
                          onDelete(o.id)
                        }
                        icon={
                          <IconTrash />
                        }
                        variant="danger"
                        disabled={
                          !!deleting[
                            o.id
                          ]
                        }
                      />

                    </div>

                  </td>

                </tr>

                {/* =================================
                   EXPANDED
                ================================= */}

                {isOpen && (
                  <tr className="row-expanded">

                    <td colSpan={8}>

                      <div className="expanded-content">

                        <OrderDetails
                          order={o}
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
