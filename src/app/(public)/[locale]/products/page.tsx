// src/app/(public)/[locale]/produits/page.tsx
import { notFound } from "next/navigation";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type Locale = (typeof LOCALES)[number];

function normalizeLocale(v: string): Locale | null {
  return (LOCALES as readonly string[]).includes(v) ? (v as Locale) : null;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  if (!locale) return notFound();

  return <ProductsClient locale={locale} />;
}
