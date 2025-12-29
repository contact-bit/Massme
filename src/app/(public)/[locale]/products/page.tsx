import { notFound } from "next/navigation";
import ProductsClient from "./products-client";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type Locale = (typeof LOCALES)[number];

function normalizeLocale(v: string): Locale | null {
  return (LOCALES as readonly string[]).includes(v) ? (v as Locale) : null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  if (!locale) return notFound();

  return <ProductsClient locale={locale} />;
}
