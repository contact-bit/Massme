import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "./retinal-detachment.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Décollement de la rétine : Opération, Suites et Pronostic – VitrectoMed",

    description:
      "Découvrez tout sur le décollement de la rétine : opération, techniques, convalescence et pronostic visuel pour une meilleure compréhension.",
  };
}

export default async function RetinalDetachmentPage({
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
    <main className="retinal-page">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="retinal-hero">
        <div className="retinal-container">
          <span className="retinal-badge">
            Pathologie rétinienne
          </span>

          <h1 className="retinal-title">
            Décollement de la rétine :
            comprendre l’opération,
            les suites et le pronostic
          </h1>

          <p className="retinal-intro">
            Le décollement de la
            rétine représente une
            urgence ophtalmologique
            pouvant survenir à tout
            âge, bien que cette
            affection soit plus
            fréquente chez les adultes
            ou les personnes souffrant
            de myopie forte.
          </p>

          <p className="retinal-description">
            Grâce aux progrès du
            diagnostic et à
            l’évolution des techniques
            chirurgicales, il est
            désormais possible
            d’obtenir dans de nombreux
            cas une récupération
            visuelle satisfaisante.
          </p>

          <p className="retinal-description">
            Découvrez tout ce qu’il
            faut savoir sur cette
            pathologie : définition,
            déroulement de
            l’intervention,
            convalescence et
            perspectives après
            l’opération.
          </p>

          {/* CTA */}

          <div className="retinal-cta-grid">
            <Link
              href={`${prefix}/operation`}
              className="retinal-card"
            >
              <span>
                En savoir plus sur la
                vitrectomie
              </span>
            </Link>

            <Link
              href={`${prefix}/convalescence/coussin`}
              className="retinal-card"
            >
              <span>
                Matériel de
                convalescence après
                vitrectomie
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEFINITION
      ===================================================== */}

      <section className="retinal-section">
        <div className="retinal-container">
          <h2>
            Comment se définit un
            décollement de la rétine ?
          </h2>

          <p>
            Un décollement de la
            rétine survient lorsque la
            fine membrane nerveuse
            située au fond de l’œil se
            sépare de son support
            naturel, l’épithélium
            pigmentaire.
          </p>

          <p>
            Cette séparation de la
            rétine empêche la
            transmission normale des
            nutriments essentiels,
            provoquant ainsi une baisse
            de vision souvent brutale.
          </p>

          <p>
            Les signes révélateurs
            incluent la perception de
            flashes lumineux, la
            présence de corps
            flottants ou l’apparition
            soudaine d’un voile sombre
            dans le champ visuel.
          </p>

          <p>
            La cause la plus courante
            est la formation d’une
            rupture ou déchirure de la
            rétine qui permet au
            liquide intraoculaire de
            s’infiltrer sous celle-ci.
          </p>

          <p>
            Les principaux facteurs de
            risque comprennent l’âge
            avancé, la forte myopie,
            les antécédents familiaux
            et les traumatismes
            oculaires.
          </p>

          <p>
            Une prise en charge rapide
            est indispensable pour
            éviter toute perte de
            vision irréversible.
          </p>
        </div>
      </section>

      {/* =====================================================
          TECHNIQUES
      ===================================================== */}

      <section className="retinal-section retinal-section-alt">
        <div className="retinal-container">
          <h2>
            Quelles techniques
            chirurgicales sont
            utilisées pour recoller la
            rétine ?
          </h2>

          <p>
            Face à un décollement
            rétinien, plusieurs
            options chirurgicales
            s’offrent au spécialiste.
          </p>

          <p>
            Le choix dépendra du type,
            de l’étendue et de
            l’ancienneté du
            décollement, mais aussi du
            profil du patient.
          </p>

          <p>
            Deux grandes familles de
            techniques existent :
          </p>

          <ul className="retinal-list">
            <li>
              La chirurgie endoculaire
              (vitrectomie)
            </li>

            <li>
              La chirurgie externe
              dite « ab externo »
              (cryoindentation avec
              implant scléral)
            </li>
          </ul>

          <p>
            Chaque méthode présente
            ses indications, avantages
            et limites.
          </p>

          <p>
            Elles peuvent être
            combinées pour maximiser
            les chances de succès et
            limiter les troubles de la
            vision post-opératoires.
          </p>

          <h3>
            Zoom sur la vitrectomie
          </h3>

          <p>
            La vitrectomie a
            profondément changé la
            prise en charge des
            décollements de rétine.
          </p>

          <p>
            Elle consiste à retirer le
            gel appelé vitré présent à
            l’intérieur de l’œil, à
            l’aide de
            micro-instruments
            introduits via de
            minuscules incisions.
          </p>

          <p>
            Le but est d’éliminer
            toutes les tractions
            responsables du
            décollement et d’accéder
            directement à la zone
            atteinte.
          </p>

          <p>
            Après avoir supprimé la
            cause mécanique, le
            chirurgien fixe la rétine,
            généralement par laser ou
            cryothérapie.
          </p>

          <p>
            Pour consolider
            l’ensemble, un gaz ou
            parfois de l’huile de
            silicone est injecté afin
            de maintenir la rétine
            appliquée.
          </p>

          <p>
            Le gaz disparaît
            naturellement en quelques
            semaines tandis que le
            silicone devra être retiré
            lors d’une intervention
            ultérieure si nécessaire.
          </p>

          <h3>
            Zoom sur la
            cryoindentation
          </h3>

          <p>
            La cryoindentation,
            technique d’indentation
            par voie externe, est
            privilégiée chez les
            patients jeunes ou lorsque
            le décollement reste
            limité.
          </p>

          <p>
            Elle consiste à placer un
            implant souple à la
            surface externe de l’œil,
            créant une pression qui
            rapproche la paroi
            sclérale de la rétine
            décollée.
          </p>

          <p>
            La fixation est renforcée
            par cryothérapie,
            stimulant la cicatrisation.
          </p>

          <p>
            L’intérêt principal de
            cette technique réside
            dans la préservation de
            l’environnement interne de
            l’œil.
          </p>

          <p>
            Selon les situations,
            l’opération dure entre 45
            minutes et une heure,
            parfois davantage.
          </p>
        </div>
      </section>

      {/* =====================================================
          ANESTHESIA
      ===================================================== */}

      <section className="retinal-section">
        <div className="retinal-container">
          <h2>
            Zoom sur l’anesthésie et
            le déroulement opératoire
          </h2>

          <p>
            En raison de l’urgence du
            décollement de la rétine,
            une consultation
            anesthésique précède
            l’intervention.
          </p>

          <p>
            L’anesthésie
            locorégionale
            (péribulbaire) est souvent
            préférée, car elle endort
            uniquement la région
            autour de l’œil.
          </p>

          <p>
            Le patient reste conscient
            et confortable pendant la
            chirurgie.
          </p>

          <p>
            Pour garantir la sécurité
            de l’acte, il est
            essentiel de fournir
            l’ensemble de ses
            documents médicaux,
            incluant la liste des
            traitements en cours, les
            antécédents et éventuelles
            allergies.
          </p>

          <p>
            À l’hôpital, une équipe
            pluridisciplinaire veille
            à chaque étape pour
            limiter les risques et
            favoriser une récupération
            optimale.
          </p>
        </div>
      </section>

      {/* =====================================================
          DURATION
      ===================================================== */}

      <section className="retinal-section retinal-section-alt">
        <div className="retinal-container">
          <h2>
            Combien de temps dure
            l’opération du
            décollement de rétine ?
          </h2>

          <p>
            La durée de l’intervention
            varie selon la complexité
            du cas et la technique
            opératoire choisie.
          </p>

          <p>
            Dans les formes simples,
            une vitrectomie prend
            généralement moins de 30
            minutes.
          </p>

          <p>
            Des cas complexes ou
            associés à d’autres
            lésions intraoculaires
            peuvent mobiliser le
            chirurgien jusqu’à une
            heure.
          </p>

          <p>
            La cryoindentation peut
            durer plus longtemps si
            plusieurs zones doivent
            être traitées
            simultanément.
          </p>

          <p>
            Dans la majorité des
            situations, l’opération se
            déroule en ambulatoire,
            permettant un retour à
            domicile le jour même.
          </p>

          <p>
            Un suivi rapproché avec
            l’ophtalmologiste sera
            ensuite nécessaire.
          </p>
        </div>
      </section>

      {/* =====================================================
          RECOVERY
      ===================================================== */}

      <section className="retinal-section">
        <div className="retinal-container">
          <h2>
            Comment se passe la
            convalescence après
            l’intervention ?
          </h2>

          <p>
            La période postopératoire
            requiert prudence et
            patience.
          </p>

          <p>
            Il est recommandé d’éviter
            les efforts intenses, de
            ne pas porter de charges
            lourdes et de suspendre
            temporairement la pratique
            sportive.
          </p>

          <p>
            Frotter l’œil doit
            également être proscrit
            afin de ne pas altérer la
            cicatrisation.
          </p>

          <p>
            Dès le réveil, la vision
            peut rester brouillée,
            notamment si un gaz a été
            utilisé comme
            tamponnement.
          </p>

          <p>
            Certains symptômes comme
            les corps flottants ou
            quelques éclairs lumineux
            peuvent persister,
            témoignant du processus de
            guérison.
          </p>

          <p>
            Un contrôle strict de la
            tension oculaire et une
            adaptation du traitement
            local par collyres peuvent
            s’avérer nécessaires.
          </p>

          <h3>
            Quelle durée prévoir pour
            la récupération complète ?
          </h3>

          <p>
            La consolidation de la
            rétine intervient
            idéalement en quatre à six
            semaines.
          </p>

          <p>
            Cependant, la vraie
            récupération visuelle
            s’étend souvent sur
            plusieurs mois.
          </p>

          <p>
            Certaines personnes
            retrouvent leur acuité
            habituelle assez vite,
            alors que pour d’autres,
            l’amélioration se fait
            plus lentement.
          </p>

          <p>
            La reprise progressive des
            activités professionnelles
            ou sportives devient
            envisageable environ huit
            semaines après
            l’intervention.
          </p>
        </div>
      </section>

      {/* =====================================================
          RISKS
      ===================================================== */}

      <section className="retinal-section retinal-section-alt">
        <div className="retinal-container">
          <h2>
            Quels sont les risques
            associés à l’opération de
            décollement de rétine ?
          </h2>

          <p>
            Même parfaitement
            maîtrisée, cette affection
            grave expose à certains
            risques.
          </p>

          <p>
            La récidive du
            décollement de la rétine
            concerne 5 à 10 % des
            patients.
          </p>

          <p>
            Parmi les autres
            complications possibles
            figurent les saignements
            intraoculaires, une
            élévation prolongée de la
            pression oculaire ou
            encore la formation d’une
            membrane à la surface de
            la macula.
          </p>

          <p>
            Un syndrome inflammatoire
            spécifique appelé syndrome
            d’Irvin Gass peut aussi
            survenir.
          </p>

          <p>
            Le dépistage précoce reste
            primordial pour préserver
            la qualité de la vision.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROGNOSIS
      ===================================================== */}

      <section className="retinal-section">
        <div className="retinal-container">
          <h2>
            Quel pronostic visuel
            attendre après un
            décollement de rétine ?
          </h2>

          <p>
            Le pronostic du
            décollement de rétine
            repose principalement sur
            l’étendue du décollement
            et l’atteinte ou non de la
            macula.
          </p>

          <p>
            Quand la macula n’a pas
            été soulevée, la
            récupération visuelle est
            souvent excellente.
          </p>

          <p>
            En revanche, si la macula
            a subi une séparation, la
            récupération sera plus
            lente et parfois
            incomplète.
          </p>

          <p>
            La rapidité de la prise en
            charge, le respect du
            protocole postopératoire
            et l’absence de facteurs
            aggravants influencent
            grandement le résultat
            final.
          </p>

          <p>
            Chaque personne évolue
            différemment, d’où la
            nécessité d’un
            accompagnement
            personnalisé et d’un
            dialogue permanent avec
            l’ophtalmologiste.
          </p>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="retinal-section retinal-section-alt">
        <div className="retinal-container">
          <h2>
            Questions fréquentes sur
            la chirurgie du
            décollement de rétine
          </h2>

          <h3>
            Pourquoi faut-il
            intervenir rapidement en
            cas de décollement de la
            rétine ?
          </h3>

          <p>
            La rapidité du geste
            chirurgical limite le
            risque de lésions
            irréversibles sur la
            rétine et maximise les
            chances de recouvrer la
            vue.
          </p>

          <ul className="retinal-list">
            <li>
              Diminution des risques
              de récidive
            </li>

            <li>
              Préservation d’une
              meilleure acuité
              visuelle
            </li>

            <li>
              Récupération plus rapide
              post-intervention
            </li>
          </ul>

          <h3>
            Faut-il éviter certains
            comportements après
            l’opération ?
          </h3>

          <p>
            Après l’intervention,
            certains gestes quotidiens
            doivent être surveillés.
          </p>

          <p>
            Il est déconseillé de se
            pencher brusquement, de
            frotter l’œil opéré ou de
            reprendre trop tôt une
            activité physique intense.
          </p>

          <ul className="retinal-list">
            <li>
              Reprise graduelle des
              activités physiques ou
              professionnelles
            </li>

            <li>
              Éviction de la natation
              et des environnements
              poussiéreux
            </li>

            <li>
              Attention particulière à
              l’exposition solaire
              directe
            </li>
          </ul>

          <h3>
            Peut-on retrouver une
            vision normale après une
            chirurgie de la rétine ?
          </h3>

          <p>
            La capacité à recouvrer
            une vision normale dépend
            de la localisation et de
            la précocité du
            décollement de la rétine.
          </p>

          <div className="retinal-table">
            <div className="retinal-table-row retinal-table-head">
              <span>Condition</span>
              <span>
                Récupération attendue
              </span>
            </div>

            <div className="retinal-table-row">
              <span>
                Macula non décollée
              </span>

              <span>
                Quasi-totale
              </span>
            </div>

            <div className="retinal-table-row">
              <span>
                Macula décollée
              </span>

              <span>
                Variable, progression
                sur plusieurs mois
              </span>
            </div>
          </div>

          <h3>
            Quels sont les principaux
            risques du tamponnement
            par gaz ou silicone ?
          </h3>

          <p>
            Le tamponnement vise à
            stabiliser la rétine après
            l’opération.
          </p>

          <p>
            Le gaz se dissipe
            spontanément en deux à six
            semaines, alors que la
            silicone nécessite une
            extraction programmée.
          </p>

          <ol className="retinal-ordered-list">
            <li>
              Récidive du décollement
            </li>

            <li>
              Saignement interne
              ponctuel
            </li>

            <li>
              Pression intraoculaire
              élevée
            </li>

            <li>
              Nécessité d’une seconde
              intervention en cas
              d’huile de silicone
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}