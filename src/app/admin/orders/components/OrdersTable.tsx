"use client";

import React, {
  useEffect,
  useState,
} from "react";

import type { Order } from "../domain/types";

import {
  compactId,
  moneyEUR,
} from "../domain/utils";

import { StatusPill } from "./StatusPill";
import { ShippingStatusPill } from "./ShippingStatusPill";

import {
  ActionIconButton,
} from "./ActionIconButton";

import {
  IconEye,
  IconTrash,
} from "./icons";

import { getShipDate } from "../domain/logistics";

import { OrderDetails } from "./OrderDetails";

const heardFromLabels: Record<string, string> = {
  internet: "Internet",
  social: "Réseaux sociaux",
  medical: "Recommandation médicale",
  other: "Autre",
};

type Props = {
  orders: Order[];

  onMarkAsPaid: (
    id: string
  ) => Promise<void>;

  onDelete: (id: string) => void;

  deleting: Record<string, boolean>;

  /* OPEN */
  onOpen: (id: string) => void;

  activeId?: string | null;
};

export default function OrdersTable({
  orders,
  onOpen,
  onDelete,
  deleting,
  activeId,
}: Props) {
  const [openId, setOpenId] =
    useState<string | null>(null);
  const [sendingInvoices, setSendingInvoices] =
    useState<Record<string, boolean>>({});
  const [sentInvoices, setSentInvoices] =
    useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeId) return;
    setOpenId(activeId);
  }, [activeId]);

  function toggle(id: string) {
    setOpenId((prev) =>
      prev === id ? null : id
    );

    onOpen(id);
  }

  async function sendInvoice(orderId: string) {
    try {
      setSendingInvoices((current) => ({
        ...current,
        [orderId]: true,
      }));

      const response = await fetch("/api/admin/orders/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "invoice_send_failed");
      }

      setSentInvoices((current) => ({
        ...current,
        [orderId]: true,
      }));
    } catch (error) {
      console.error(error);
      alert("Erreur envoi facture");
    } finally {
      setSendingInvoices((current) => ({
        ...current,
        [orderId]: false,
      }));
    }
  }

  return (
    <div className="orders-table-wrap">

      <table className="orders-table-v2">

        {/* =====================================================
           HEAD
        ===================================================== */}

        <thead>
          <tr>

            <th>N°</th>

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

            const shipDate =
              getShipDate(o);

            const createdDate =
              o.__created ?? null;

            const createdDateLabel =
              createdDate
                ? createdDate.toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )
                : "—";

            const createdTimeLabel =
              createdDate
                ? createdDate.toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "";

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

            const heardFrom =
              (o as any)?.heardFrom || "—";

            const heardFromLabel =
              heardFromLabels[heardFrom] || heardFrom;

            const heardFromOther =
              (o as any)?.heardFromOther || "";

            const invoice =
              (o as any)?.invoiceEmail || null;

            const invoiceNumber =
              (o as any)?.invoiceNumber ||
              invoice?.invoiceNumber ||
              "Création...";

            const invoiceSent =
              sentInvoices[o.id] || invoice?.status === "sent";

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

                    <div className="order-date-cell">
                      <span className="cell-main">
                        {createdDateLabel}
                      </span>

                      {createdTimeLabel && (
                        <span className="cell-sub">
                          {createdTimeLabel}
                        </span>
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

                      <ShippingStatusPill
                        order={o}
                      />

                      {shipDate && (
                        <span className="cell-sub">
                          {new Intl.DateTimeFormat(
                            "fr-FR",
                            {
                              dateStyle:
                                "short",
                            }
                          ).format(
                            new Date(
                              shipDate
                            )
                          )}
                        </span>
                      )}

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

                <tr
                  className={`row-general-info ${
                    isOpen ? "open" : ""
                  }`}
                  onClick={() => toggle(o.id)}
                >
                  <td colSpan={8}>
                    <div className="row-general-info-line">
                      <span>
                        Site <strong>vitrectomed.com</strong>
                      </span>
                      <span>
                        Média <strong>{heardFromLabel}</strong>
                      </span>
                      {heardFromOther && (
                        <span>
                          Détail <strong>{heardFromOther}</strong>
                        </span>
                      )}
                      <span>
                        N° facture <strong>{invoiceNumber}</strong>
                      </span>
                      <span
                        className="row-invoice-actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <a
                          href={`/api/admin/orders/invoice?orderId=${encodeURIComponent(
                            o.id
                          )}&mode=preview`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir
                        </a>
                        <a
                          href={`/api/admin/orders/invoice?orderId=${encodeURIComponent(
                            o.id
                          )}&mode=download`}
                        >
                          PDF
                        </a>
                        <button
                          type="button"
                          disabled={sendingInvoices[o.id]}
                          onClick={() => sendInvoice(o.id)}
                        >
                          {sendingInvoices[o.id]
                            ? "..."
                            : invoiceSent
                            ? "Renvoyer"
                            : "Envoyer"}
                        </button>
                      </span>
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
