import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "../pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Myopie forte : Symptômes, Diagnostic et Options Chirurgicales – VitrectoMed",

    description:
      "Découvrez tout sur la myopie forte, ses symptômes, le diagnostic précis et les interventions chirurgicales possibles pour améliorer votre vision.",
  };
}

export default async function HighMyopiaPage({
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

  const prefix = `/${locale}`;

  return (
    <main className="pathologies-page">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="pathologies-hero">
        <div className="pathologies-container">
          <span className="pathologies-badge">
            Myopie forte et rétine
          </span>

          <h1 className="pathologies-title">
            Myopie forte : tout
            comprendre, des symptômes
            à la chirurgie et ses
            résultats
          </h1>

          <p className="pathologies-intro">
            La myopie forte concerne
            un nombre croissant de
            personnes et ne se limite
            pas à une simple
            difficulté pour voir de
            loin.
          </p>

          <p className="pathologies-description">
            Les yeux très myopes
            présentent souvent des
            modifications anatomiques
            profondes du fond d’œil,
            augmentant le risque de
            complications rétiniennes
            nécessitant parfois une
            chirurgie spécialisée.
          </p>

          <p className="pathologies-description">
            Comprendre les symptômes,
            les examens de diagnostic
            et les traitements
            disponibles permet une
            prise en charge plus
            précoce et une meilleure
            préservation de la
            vision.
          </p>

          {/* CTA GRID */}

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/operation`}
              className="pathologies-card"
            >
              En savoir plus sur la
              vitrectomie
            </Link>

            <Link
              href={`${prefix}/convalescence/coussin`}
              className="pathologies-card pathologies-card--accent"
            >
              Matériel de
              convalescence après
              vitrectomie
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEFINITION
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Qu’est-ce que la myopie
            forte ?
          </h2>

          <p>
            La myopie forte correspond
            généralement à une
            correction supérieure à
            -6 dioptries.
          </p>

          <p>
            Cette forme sévère de
            myopie se caractérise par
            une longueur axiale de
            l’œil anormalement
            allongée.
          </p>

          <p>
            Cet allongement modifie
            progressivement les
            structures internes de
            l’œil, notamment la
            rétine et la macula,
            essentielles à la vision
            centrale précise.
          </p>

          <p>
            Contrairement à une
            myopie modérée, la
            myopie forte ne se limite
            pas à un simple besoin de
            lunettes ou de lentilles.
          </p>

          <p>
            Les dioptries élevées
            fragilisent la rétine et
            exposent à des
            complications oculaires
            pouvant menacer
            durablement la vision.
          </p>

          <p>
            Un suivi ophtalmologique
            régulier est donc
            indispensable afin de
            dépister rapidement toute
            anomalie évolutive.
          </p>
        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Reconnaître les
            symptômes et les signes
            associés à la myopie
            forte
          </h2>

          <p>
            Les premiers signes de
            myopie forte incluent
            souvent une baisse rapide
            de la vision de loin avec
            nécessité de modifier
            fréquemment la correction
            optique.
          </p>

          <p>
            D’autres symptômes plus
            spécifiques peuvent
            apparaître et doivent
            attirer l’attention.
          </p>

          <ul className="seo-list">
            <li>
              Vision floue persistante
              malgré la correction
            </li>

            <li>
              Apparition de mouches
              volantes ou points
              noirs mobiles
            </li>

            <li>
              Flashs lumineux dans le
              champ visuel
            </li>

            <li>
              Déformations des lignes
              ou des images
            </li>

            <li>
              Baisse de vision
              centrale
            </li>
          </ul>

          <p>
            Ces symptômes peuvent
            révéler une atteinte de
            la macula ou de la
            rétine périphérique.
          </p>

          <p>
            Une consultation rapide
            chez l’ophtalmologiste
            permet alors de rechercher
            des complications comme
            un trou maculaire, un
            rétinoschisis ou un
            décollement de rétine.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIAGNOSTIC
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Comment se déroule le
            diagnostic de la myopie
            forte ?
          </h2>

          <p>
            Le diagnostic débute par
            une mesure précise de
            l’acuité visuelle avec la
            meilleure correction
            possible.
          </p>

          <p>
            L’ophtalmologiste réalise
            ensuite un examen complet
            de l’œil afin d’analyser
            les structures internes
            et détecter les signes de
            fragilité rétinienne.
          </p>

          <p>
            Le fond d’œil permet
            notamment de rechercher
            un staphylome postérieur,
            des lésions périphériques
            ou des zones de traction
            pouvant favoriser un
            décollement de rétine.
          </p>

          <h3>
            L’importance de l’OCT
          </h3>

          <p>
            La tomographie par
            cohérence optique (OCT)
            constitue l’examen clé du
            suivi des yeux très
            myopes.
          </p>

          <p>
            Cet examen indolore
            permet de visualiser en
            détail la macula et la
            rétine afin de détecter
            précocement :
          </p>

          <ul className="seo-list">
            <li>
              Distensions rétiniennes
            </li>

            <li>
              Rétinoschisis maculaire
            </li>

            <li>
              Fissures ou trous
              maculaires
            </li>

            <li>
              Œdème ou déformations
              rétiniennes
            </li>
          </ul>
        </div>
      </section>

      {/* =====================================================
          SURGERY INDICATIONS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            À quel moment envisager
            une opération en cas de
            myopie forte ?
          </h2>

          <p>
            Une baisse de vision ne
            conduit pas
            systématiquement à une
            chirurgie.
          </p>

          <p>
            Les indications
            opératoires reposent
            surtout sur l’évolution
            des anomalies observées à
            l’OCT et sur
            l’aggravation progressive
            de l’acuité visuelle.
          </p>

          <p>
            Lorsque la vision diminue
            rapidement ou que des
            complications apparaissent,
            il devient préférable
            d’intervenir avant une
            dégradation trop avancée
            de la rétine.
          </p>

          <p>
            Une prise en charge
            précoce améliore souvent
            les chances de récupération
            visuelle après traitement.
          </p>

          <ul className="seo-list">
            <li>
              Diminution progressive
              de l’acuité visuelle
            </li>

            <li>
              Aggravation visible à
              l’OCT
            </li>

            <li>
              Apparition d’un trou
              maculaire
            </li>

            <li>
              Rétinoschisis évolutif
            </li>

            <li>
              Risque de décollement
              de rétine
            </li>
          </ul>
        </div>
      </section>

      {/* =====================================================
          SURGERY
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Principales étapes de la
            chirurgie de la myopie
            forte
          </h2>

          <p>
            La vitrectomie représente
            la technique la plus
            utilisée pour traiter les
            complications liées à la
            myopie forte.
          </p>

          <p>
            Cette intervention
            consiste à retirer le
            vitré afin de supprimer
            les tractions exercées
            sur la rétine et la
            macula.
          </p>

          <p>
            Le chirurgien introduit
            plusieurs micro-
            instruments à travers de
            très petites incisions
            réalisées dans la sclère.
          </p>

          <p>
            Après aspiration du
            vitré, la membrane
            limitante interne de la
            rétine peut être retirée
            délicatement autour de la
            macula afin de réduire
            les tensions responsables
            des lésions.
          </p>

          <ul className="seo-list">
            <li>
              Pénétration dans l’œil
              via des micro-incisions
            </li>

            <li>
              Aspiration contrôlée du
              vitré
            </li>

            <li>
              Traitement des
              adhérences maculaires
            </li>

            <li>
              Retrait de la membrane
              limitante interne
            </li>

            <li>
              Contrôle final de
              l’intégrité rétinienne
            </li>
          </ul>

          <p>
            Ces opérations exigent
            une expertise importante
            afin de préserver les
            structures rétiniennes
            fragiles.
          </p>

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/operation`}
              className="pathologies-card"
            >
              Découvrir la
              vitrectomie
            </Link>

            <Link
              href={`${prefix}/operation/risque`}
              className="pathologies-card"
            >
              Risques et complications
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          POST OPERATIVE
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quelles sont les suites
            après l'opération ?
          </h2>

          <p>
            Après une chirurgie de la
            myopie forte, l’œil reste
            généralement peu douloureux
            et retrouve progressivement
            sa stabilité.
          </p>

          <p>
            Des fluctuations visuelles
            temporaires ou une légère
            gêne peuvent apparaître
            durant les premières
            semaines.
          </p>

          <p>
            La récupération complète
            dépend du stade initial
            des lésions et peut
            nécessiter plusieurs mois
            de surveillance.
          </p>

          <ul className="seo-list">
            <li>
              Contrôles réguliers de
              la macula
            </li>

            <li>
              Surveillance d’un
              éventuel trou
              maculaire
            </li>

            <li>
              Suivi de l’évolution du
              rétinoschisis
            </li>

            <li>
              Adaptation progressive
              de la correction
              optique
            </li>

            <li>
              Reprise progressive des
              activités quotidiennes
            </li>
          </ul>

          <p>
            Dans la majorité des cas,
            la stabilité de la macula
            s’observe progressivement
            au cours de l’année qui
            suit l’intervention.
          </p>
        </div>
      </section>

      {/* =====================================================
          RISKS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Surveillance et risques
            potentiels liés à la
            myopie forte
          </h2>

          <p>
            Même sous surveillance,
            la myopie forte expose à
            un risque accru de
            complications du segment
            postérieur de l’œil.
          </p>

          <p>
            Certaines lésions
            apparaissent
            progressivement au fil du
            temps tandis que d’autres
            surviennent brutalement.
          </p>

          <ul className="seo-list">
            <li>
              Décollement de rétine
            </li>

            <li>
              Déchirures rétiniennes
            </li>

            <li>
              Membranes épirétiniennes
            </li>

            <li>
              Cataracte précoce
            </li>

            <li>
              Altérations irréversibles
              du champ visuel
            </li>
          </ul>

          <p>
            Toute baisse soudaine de
            vision, apparition de
            flashs lumineux ou
            multiplication brutale
            des corps flottants doit
            conduire à consulter en
            urgence.
          </p>
        </div>
      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quel résultat visuel
            espérer après traitement ?
          </h2>

          <p>
            Lorsque la chirurgie est
            réalisée à un stade
            adapté, une amélioration
            notable de l’acuité
            visuelle peut être
            obtenue.
          </p>

          <p>
            Le résultat dépend
            toutefois de nombreux
            facteurs :
          </p>

          <ul className="seo-list">
            <li>
              État initial de la
              rétine
            </li>

            <li>
              Ancienneté des lésions
            </li>

            <li>
              Rapidité de la prise en
              charge
            </li>

            <li>
              Présence d’un trou
              maculaire ou d’un
              œdème
            </li>

            <li>
              Qualité de la correction
              optique après chirurgie
            </li>
          </ul>

          <div className="seo-table-wrapper">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>
                    Situation
                    pré-opératoire
                  </th>

                  <th>
                    Amélioration
                    attendue
                  </th>

                  <th>
                    Délai moyen
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    Acuité ≥ 4/10
                  </td>

                  <td>
                    Jusqu’à 6/10 ou +
                  </td>

                  <td>
                    8 à 12 mois
                  </td>
                </tr>

                <tr>
                  <td>
                    Lésion étendue
                  </td>

                  <td>
                    Stabilisation ou
                    récupération
                    partielle
                  </td>

                  <td>
                    Variable
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Un suivi prolongé reste
            essentiel afin de
            surveiller l’évolution
            des structures
            rétiniennes sur le long
            terme.
          </p>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Questions récurrentes
            autour de la myopie forte
          </h2>

          <h3>
            Quels sont les risques de
            développer un
            décollement de rétine
            quand on a une myopie
            forte ?
          </h3>

          <p>
            L’étirement progressif de
            la rétine fragilise les
            tissus et augmente le
            risque de fissures ou de
            ruptures rétiniennes.
          </p>

          <p>
            Ces lésions peuvent
            entraîner un décollement
            de rétine nécessitant une
            prise en charge urgente.
          </p>

          <ul className="seo-list">
            <li>
              Apparition de taches
              noires mobiles
            </li>

            <li>
              Éclairs lumineux
              persistants
            </li>

            <li>
              Baisse de vision brutale
            </li>
          </ul>

          <h3>
            Une intervention
            chirurgicale suffit-elle
            à éliminer tous les
            problèmes liés à la
            myopie forte ?
          </h3>

          <p>
            Même après une chirurgie
            réussie, les yeux très
            myopes restent plus
            fragiles et nécessitent
            un suivi spécialisé à
            long terme.
          </p>

          <ul className="seo-list">
            <li>
              Persistance de la
              myopie optique
            </li>

            <li>
              Risque de nouvelles
              lésions rétiniennes
            </li>

            <li>
              Contrôles réguliers
              indispensables
            </li>
          </ul>

          <h3>
            Quels examens permettent
            de surveiller correctement
            un œil myope fort ?
          </h3>

          <p>
            Plusieurs examens
            permettent d’assurer un
            suivi précis des yeux
            très myopes.
          </p>

          <ul className="seo-list">
            <li>
              OCT
            </li>

            <li>
              Photographie du fond
              d’œil
            </li>

            <li>
              Mesure de la longueur
              axiale
            </li>

            <li>
              Angiographie
              rétinienne selon les
              cas
            </li>
          </ul>

          <div className="seo-table-wrapper">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>
                    Examen
                  </th>

                  <th>
                    Fréquence
                    recommandée
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    OCT
                  </td>

                  <td>
                    Tous les 6 à 18
                    mois
                  </td>
                </tr>

                <tr>
                  <td>
                    Fond d’œil
                  </td>

                  <td>
                    1 fois par an
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>
            Peut-on prévenir ou
            ralentir l’évolution de
            la myopie forte ?
          </h3>

          <p>
            Il n’existe actuellement
            pas de méthode universelle
            pour stopper totalement
            l’évolution de la myopie
            forte chez l’adulte.
          </p>

          <p>
            Chez l’enfant et
            l’adolescent, certaines
            mesures peuvent toutefois
            ralentir l’allongement de
            l’œil.
          </p>

          <ol className="seo-list">
            <li>
              Contrôles visuels
              réguliers
            </li>

            <li>
              Limitation des écrans
            </li>

            <li>
              Exposition suffisante à
              la lumière naturelle
            </li>

            <li>
              Pauses visuelles
              fréquentes
            </li>

            <li>
              Consultation rapide en
              cas de symptôme nouveau
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}