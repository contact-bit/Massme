import type { Locale } from "@/lib/i18n";

export type LocalizedPageContent<T> = {
  fr: T;
} & Partial<Record<Locale, T>>;

export function getPageContent<T>(
  content: LocalizedPageContent<T>,
  locale: Locale
) {
  return content[locale] ?? content.fr;
}
