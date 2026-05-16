import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Vitrectomie : Guide Complet de l'Intervention Oculaire – VitrectoMed",

    description:
      "Découvrez tout sur la vitrectomie : indications, déroulement, convalescence et risques. Informez-vous pour un parcours de soins serein.",
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  const prefix = `/${locale}`;

  return (
    <main className="home">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="hero section">
        <div className="container-xl">
          <div className="hero-shell">
            <div className="hero-grid">
              {/* LEFT */}

              <div className="stack-lg">
                <div className="stack-md">
                  <span className="text-label hero-label">
                   vitrectomed - Guide médical
                  </span>

                  <h1 className="title-hero hero-title">
                    Vitrectomie :
                    comprendre
                    l’intervention,
                    les indications
                    et le parcours
                    de soins
                  </h1>

                  <p className="text-large hero-intro">
                    La vitrectomie occupe aujourd’hui
                    une place centrale dans la chirurgie
                    oculaire des maladies rétiniennes.
                  </p>

                  <p className="text-body">
                    Cette intervention moderne permet
                    d’accéder à des zones sensibles
                    de l’œil afin de traiter diverses
                    pathologies rétiniennes avec une
                    précision microchirurgicale.
                  </p>

                  <p className="text-body">
                    Découvrez le déroulement de
                    l’opération, les indications,
                    les suites post-opératoires
                    et les solutions pour mieux
                    vivre la convalescence.
                  </p>
                </div>

                {/* CTA GRID */}

                <div className="hero-actions">
                  <Link
                    href={`${prefix}/convalescence/coussin`}
                    className="hero-link-card"
                  >
                    <div>
                      <strong>
                        Matériel de convalescence
                      </strong>

                      <span>
                        Solutions ergonomiques
                      </span>
                    </div>

                    <i>→</i>
                  </Link>

                  <Link
                    href={`${prefix}/pathologies`}
                    className="hero-link-card"
                  >
                    <div>
                      <strong>
                        Les pathologies
                      </strong>

                      <span>
                        Comprendre les indications
                      </span>
                    </div>

                    <i>→</i>
                  </Link>

                  <Link
                    href={`${prefix}/operation`}
                    className="hero-link-card"
                  >
                    <div>
                      <strong>
                        Les opérations
                      </strong>

                      <span>
                        Déroulement détaillé
                      </span>
                    </div>

                    <i>→</i>
                  </Link>

                  <Link
                    href={`${prefix}/temoignage`}
                    className="hero-link-card"
                  >
                    <div>
                      <strong>
                        Témoignages
                      </strong>

                      <span>
                        Retours de patients
                      </span>
                    </div>

                    <i>→</i>
                  </Link>
                </div>
              </div>

              {/* RIGHT */}

              <div className="hero-panel card card-hero">
                <div className="hero-panel-top">
                  <span className="hero-chip">
                    Chirurgie rétinienne
                  </span>

                  <span className="hero-chip hero-chip-soft">
                    Micro-invasive
                  </span>
                </div>

                <div className="hero-stats">
                  <div className="hero-stat">
                    <strong>
                      Haute précision
                    </strong>

                    <span>
                      Instruments microchirurgicaux
                    </span>
                  </div>

                  <div className="hero-stat">
                    <strong>
                      Ambulatoire
                    </strong>

                    <span>
                      Retour rapide à domicile
                    </span>
                  </div>

                  <div className="hero-stat">
                    <strong>
                      Suivi médical
                    </strong>

                    <span>
                      Contrôles post-opératoires
                    </span>
                  </div>

                  <div className="hero-stat">
                    <strong>
                      Convalescence
                    </strong>

                    <span>
                      Accompagnement personnalisé
                    </span>
                  </div>
                </div>

                <div className="hero-panel-footer">
                  Vitrectomie • Macula • Rétine •
                  Convalescence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}

      <section className="section">
        <div className="container-md stack-lg">
          <div className="section-header">
            <span className="text-label">
              Chirurgie du vitré
            </span>

            <h2 className="title-section">
              Définition et principes
              de la vitrectomie
            </h2>
          </div>

          <div className="card card-content stack-md">
            <p className="text-large">
              La vitrectomie est une
              technique chirurgicale utilisée
              pour intervenir directement
              sur la rétine située au fond
              du globe oculaire.
            </p>

            <p className="text-body">
              Grâce aux progrès des
              microscopes chirurgicaux et
              des micro-instruments, cette
              opération permet aujourd’hui
              un traitement extrêmement précis
              des pathologies rétiniennes.
            </p>

            <p className="text-body">
              Le vitré peut être remplacé par
              une bulle de gaz, un liquide
              spécifique ou une huile de silicone
              afin de maintenir la rétine
              correctement positionnée.
            </p>
          </div>

          <div className="grid-3">
            <div className="info-card">
              <strong>
                Micro-incisions
              </strong>

              <span>
                Intervention mini-invasive
              </span>
            </div>

            <div className="info-card">
              <strong>
                Haute précision
              </strong>

              <span>
                Technologie chirurgicale avancée
              </span>
            </div>

            <div className="info-card">
              <strong>
                Ambulatoire
              </strong>

              <span>
                Retour rapide au domicile
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INDICATIONS
      ========================================================= */}

      <section className="section section-alt">
        <div className="container-md stack-lg">
          <div className="section-header">
            <span className="text-label">
              Pathologies rétiniennes
            </span>

            <h2 className="title-section">
              Dans quels cas réaliser
              une vitrectomie ?
            </h2>
          </div>

          <div className="card card-content stack-md">
            <p className="text-large">
              La vitrectomie peut être
              proposée pour traiter plusieurs
              maladies touchant le vitré
              ou la rétine.
            </p>

            <ul className="modern-list">
              <li>
                Décollement de rétine
              </li>

              <li>
                Trou maculaire
              </li>

              <li>
                Rétinopathie diabétique
              </li>

              <li>
                Hémorragie intra-vitréenne
              </li>

              <li>
                Membranes épirétiniennes
              </li>

              <li>
                Inflammations profondes
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================
          OPERATION
      ========================================================= */}

      <section className="section">
        <div className="container-md stack-lg">
          <div className="section-header">
            <span className="text-label">
              Intervention
            </span>

            <h2 className="title-section">
              Comprendre le déroulement
              de l’opération
            </h2>
          </div>

          <div className="grid-2">
            <div className="card card-content stack-md">
              <h3 className="title-card">
                Les étapes techniques
              </h3>

              <p className="text-body">
                Le chirurgien retire le vitré
                grâce à des instruments
                miniaturisés puis traite
                les lésions rétiniennes.
              </p>

              <p className="text-body">
                Une bulle de gaz ou une huile
                de silicone peut ensuite être
                utilisée afin de stabiliser
                la rétine.
              </p>
            </div>

            <div className="card card-content stack-md">
              <h3 className="title-card">
                Durée et récupération
              </h3>

              <p className="text-body">
                La durée varie selon la
                complexité de l’intervention.
              </p>

              <p className="text-body">
                Une surveillance post-opératoire
                est assurée avant le retour
                à domicile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RECOVERY
      ========================================================= */}

      <section className="section section-alt">
        <div className="container-md stack-lg">
          <div className="section-header">
            <span className="text-label">
              Convalescence
            </span>

            <h2 className="title-section">
              Récupération et
              période post-opératoire
            </h2>
          </div>

          <div className="grid-2">
            <div className="card card-content stack-md">
              <h3 className="title-card">
                Adaptation du quotidien
              </h3>

              <p className="text-body">
                Certaines interventions
                nécessitent une position
                spécifique de la tête
                pendant plusieurs jours.
              </p>

              <p className="text-body">
                Les voyages en avion et
                certaines activités doivent
                être temporairement évités.
              </p>
            </div>

            <div className="card card-content stack-md">
              <h3 className="title-card">
                Sensations normales
              </h3>

              <p className="text-body">
                Une gêne légère, une sensation
                d’œil sec ou une vision trouble
                temporaire sont fréquentes
                après l’intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}

      <section className="section">
        <div className="container-md stack-lg">
          <div className="section-header">
            <span className="text-label">
              FAQ
            </span>

            <h2 className="title-section">
              Questions fréquentes
            </h2>
          </div>

          <div className="grid-2">
            <div className="card card-content stack-sm">
              <h3 className="title-card">
                La vitrectomie est-elle douloureuse ?
              </h3>

              <p className="text-body">
                L’intervention est généralement
                réalisée sous anesthésie locale
                et reste peu douloureuse.
              </p>
            </div>

            <div className="card card-content stack-sm">
              <h3 className="title-card">
                Peut-on reprendre rapidement
                le travail ?
              </h3>

              <p className="text-body">
                Cela dépend du métier et
                de l’évolution post-opératoire.
              </p>
            </div>

            <div className="card card-content stack-sm">
              <h3 className="title-card">
                Quels gestes éviter ?
              </h3>

              <ul className="modern-list">
                <li>Éviter l’avion</li>
                <li>Éviter la plongée</li>
                <li>Ne pas frotter l’œil</li>
              </ul>
            </div>

            <div className="card card-content stack-sm">
              <h3 className="title-card">
                Comment dormir après l’opération ?
              </h3>

              <p className="text-body">
                Une position ventrale peut
                être recommandée selon
                l’intervention réalisée.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    Activité
                  </th>

                  <th>
                    Reprise estimée
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    Voyage aérien
                  </td>

                  <td>
                    Après disparition du gaz
                  </td>
                </tr>

                <tr>
                  <td>
                    Télétravail
                  </td>

                  <td>
                    Entre 7 et 21 jours
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="section">
        <div className="container-lg">
          <div className="final-cta">
            <div className="stack-md">
              <span className="text-label">
                VitrectoMed
              </span>

              <h2 className="title-section">
                Préparer sereinement
                votre convalescence
              </h2>

              <p className="text-large">
                Découvrez les équipements,
                conseils et solutions pour
                améliorer votre confort
                post-opératoire.
              </p>

              <div>
                <Link
                  href={`${prefix}/convalescence/coussin`}
                  className="btn btn-primary btn-lg"
                >
                  Voir les solutions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DOCUMENTATION
      ========================================================= */}

      <section className="section section-alt">
        <div className="container-md">
          <div className="card card-content stack-md">
            <span className="text-label">
              Documentation
            </span>

            <h2 className="title-section">
              Ressources médicales
            </h2>

            <p className="text-body">
              Feuille de consentement
              officielle de la Société
              Française d’Ophtalmologie.
            </p>

            <div>
              <a
                href="https://www.sfo-online.fr/sites/www.sfo-online.fr/files/medias/documents/12a_Vitrectomie.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Télécharger le PDF
              </a>
            </div>


{/* =========================================================
    REVIEWS
========================================================= */}

<section className="section">
  <div className="container-xl stack-lg">

    <div className="section-header">
      <span className="text-label">
        Avis patients
      </span>

      <h2 className="title-section">
        Ils partagent leur expérience
      </h2>
    </div>

    <ReviewsSection locale={locale} />

  </div>
</section>


          </div>
        </div>
      </section>
    </main>
  );
}