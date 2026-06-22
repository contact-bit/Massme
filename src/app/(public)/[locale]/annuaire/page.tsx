import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  MapPinned,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import type { CountryCode } from "@/lib/shipping-i18n";
import { loadPublishedDirectoryEntries } from "@/server/directory/loadDirectoryEntries";

import DirectorySearchForm from "./DirectorySearchForm";
import "./annuaire.css";

export const revalidate = 300;

const directoryPromises = [
  {
    icon: Stethoscope,
    title: "Chirurgiens rétine",
    text:
      "Rechercher des professionnels impliqués dans la vitrectomie, la chirurgie de la rétine et le suivi post-opératoire.",
  },
  {
    icon: Building2,
    title: "Établissements",
    text:
      "Identifier hôpitaux, cliniques et centres disposant d’une activité de chirurgie vitréo-rétinienne.",
  },
  {
    icon: ShieldCheck,
    title: "Fiches vérifiées",
    text:
      "Publier uniquement des informations utiles, structurées et vérifiables avant mise en ligne.",
  },
];

const trustItems = [
  "Recherche centrée vitrectomie",
  "Recherche par ville ou département",
  "Résultats dédiés rétine et vitré",
];

const popularLocations = [
  { label: "Nice", slug: "nice" },
  { label: "Alpes-Maritimes", slug: "alpes-maritimes" },
  {
    label: "Provence-Alpes-Côte d’Azur",
    slug: "provence-alpes-cote-d-azur",
  },
  { label: "Paris", slug: "paris" },
  { label: "Île-de-France", slug: "ile-de-france" },
  { label: "Lyon", slug: "lyon" },
];

const COUNTRY_BY_LOCALE: Record<Locale, CountryCode> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  de: "DE",
  it: "IT",
  nl: "NL",
};

export async function generateMetadata() {
  return {
    title:
      "Annuaire vitrectomie et chirurgie rétine en France – VitrectoMed",
    description:
      "Recherchez un spécialiste de la vitrectomie, un chirurgien rétine, un hôpital ou une clinique en France depuis l’annuaire VitrectoMed.",
  };
}

export default async function DirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } =
    await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const country = COUNTRY_BY_LOCALE[locale];
  const prefix = `/${locale}`;
  const directoryEntries =
    await loadPublishedDirectoryEntries({
      country,
    });
  const featuredDirectoryEntries =
    directoryEntries.slice(0, 4);

  return (
    <main className="directory-page">
      <section className="directory-hero directory-hero--search">
        <div className="directory-container">
          <div className="directory-hero-panel">
            <div className="directory-hero-background">
              <img
                src="/brand/annuaire-hero-europe.png"
                alt=""
              />
            </div>

            <div className="directory-hero-search-container">
              <div className="directory-search-hero-content">
                <span className="directory-eyebrow">
                  Annuaire national France
                </span>

                <h1>
                  Trouver un spécialiste vitrectomie,
                  un chirurgien rétine ou un
                  établissement spécialisé
                </h1>

                <p>
                  Recherchez une fiche vérifiée par ville,
                  type de structure ou besoin lié à la
                  vitrectomie.
                </p>
              </div>

              <DirectorySearchForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="directory-trust-strip-section">
        <div className="directory-container">
          <div className="directory-trust-strip">
            {trustItems.map((item) => (
              <span key={item}>
                <CheckCircle2 size={20} aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-container">
          <div className="directory-section-card">
            <div className="directory-section__head">
              <span className="directory-eyebrow">
                Aperçu de l’annuaire
              </span>

              <h2>
                Quelques spécialistes et établissements référencés
              </h2>

              <p>
                Découvrez une sélection de fiches publiées.
                Utilisez la recherche pour explorer l’annuaire
                complet par ville, spécialité ou type
                d’établissement.
              </p>
            </div>

            {featuredDirectoryEntries.length > 0 ? (
              <div className="directory-featured-marquee">
                {[0, 1].map((loopIndex) => (
                  <div
                    className="directory-featured-list"
                    key={loopIndex}
                    aria-hidden={loopIndex === 1}
                  >
                    {featuredDirectoryEntries.map((entry) => (
                      <article
                        className="directory-featured-card"
                        key={`${loopIndex}-${entry.id}`}
                      >
                        <div className="directory-featured-card__head">
                          <span>{entry.category}</span>
                          <strong>{entry.city}</strong>
                        </div>

                        <h3>{entry.name}</h3>

                        <p>{entry.specialty}</p>

                        <p className="directory-featured-card__address">
                          <MapPinned size={17} aria-hidden="true" />
                          {[
                            entry.address,
                            entry.postalCode,
                            entry.city,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        <div className="directory-featured-card__actions">
                          {entry.phone ? (
                            <a href={`tel:${entry.phone}`}>
                              <Phone size={17} aria-hidden="true" />
                              Appeler
                            </a>
                          ) : null}

                          {entry.website ? (
                            <a href={entry.website}>
                              <Building2
                                size={17}
                                aria-hidden="true"
                              />
                              Site officiel
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="directory-results-empty">
                <Stethoscope size={34} aria-hidden="true" />
                <h2>Aucune fiche publiée pour le moment</h2>
                <p>
                  Les fiches ajoutées en administration
                  apparaîtront ici dès qu’elles seront au
                  statut publié.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-container">
          <div className="directory-section-card">
            <div className="directory-section__head">
              <span className="directory-eyebrow">
                Fonctionnement
              </span>

              <h2>
                Une recherche simple, puis une page de résultats par ville
              </h2>

              <p>
                L’annuaire fonctionne comme un moteur de
                recherche : vous indiquez ce que vous cherchez
                et où vous cherchez. La page suivante regroupe
                les fiches correspondant à la ville ou au secteur.
              </p>
            </div>

            <div className="directory-promise-grid">
              {directoryPromises.map((promise) => {
                const Icon = promise.icon;

                return (
                  <article
                    className="directory-promise-card"
                    key={promise.title}
                  >
                    <div className="directory-promise-card__icon">
                      <Icon size={25} aria-hidden="true" />
                    </div>

                    <h3>{promise.title}</h3>
                    <p>{promise.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-container">
          <div className="directory-section-card">
            <div className="directory-section__head">
              <span className="directory-eyebrow">
                Recherches fréquentes
              </span>

              <h2>
                Accès rapide par ville ou région
              </h2>

              <p>
                Ouvrez directement une page locale dédiée
                aux spécialistes vitrectomie et structures
                référencées dans la zone recherchée.
              </p>
            </div>

            <div className="directory-location-links">
              {popularLocations.map((location) => (
                <Link
                  key={location.slug}
                  href={`${prefix}/annuaire/${location.slug}`}
                >
                  {location.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-container directory-cta">
          <div>
            <span className="directory-eyebrow">
              Référencement
            </span>

            <h2>
              Vous souhaitez proposer une fiche ?
            </h2>

            <p>
              Envoyez les informations publiques à
              vérifier : nom, spécialité, ville,
              structure, site officiel et coordonnées
              professionnelles.
            </p>
          </div>

          <Link
            href={`${prefix}/contact`}
            className="directory-cta__button"
          >
            Proposer une fiche
          </Link>
        </div>
      </section>

      <section className="directory-section directory-section--note">
        <div className="directory-container">
          <div className="directory-note">
            <MapPinned size={22} aria-hidden="true" />
            <p>
              L’annuaire est en cours de structuration.
              Les fiches réelles seront ajoutées après
              vérification des informations publiques.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
