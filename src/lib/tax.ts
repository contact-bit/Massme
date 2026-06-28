// src/lib/tax.ts

export type TaxResult = {
  country: string;
  vatRate: number;      // %
  ht: number;
  vatAmount: number;
  ttc: number;
  applied: boolean;     // ✅ TVA appliquée ou non
};

/* ----------------------------------
   🇪🇺 EU COUNTRIES (utile par défaut)
---------------------------------- */
const EU_COUNTRIES = new Set([
  "FR","DE","ES","IT","NL","BE","LU","IE","AT",
  "FI","SE","DK","PL","CZ","SK","HU","RO","BG","HR",
  "SI","LT","LV","EE","CY","MT","GR",
]);

/* ----------------------------------
   🧠 INPUT
---------------------------------- */
export type ComputeTaxParams = {
  priceHT: number;
  country: string;

  /** TVA définie par pays (Firestore) */
  vatRate?: number;

  /** TVA activée ou non pour ce pays */
  vatEnabled?: boolean;

  /** TVA activée pour ce produit */
  applyVAT?: boolean;

  /** Forcer la désactivation (checkout pro / export) */
  disableVAT?: boolean;
};

/* ----------------------------------
   🧮 MAIN FUNCTION
---------------------------------- */
export function computeTax({
  priceHT,
  country,
  vatRate,
  vatEnabled = true,
  applyVAT = true,
  disableVAT = false,
}: ComputeTaxParams): TaxResult {
  const c = country.toUpperCase();
  const ht = round2(priceHT);

  // ❌ TVA désactivée volontairement
  if (!vatEnabled || !applyVAT || disableVAT) {
    return {
      country: c,
      vatRate: 0,
      ht,
      vatAmount: 0,
      ttc: ht,
      applied: false,
    };
  }

  // ❌ Pas de TVA hors UE si non définie
  const effectiveVatRate =
    typeof vatRate === "number"
      ? vatRate
      : EU_COUNTRIES.has(c)
      ? 20 // fallback UE
      : 0;

  if (effectiveVatRate <= 0) {
    return {
      country: c,
      vatRate: 0,
      ht,
      vatAmount: 0,
      ttc: ht,
      applied: false,
    };
  }

  const vatAmount = round2((ht * effectiveVatRate) / 100);
  const ttc = round2(ht + vatAmount);

  return {
    country: c,
    vatRate: effectiveVatRate,
    ht,
    vatAmount,
    ttc,
    applied: true,
  };
}

/* ----------------------------------
   🔢 HELPERS
---------------------------------- */
function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
