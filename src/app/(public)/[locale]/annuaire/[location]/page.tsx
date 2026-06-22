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

type LocalDirectoryPageProps = {
  params: Promise<{
    locale: string;
    location: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const LOCATION_LABELS: Record<string, string> = {
  nice: "Nice",
  paris: "Paris",
  lyon: "Lyon",
  marseille: "Marseille",
  toulouse: "Toulouse",
  bordeaux: "Bordeaux",
  "alpes-maritimes": "Alpes-Maritimes",
  "bouches-du-rhone": "Bouches-du-Rhône",
  rhone: "Rhône",
  gironde: "Gironde",
  "provence-alpes-cote-d-azur":
    "Provence-Alpes-Côte d'Azur",
  paca: "Provence-Alpes-Côte d'Azur",
  "ile-de-france": "Île-de-France",
};

const COUNTRY_BY_LOCALE: Record<Locale, CountryCode> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

function parsePage(value?: string) {
  const page = Number(value || "1");

  return Number.isFinite(page)
    ? Math.max(1, Math.floor(page))
    : 1;
}

function unslug(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (letter) =>
      letter.toLocaleUpperCase("fr")
    );
}

function getLocationLabel(slug: string) {
  return LOCATION_LABELS[slug] || unslug(slug);
}

function buildLocalHref({
  locale,
  location,
  page,
}: {
  locale: string;
  location: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/${locale}/annuaire/${location}${
    params.toString() ? `?${params.toString()}` : ""
  }`;
}

export async function generateMetadata({
  params,
}: LocalDirectoryPageProps) {
  const { locale, location } = await params;
  const locationLabel = getLocationLabel(location);

  return {
    title:
      `Spécialistes vitrectomie à ${locationLabel} – Annuaire VitrectoMed`,
    description:
      `Trouvez des spécialistes de la vitrectomie, chirurgiens rétine et établissements spécialisés à ${locationLabel}.`,
    alternates: {
      canonical: `/${locale}/annuaire/${location}`,
    },
  };
}

export default async function LocalDirectoryPage({
  params,
  searchParams,
}: LocalDirectoryPageProps) {
  const {
    locale: rawLocale,
    location,
  } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const country = COUNTRY_BY_LOCALE[locale];
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const locationLabel = getLocationLabel(location);
  const query = "specialiste vitrectomie";
  const searchResult =
    await searchPublishedDirectoryEntries({
      query,
      location: locationLabel,
      country,
      page: currentPage,
      limit: 24,
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Annuaire vitrectomie à ${locationLabel}`,
    description:
      `Spécialistes vitrectomie, chirurgiens rétine et établissements spécialisés à ${locationLabel}.`,
    url: `/${locale}/annuaire/${location}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: searchResult.entries.length,
      itemListElement: searchResult.entries.map(
        (entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.name,
          item: {
            "@type":
              entry.type === "establishment"
                ? "MedicalClinic"
                : "Physician",
            name: entry.name,
            medicalSpecialty: entry.specialty,
            address: {
              "@type": "PostalAddress",
              streetAddress: entry.address,
              postalCode: entry.postalCode,
              addressLocality: entry.city,
              addressRegion: entry.department,
              addressCountry: entry.country,
            },
            telephone: entry.phone || undefined,
            url: entry.website || undefined,
          },
        })
      ),
    },
  };

  return (
    <main className="directory-page directory-results-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

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
            initialLocation={locationLabel}
            initialQuery={query}
            locale={locale}
          />
        </div>
      </section>

      <section className="directory-results-section">
        <div className="directory-container directory-results-layout">
          <aside className="directory-results-sidebar">
            <span className="directory-eyebrow">
              Annuaire local
            </span>

            <h1>
              Spécialistes vitrectomie à {locationLabel}
            </h1>

            <p>
              {searchResult.total} résultat
              {searchResult.total > 1 ? "s" : ""}
            </p>

            <div className="directory-sort-box">
              <span>Zone</span>
              <strong>{locationLabel}</strong>
            </div>
          </aside>

          <DirectoryResults
            entries={searchResult.entries}
            emptyHref={`/${locale}/contact`}
            emptyText={`Aucune fiche publiée à ${locationLabel} pour le moment. Vous pouvez proposer une fiche à vérifier.`}
            hasNextPage={searchResult.hasNextPage}
            hasPreviousPage={searchResult.hasPreviousPage}
            page={searchResult.page}
            previousHref={buildLocalHref({
              locale,
              location,
              page: searchResult.page - 1,
            })}
            nextHref={buildLocalHref({
              locale,
              location,
              page: searchResult.page + 1,
            })}
          />
        </div>
      </section>
    </main>
  );
}
