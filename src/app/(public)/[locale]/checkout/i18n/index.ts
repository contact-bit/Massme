import FR from "./fr";
import EN from "./en";
import ES from "./es";
import DE from "./de";
import IT from "./it";
import NL from "./nl";

import type { Translation } from "./types";

/* =====================================================
   LOCALES
===================================================== */

export const LOCALES = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
] as const;

export type Locale =
  (typeof LOCALES)[number];

/* =====================================================
   COUNTRY
===================================================== */

export const LOCALE_TO_COUNTRY: Record<
  Locale,
  string
> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

/* =====================================================
   GET LOCALE
===================================================== */

export function getLocale(
  path: string | null
): Locale {
  const locale =
    path?.split("/")?.[1];

  return (
    (
      LOCALES as readonly string[]
    ).includes(locale ?? "")
      ? (locale as Locale)
      : "fr"
  );
}

/* =====================================================
   PAYPAL LOCALES
===================================================== */

export function mapLocaleToPayPal(
  locale: Locale
): string {
  switch (locale) {
    case "fr":
      return "fr_FR";

    case "en":
      return "en_GB";

    case "es":
      return "es_ES";

    case "de":
      return "de_DE";

    case "it":
      return "it_IT";

    case "nl":
      return "nl_NL";

    default:
      return "en_US";
  }
}

/* =====================================================
   TRANSLATIONS
===================================================== */

export const TRANSLATIONS: Record<
  Locale,
  Translation
> = {
  fr: FR,
  en: EN,
  es: ES,
  de: DE,
  it: IT,
  nl: NL,
};

/* =====================================================
   GET T
===================================================== */

export function getT(
  locale: Locale
): Translation {
  return (
    TRANSLATIONS[locale] ??
    FR
  );
}