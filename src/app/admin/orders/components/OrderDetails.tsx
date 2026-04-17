"use client";
import React, { useMemo, useState } from "react";
import type { Order } from "../domain/types";
import {
  formatDateFR,
  moneyEUR,
  formatAddress,
  compactId,
} from "../domain/utils";
import {
  getItemPrice,
  getShipping,
  getSubtotal,
  getTotal,
} from "../domain/orderMath";
import { StatusPill } from "./StatusPill";
import { getShipDate, getLogisticStatus } from "../domain/logistics";

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
  onValidateBankTransfer,
}: {
  order: Order;
  onCopyId: () => void;
  onCopyEmail: () => void;
  onCopyAddress: () => void;
  onValidateBankTransfer?: (id: string) => Promise<void>;
}) {
  const [validating, setValidating] = useState(false);

  const items = Array.isArray(order.items) ? order.items : [];
  const created = order.__created ?? null;
  const total = order.__total ?? getTotal(order);
  const shipping = getShipping(order);
  const subtotal = getSubtotal(order);

  const email = (order as any).__email || order.email || "—";

  const displayId =
    (order as any).orderNumber ||
    (order as any).number ||
    compactId(order.id);

  const logisticStatus = getLogisticStatus(order);
  const shipDate = getShipDate(order);

  const relay = (order as any).relayPoint ?? null;
  const billing = (order as any).billingAddress ?? null;

  const paymentProvider =
    (order as any).payment?.provider ||
    (order as any).paymentProvider ||
    (order as any).provider ||
    null;

  const paymentStatus =
    (order as any).payment?.status ||
    (order as any).paymentStatus ||
    null;

  const bankTransferRef =
    (order as any).payment?.reference ||
    (order as any).bankTransfer?.reference ||
    (order as any).reference ||
    null;

  const isBankTransfer = paymentProvider === "bank_transfer";

  const canValidateBankTransfer = useMemo(() => {
    if (!isBankTransfer) return false;

    const status = String(order.status || "").toLowerCase();
    const payStatus = String(paymentStatus || "").toLowerCase();

    if (status === "paid") return false;
    if (payStatus === "paid" || payStatus === "validated") return false;

    return (
      status === "awaiting_bank_transfer" ||
      status === "pending_payment" ||
      payStatus === "pending" ||
      payStatus === "awaiting_bank_transfer"
    );
  }, [isBankTransfer, order.status, paymentStatus]);

  const handleValidate = async () => {
    if (!onValidateBankTransfer || !order?.id || validating) return;
    try {
      setValidating(true);
      await onValidateBankTransfer(order.id);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="detailGrid">
      {/* HEADER */}
      <div className="detailTop">
        <div>
          <div className="detailAmount">{moneyEUR(total)}</div>
          <div className="detailDate">{formatDateFR(created)}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* INFOS */}
      <section className="box">
        <h3 className="boxTitle">Infos</h3>

        <div className="kv">
          <div className="kvKey">Commande</div>
          <div className="kvVal mono">#{displayId}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Email</div>
          <div className="kvVal">{email}</div>
        </div>

        <div className="kv">
          <div className="kvKey">Paiement</div>
          <div className="kvVal">
            {paymentProvider === "stripe"
              ? "💳 Carte bancaire"
              : paymentProvider === "paypal"
              ? "🅿️ PayPal"
              : paymentProvider === "bank_transfer"
              ? "🏦 Virement bancaire"
              : "—"}
          </div>
        </div>

        <div className="kv">
          <div className="kvKey">Statut paiement</div>
          <div className="kvVal">
            {paymentStatus === "paid" || paymentStatus === "validated"
              ? "✅ Payé"
              : isBankTransfer
              ? "⏳ En attente de virement"
              : "—"}
          </div>
        </div>

        {isBankTransfer && bankTransferRef && (
          <div className="kv">
            <div className="kvKey">Référence virement</div>
            <div className="kvVal mono">{bankTransferRef}</div>
          </div>
        )}

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

        {canValidateBankTransfer && (
          <div className="bankValidateBlock">
            <button
              type="button"
              className="btn bankValidateBtn"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating
                ? "Validation du paiement..."
                : "✅ Valider le paiement par virement"}
            </button>
          </div>
        )}
      </section>

      {/* PRODUITS */}
      <section className="box">
        <h3 className="boxTitle">Produits</h3>

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

              return (
                <div key={idx} className="itemCard">
                  <div className="itemLeft">
                    <div className="itemName">{name}</div>
                    <div className="itemMeta">Qté : {qty}</div>
                  </div>
                  <div className="itemPrice">
                    {moneyEUR(price * qty)}
                  </div>
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
            <span className="sumVal sumVal--total">
              {moneyEUR(total)}
            </span>
          </div>
        </div>
      </section>

      {/* LIVRAISON + FACTURATION */}
      <section className="detailColumns">
        {/* LIVRAISON */}
        <div className="box">
          <h3 className="boxTitle">📦 Livraison</h3>

          <div className="kv">
            <div className="kvKey">Statut</div>
            <div className="kvVal">
              {logisticStatus === "shipped"
                ? "Expédiée"
                : "À préparer"}
            </div>
          </div>

          {shipDate && (
            <div className="kv">
              <div className="kvKey">Expédiée le</div>
              <div className="kvVal">
                {formatDateTime(shipDate)}
              </div>
            </div>
          )}

          {relay ? (
            <div className="addr">
              <div className="addrTitle">📦 Point relais</div>
              <div>{relay.name}</div>
              <div>{relay.address}</div>
              <div>
                {relay.postalCode} {relay.city}
              </div>
            </div>
          ) : (
            <div className="addr">
              {formatAddress(order.shippingAddress) || "—"}
            </div>
          )}

          <div className="rowBtns">
            <button
              className="btn btn--soft"
              onClick={onCopyAddress}
            >
              Copier adresse livraison
            </button>
          </div>
        </div>

        {/* FACTURATION */}
        <div className="box">
          <h3 className="boxTitle">🧾 Facturation</h3>

          <div className="addr">
            <div>{billing?.name || "—"}</div>
            <div>{billing?.address || "—"}</div>
            <div>
              {billing?.postalCode || ""} {billing?.city || ""}
            </div>
            <div>{billing?.country || ""}</div>
            {billing?.phone && <div>{billing.phone}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}