"use client";

import "./OrderDetails.css";

import React, { useEffect, useState } from "react";

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

import {
  getShipDate,
  getLogisticStatus,
} from "../domain/logistics";

/* =========================================================
   DATE SAFE
========================================================= */

function toDateSafe(value: any): Date | null {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (typeof value?._seconds === "number") {
    return new Date(value._seconds * 1000);
  }

  const d = new Date(value);

  return isNaN(d.getTime()) ? null : d;
}

function getRemainingTime(scheduledAt?: any) {
  const date = toDateSafe(scheduledAt);

  if (!date) return null;

  const diff = date.getTime() - Date.now();

  if (diff <= 0) return "Prêt à envoyer";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  return `${days}j ${hours}h ${minutes}m`;
}

/* ========================================================= */

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
  const [validating, setValidating] =
    useState(false);

  const [sendingReview, setSendingReview] =
    useState(false);

  const [localReview, setLocalReview] =
    useState(
      (order as any)?.reviewEmail || null
    );

  /* =========================================================
     SYNC REVIEW
  ========================================================= */

  useEffect(() => {
    const incoming =
      (order as any)?.reviewEmail;

    if (localReview?.status === "sent") {
      return;
    }

    setLocalReview(incoming || null);
  }, [order]);

  const review =
    localReview?.status === "sent"
      ? localReview
      : (order as any)?.reviewEmail ||
        localReview;

  /* =========================================================
     LIVE TIMER
  ========================================================= */

  const [, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setTick((x) => x + 1);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  /* =========================================================
     DATA
  ========================================================= */

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const total =
    order.__total ?? getTotal(order);

  const shipping = getShipping(order);

  const subtotal = getSubtotal(order);

  const displayId =
    (order as any).orderNumber ||
    (order as any).number ||
    compactId(order.id);

  const logisticStatus =
    getLogisticStatus(order);

  const shipDate = getShipDate(order);

  const phone =
  (order as any)?.shippingAddress?.phone ||
  (order as any)?.billingAddress?.phone ||
  "—";

const site =
  "vitrectomed.com";

const heardFrom =
  (order as any)?.heardFrom || "—";

const heardFromOther =
  (order as any)?.heardFromOther || "";

const heardFromLabelMap: Record<string, string> = {
  internet: "Internet",
  social: "Réseaux sociaux",
  medical: "Recommandation médicale",
  other: "Autre",
};

const heardFromLabel =
  heardFromLabelMap[heardFrom] ||
  heardFrom;

  /* =========================================================
     VALIDATE PAYMENT
  ========================================================= */

  async function handleValidate() {
    if (validating) return;

    try {
      setValidating(true);

      const res = await fetch(
        "/api/admin/orders/mark-paid",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        }
      );

      const data = await res.json();

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "Validation échouée"
        );
      }

      window.location.reload();
    } catch (e) {
      console.error(e);

      alert(
        "❌ Erreur validation paiement"
      );
    } finally {
      setValidating(false);
    }
  }

  /* =========================================================
     SEND REVIEW
  ========================================================= */

  async function sendReviewNow(
    orderId: string
  ) {
    try {
      setSendingReview(true);

      const res = await fetch(
        "/api/admin/reviews/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      if (!data?.ok) {
        throw new Error();
      }

      const now = new Date();

      setLocalReview((prev: any) => ({
        ...prev,
        status: "sent",
        sentAt: now,
        scheduledAt: null,
      }));
    } catch (e) {
      console.error(e);

      alert("❌ Erreur envoi email");
    } finally {
      setSendingReview(false);
    }
  }

  /* =========================================================
     REVIEW STATUS
  ========================================================= */

  function renderReviewStatus() {
    if (!review?.status) return "—";

    switch (review.status) {
      case "scheduled":
        return "⏳ Programmé";

      case "sending":
        return "📤 Envoi...";

      case "sent":
        return "✅ Envoyé";

      case "error":
        return "❌ Erreur";

      default:
        return review.status;
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="od-page">

      {/* =====================================================
         TOP
      ===================================================== */}

      <section className="od-top">

        <div className="od-header-left">

          <div className="od-order-id">
            Commande #{displayId}
          </div>

          <div className="od-order-main">

            <div className="od-order-title">
              {moneyEUR(total)}
            </div>

            <StatusPill
              status={order.status}
            />

          </div>

          <div className="od-order-date">
            {formatDateFR(
              order.__created ?? null
            )}
          </div>

        </div>

        <div className="od-header-right">

          <button
            className="btn-secondary"
            onClick={onCopyId}
          >
            Copier ID
          </button>

          <button
            className="btn-secondary"
            onClick={onCopyEmail}
          >
            Copier email
          </button>

          {(order.status ===
            "pending_payment" ||
            order.status ===
              "awaiting_bank_transfer") && (
            <button
              className="btn-primary"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating
                ? "Validation..."
                : "Valider le paiement"}
            </button>
          )}

        </div>

      </section>

      {/* =====================================================
         GENERAL INFO
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Informations générales
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-info-grid">

            <div className="od-info-card">
              <div className="od-info-label">
                Commande
              </div>

              <div className="od-info-value">
                #{displayId}
              </div>
            </div>

            <div className="od-info-card">
              <div className="od-info-label">
                Email
              </div>

              <div className="od-info-value">
                {order.__email ||
                  order.email ||
                  "—"}
              </div>
            </div>

            <div className="od-info-card">
              <div className="od-info-label">
                Paiement
              </div>

              <div className="od-info-value">
                {order.status}
              </div>
            </div>

            <div className="od-info-card">
              <div className="od-info-label">
                Livraison
              </div>

              <div className="od-info-value">
                {logisticStatus ===
                "shipped"
                  ? "Expédiée"
                  : "À préparer"}
              </div>
            </div>

<div className="od-info-card">
  <div className="od-info-label">
    Téléphone
  </div>

  <div className="od-info-value">
    {phone}
  </div>
</div>


<div className="od-info-card">
  <div className="od-info-label">
    Site
  </div>

  <div className="od-info-value">
    {site}
  </div>
</div>

<div className="od-info-card">
  <div className="od-info-label">
    Média
  </div>

  <div className="od-info-value">
    {heardFromLabel}
  </div>
</div>

{heardFromOther && (
  <div className="od-info-card">
    <div className="od-info-label">
      Détail média
    </div>

    <div className="od-info-value">
      {heardFromOther}
    </div>
  </div>
)}

          </div>

        </div>

      </section>

      {/* =====================================================
         ADDRESSES
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Adresses
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-address-grid">

            <div className="od-address-card">

              <div className="od-address-title">
                Livraison
              </div>

              <div className="od-address-text">
                {formatAddress(
                  order.shippingAddress
                ) || "—"}
              </div>

              <button
                className="btn-secondary"
                onClick={onCopyAddress}
              >
                Copier adresse
              </button>

            </div>

            <div className="od-address-card">

              <div className="od-address-title">
                Facturation
              </div>

              <div className="od-address-text">
                {formatAddress(
                  (order as any)
                    .billingAddress ||
                    order.shippingAddress
                ) || "—"}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
         PRODUCTS
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Produits
          </h2>
        </div>

        <div className="od-table-wrap">

          <table className="od-table">

            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Aucun produit
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const name =
                    typeof it?.name ===
                    "string"
                      ? it.name
                      : it?.name?.fr ||
                        it?.name?.en ||
                        "Produit";

                  const qty =
                    it?.quantity ?? 1;

                  const price =
                    getItemPrice(it);

                  return (
                    <tr key={idx}>

                      <td>

                        <div className="od-product-name">
                          {name}
                        </div>

                        <div className="od-product-sub">
                          Produit boutique
                        </div>

                      </td>

                      <td className="od-table-price">
                        {moneyEUR(price)}
                      </td>

                      <td>
                        x{qty}
                      </td>

                      <td className="od-table-price">
                        {moneyEUR(
                          price * qty
                        )}
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
         TOTALS
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Totaux
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-totals">

            <div className="od-total-row">

              <div className="od-total-label">
                Sous-total
              </div>

              <div className="od-total-value">
                {moneyEUR(subtotal)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                Livraison
              </div>

              <div className="od-total-value">
                {moneyEUR(shipping)}
              </div>

            </div>

            <div className="od-total-row od-total-final">

              <div className="od-total-label">
                Total
              </div>

              <div className="od-total-value">
                {moneyEUR(total)}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
         META
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Livraison & avis
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-meta-grid">

            {/* SHIPPING */}

            <div className="od-meta-card">

              <div className="od-meta-row">

                <div className="od-meta-label">
                  Statut
                </div>

                <div className="od-meta-value">
                  {logisticStatus ===
                  "shipped"
                    ? "Expédiée"
                    : "À préparer"}
                </div>

              </div>

              {shipDate && (
                <div className="od-meta-row">

                  <div className="od-meta-label">
                    Expédiée le
                  </div>

                  <div className="od-meta-value">
                    {new Intl.DateTimeFormat(
                      "fr-FR",
                      {
                        dateStyle:
                          "medium",
                        timeStyle:
                          "short",
                      }
                    ).format(
                      new Date(shipDate)
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* REVIEW */}

            <div className="od-meta-card">

              <div className="od-meta-row">

                <div className="od-meta-label">
                  Statut email
                </div>

                <div className="od-meta-value">
                  {renderReviewStatus()}
                </div>

              </div>

              {(sendingReview ||
                review?.status ===
                  "sent") && (
                <div className="od-meta-row">

                  <div className="od-meta-label">
                    Dernier envoi
                  </div>

                  <div className="od-meta-value">
                    {toDateSafe(
                      review?.sentAt
                    )?.toLocaleString(
                      "fr-FR"
                    ) || "—"}
                  </div>

                </div>
              )}

              {!sendingReview &&
                review?.status ===
                  "scheduled" &&
                toDateSafe(
                  review?.scheduledAt
                ) && (
                  <div className="od-meta-row">

                    <div className="od-meta-label">
                      Prévu dans
                    </div>

                    <div className="od-meta-value">
                      {getRemainingTime(
                        review?.scheduledAt
                      )}
                    </div>

                  </div>
                )}

              <button
                className={
                  review?.status ===
                  "sent"
                    ? "btn-secondary"
                    : "btn-primary"
                }
                disabled={sendingReview}
                onClick={() =>
                  sendReviewNow(order.id)
                }
              >
                {sendingReview
                  ? "Envoi..."
                  : review?.status ===
                    "sent"
                  ? "Renvoyer"
                  : "Envoyer maintenant"}
              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}