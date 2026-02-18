import type { CountryCode, ShippingLocale } from "@/lib/shipping-i18n";

export const COUNTRIES: {
  code: CountryCode;
  label: string;
  flag: string;
}[] = [
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "GB", label: "Angleterre", flag: "🇬🇧" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "NL", label: "Pays-Bas", flag: "🇳🇱" },
];

export const COUNTRY_TO_LOCALE: Record<CountryCode, ShippingLocale> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  ES: "es",
  IT: "it",
  NL: "nl",
  CH: "fr",
};
