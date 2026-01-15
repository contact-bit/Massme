/* =====================================================
   PRICING — SOURCE UNIQUE DE VÉRITÉ
===================================================== */

export type PriceResult = {
  ht: number;
  vatAmount: number;
  ttc: number;
  vatRate: number;
};

export function computePrice(params: {
  priceHT: number;
  vatRate?: number;
}): PriceResult {
  const ht = round2(params.priceHT);
  const vatRate = params.vatRate && params.vatRate > 0 ? params.vatRate : 0;

  if (vatRate === 0) {
    return {
      ht,
      vatAmount: 0,
      ttc: ht,
      vatRate: 0,
    };
  }

  const vatAmount = round2((ht * vatRate) / 100);
  const ttc = round2(ht + vatAmount);

  return {
    ht,
    vatAmount,
    ttc,
    vatRate,
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
