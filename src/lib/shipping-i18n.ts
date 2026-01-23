export type CountryCode = "FR" | "GB" | "DE" | "CH";
export type ShippingLocale = "fr" | "en" | "de";

export const COUNTRY_LANGUAGE_MAP: Record<
  CountryCode,
  ShippingLocale
> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  CH: "fr", // Suisse = français (modifiable plus tard)
};
