"use client";
import React from "react";
import type { Order } from "../domain/types";
import { formatDateFR, moneyEUR, formatAddress } from "../domain/utils";
import { getItemPrice, getShipping, getSubtotal, getTotal } from "../domain/orderMath";
import { StatusPill } from "./StatusPill";
import {
  getCarrier,
  getEffectiveShippingStatus,
  getShipDate,
  getTrackingNumber,
} from "../domain/logistics";
import { LogisticsStatusBadge } from "./LogisticsStatusBadge";

function formatDateTime(value: unknown) {
  if (!value) return "—";

  try {
    const d =
      value instanceof Date
        ? value
        : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

    if (!d || Number.isNaN(d.getTime())) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

export function OrderDetails({
  order,
  onCopyId,
  onCopyEmail,
  onCopyAddress,
}: {
  order: Order;
  onCopyId: () => void;
  onCopyEmail: () => void;
  onCopyAddress: () => void;
}) {
  const items = Array.isArray(order.items) ? order.items : [];
  const created = order.__created ?? null;
  const total = order.__total ?? getTotal(order);
  const shipping = getShipping(order);
  const subtotal = getSubtotal(order);

  const email = order.__email || order.email || "—";
  const shippingStatus = getEffectiveShippingStatus(order);
  const tracking = getTrackingNumber(order);
  const carrier = getCarrier(order);
  const shipDate = getShipDate(order);

  return (
    <div className="detailGrid">
      <div className="detailTop">
        <div>
          <div className="detailAmount">{moneyEUR(total)}</div>
          <div className="detailDate">{formatDateFR(created)}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="box">
        <div className="boxTitle">Infos</div>

        <div className="kv">
          <div className="kvKey">ID</div>
          <div className="kvVal mono">{order.id}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Email</div>
          <div className="kvVal">{email}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Langue</div>
          <div className="kvVal">{order.__lang || "—"}</div>
        </div>

        <div className="rowBtns">
          <button className="btn btn--soft" onClick={onCopyId}>
            Copier ID
          </button>
          <button className="btn btn--soft" onClick={onCopyEmail}>
            Copier email
          </button>
        </div>
      </div>

      <div className="box">
        <div className="boxTitle">Produits</div>

        {items.length === 0 ? (
          <div className="muted">Aucun item</div>
        ) : (
          <div className="items">
            {items.map((it, idx) => {
              const name =
                typeof it?.name === "string"
                  ? it.name
                  : it?.name?.fr || it?.name?.en || "Produit";
              const qty = it?.quantity ?? 1;
              const price = getItemPrice(it);
              const desc = it?.description || "";

              return (
                <div key={idx} className="itemCard">
                  <div className="itemLeft">
                    <div className="itemName">{name}</div>
                    {desc ? <div className="itemDesc">{desc}</div> : null}
                    <div className="itemMeta">Qté: {qty}</div>
                  </div>
                  <div className="itemPrice">{moneyEUR(price * qty)}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="sum">
          <div className="sumRow">
            <span className="sumKey">Sous-total</span>
            <span className="sumVal">{moneyEUR(subtotal)}</span>
          </div>
          <div className="sumRow">
            <span className="sumKey">Livraison</span>
            <span className="sumVal">{moneyEUR(shipping)}</span>
          </div>
          <div className="sumRow sumRow--total">
            <span className="sumKey sumKey--total">Total</span>
            <span className="sumVal sumVal--total">{moneyEUR(total)}</span>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="boxTitle">Logistique</div>

        <div className="kv">
          <div className="kvKey">Statut logistique</div>
          <div className="kvVal">
            <LogisticsStatusBadge status={shippingStatus} />
          </div>
        </div>

        <div className="kv">
          <div className="kvKey">Méthode de livraison</div>
          <div className="kvVal">{order.shippingMethod?.name || "—"}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Transporteur</div>
          <div className="kvVal">{carrier || "—"}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Tracking</div>
          <div className="kvVal mono">{tracking || "—"}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Date d’expédition</div>
          <div className="kvVal">{formatDateTime(shipDate)}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Mode logistique</div>
          <div className="kvVal">{(order as any)?.shippingMode || "—"}</div>
        </div>

        <div className="addr">{formatAddress(order.shippingAddress) || "—"}</div>

        <div className="rowBtns">
          <button className="btn btn--soft" onClick={onCopyAddress}>
            Copier adresse
          </button>
        </div>
      </div>
    </div>
  );
}