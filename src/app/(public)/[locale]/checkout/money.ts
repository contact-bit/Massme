/** Helpers argent – version stable en centimes */

export function moneyToCents(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function centsToMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}
