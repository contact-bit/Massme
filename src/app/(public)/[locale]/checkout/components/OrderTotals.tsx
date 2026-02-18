"use client";

import { centsToMoney } from "../money";

export default function OrderTotals({
  t,
  cartHTCents,
  cartVatCents,
  shippingTTCCents,
  shippingVatRate,
  finalTTCCents,
}: {
  t: any;
  cartHTCents: number;
  cartVatCents: number;
  shippingTTCCents: number;
  shippingVatRate: number;
  finalTTCCents: number;
}) {
  return (
    <section className="checkout-totals">
      <div className="checkout-row">
        <span>{t.subtotalExclTax}</span>
        <span>{centsToMoney(cartHTCents)} €</span>
      </div>

      {cartVatCents > 0 && (
        <div className="checkout-row">
          <span>{t.productVAT}</span>
          <span>{centsToMoney(cartVatCents)} €</span>
        </div>
      )}

      <div className="checkout-row">
        <span>{t.shippingInclTax}</span>
        <div className="checkout-shipping-amount">
          <span>{centsToMoney(shippingTTCCents)} €</span>
          <span className="checkout-shipping-vat">TVA : {shippingVatRate} %</span>
        </div>
      </div>

      <div className="checkout-row checkout-total">
        <span>{t.totalInclTax}</span>
        <span>{centsToMoney(finalTTCCents)} €</span>
      </div>
    </section>
  );
}
