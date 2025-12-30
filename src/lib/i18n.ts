export const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: any): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
