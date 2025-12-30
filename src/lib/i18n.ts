// src/lib/i18n.ts
export const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

export function getLocaleFromPathname(pathname: string | null | undefined): Locale {
  const seg = (pathname || "").split("/")[1] || "";
  return isLocale(seg) ? seg : "fr";
}
