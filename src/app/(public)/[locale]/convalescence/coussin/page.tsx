import { notFound } from "next/navigation";

import ProductsClient from "../../products/products-client";

import "./products-page.css";

export const dynamic =
  "force-dynamic";

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
      "Coussin après vitrectomie — Confort post-opératoire premium | VitrectoMed",

    description:
      "Découvrez notre coussin ergonomique après vitrectomie conçu pour améliorer le confort en position face vers le bas après une chirurgie de la rétine ou un trou maculaire.",
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

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div className="products-hero__content">

              <div className="products-eyebrow">
                Vitrectomie •
                Récupération
                post-opératoire
              </div>

              <h1 className="products-hero__title">
                Coussin après
                vitrectomie
              </h1>

              <p className="products-hero__intro">
                Une solution pensée
                pour rendre la
                récupération après
                chirurgie rétinienne
                plus confortable,
                plus stable et moins
                contraignante au
                quotidien.
              </p>

              <p className="products-hero__description">
                Après un trou
                maculaire, un
                décollement de
                rétine ou certaines
                interventions
                ophtalmologiques,
                maintenir une
                position face vers
                le bas peut devenir
                extrêmement
                fatigant. Nos
                coussins ergonomiques
                aident à soulager
                les tensions
                cervicales et
                améliorent le
                confort pendant les
                longues périodes de
                convalescence.
              </p>

              <div className="products-hero__badges">

                <div className="hero-badge-card">
                  <strong>
                    Ergonomie
                    médicale
                  </strong>

                  <span>
                    Pensé pour les
                    longues périodes
                    en position
                    ventrale.
                  </span>
                </div>

                <div className="hero-badge-card">
                  <strong>
                    Confort premium
                  </strong>

                  <span>
                    Réduction des
                    tensions au cou,
                    au dos et aux
                    épaules.
                  </span>
                </div>

                <div className="hero-badge-card">
                  <strong>
                    Expédition rapide
                  </strong>

                  <span>
                    Préparation
                    immédiate après
                    validation de la
                    commande.
                  </span>
                </div>

              </div>
            </div>

            {/* =================================================
                RIGHT PANEL
            ================================================= */}

            <div className="products-hero__panel">

              <div className="products-hero__panel-glow" />

              <div className="products-hero__panel-card">

                <div className="hero-panel-top">
                  <span>
                    VitrectoMed
                  </span>

                  <span>
                    Confort
                    post-opératoire
                  </span>

                  <span>
                    Position face
                    vers le bas
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
                  Récupération •
                  Position ventrale •
                  Chirurgie rétinienne
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
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

          {/* ===============================================
              BLOCK 1
          =============================================== */}

          <div className="seo-block">

            <span className="seo-block__eyebrow">
              Après vitrectomie
            </span>

            <h2>
              Pourquoi utiliser un
              coussin ergonomique
              après une chirurgie
              de la rétine ?
            </h2>

            <div className="seo-card">

              <p>
                Après une
                vitrectomie,
                certains patients
                doivent maintenir
                une position face
                vers le bas pendant
                plusieurs jours afin
                de favoriser la
                cicatrisation de la
                rétine.
              </p>

              <p>
                Cette posture est
                fréquemment demandée
                après une opération
                du trou maculaire ou
                un décollement de
                rétine avec bulle de
                gaz intraoculaire.
              </p>

              <p>
                Maintenir cette
                position pendant de
                longues périodes
                peut rapidement
                provoquer des
                douleurs cervicales,
                des tensions dans le
                dos ainsi qu’une
                fatigue importante.
              </p>

              <p>
                Les coussins
                ergonomiques dédiés
                à l’après
                vitrectomie
                permettent
                d’améliorer le
                confort quotidien et
                d’aider le patient à
                respecter les
                recommandations
                post-opératoires.
              </p>

            </div>
          </div>

          {/* ===============================================
              BENEFITS
          =============================================== */}

          <div className="benefits-grid">

            <div className="benefit-card">
              <h3>
                Position stable
              </h3>

              <p>
                Facilite le maintien
                de la position
                ventrale durant les
                périodes prolongées.
              </p>
            </div>

            <div className="benefit-card">
              <h3>
                Moins de tensions
              </h3>

              <p>
                Réduction de la
                pression exercée sur
                le cou, les épaules
                et le dos.
              </p>
            </div>

            <div className="benefit-card">
              <h3>
                Meilleur confort
              </h3>

              <p>
                Lecture, repos,
                repas ou utilisation
                quotidienne plus
                confortables.
              </p>
            </div>

          </div>

          {/* ===============================================
              BLOCK 2
          =============================================== */}

          <div className="seo-block">

            <span className="seo-block__eyebrow">
              Convalescence
            </span>

            <h2>
              Une récupération
              post-opératoire plus
              confortable et plus
              sereine
            </h2>

            <div className="seo-card">

              <p>
                La récupération
                après une chirurgie
                ophtalmologique peut
                durer plusieurs
                jours ou plusieurs
                semaines selon la
                pathologie traitée
                et les consignes
                médicales données au
                patient.
              </p>

              <p>
                Disposer d’un
                environnement adapté
                améliore nettement
                le confort pendant
                cette période et
                aide à mieux vivre
                les contraintes
                liées à la position
                face vers le bas.
              </p>

              <p>
                Les accessoires
                ergonomiques dédiés
                à l’après
                vitrectomie
                permettent de rendre
                cette phase plus
                supportable au
                quotidien tout en
                accompagnant une
                récupération plus
                apaisée.
              </p>

            </div>
          </div>

          {/* ===============================================
              BLOCK 3
          =============================================== */}

          <div className="seo-block">

            <span className="seo-block__eyebrow">
              VitrectoMed
            </span>

            <h2>
              Une approche pensée
              pour le confort des
              patients
            </h2>

            <div className="seo-card">

              <p>
                Chez VitrectoMed,
                nous concevons des
                solutions orientées
                vers le confort
                post-opératoire et
                l’amélioration de
                l’expérience patient
                après une chirurgie
                rétinienne.
              </p>

              <p>
                Notre objectif est
                d’aider les patients
                à traverser cette
                période délicate
                avec davantage de
                confort, de stabilité
                et de sérénité.
              </p>

              <p>
                Chaque détail est
                pensé pour proposer
                une expérience plus
                premium, plus
                moderne et adaptée
                aux besoins réels de
                la récupération
                post-vitrectomie.
              </p>

            </div>
          </div>

        </div>
      </section>
    </main>
  );
}