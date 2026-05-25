export type WeightPriceTier = {
  maxWeightKg: number;
  priceHT: number;
};

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeWeightPriceTiers(
  value: unknown
): WeightPriceTier[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((tier) => {
      const raw = tier as Record<string, unknown>;
      const maxWeightKg = Number(
        String(raw.maxWeightKg ?? "").replace(",", ".")
      );
      const priceHT = Number(
        String(raw.priceHT ?? "").replace(",", ".")
      );

      if (
        !Number.isFinite(maxWeightKg) ||
        !Number.isFinite(priceHT) ||
        maxWeightKg <= 0 ||
        priceHT < 0
      ) {
        return null;
      }

      return {
        maxWeightKg: round2(maxWeightKg),
        priceHT: round2(priceHT),
      };
    })
    .filter((tier): tier is WeightPriceTier => Boolean(tier))
    .sort((a, b) => a.maxWeightKg - b.maxWeightKg);
}

export function getShippingPriceForWeight(
  basePriceHT: number,
  tiers: unknown,
  totalWeightKg: number
) {
  const normalized = normalizeWeightPriceTiers(tiers);

  if (!normalized.length || totalWeightKg <= 0) {
    return round2(Number(basePriceHT) || 0);
  }

  const match = normalized.find(
    (tier) => totalWeightKg <= tier.maxWeightKg
  );

  if (match) {
    return match.priceHT;
  }

  return normalized[normalized.length - 1].priceHT;
}
