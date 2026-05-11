import { notFound } from "next/navigation";
import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "./home.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Vitrectomie : Guide Complet de l'Intervention Oculaire – VitrectoMed",
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
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            {/* LEFT */}
            <div className="hero-content">
              <span className="hero-badge">Guide médical complet</span>

              <h1 className="hero-title">
                Vitrectomie :
                comprendre
                l’intervention, les
                indications et le
                parcours de soins
              </h1>

              <p className="hero-intro">
                La vitrectomie occupe
                aujourd’hui une place
                centrale dans la
                chirurgie oculaire des
                maladies rétiniennes.
              </p>

              <p className="hero-description">
                Cette opération moderne
                de l’œil permet
                d’accéder à des zones
                sensibles jusque-là
                inaccessibles pour
                corriger ou traiter
                diverses pathologies.
              </p>

              <p className="hero-description">
                Mais en quoi consiste
                exactement cette
                intervention ? À
                quelles maladies
                s’adresse-t-elle,
                comment se déroule-t-elle
                concrètement, et que
                faut-il prévoir après
                l’opération ?
              </p>

              <p className="hero-description">
                Voici un tour
                d’horizon complet pour
                mieux appréhender
                chaque étape de la
                vitrectomie et vivre ce
                parcours sereinement.
              </p>

              {/* CTA */}
              <div className="hero-cta-grid">
                <Link
                  href={`${prefix}/convalescence/coussin`}
                  className="hero-card"
                >
                  <span>Matériel de convalescence</span>
                </Link>

                <Link href={`${prefix}/pathologies`} className="hero-card">
                  <span>Les pathologies</span>
                </Link>

                <Link href={`${prefix}/operation`} className="hero-card">
                  <span>Les opérations</span>
                </Link>

                <Link href={`${prefix}/temoignage`} className="hero-card">
                  <span>Témoignages</span>
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="hero-visual">
              <div className="hero-visual__glow" />

              <div className="hero-visual__panel">
                <div className="hero-visual__top">
                  <span className="hero-visual__chip">
                    Chirurgie rétinienne avancée
                  </span>

                  <span className="hero-visual__status">
                    Intervention micro-invasive
                  </span>
                </div>

                <div className="hero-visual__stats">
                  <div className="hero-stat-card">
                    <strong>Haute précision</strong>
                    <span>Instruments microchirurgicaux</span>
                  </div>

                  <div className="hero-stat-card">
                    <strong>Ambulatoire</strong>
                    <span>Retour rapide à domicile</span>
                  </div>

                  <div className="hero-stat-card">
                    <strong>Suivi médical</strong>
                    <span>Contrôle post-opératoire</span>
                  </div>

                  <div className="hero-stat-card">
                    <strong>Récupération</strong>
                    <span>Accompagnement personnalisé</span>
                  </div>
                </div>

                <div className="hero-visual__footer">
                  Vitrectomie • Décollement de rétine • Macula • Convalescence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEFINITION ===== */}
      <section className="seo-section">
        <div className="seo-container">
          <div className="section-header">
            <span>Chirurgie du vitré</span>

            <h2>Définition et principes de la vitrectomie</h2>
          </div>

          <div className="seo-card">
            <p>
              La vitrectomie est une
              technique chirurgicale
              utilisée depuis
              plusieurs décennies,
              récemment améliorée
              grâce aux progrès
              technologiques.
            </p>

            <p>
              Son principal objectif
              consiste à intervenir
              sur la rétine, située au
              fond du globe oculaire.
              L’ophtalmologiste retire
              alors le vitré, une
              substance gélatineuse
              qui remplit l’œil, afin
              de soigner divers
              troubles du segment
              postérieur.
            </p>

            <p>
              Grâce à l’utilisation
              de microscopes spéciaux
              et de micro-instruments
              chirurgicaux, il devient
              possible d’atteindre
              précisément la rétine.
            </p>

            <p>
              Remplacer le vitré par
              un autre liquide, une
              bulle de gaz ou encore
              de l’huile de silicone
              permet de maintenir la
              rétine en place et
              favorise sa
              cicatrisation.
            </p>

            <p>
              Ce type d’intervention
              a profondément fait
              évoluer la prise en
              charge de nombreuses
              pathologies visuelles.
            </p>
          </div>

          <div className="highlight-grid">
            <div className="highlight-card">Micro-incisions</div>
            <div className="highlight-card">Chirurgie de précision</div>
            <div className="highlight-card">Intervention ambulatoire</div>
          </div>
        </div>
      </section>

      {/* ===== INDICATIONS ===== */}
      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <div className="section-header">
            <span>Pathologies rétiniennes</span>

            <h2>Dans quels cas bénéficier d’une vitrectomie ?</h2>
          </div>

          <div className="seo-card">
            <p>
              On propose l’ablation
              du vitré pour
              différentes affections
              touchant le vitré ou la
              rétine.
            </p>

            <p>
              Le choix de cette
              opération dépend du
              diagnostic posé par le
              spécialiste et du
              niveau d’atteinte
              observé lors des
              examens préalables.
            </p>

            <p>
              Voici quelques
              situations où une
              vitrectomie peut être
              indispensable :
            </p>

            <ul className="seo-list">
              <li>Décollement de rétine</li>
              <li>Membranes épimaculaires / épirétiniennes</li>
              <li>Trous maculaires</li>
              <li>Rétinopathie diabétique compliquée</li>
              <li>Corps étrangers intraoculaires</li>
              <li>Hémorragie intra-vitréenne</li>
              <li>Inflammations ou infections profondes</li>
            </ul>

            <p>
              La chirurgie du vitré
              est adaptée en fonction
              des besoins spécifiques
              de chaque patient.
            </p>
          </div>
        </div>
      </section>

      {/* ===== OPERATION ===== */}
      <section className="seo-section">
        <div className="seo-container">
          <div className="section-header">
            <span>Intervention</span>

            <h2>Comprendre le déroulement de l’opération</h2>
          </div>

          <div className="seo-card">
            <p>
              Au bloc opératoire,
              l’opération de l’œil
              suit un protocole très
              sécurisé limitant les
              gênes pour le patient.
            </p>

            <p>
              L’intervention peut
              généralement être
              réalisée en ambulatoire
              sous anesthésie locale.
            </p>

            <p>
              Le spécialiste
              introduit délicatement
              plusieurs
              micro-instruments au
              travers de la
              sclérotique afin
              d’accéder au fond
              d’œil.
            </p>

            <div className="subsection-card">
              <h3>Les étapes techniques majeures</h3>

              <p>
                Les instruments
                retirent le vitré
                opacifié, sanglant ou
                encombré de débris.
              </p>

              <p>
                Selon la situation,
                le chirurgien peut
                retirer des membranes
                fibreuses, traiter un
                décollement rétinien
                ou extraire un corps
                étranger.
              </p>

              <p>
                L’espace laissé vide
                est ensuite rempli
                avec un liquide
                stérile, du gaz ou de
                l’huile de silicone.
              </p>
            </div>

            <div className="subsection-card">
              <h3>Durée et particularités</h3>

              <p>
                La durée varie selon
                la complexité de
                l’intervention.
              </p>

              <p>
                Une opération simple
                peut durer moins de
                trente minutes alors
                qu’un décollement
                complexe peut
                nécessiter jusqu’à
                90 minutes.
              </p>

              <p>
                Après l’intervention,
                une surveillance est
                assurée avant le
                retour à domicile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECOVERY ===== */}
      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <div className="section-header">
            <span>Convalescence</span>

            <h2>
              Période
              post-opératoire :
              récupération et
              restrictions
            </h2>
          </div>

          <div className="seo-card">
            <p>
              La phase de récupération
              fait partie intégrante
              du traitement.
            </p>

            <p>
              Certaines précautions
              post-opératoires
              s’imposent dans les
              jours suivant
              l’intervention.
            </p>

            <p>
              Une coque protectrice
              devra être portée afin
              d’éviter tout
              frottement accidentel.
            </p>

            <div className="subsection-card">
              <h3>L’adaptation du quotidien</h3>

              <p>
                Lorsque l’opération
                nécessite une bulle
                de gaz, il peut être
                indispensable de
                maintenir une
                position spécifique
                de la tête.
              </p>

              <p>
                Des coussins
                ergonomiques
                spécialement conçus
                pour l’après
                vitrectomie peuvent
                améliorer le confort
                et aider au respect
                des recommandations
                médicales.
              </p>

              <p>
                Les voyages en avion,
                la montagne ou la
                plongée doivent être
                évités tant que le
                gaz est présent dans
                l’œil.
              </p>
            </div>

            <div className="subsection-card">
              <h3>Sensations normales et inconforts</h3>

              <p>
                Une sensation de
                gêne, d’œil sec ou de
                grain de sable peut
                être ressentie
                temporairement.
              </p>

              <p>
                En revanche, une
                douleur importante ou
                une baisse brutale de
                la vision nécessite
                un avis médical
                rapide.
              </p>

              <p>
                Les rendez-vous de
                suivi permettent de
                contrôler la bonne
                cicatrisation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RISKS ===== */}
      <section className="seo-section">
        <div className="seo-container">
          <div className="section-header">
            <span>Surveillance</span>

            <h2>
              Complications
              potentielles et
              gestion des risques
            </h2>
          </div>

          <div className="seo-card">
            <p>
              Bien que la
              vitrectomie présente
              d’excellents résultats,
              certaines complications
              restent possibles.
            </p>

            <ul className="seo-list">
              <li>Endophtalmies</li>
              <li>Hémorragies</li>
              <li>Déchirures rétiniennes</li>
              <li>Variation de la pression intraoculaire</li>
              <li>Développement d’une cataracte</li>
            </ul>

            <p>
              Une surveillance
              attentive permet
              généralement de limiter
              les conséquences de ces
              complications.
            </p>
          </div>
        </div>
      </section>

      {/* ===== VISUAL RECOVERY ===== */}
      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <div className="section-header">
            <span>Pronostic visuel</span>

            <h2>
              Récupération visuelle :
              délai et évolution
            </h2>
          </div>

          <div className="seo-card">
            <p>
              La récupération varie
              selon la maladie
              traitée et les lésions
              observées.
            </p>

            <p>
              Après un tamponnement
              par gaz, la vision peut
              être réduite pendant
              plusieurs jours ou
              semaines.
            </p>

            <p>
              Les résultats définitifs
              peuvent parfois être
              évalués plusieurs mois
              après l’intervention.
            </p>

            <ul className="seo-list">
              <li>Récupération rapide sur les cas simples</li>
              <li>Évolution plus lente sur les pathologies complexes</li>
              <li>Importance du suivi médical régulier</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="seo-section">
        <div className="seo-container">
          <div className="section-header">
            <span>FAQ</span>

            <h2>Questions fréquentes sur la vitrectomie</h2>
          </div>

          <div className="faq-grid">
            <div className="faq-card">
              <h3>La vitrectomie est-elle douloureuse ?</h3>

              <p>
                L’intervention est
                généralement
                indolore grâce à
                l’anesthésie locale
                ou générale.
              </p>
            </div>

            <div className="faq-card">
              <h3>Peut-on reprendre le travail rapidement ?</h3>

              <p>
                La reprise dépend du
                type d’activité et de
                l’évolution
                post-opératoire.
              </p>
            </div>

            <div className="faq-card">
              <h3>Quels gestes éviter ?</h3>

              <ul className="seo-list">
                <li>Éviter l’avion</li>
                <li>Éviter la plongée</li>
                <li>Ne pas frotter l’œil</li>
              </ul>
            </div>

            <div className="faq-card">
              <h3>Comment dormir après l’opération ?</h3>

              <p>
                Certaines situations
                nécessitent une
                position ventrale
                afin de favoriser la
                cicatrisation de la
                macula.
              </p>
            </div>
          </div>

          <table className="seo-table">
            <thead>
              <tr>
                <th>Activité</th>
                <th>Reprise estimée</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Voyage aérien / montagne</td>
                <td>Après disparition du gaz</td>
              </tr>

              <tr>
                <td>Bureau / télétravail</td>
                <td>Entre 7 et 21 jours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <span className="final-cta-badge">VitrectoMed</span>

          <h2>
            Préparer sereinement
            votre convalescence
            après une vitrectomie
          </h2>

          <p>
            Découvrez les équipements,
            conseils et ressources
            utiles pour améliorer le
            confort post-opératoire.
          </p>

          <Link
            href={`${prefix}/convalescence/coussin`}
            className="final-cta-button"
          >
            Voir les solutions de
            convalescence
          </Link>
        </div>
      </section>

      {/* ===== DOCUMENTATION ===== */}
      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <div className="seo-card">
            <h2>Documentation</h2>

            <p>
              Feuille de consentement
              de la Société Française
              d’Ophtalmologie pour une
              intervention par
              vitrectomie.
            </p>

            <a
              href="https://www.sfo-online.fr/sites/www.sfo-online.fr/files/medias/documents/12a_Vitrectomie.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="documentation-link"
            >
              Télécharger la
              documentation PDF
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}