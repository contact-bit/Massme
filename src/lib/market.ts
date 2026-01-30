/* =====================================================
   🌍 LOCALES (FRONT)
===================================================== */

export type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "nl"
  | "pt";

/* =====================================================
   🌍 MARCHÉS (BUSINESS / TVA / PRIX)
===================================================== */

export type Market =
  | "FR"
  | "EN"   // <-- on ajoute EN comme marché séparé
  | "IT"
  | "DE"
  | "ES"
  | "NL"
  | "PT"
  | "BE"
  | "CH";

/* =====================================================
   🔁 MAPPING LOCALE → MARKET
   (SOURCE DE VÉRITÉ UNIQUE)
===================================================== */

export const MARKET_BY_LOCALE: Record<Locale, Market> = {
  fr: "FR",
  en: "EN", // <-- EN pointe maintenant sur EN, plus sur FR
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
  pt: "PT",
};
