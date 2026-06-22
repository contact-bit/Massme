import Link from "next/link";
import { notFound } from "next/navigation";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import type { CountryCode } from "@/lib/shipping-i18n";
import { searchPublishedDirectoryEntries } from "@/server/directory/loadDirectoryEntries";

import DirectorySearchForm from "../DirectorySearchForm";
import DirectoryResults from "../DirectoryResults";
import "../annuaire.css";

export const revalidate = 300;

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    quoi?: string;
    ou?: string;
    page?: string;
  }>;
}

function parsePage(value?: string) {
  const page = Number(value || "1");

  return Number.isFinite(page)
    ? Math.max(1, Math.floor(page))
    : 1;
}

function buildSearchHref({
  locale,
  quoi,
  ou,
  page,
}: {
  locale: string;
  quoi: string;
  ou: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (quoi) {
    params.set("quoi", quoi);
  }

  if (ou) {
    params.set("ou", ou);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/${locale}/annuaire/recherche?${params.toString()}`;
}

function slugifyLocation(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const COUNTRY_BY_LOCALE: Record<Locale, CountryCode> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const {
    quoi = "spécialiste vitrectomie",
    ou,
  } = await searchParams;
  const locationLabel = ou || "France";

  return {
    title:
      `${quoi} à ${locationLabel} – Résultats annuaire VitrectoMed`,
    description:
      `Résultats de recherche pour ${quoi} à ${locationLabel} dans l’annuaire vitrectomie, rétine et vitré VitrectoMed.`,
    alternates: ou
      ? {
          canonical: `/${locale}/annuaire/${slugifyLocation(ou)}`,
        }
      : undefined,
  };
}

export default async function DirectorySearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale: rawLocale } =
    await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const country = COUNTRY_BY_LOCALE[locale];
  const {
    quoi = "",
    ou = "",
    page,
  } = await searchParams;
  const currentPage = parsePage(page);

  const searchResult =
    await searchPublishedDirectoryEntries({
      query: quoi,
      location: ou,
      country,
      page: currentPage,
      limit: 24,
    });
  const results = searchResult.entries;

  const searchTitle =
    `${quoi || "Spécialistes vitrectomie"}${
      ou ? ` à ${ou}` : " en France"
    }`;

  return (
    <main className="directory-page directory-results-page">
      <section className="directory-results-top">
        <div className="directory-container">
          <Link
            href={`/${locale}/annuaire`}
            className="directory-back-link"
          >
            Retour à l’annuaire
          </Link>

          <DirectorySearchForm
            compact
            initialLocation={ou}
            initialQuery={quoi}
            locale={locale}
          />
        </div>
      </section>

      <section className="directory-results-section">
        <div className="directory-container directory-results-layout">
          <aside className="directory-results-sidebar">
            <span className="directory-eyebrow">
              Résultats
            </span>

            <h1>{searchTitle}</h1>

            <p>
              {searchResult.total} résultat
              {searchResult.total > 1 ? "s" : ""}
            </p>

            <div className="directory-sort-box">
              <span>Tri</span>
              <strong>Pertinence</strong>
            </div>
          </aside>

          <DirectoryResults
            entries={results}
            emptyHref={`/${locale}/contact`}
            hasNextPage={searchResult.hasNextPage}
            hasPreviousPage={searchResult.hasPreviousPage}
            page={searchResult.page}
            previousHref={buildSearchHref({
              locale,
              quoi,
              ou,
              page: searchResult.page - 1,
            })}
            nextHref={buildSearchHref({
              locale,
              quoi,
              ou,
              page: searchResult.page + 1,
            })}
          />
        </div>
      </section>
    </main>
  );
}
