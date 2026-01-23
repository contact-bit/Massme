// /lib/shipping-i18n.ts

export type CountryCode =
  | "FR"
  | "GB"
  | "DE"
  | "ES"
  | "IT"
  | "NL"
  | "CH";

export type ShippingLocale =
  | "fr"
  | "en"
  | "de"
  | "es"
  | "it"
  | "nl";

export const COUNTRY_LANGUAGE_MAP: Record<
  CountryCode,
  ShippingLocale
> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  ES: "es",
  IT: "it",
  NL: "nl",
  CH: "fr",
};
