import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "./pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Chirurgie de la rétine et vitré : Interventions et pathologies – VitrectoMed",

    description:
      "Découvrez les interventions de la chirurgie de la rétine et du vitré, les pathologies traitées et les facteurs de succès pour la restauration de la vision.",
  };
}

export default async function PathologiesPage({
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
            Pathologies rétiniennes
          </span>

          <h1 className="pathologies-title">
            Chirurgie de la rétine et
            du vitré : comprendre les
            interventions et les
            pathologies associées
          </h1>

          <p className="pathologies-intro">
            La chirurgie de la rétine
            et du vitré désigne
            l’ensemble des techniques
            destinées à traiter les
            maladies atteignant la
            fine membrane au fond de
            l’œil ainsi que la
            substance gélatineuse qui
            la recouvre.
          </p>

          <p className="pathologies-description">
            Grâce aux avancées
            médicales, ces
            interventions permettent
            aujourd’hui une
            préservation de la vision,
            voire une restauration de
            la vision après certains
            traumatismes ou maladies.
          </p>

          <p className="pathologies-description">
            Ce domaine chirurgical
            s’avère essentiel pour
            corriger de nombreuses
            affections oculaires
            parfois graves.
          </p>

          {/* CTA GRID */}

          <div className="pathologies-grid">
            <Link
              href={`${prefix}/pathologies/trou-maculaire`}
              className="pathologies-card"
            >
              Trou maculaire
            </Link>

            <Link
              href={`${prefix}/pathologies/decollement-retine`}
              className="pathologies-card"
            >
              Décollement de la
              rétine
            </Link>

            <Link
              href={`${prefix}/pathologies/mouches-volantes-ou-corps-flottants`}
              className="pathologies-card"
            >
              Mouches volantes / corps
              flottants
            </Link>

            <Link
              href={`${prefix}/pathologies/myopie-forte`}
              className="pathologies-card"
            >
              Myopie forte
            </Link>

            <Link
              href={`${prefix}/pathologies/retinopathie-diabetique`}
              className="pathologies-card"
            >
              Rétinopathie diabétique
            </Link>

            <Link
              href={`${prefix}/pathologies/uveite`}
              className="pathologies-card"
            >
              Uvéite
            </Link>

            <Link
              href={`${prefix}/convalescence/coussin`}
              className="pathologies-card pathologies-card--accent"
            >
              Matériel de
              convalescence
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
            Définition et principes de
            la chirurgie rétinienne et
            vitréenne
          </h2>

          <p>
            La chirurgie de la rétine
            consiste à intervenir
            directement sur le tissu
            nerveux tapissant le fond
            de l’œil, indispensable à
            la perception des images.
          </p>

          <p>
            Le vitré, quant à lui, est
            une structure transparente
            et gélatineuse située
            entre le cristallin et la
            rétine.
          </p>

          <p>
            Plusieurs affections
            peuvent nécessiter une
            intervention afin de
            réparer une déchirure de
            la rétine, retirer des
            corps flottants gênants ou
            corriger d’autres
            anomalies risquant de
            compromettre la santé
            visuelle.
          </p>

          <p>
            Le geste chirurgical le
            plus courant demeure la
            vitrectomie.
          </p>

          <p>
            Cette technique consiste à
            retirer tout ou partie du
            vitré pour accéder à la
            rétine, traiter des
            hémorragies intraoculaires
            ou éliminer des opacités
            perturbantes.
          </p>

          <p>
            L’utilisation de
            micro-instruments et d’un
            microscope opératoire
            apporte aujourd’hui un
            haut niveau de sécurité,
            adapté à divers profils de
            patients.
          </p>
        </div>
      </section>

      {/* =====================================================
          PATHOLOGIES
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Pathologies traitées par
            la chirurgie de la rétine
            et du vitré
          </h2>

          <p>
            Un large éventail de
            pathologies rétiniennes et
            affections vitréennes peut
            justifier une intervention
            spécifique.
          </p>

          <p>
            Les indications sont
            posées après une
            évaluation spécialisée,
            souvent complétée
            d’imageries comme l’OCT ou
            l’angiographie.
          </p>

          <p>
            Voyons ensemble les
            principales pathologies
            concernées par ces
            chirurgies.
          </p>

          <h3>
            Trou maculaire :
            définition et prise en
            charge
          </h3>

          <p>
            Le trou maculaire
            correspond à une petite
            ouverture localisée au
            centre de la rétine, dans
            la zone appelée macula,
            responsable de la vision
            centrale détaillée.
          </p>

          <p>
            Son apparition se
            manifeste par une image
            déformée ou floue, parfois
            accompagnée d’une tache
            sombre.
          </p>

          <p>
            La vitrectomie est la
            solution principale pour
            refermer ce trou.
          </p>

          <p>
            Après avoir retiré le
            vitré, le chirurgien
            injecte parfois un gaz
            pour favoriser la
            cicatrisation rétinienne.
          </p>

          <p>
            La majorité des personnes
            opérées bénéficient d’une
            nette amélioration de leur
            acuité visuelle dans les
            semaines qui suivent
            l’intervention.
          </p>

          <h3>
            Décollement de la rétine :
            une urgence médicale
          </h3>

          <p>
            Le décollement de la
            rétine survient lorsque la
            rétine se sépare de son
            support sous-jacent,
            provoquant une perte
            rapide et irréversible de
            la vue si aucune
            réparation n’est réalisée
            à temps.
          </p>

          <p>
            Il s’agit d’une véritable
            urgence ophtalmologique.
          </p>

          <p>
            Ce phénomène résulte
            souvent d’une déchirure de
            la rétine laissant passer
            le liquide du vitré.
          </p>

          <p>
            La chirurgie de la rétine
            vise alors à recoller
            cette dernière, soit par
            vitrectomie, soit par pose
            d’un plombage scléral.
          </p>

          <h3>
            Mouches volantes et
            décollement du vitré :
            manifestations fréquentes
          </h3>

          <p>
            Avec l’âge, le vitré subit
            des modifications
            naturelles pouvant
            entraîner l’apparition de
            corps flottants.
          </p>

          <p>
            Il s’agit de petites
            opacités mobiles dans le
            champ de vision,
            généralement bénignes mais
            parfois très gênantes.
          </p>

          <p>
            Lorsque ces mouches
            volantes deviennent
            envahissantes, la
            vitrectomie permet de les
            éliminer efficacement.
          </p>

          <h3>
            Myopie forte : risques
            particuliers pour la
            rétine
          </h3>

          <p>
            Chez les sujets atteints
            de myopie forte, la
            morphologie oculaire
            modifiée fragilise la
            rétine et le vitré.
          </p>

          <p>
            L’étirement excessif du
            globe oculaire favorise la
            survenue de déchirures de
            la rétine et de
            décollements rétiniens.
          </p>

          <p>
            Un suivi régulier chez
            l’ophtalmologue permet de
            détecter précocement toute
            anomalie et de préserver
            la fonction visuelle.
          </p>

          <h3>
            Rétinopathie diabétique :
            complications et
            traitements
          </h3>

          <p>
            La rétinopathie
            diabétique est une
            complication redoutée du
            diabète, liée à
            l’altération progressive
            des vaisseaux sanguins de
            la rétine.
          </p>

          <p>
            Dans les formes sévères,
            la chirurgie de la rétine
            repose généralement sur
            la vitrectomie associée à
            l’ablation des tissus
            fibreux.
          </p>

          <p>
            Ces gestes visent à
            stabiliser la maladie et à
            permettre une restauration
            partielle de la vision.
          </p>

          <h3>
            Uvéite : gérer
            l’inflammation chronique
          </h3>

          <p>
            L’uvéite regroupe
            plusieurs maladies
            inflammatoires touchant
            l’intérieur de l’œil.
          </p>

          <p>
            Une inflammation
            persistante peut entraîner
            la formation de dépôts ou
            de membranes gênant la
            transmission de la
            lumière.
          </p>

          <p>
            Dans ce contexte, la
            vitrectomie sert à
            nettoyer les opacités
            inflammatoires et limiter
            l’apparition de séquelles
            irréversibles sur la
            vision.
          </p>
        </div>
      </section>

      {/* =====================================================
          VITRECTOMY
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Déroulement de la
            vitrectomie et suites
            post-opératoires
          </h2>

          <p>
            La vitrectomie s’effectue
            le plus souvent en
            ambulatoire, sous
            anesthésie locale ou
            générale selon la
            complexité du cas.
          </p>

          <p>
            Le chirurgien introduit de
            fins instruments à travers
            trois micro-incisions dans
            la sclère pour retirer le
            vitré et accéder à la
            rétine.
          </p>

          <p>
            À l’issue de
            l’intervention,
            l’intérieur de l’œil est
            remplacé temporairement
            par une solution saline,
            un gaz expansible ou
            parfois une huile de
            silicone.
          </p>

          <p>
            Il peut être nécessaire
            d’adopter une position de
            repos particulière pendant
            quelques jours afin de
            garantir une bonne
            cicatrisation.
          </p>

          <ul className="seo-list">
            <li>
              Port de coques
              protectrices la nuit et
              lunettes solaires en
              journée
            </li>

            <li>
              Utilisation d’un coussin
              pour la convalescence
              après la vitrectomie
            </li>

            <li>
              Prescription de collyres
              anti-inflammatoires et
              antibiotiques
            </li>

            <li>
              Éviction des efforts
              physiques intenses
              durant la phase de
              cicatrisation
            </li>

            <li>
              Contrôles réguliers chez
              l’ophtalmologue pour
              surveiller la
              récupération visuelle
            </li>
          </ul>

          <p>
            L’amélioration de la vue
            s’observe généralement de
            manière progressive,
            parfois sur plusieurs
            semaines.
          </p>

          <p>
            Certaines activités ou
            voyages en altitude sont
            déconseillés
            momentanément, surtout
            après injection d’un gaz
            interne.
          </p>
        </div>
      </section>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Facteurs de succès et
            limites de la restauration
            de la vision
          </h2>

          <p>
            Le recours à la chirurgie
            de la rétine permet, dans
            de nombreux cas, une
            restauration de la vision
            spectaculaire.
          </p>

          <p>
            Cependant, plusieurs
            facteurs conditionnent le
            résultat final : état
            initial de la rétine,
            ancienneté des lésions,
            rapidité de la prise en
            charge et absence de
            complications secondaires.
          </p>

          <p>
            Même après une
            intervention techniquement
            réussie, il arrive que des
            séquelles visuelles
            persistent.
          </p>

          <p>
            Consulter dès les premiers
            symptômes reste essentiel
            pour maximiser les chances
            de préservation de la
            vision.
          </p>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Questions fréquentes sur
            la chirurgie de la rétine
            et du vitré
          </h2>

          <h3>
            Quels sont les signes
            devant alerter avant une
            chirurgie de la rétine ?
          </h3>

          <p>
            Des symptômes tels que des
            éclairs lumineux, une
            pluie soudaine de mouches
            volantes ou l’apparition
            d’un voile noir doivent
            conduire à consulter
            rapidement.
          </p>

          <ul className="seo-list">
            <li>
              Baisse brutale ou
              progressive de la vision
            </li>

            <li>
              Sensation de rideau ou
              d’ombre latérale
            </li>

            <li>
              Déformation persistante
              des images
            </li>
          </ul>

          <h3>
            Comment se préparer à une
            vitrectomie ?
          </h3>

          <p>
            Avant une vitrectomie, il
            est recommandé de discuter
            avec le chirurgien lors de
            la consultation
            préopératoire.
          </p>

          <ul className="seo-list">
            <li>
              Ajustement des
              traitements
              anticoagulants si besoin
            </li>

            <li>
              Arrêt du port de
              lentilles de contact
              avant la chirurgie
            </li>

            <li>
              Prévoir une personne
              pour raccompagner le
              jour J
            </li>
          </ul>

          <h3>
            Peut-on récupérer
            totalement la vision après
            une chirurgie de la
            rétine ?
          </h3>

          <p>
            La restauration de la
            vision dépend
            principalement de la
            nature et de l’ancienneté
            des lésions.
          </p>

          <ul className="seo-list">
            <li>
              En cas de décollement de
              la rétine limité :
              meilleure récupération
              possible
            </li>

            <li>
              Atteinte prolongée :
              séquelles potentielles
              malgré la chirurgie
            </li>
          </ul>

          <h3>
            Quels sont les principaux
            risques ou effets
            secondaires de la
            vitrectomie ?
          </h3>

          <p>
            La vitrectomie offre un
            bon niveau de sécurité,
            mais certains risques
            existent : infection,
            élévation de la pression
            intraoculaire ou cataracte
            accélérée.
          </p>

          <ul className="seo-list">
            <li>
              Enflure ou rougeur
              prolongée
            </li>

            <li>
              Diminution transitoire
              de la vision
            </li>

            <li>
              Besoin ponctuel d’une
              nouvelle opération
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}