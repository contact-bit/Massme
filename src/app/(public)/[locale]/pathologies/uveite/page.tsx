import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "../pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Uvéite : Comprendre l'Inflammation Oculaire – VitrectoMed",

    description:
      "Découvrez l'uvéite, ses types, symptômes et traitements. Informez-vous sur cette inflammation de l'œil pour mieux protéger votre vision.",
  };
}

export default async function UveitisPage({
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
            Inflammation oculaire
          </span>

          <h1 className="pathologies-title">
            Uvéite : comprendre
            cette inflammation de
            l’œil et ses différentes
            formes
          </h1>

          <p className="pathologies-intro">
            L’uvéite fait partie des
            maladies oculaires
            susceptibles de menacer
            sérieusement la vision
            lorsqu’elles ne sont pas
            diagnostiquées rapidement.
          </p>

          <p className="pathologies-description">
            Cette inflammation de
            l’œil touche le tractus
            uvéal, également appelé
            tunique vasculaire, et
            peut provoquer des
            douleurs, une baisse de
            vision ou des complications
            importantes.
          </p>

          <p className="pathologies-description">
            Comprendre les symptômes,
            les causes et les
            traitements permet
            d’agir rapidement pour
            protéger durablement la
            santé visuelle.
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
            Uvéite : de quoi
            s’agit-il exactement ?
          </h2>

          <p>
            L’uvéite correspond à une
            inflammation qui touche
            tout ou partie de l’uvée,
            structure appelée aussi
            tunique vasculaire de
            l’œil.
          </p>

          <p>
            Cette zone comprend trois
            éléments essentiels :
            l’iris, le corps ciliaire
            et la choroïde.
          </p>

          <p>
            Ensemble, ces structures
            participent à la nutrition
            de l’œil, à la régulation
            de certaines fonctions
            visuelles et au bon
            fonctionnement de la
            rétine.
          </p>

          <p>
            L’uvéite peut apparaître
            brutalement ou évoluer de
            manière chronique avec
            des poussées répétées.
          </p>

          <p>
            Sans traitement adapté,
            cette inflammation de
            l’œil peut entraîner des
            complications sévères et
            une perte importante de
            la vision.
          </p>
        </div>
      </section>

      {/* =====================================================
          TYPES
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quels sont les principaux
            types d’uvéite ?
          </h2>

          <p>
            Il existe plusieurs types
            d’uvéite, classés selon
            la localisation de
            l’inflammation dans
            l’œil.
          </p>

          <h3>
            Uvéite antérieure
          </h3>

          <p>
            L’uvéite antérieure est
            la forme la plus
            fréquente. Elle touche
            principalement l’iris et
            parfois le corps
            ciliaire.
          </p>

          <p>
            Elle provoque souvent une
            rougeur importante, une
            douleur oculaire et une
            forte sensibilité à la
            lumière.
          </p>

          <ul className="seo-list">
            <li>
              Rougeur de l’œil
            </li>

            <li>
              Douleurs oculaires
            </li>

            <li>
              Photophobie importante
            </li>

            <li>
              Baisse rapide de la
              vision
            </li>
          </ul>

          <h3>
            Uvéite intermédiaire
          </h3>

          <p>
            Cette forme touche
            principalement le vitré
            et la région située près
            du corps ciliaire.
          </p>

          <p>
            Les symptômes sont
            souvent plus discrets,
            avec des mouches volantes
            et une vision floue
            progressive.
          </p>

          <p>
            Le diagnostic peut être
            retardé car la douleur
            reste généralement
            modérée.
          </p>

          <h3>
            Uvéite postérieure
          </h3>

          <p>
            L’uvéite postérieure
            atteint la choroïde, la
            rétine ou les vaisseaux
            rétiniens.
          </p>

          <p>
            Les troubles visuels
            dominent avec baisse
            d’acuité, taches sombres
            et déformations du champ
            visuel.
          </p>

          <p>
            Cette forme expose à un
            risque élevé de handicap
            visuel si elle n’est pas
            traitée rapidement.
          </p>

          <h3>
            Panuvéite
          </h3>

          <p>
            La panuvéite correspond à
            une inflammation diffuse
            touchant toutes les
            parties de l’uvée.
          </p>

          <p>
            Il s’agit de la forme la
            plus sévère, avec une
            atteinte visuelle souvent
            importante.
          </p>
        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Quels sont les symptômes
            qui doivent alerter ?
          </h2>

          <p>
            Les symptômes varient
            selon la localisation de
            l’inflammation mais
            certains signes doivent
            conduire à consulter
            rapidement.
          </p>

          <ul className="seo-list">
            <li>
              Rougeur de l’œil
            </li>

            <li>
              Douleur profonde dans
              l’œil
            </li>

            <li>
              Photophobie importante
            </li>

            <li>
              Vision floue ou baisse
              d’acuité visuelle
            </li>

            <li>
              Apparition de mouches
              volantes
            </li>

            <li>
              Sensation de voile ou
              de taches grises
            </li>

            <li>
              Larmoiement excessif
            </li>
          </ul>

          <p>
            Une inflammation
            intraoculaire non traitée
            peut rapidement évoluer
            vers des complications
            affectant durablement la
            vision.
          </p>

          <p>
            Même un symptôme isolé
            justifie une consultation
            ophtalmologique rapide.
          </p>
        </div>
      </section>

      {/* =====================================================
          CAUSES
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quelles sont les
            principales causes de
            l’uvéite ?
          </h2>

          <p>
            L’uvéite peut apparaître
            pour des raisons très
            variées.
          </p>

          <p>
            Dans certains cas,
            l’origine exacte n’est
            pas retrouvée : on parle
            alors d’uvéite
            idiopathique.
          </p>

          <h3>
            Causes infectieuses
          </h3>

          <p>
            Plusieurs infections
            peuvent déclencher une
            inflammation oculaire.
          </p>

          <ul className="seo-list">
            <li>
              Herpès oculaire
            </li>

            <li>
              Zona ophtalmique
            </li>

            <li>
              Toxoplasmose oculaire
            </li>

            <li>
              Syphilis
            </li>

            <li>
              Tuberculose
            </li>
          </ul>

          <h3>
            Causes auto-immunes ou
            inflammatoires
          </h3>

          <p>
            Certaines maladies
            inflammatoires chroniques
            favorisent également
            l’apparition d’une
            uvéite.
          </p>

          <ul className="seo-list">
            <li>
              Spondylarthrite
              ankylosante
            </li>

            <li>
              Sarcoïdose
            </li>

            <li>
              Polyarthrite
              rhumatoïde
            </li>

            <li>
              Maladie de Behçet
            </li>
          </ul>

          <h3>
            Facteurs environnementaux
            ou toxiques
          </h3>

          <p>
            Certains traumatismes,
            produits chimiques ou
            interventions chirurgicales
            peuvent aussi déclencher
            une réaction inflammatoire
            oculaire.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIAGNOSIS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Comment diagnostiquer et
            traiter une uvéite ?
          </h2>

          <p>
            Le diagnostic repose sur
            un examen ophtalmologique
            complet réalisé à la
            lampe à fente.
          </p>

          <p>
            Cet examen permet de
            localiser précisément
            l’inflammation et
            d’évaluer son intensité.
          </p>

          <p>
            Des examens
            complémentaires peuvent
            être nécessaires afin de
            rechercher une cause
            infectieuse ou
            inflammatoire générale.
          </p>

          <h3>
            Principaux traitements
            proposés
          </h3>

          <p>
            Le traitement dépend du
            type d’uvéite, de sa
            gravité et de son
            origine.
          </p>

          <ul className="seo-list">
            <li>
              Corticoïdes sous forme
              de collyres,
              injections ou comprimés
            </li>

            <li>
              Immunosuppresseurs ou
              biothérapies
            </li>

            <li>
              Antibiotiques ou
              antiviraux
            </li>

            <li>
              Collyres pour soulager
              la douleur et limiter
              les complications
            </li>
          </ul>

          <p>
            Un suivi régulier est
            indispensable afin de
            surveiller l’évolution de
            l’inflammation et prévenir
            les rechutes.
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
          PROGNOSIS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Pronostic et prévention
          </h2>

          <p>
            Le pronostic dépend de
            nombreux facteurs :
            rapidité du diagnostic,
            efficacité du traitement
            et présence éventuelle de
            maladies associées.
          </p>

          <p>
            Dans beaucoup de cas, une
            récupération visuelle
            satisfaisante est
            possible lorsque la prise
            en charge est rapide.
          </p>

          <p>
            Certaines formes
            chroniques peuvent
            toutefois entraîner des
            récidives ou des
            complications durables.
          </p>

          <ul className="seo-list">
            <li>
              Surveillance régulière
              chez l’ophtalmologiste
            </li>

            <li>
              Traitement rapide des
              infections
            </li>

            <li>
              Protection des yeux lors
              d’activités à risque
            </li>

            <li>
              Suivi des maladies
              inflammatoires
              chroniques
            </li>
          </ul>

          <p>
            La prévention repose
            surtout sur un diagnostic
            précoce et un suivi
            médical rigoureux.
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
            l’uvéite et les
            inflammations de l’œil
          </h2>

          <h3>
            L’uvéite est-elle
            contagieuse ?
          </h3>

          <p>
            Non, l’uvéite n’est
            généralement pas une
            maladie contagieuse.
          </p>

          <p>
            Lorsque l’inflammation
            est liée à une infection,
            seul l’agent infectieux
            peut parfois être
            transmissible.
          </p>

          <ul className="seo-list">
            <li>
              Uvéite souvent
              auto-immune ou
              inflammatoire
            </li>

            <li>
              Contagion exceptionnelle
            </li>
          </ul>

          <h3>
            Peut-on devenir aveugle à
            cause d’une uvéite ?
          </h3>

          <p>
            Oui, certaines formes
            sévères d’uvéite peuvent
            entraîner une perte
            importante de vision si
            elles ne sont pas
            traitées rapidement.
          </p>

          <ul className="seo-list">
            <li>
              Risque plus élevé dans
              les uvéites postérieures
            </li>

            <li>
              Surveillance régulière
              indispensable
            </li>

            <li>
              Traitement précoce
              essentiel
            </li>
          </ul>

          <h3>
            Quel spécialiste
            consulter en cas de
            suspicion d’uvéite ?
          </h3>

          <p>
            Toute suspicion d’uvéite
            nécessite un rendez-vous
            rapide chez un
            ophtalmologiste.
          </p>

          <p>
            Selon les résultats du
            bilan, un interniste, un
            rhumatologue ou un
            infectiologue peut aussi
            intervenir dans la prise
            en charge.
          </p>

          <h3>
            Existe-t-il des mesures
            de prévention efficaces
            contre l’uvéite ?
          </h3>

          <p>
            Il n’existe pas de
            prévention universelle,
            mais certaines habitudes
            permettent de limiter les
            risques de complications.
          </p>

          <ol className="seo-list">
            <li>
              Protection des yeux
              lors d’activités à
              risque
            </li>

            <li>
              Traitement rapide des
              infections
            </li>

            <li>
              Suivi régulier des
              maladies auto-immunes
            </li>

            <li>
              Consultation rapide en
              cas de symptôme
              inhabituel
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}