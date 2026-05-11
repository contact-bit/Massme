import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "../pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Trou Maculaire : Causes, Diagnostic et Solutions pour la Vue – VitrectoMed",

    description:
      "Découvrez les causes, symptômes et traitements du trou maculaire pour préserver votre vue. Informez-vous sur le diagnostic et la chirurgie.",
  };
}

export default async function MacularHolePage({
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
            Macula et vision centrale
          </span>

          <h1 className="pathologies-title">
            Trou maculaire :
            comprendre les causes,
            le diagnostic et les
            solutions pour préserver
            la vue
          </h1>

          <p className="pathologies-intro">
            Parmi les pathologies qui
            touchent la vision
            centrale, le trou
            maculaire occupe une
            place particulière.
          </p>

          <p className="pathologies-description">
            Cette atteinte de la
            macula peut bouleverser
            la lecture, la conduite
            ou encore la reconnaissance
            des visages au quotidien.
          </p>

          <p className="pathologies-description">
            Comprendre les causes,
            reconnaître les premiers
            symptômes et connaître
            les traitements permet
            d’optimiser les chances
            de récupération visuelle.
          </p>

          {/* CTA GRID */}

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/pathologies/trou-maculaire/convalescence`}
              className="pathologies-card"
            >
              Convalescence trou
              maculaire
            </Link>

            <Link
              href={`${prefix}/pathologies/trou-maculaire/temoignage`}
              className="pathologies-card"
            >
              Témoignages
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
            Qu’est-ce qu’un trou
            maculaire ?
          </h2>

          <p>
            Le trou maculaire
            correspond à une
            ouverture située au
            centre de la macula,
            région stratégique de la
            rétine responsable de la
            vision fine et détaillée.
          </p>

          <p>
            Cette petite zone joue un
            rôle essentiel dans les
            activités du quotidien
            nécessitant une vision
            précise.
          </p>

          <p>
            Contrairement à d’autres
            maladies diffuses de la
            rétine, le trou maculaire
            touche un point central
            bien localisé, ce qui
            entraîne rapidement une
            gêne importante.
          </p>

          <p>
            Cette pathologie concerne
            principalement les
            personnes autour de la
            soixantaine et évolue
            souvent progressivement.
          </p>

          <p>
            Au début, l’autre œil
            peut compenser, retardant
            parfois la consultation
            et le diagnostic.
          </p>
        </div>
      </section>

      {/* =====================================================
          CAUSES
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quelles sont les causes
            d’un trou maculaire ?
          </h2>

          <p>
            Le mécanisme le plus
            fréquent est lié au
            vieillissement naturel du
            vitré, le gel transparent
            présent à l’intérieur de
            l’œil.
          </p>

          <p>
            Avec le temps, ce vitré
            se liquéfie puis se
            détache progressivement
            de la rétine.
          </p>

          <p>
            Cette traction exercée
            sur la macula peut finir
            par provoquer une
            déchirure centrale.
          </p>

          <p>
            D’autres situations
            peuvent également
            favoriser l’apparition
            d’un trou maculaire.
          </p>

          <ul className="seo-list">
            <li>
              Vieillissement du vitré
            </li>

            <li>
              Décollement du vitré
            </li>

            <li>
              Traumatisme de l’œil
            </li>

            <li>
              Décollement de la
              rétine
            </li>

            <li>
              Inflammations
              intraoculaires
            </li>

            <li>
              Antécédents de chirurgie
              oculaire
            </li>
          </ul>

          <p>
            Même si cette pathologie
            reste relativement rare,
            elle nécessite une prise
            en charge rapide afin de
            limiter la perte de
            vision centrale.
          </p>
        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Symptômes associés et
            premiers signes
            inquiétants
          </h2>

          <p>
            Les premiers symptômes
            peuvent être discrets et
            évoluer lentement.
          </p>

          <p>
            Certaines personnes
            remarquent une baisse de
            la vision centrale ou une
            difficulté croissante à
            lire malgré leurs
            lunettes habituelles.
          </p>

          <p>
            Les lignes droites peuvent
            également apparaître
            déformées ou ondulées.
          </p>

          <ul className="seo-list">
            <li>
              Baisse de la vision
              centrale
            </li>

            <li>
              Distorsion des lignes
              droites
            </li>

            <li>
              Apparition d’une tache
              sombre centrale
            </li>

            <li>
              Difficulté à lire ou à
              reconnaître les visages
            </li>

            <li>
              Diminution de la
              perception des détails
            </li>
          </ul>

          <p>
            La vision périphérique
            reste généralement
            conservée, ce qui peut
            masquer l’évolution de la
            maladie au début.
          </p>

          <p>
            Une consultation rapide
            améliore les chances de
            récupération après
            traitement.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIAGNOSIS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Comment s’établit le
            diagnostic ?
          </h2>

          <p>
            Le diagnostic repose sur
            un examen
            ophtalmologique complet.
          </p>

          <p>
            L’ophtalmologiste évalue
            l’acuité visuelle puis
            examine précisément la
            macula afin de rechercher
            une anomalie centrale de
            la rétine.
          </p>

          <p>
            Aujourd’hui, l’examen de
            référence est l’OCT
            (tomographie par
            cohérence optique).
          </p>

          <p>
            Cette technologie permet
            d’obtenir une image très
            détaillée des différentes
            couches de la rétine.
          </p>

          <ul className="seo-list">
            <li>
              Visualisation précise
              du trou maculaire
            </li>

            <li>
              Mesure de la taille et
              de la profondeur
            </li>

            <li>
              Évaluation des chances
              de fermeture après
              chirurgie
            </li>

            <li>
              Suivi de la cicatrisation
              postopératoire
            </li>
          </ul>

          <p>
            L’OCT joue un rôle majeur
            dans le choix du
            traitement et le suivi de
            l’évolution.
          </p>
        </div>
      </section>

      {/* =====================================================
          SURGERY
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Traitement : quelles
            options et comment agit
            la chirurgie ?
          </h2>

          <p>
            La vitrectomie constitue
            aujourd’hui le traitement
            de référence du trou
            maculaire.
          </p>

          <p>
            Cette chirurgie consiste
            à retirer le vitré afin
            de supprimer les
            tractions exercées sur la
            rétine.
          </p>

          <p>
            Une fois le vitré retiré,
            le chirurgien agit autour
            de la macula puis injecte
            une bulle de gaz destinée
            à favoriser la fermeture
            du trou.
          </p>

          <ul className="seo-list">
            <li>
              Retrait du vitré
            </li>

            <li>
              Libération des
              adhérences rétiniennes
            </li>

            <li>
              Injection d’un gaz
              intraoculaire
            </li>

            <li>
              Fermeture progressive
              du trou maculaire
            </li>
          </ul>

          <p>
            Cette intervention vise à
            améliorer la vision
            centrale et à limiter
            l’aggravation des lésions
            rétiniennes.
          </p>

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/operation`}
              className="pathologies-card"
            >
              En savoir plus sur la
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
          OPERATION
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Déroulement de
            l’opération et subtilités
            de l’anesthésie
          </h2>

          <p>
            La chirurgie est
            généralement réalisée
            sous anesthésie
            loco-régionale.
          </p>

          <p>
            L’œil est anesthésié afin
            d’éviter toute douleur et
            de garantir une parfaite
            immobilité pendant
            l’intervention.
          </p>

          <p>
            L’opération dure souvent
            moins d’une heure et se
            déroule la plupart du
            temps en ambulatoire.
          </p>

          <p>
            Après une courte période
            de surveillance, le
            retour à domicile est
            généralement possible le
            jour même.
          </p>
        </div>
      </section>

      {/* =====================================================
          RECOVERY
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Période postopératoire :
            consignes et récupération
          </h2>

          <p>
            Après l’intervention, une
            période de convalescence
            spécifique débute afin de
            favoriser la cicatrisation
            de la macula.
          </p>

          <p>
            Tant que la bulle de gaz
            reste présente dans
            l’œil, certaines activités
            doivent être évitées,
            notamment les voyages en
            avion ou les séjours en
            altitude.
          </p>

          <p>
            Une position dite « tête
            vers le bas » est souvent
            recommandée pendant
            plusieurs jours afin de
            maintenir correctement la
            bulle de gaz contre la
            macula.
          </p>

          <p>
            Des coussins ergonomiques
            spécialement conçus pour
            la récupération après
            vitrectomie permettent
            d’améliorer le confort
            pendant cette période.
          </p>

          <ul className="seo-list">
            <li>
              Respect de la position
              postopératoire
            </li>

            <li>
              Utilisation régulière
              des collyres prescrits
            </li>

            <li>
              Éviction des efforts
              physiques importants
            </li>

            <li>
              Consultations de suivi
              régulières
            </li>

            <li>
              Surveillance de la
              disparition du gaz
            </li>
          </ul>

          <p>
            L’amélioration de la
            vision est progressive et
            peut s’étendre sur
            plusieurs semaines ou
            plusieurs mois.
          </p>

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/convalescence/coussin`}
              className="pathologies-card pathologies-card--accent"
            >
              Coussin de
              convalescence après
              vitrectomie
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          RISKS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Complications potentielles
            et gestion des risques
          </h2>

          <p>
            Comme toute chirurgie
            intraoculaire, la
            vitrectomie comporte
            certains risques même si
            les complications graves
            restent rares.
          </p>

          <ul className="seo-list">
            <li>
              Non-fermeture du trou
              maculaire
            </li>

            <li>
              Augmentation de la
              pression intraoculaire
            </li>

            <li>
              Apparition ou
              aggravation d’une
              cataracte
            </li>

            <li>
              Infection oculaire
            </li>

            <li>
              Saignement intraoculaire
            </li>
          </ul>

          <p>
            Une surveillance
            postopératoire rapprochée
            permet de détecter
            rapidement d’éventuelles
            complications et
            d’adapter la prise en
            charge.
          </p>

          <p>
            Dans certains cas, une
            rééducation visuelle peut
            aider à améliorer le
            confort visuel après la
            chirurgie.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROGNOSIS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            À quoi s’attendre après
            l’opération : évolution,
            pronostic visuel et
            perspectives
          </h2>

          <p>
            Le résultat visuel dépend
            de plusieurs facteurs :
            taille du trou,
            ancienneté de la maladie
            et état initial de la
            macula.
          </p>

          <p>
            Les meilleurs résultats
            sont généralement obtenus
            lorsque la prise en
            charge intervient tôt.
          </p>

          <p>
            Même après fermeture du
            trou maculaire, une
            légère gêne visuelle ou
            une petite déformation
            résiduelle peut persister.
          </p>

          <ul className="seo-list">
            <li>
              Meilleur pronostic pour
              les petits trous récents
            </li>

            <li>
              Amélioration progressive
              sur plusieurs mois
            </li>

            <li>
              Vision rarement
              totalement identique à
              l’état initial
            </li>

            <li>
              Suivi régulier
              indispensable
            </li>
          </ul>

          <p>
            Malgré certaines limites,
            de nombreux patients
            retrouvent une autonomie
            appréciable pour la
            lecture, les déplacements
            ou la conduite.
          </p>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Questions fréquentes sur
            le trou maculaire et la
            chirurgie
          </h2>

          <h3>
            Quels sont les symptômes
            caractéristiques d’un
            trou maculaire ?
          </h3>

          <p>
            Les principaux signes
            sont une baisse de la
            vision centrale, des
            lignes déformées et une
            tache sombre au centre du
            regard.
          </p>

          <ul className="seo-list">
            <li>
              Vision centrale floue
            </li>

            <li>
              Distorsion des lignes
            </li>

            <li>
              Difficulté de lecture
            </li>

            <li>
              Tache sombre centrale
            </li>
          </ul>

          <h3>
            Combien de temps faut-il
            pour récupérer après une
            opération ?
          </h3>

          <p>
            La récupération varie
            selon les patients mais
            une amélioration apparaît
            souvent entre quatre et
            huit semaines après
            l’intervention.
          </p>

          <ol className="seo-list">
            <li>
              Disparition progressive
              de la bulle de gaz
            </li>

            <li>
              Stabilisation lente de
              la macula
            </li>

            <li>
              Amélioration graduelle
              de la vision
            </li>
          </ol>

          <h3>
            Quels sont les principaux
            risques de la vitrectomie
            pour trou maculaire ?
          </h3>

          <p>
            Les risques principaux
            incluent la non-fermeture
            du trou, la cataracte,
            l’augmentation de la
            pression intraoculaire ou
            une infection rare.
          </p>

          <ul className="seo-list">
            <li>
              Cataracte secondaire
            </li>

            <li>
              Infection oculaire rare
            </li>

            <li>
              Pression intraoculaire
              élevée
            </li>

            <li>
              Résultat visuel
              incomplet
            </li>
          </ul>

          <h3>
            Les lunettes permettent-
            elles de corriger la
            perte de vision causée
            par un trou maculaire ?
          </h3>

          <p>
            Non, les lunettes ne
            corrigent pas directement
            la lésion rétinienne
            responsable du trouble
            visuel.
          </p>

          <p>
            Elles peuvent améliorer
            certains défauts optiques
            associés mais ne
            réparent pas la macula.
          </p>

          <h3>
            Quelle position adopter
            après une opération du
            trou maculaire ?
          </h3>

          <p>
            Une position tête vers le
            bas est souvent
            recommandée afin que la
            bulle de gaz reste en
            contact avec la macula et
            favorise sa cicatrisation.
          </p>

          <h3>
            Comment améliorer le
            confort pendant la
            convalescence ?
          </h3>

          <p>
            L’utilisation d’un
            coussin spécialement
            conçu pour la récupération
            après vitrectomie aide à
            maintenir la bonne
            posture tout en réduisant
            les tensions cervicales.
          </p>

          <p>
            Ce type d’équipement
            améliore le confort et
            facilite le respect des
            consignes postopératoires.
          </p>
        </div>
      </section>
    </main>
  );
}