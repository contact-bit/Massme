"use client";

import { centsToMoney } from "../money";

import "./OrderTotals.css";

type Props = {
  t: any;

  cartHTCents: number;

  cartVatCents: number;

  shippingTTCCents: number;

  shippingVatRate: number;

  finalTTCCents: number;
};

export default function OrderTotals({
  t,
  cartHTCents,
  cartVatCents,
  shippingTTCCents,
  shippingVatRate,
  finalTTCCents,
}: Props) {

  return (
    <section className="order-totals">

      {/* HEADER */}

      <div className="order-totals-header">

        <div>

          <span className="order-totals-kicker">
            Résumé
          </span>

          <h2 className="order-totals-title">
            {t.totalInclTax}
          </h2>

        </div>

      </div>

      {/* CONTENT */}

      <div className="order-totals-content">

        {/* SUBTOTAL */}

        <div className="order-totals-row">

          <span className="order-totals-label">
            {t.subtotalExclTax}
          </span>

          <span className="order-totals-value">
            {centsToMoney(
              cartHTCents
            )} €
          </span>

        </div>

        {/* VAT */}

        {cartVatCents > 0 && (

          <div className="order-totals-row">

            <span className="order-totals-label-muted">
              {t.productVAT}
            </span>

            <span className="order-totals-value-muted">
              {centsToMoney(
                cartVatCents
              )} €
            </span>

          </div>
        )}

        {/* SHIPPING */}

        <div className="order-totals-row">

          <div className="order-totals-shipping">

            <span className="order-totals-label">
              {t.shippingInclTax}
            </span>

            <span className="order-totals-meta">
              TVA incluse :
              {" "}
              {shippingVatRate}%
            </span>

          </div>

          <span className="order-totals-value">
            {centsToMoney(
              shippingTTCCents
            )} €
          </span>

        </div>

      </div>

      {/* DIVIDER */}

      <div className="order-totals-divider" />

      {/* FINAL */}

      <div className="order-totals-final">

        <div>

          <span className="order-totals-final-label">
            {t.totalInclTax}
          </span>

          <p className="order-totals-final-description">
            Paiement sécurisé et chiffré
          </p>

        </div>

        <span className="order-totals-final-price">

          {centsToMoney(
            finalTTCCents
          )} €

        </span>

      </div>

    </section>
  );
}