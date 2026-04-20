"use client";

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
import { getShipDate, getLogisticStatus } from "../domain/logistics";

/* =========================================================
   DATE SAFE
========================================================= */

function toDateSafe(value: any): Date | null {
  if (!value) return null;

  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?._seconds === "number")
    return new Date(value._seconds * 1000);

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function getRemainingTime(scheduledAt?: any) {
  const date = toDateSafe(scheduledAt);
  if (!date) return null;

  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Prêt à envoyer";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

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
  const [validating, setValidating] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [localReview, setLocalReview] = useState(
    (order as any)?.reviewEmail || null
  );

  useEffect(() => {
    const incoming = (order as any)?.reviewEmail;
    if (localReview?.status === "sent") return;
    setLocalReview(incoming || null);
  }, [order]);

  const review =
    localReview?.status === "sent"
      ? localReview
      : (order as any)?.reviewEmail || localReview;

  useEffect(() => {
    const i = setInterval(() => {
      setTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const [, setTick] = useState(0);

  /* DATA */

  const items = Array.isArray(order.items) ? order.items : [];
  const total = order.__total ?? getTotal(order);
  const shipping = getShipping(order);
  const subtotal = getSubtotal(order);

  const displayId =
    (order as any).orderNumber ||
    (order as any).number ||
    compactId(order.id);

  const logisticStatus = getLogisticStatus(order);
  const shipDate = getShipDate(order);

  /* =========================================================
     🔥 VALIDATE PAYMENT (TON API)
  ========================================================= */

  const handleValidate = async () => {
    if (validating) return;

    try {
      setValidating(true);

      const res = await fetch("/api/admin/orders/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const data = await res.json();

      if (!data?.ok) {
        throw new Error(data?.error || "Validation échouée");
      }

      // refresh simple (propre)
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("❌ Erreur validation paiement");
    } finally {
      setValidating(false);
    }
  };

  /* REVIEW */

  async function sendReviewNow(orderId: string) {
    try {
      setSendingReview(true);

      const res = await fetch("/api/admin/reviews/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!data?.ok) throw new Error();

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

  /* ========================================================= */

  return (
    <div className="admin-detail-v2">
      {/* HEADER */}
      <div className="od-header">
        <div>
          <div className="od-total">{moneyEUR(total)}</div>
          <div className="admin-muted">
            {formatDateFR(order.__created ?? null)}
          </div>
        </div>

        <div className="od-header-right">
          <StatusPill status={order.status} />

          {(order.status === "pending_payment" ||
            order.status === "awaiting_bank_transfer") && (
            <button
              className="btn-primary"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? "Validation..." : "Valider le paiement"}
            </button>
          )}
        </div>
      </div>

      {/* GRID */}
      <div className="od-grid">
        {/* LEFT */}
        <div className="od-left">
          <div className="admin-card">
            <h3 className="admin-section-title">Commande</h3>

            <div className="od-kv">
              <span>ID</span>
              <strong>#{displayId}</strong>
            </div>

            <div className="od-kv">
              <span>Email</span>
              <strong>{order.__email || order.email || "—"}</strong>
            </div>

            <div className="od-actions">
              <button className="btn-secondary" onClick={onCopyId}>
                Copier ID
              </button>
              <button className="btn-secondary" onClick={onCopyEmail}>
                Email
              </button>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-section-title">Produits</h3>

            {items.length === 0 ? (
              <div className="admin-muted">Aucun item</div>
            ) : (
              <div className="od-items">
                {items.map((it, idx) => {
                  const name =
                    typeof it?.name === "string"
                      ? it.name
                      : it?.name?.fr || it?.name?.en || "Produit";

                  const qty = it?.quantity ?? 1;
                  const price = getItemPrice(it);

                  return (
                    <div key={idx} className="od-item">
                      <div>
                        <div className="od-item-name">{name}</div>
                        <div className="admin-muted">x{qty}</div>
                      </div>

                      <div className="od-item-price">
                        {moneyEUR(price * qty)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="od-right">
          <div className="admin-card od-summary">
            <h3 className="admin-section-title">Résumé</h3>

            <div className="od-kv">
              <span>Sous-total</span>
              <strong>{moneyEUR(subtotal)}</strong>
            </div>

            <div className="od-kv">
              <span>Livraison</span>
              <strong>{moneyEUR(shipping)}</strong>
            </div>

            <div className="od-total-row">
              <span>Total</span>
              <strong>{moneyEUR(total)}</strong>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-section-title">Livraison</h3>

            <div className="od-kv">
              <span>Statut</span>
              <strong>
                {logisticStatus === "shipped"
                  ? "Expédiée"
                  : "À préparer"}
              </strong>
            </div>

            {shipDate && (
              <div className="od-kv">
                <span>Expédiée le</span>
                <strong>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(shipDate))}
                </strong>
              </div>
            )}

            <div className="admin-address">
              {formatAddress(order.shippingAddress) || "—"}
            </div>

            <button className="btn-secondary" onClick={onCopyAddress}>
              Copier adresse
            </button>
          </div>

{/* REVIEW EMAIL */}
<div className="admin-card">
  <h3 className="admin-section-title">Email d’avis</h3>

  <div className="od-kv">
    <span>Statut</span>
    <strong>{renderReviewStatus()}</strong>
  </div>

  {/* ✅ ENVOYÉ */}
  {(sendingReview || review?.status === "sent") && (
    <div className="od-kv">
      <span>Dernier envoi</span>
      <strong>
        {toDateSafe(review?.sentAt)?.toLocaleString("fr-FR") ||
          new Date().toLocaleString("fr-FR")}
      </strong>
    </div>
  )}

  {/* ✅ PROGRAMMÉ + CHRONO */}
  {!sendingReview &&
    review?.status === "scheduled" &&
    toDateSafe(review?.scheduledAt) && (
      <>
        <div className="od-kv">
          <span>Envoi prévu</span>
          <strong>
            {toDateSafe(review?.scheduledAt)!.toLocaleString("fr-FR")}
          </strong>
        </div>

        <div className="admin-muted">
          ⏳ {getRemainingTime(review?.scheduledAt)}
        </div>
      </>
    )}

  {/* ✅ BOUTON */}
  <button
    className={
      review?.status === "sent"
        ? "btn-secondary"
        : "btn-primary"
    }
    style={{ marginTop: 10 }}
    disabled={sendingReview}
    onClick={() => sendReviewNow(order.id)}
  >
    {sendingReview
      ? "Envoi..."
      : review?.status === "sent"
      ? "Renvoyer"
      : "Envoyer maintenant"}
  </button>
</div>
        </div>
      </div>
    </div>
  );
}