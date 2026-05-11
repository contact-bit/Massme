import { notFound } from "next/navigation";

import ProductsClient from "../../products/products-client";

import "./products-page.css";

export const dynamic = "force-dynamic";

const LOCALES = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
] as const;

type Locale =
  (typeof LOCALES)[number];

function normalizeLocale(
  value: string
): Locale | null {
  return (
    (
      LOCALES as readonly string[]
    ).includes(value)
      ? (value as Locale)
      : null
  );
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata() {
  return {
    title:
      "Coussin après vitrectomie — Confort post-opératoire | VitrectoMed",

    description:
      "Découvrez notre coussin ergonomique après vitrectomie pour maintenir la position face vers le bas et améliorer le confort durant la convalescence.",
  };
}

export default async function Page({
  params,
}: PageProps) {
  const { locale: raw } =
    await params;

  const locale =
    normalizeLocale(raw);

  if (!locale) {
    return notFound();
  }

  return (
    <main className="products-page-shell">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="products-hero">
        <div className="products-hero__container">
          <div className="products-hero__grid">
            {/* LEFT */}

            <div className="products-hero__content">
              <span className="products-eyebrow">
                Convalescence
                post-opératoire
              </span>

              <h1 className="products-hero__title">
                Coussin après
                vitrectomie
              </h1>

              <p className="products-hero__intro">
                Maintenez plus
                confortablement la
                position face vers le
                bas après une
                opération du trou
                maculaire ou un
                décollement de
                rétine.
              </p>

              <p className="products-hero__description">
                Pensé pour la
                récupération
                post-opératoire,
                notre coussin aide à
                réduire les tensions
                cervicales et
                améliore le confort
                pendant les longues
                périodes de position
                ventrale recommandées
                après une
                vitrectomie.
              </p>

              <div className="products-hero__badges">
                <div className="hero-badge-card">
                  <strong>
                    Ergonomique
                  </strong>

                  <span>
                    Confort longue
                    durée
                  </span>
                </div>

                <div className="hero-badge-card">
                  <strong>
                    Post-opératoire
                  </strong>

                  <span>
                    Trou maculaire &
                    rétine
                  </span>
                </div>

                <div className="hero-badge-card">
                  <strong>
                    Livraison rapide
                  </strong>

                  <span>
                    Préparation
                    immédiate
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="products-hero__panel">
              <div className="products-hero__panel-glow" />

              <div className="products-hero__panel-card">
                <div className="hero-panel-top">
                  <span>
                    VitrectoMed
                  </span>

                  <span>
                    Confort médical
                  </span>
                </div>

                <div className="hero-panel-body">
                  <div className="hero-panel-line" />
                  <div className="hero-panel-line short" />
                  <div className="hero-panel-line" />
                </div>

                <div className="hero-panel-footer">
                  Coussin •
                  Vitrectomie •
                  Convalescence •
                  Position ventrale
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section className="products-section">
        <div className="products-section__container">
          <ProductsClient
            locale={locale}
          />
        </div>
      </section>

      {/* =====================================================
          SEO CONTENT
      ===================================================== */}

      <section className="products-seo">
        <div className="products-seo__container">
          <div className="seo-block">
            <span className="seo-block__eyebrow">
              Récupération
            </span>

            <h2>
              Pourquoi utiliser un
              coussin après
              vitrectomie ?
            </h2>

            <div className="seo-card">
              <p>
                Après certaines
                opérations de la
                rétine comme le trou
                maculaire ou le
                décollement de
                rétine, il est
                souvent demandé au
                patient de maintenir
                une position face
                vers le bas pendant
                plusieurs jours.
              </p>

              <p>
                Cette posture permet
                à la bulle de gaz
                présente dans l’œil
                d’exercer une
                pression adaptée sur
                la zone opérée afin
                de favoriser la
                cicatrisation.
              </p>

              <p>
                Maintenir cette
                position durant de
                longues périodes
                peut toutefois
                provoquer des
                tensions importantes
                au niveau du dos,
                des épaules et du
                cou.
              </p>

              <p>
                Les coussins
                ergonomiques
                spécialement conçus
                pour l’après
                vitrectomie
                améliorent le
                confort quotidien et
                facilitent le
                respect des
                recommandations
                médicales.
              </p>
            </div>
          </div>

          {/* BENEFITS */}

          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>
                Position ventrale
              </h3>

              <p>
                Aide à maintenir une
                posture stable plus
                facilement.
              </p>
            </div>

            <div className="benefit-card">
              <h3>
                Réduction des
                tensions
              </h3>

              <p>
                Soulage le cou, le
                dos et les épaules
                durant la
                récupération.
              </p>
            </div>

            <div className="benefit-card">
              <h3>
                Confort quotidien
              </h3>

              <p>
                Lecture, repos ou
                repas deviennent
                plus supportables.
              </p>
            </div>
          </div>

          {/* SECOND BLOCK */}

          <div className="seo-block">
            <span className="seo-block__eyebrow">
              Convalescence
            </span>

            <h2>
              Une récupération plus
              confortable après
              l’opération
            </h2>

            <div className="seo-card">
              <p>
                La période de
                récupération après
                une vitrectomie peut
                durer plusieurs
                jours à plusieurs
                semaines selon la
                pathologie traitée.
              </p>

              <p>
                Durant cette phase,
                disposer d’un
                environnement adapté
                améliore nettement
                le confort et aide à
                mieux vivre les
                contraintes
                post-opératoires.
              </p>

              <p>
                Les accessoires
                ergonomiques dédiés
                à l’après
                vitrectomie
                permettent de mieux
                supporter les
                positions imposées
                et favorisent une
                récupération plus
                sereine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}