import { moneyToCents } from "../money";

type Params = {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;

  shippingMethod?: {
    priceHT?: number;
    vatRate?: number;
  } | null;
};

export function calculateTotals({
  totalHT,
  totalVAT,
  totalTTC,
  shippingMethod,
}: Params) {
  const shippingHTEUR =
    shippingMethod?.priceHT ?? 0;

  const shippingVatRate =
    shippingMethod?.vatRate ?? 0;

  const cartHTCents =
    moneyToCents(totalHT);

  const cartVatCents =
    moneyToCents(totalVAT);

  const cartTTCCents =
    moneyToCents(totalTTC);

  const shippingHTCents =
    moneyToCents(
      shippingHTEUR
    );

  const shippingVatCents =
    shippingVatRate > 0
      ? Math.round(
          (
            shippingHTCents *
            shippingVatRate
          ) / 100
        )
      : 0;

  const shippingTTCCents =
    shippingHTCents +
    shippingVatCents;

  const finalTTCCents =
    cartTTCCents +
    shippingTTCCents;

  return {
    shippingHTEUR,
    shippingVatRate,

    cartHTCents,
    cartVatCents,
    cartTTCCents,

    shippingHTCents,
    shippingVatCents,
    shippingTTCCents,

    finalTTCCents,
  };
}