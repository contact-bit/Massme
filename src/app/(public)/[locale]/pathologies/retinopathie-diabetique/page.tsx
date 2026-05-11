import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "../pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Rétinopathie diabétique : Comprendre et prévenir cette maladie oculaire – VitrectoMed",

    description:
      "Découvrez la rétinopathie diabétique, ses facteurs de risque, symptômes et traitements. Apprenez à préserver votre vision face à cette complication du diabète.",
  };
}

export default async function DiabeticRetinopathyPage({
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
            Diabète et rétine
          </span>

          <h1 className="pathologies-title">
            Rétinopathie diabétique :
            comprendre et prévenir
            cette complication du
            diabète
          </h1>

          <p className="pathologies-intro">
            La rétinopathie
            diabétique fait partie
            des complications du
            diabète pouvant altérer
            durablement la vision.
          </p>

          <p className="pathologies-description">
            Cette maladie de la
            rétine touche les
            vaisseaux sanguins
            oculaires, fragilisés par
            une hyperglycémie
            prolongée, et peut
            évoluer vers une perte de
            vision importante en
            l’absence de prise en
            charge.
          </p>

          <p className="pathologies-description">
            Identifier rapidement les
            facteurs de risque, les
            symptômes et les
            traitements disponibles
            permet de préserver plus
            efficacement la santé
            visuelle.
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
            Qu’est-ce que la
            rétinopathie diabétique ?
          </h2>

          <p>
            La rétinopathie
            diabétique correspond à
            une atteinte progressive
            des vaisseaux sanguins de
            la rétine liée au diabète
            de type 1 ou de type 2.
          </p>

          <p>
            Une hyperglycémie
            persistante endommage peu
            à peu les petits
            vaisseaux rétiniens,
            perturbant leur
            fonctionnement et leur
            capacité à nourrir les
            tissus oculaires.
          </p>

          <p>
            Cette maladie peut
            évoluer silencieusement
            pendant plusieurs années
            avant d’entraîner une
            baisse de vision.
          </p>

          <h3>
            Les différents stades de
            la maladie
          </h3>

          <p>
            On distingue
            principalement deux
            formes de rétinopathie
            diabétique.
          </p>

          <ul className="seo-list">
            <li>
              Forme non proliférante
              avec micro-anévrismes,
              hémorragies et
              exsudats
            </li>

            <li>
              Forme proliférante avec
              apparition de nouveaux
              vaisseaux anormaux
            </li>
          </ul>

          <p>
            L’œdème maculaire
            diabétique peut apparaître
            à n’importe quel stade et
            représente l’une des
            principales causes de
            perte de vision chez les
            patients diabétiques.
          </p>
        </div>
      </section>

      {/* =====================================================
          RISK FACTORS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Les principaux facteurs
            de risque de la
            rétinopathie diabétique
          </h2>

          <p>
            Plusieurs éléments
            augmentent le risque de
            développer ou d’aggraver
            cette complication du
            diabète.
          </p>

          <p>
            Une surveillance adaptée
            permet de limiter
            l’évolution des lésions
            rétiniennes.
          </p>

          <ul className="seo-list">
            <li>
              Durée du diabète élevée
            </li>

            <li>
              Mauvais équilibre
              glycémique
            </li>

            <li>
              Hypertension artérielle
              associée
            </li>

            <li>
              Cholestérol ou
              triglycérides élevés
            </li>

            <li>
              Tabagisme
            </li>

            <li>
              Grossesse chez une
              personne diabétique
            </li>

            <li>
              Mode de vie sédentaire
            </li>

            <li>
              Prédisposition
              génétique
            </li>
          </ul>

          <p>
            Plus le diabète est
            ancien et mal contrôlé,
            plus le risque
            d’anomalies rétiniennes
            augmente.
          </p>
        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Comment reconnaître les
            signes annonciateurs ?
          </h2>

          <p>
            La rétinopathie
            diabétique évolue souvent
            sans symptôme visible dans
            les premiers stades.
          </p>

          <p>
            Un suivi ophtalmologique
            régulier est donc
            indispensable même en
            l’absence de gêne
            visuelle.
          </p>

          <h3>
            Symptômes précoces
            observés
          </h3>

          <p>
            Lorsque des symptômes
            apparaissent, ils
            traduisent souvent une
            atteinte déjà avancée de
            la rétine.
          </p>

          <ul className="seo-list">
            <li>
              Baisse progressive de
              l’acuité visuelle
            </li>

            <li>
              Vision floue lors de la
              lecture
            </li>

            <li>
              Présence de taches
              sombres mobiles
            </li>

            <li>
              Déformation des lignes
              ou des images
            </li>

            <li>
              Éclairs lumineux ou
              ombres soudaines
            </li>
          </ul>

          <p>
            L’œdème maculaire
            diabétique provoque
            souvent une vision
            centrale déformée ou
            brouillée.
          </p>

          <h3>
            Quand consulter sans
            attendre ?
          </h3>

          <p>
            Une baisse brutale de la
            vision, un voile noir ou
            des douleurs oculaires
            nécessitent une
            consultation urgente.
          </p>

          <p>
            Une prise en charge
            rapide limite le risque
            de séquelles irréversibles
            ou de cécité.
          </p>

          <p>
            Les patients présentant
            un diabète ancien ou mal
            équilibré doivent rester
            particulièrement vigilants.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIAGNOSIS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Diagnostic de la
            rétinopathie diabétique :
            quels examens privilégier
            ?
          </h2>

          <p>
            Le diagnostic repose
            principalement sur
            l’examen du fond d’œil.
          </p>

          <p>
            Cet examen permet
            d’observer directement
            les vaisseaux sanguins de
            la rétine et de détecter
            d’éventuelles anomalies.
          </p>

          <h3>
            Tests et technologies de
            pointe
          </h3>

          <p>
            Plusieurs examens
            complémentaires peuvent
            être réalisés afin
            d’évaluer précisément la
            gravité des lésions.
          </p>

          <ul className="seo-list">
            <li>
              Fond d’œil avec
              dilatation pupillaire
            </li>

            <li>
              Angiographie
              fluorescéinique
            </li>

            <li>
              OCT (tomographie par
              cohérence optique)
            </li>

            <li>
              Photographies
              rétiniennes
            </li>
          </ul>

          <p>
            Ces examens permettent de
            détecter les fuites
            vasculaires, les
            néovaisseaux ou un œdème
            maculaire diabétique.
          </p>

          <h3>
            À quelle fréquence
            réaliser un suivi ?
          </h3>

          <p>
            Un contrôle annuel est
            généralement recommandé
            chez toute personne
            diabétique, même sans
            symptôme visuel.
          </p>

          <p>
            En présence d’une
            rétinopathie évolutive,
            les consultations peuvent
            devenir beaucoup plus
            rapprochées.
          </p>
        </div>
      </section>

      {/* =====================================================
          TREATMENTS
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Quels traitements
            permettent de préserver
            la vision ?
          </h2>

          <p>
            La prise en charge dépend
            du stade de la maladie et
            des complications
            observées au niveau de la
            rétine.
          </p>

          <p>
            L’objectif des traitements
            consiste à stabiliser les
            anomalies rétiniennes et
            à limiter la perte de
            vision.
          </p>

          <ul className="seo-list">
            <li>
              Équilibre glycémique
              strict
            </li>

            <li>
              Injections
              intraoculaires
              anti-VEGF
            </li>

            <li>
              Traitement laser
              rétinien
            </li>

            <li>
              Corticoïdes dans
              certaines situations
            </li>

            <li>
              Chirurgie
              vitréorétinienne
            </li>
          </ul>

          <p>
            La vitrectomie peut être
            proposée en cas
            d’hémorragie importante,
            de décollement de rétine
            ou d’échec des autres
            traitements.
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
          PREVENTION
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Prévention et gestes
            quotidiens pour protéger
            ses yeux
          </h2>

          <p>
            Au-delà des traitements
            médicaux, certaines
            habitudes jouent un rôle
            majeur dans la prévention
            de la rétinopathie
            diabétique.
          </p>

          <p>
            Une bonne hygiène de vie
            aide à ralentir
            l’évolution des lésions
            rétiniennes.
          </p>

          <ul className="seo-list">
            <li>
              Contrôle rigoureux de
              la glycémie
            </li>

            <li>
              Arrêt du tabac
            </li>

            <li>
              Activité physique
              régulière
            </li>

            <li>
              Contrôle du poids
            </li>

            <li>
              Gestion du stress
            </li>

            <li>
              Surveillance de la
              tension artérielle
            </li>

            <li>
              Alimentation équilibrée
              riche en nutriments
              protecteurs pour la
              rétine
            </li>
          </ul>

          <p>
            La collaboration entre le
            patient, le diabétologue
            et l’ophtalmologiste
            améliore considérablement
            la prévention des
            complications visuelles.
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
            la rétinopathie
            diabétique
          </h2>

          <h3>
            La rétinopathie
            diabétique conduit-elle
            toujours à la cécité ?
          </h3>

          <p>
            Non, cette complication
            du diabète n’entraîne pas
            systématiquement une
            perte totale de la
            vision.
          </p>

          <p>
            Grâce aux progrès du
            diagnostic et des
            traitements, la plupart
            des patients peuvent
            aujourd’hui stabiliser la
            maladie lorsqu’elle est
            prise en charge
            suffisamment tôt.
          </p>

          <ul className="seo-list">
            <li>
              Examens réguliers du
              fond d’œil
            </li>

            <li>
              Bon équilibre
              glycémique
            </li>

            <li>
              Traitement précoce des
              anomalies détectées
            </li>
          </ul>

          <h3>
            Quelle différence existe
            entre rétinopathie non
            proliférante et
            proliférante ?
          </h3>

          <p>
            La forme non proliférante
            correspond au stade
            initial avec micro-
            hémorragies et exsudats.
          </p>

          <p>
            La forme proliférante est
            plus avancée et se
            caractérise par la
            présence de néovaisseaux
            fragiles pouvant saigner
            ou provoquer un
            décollement de rétine.
          </p>

          <ul className="seo-list">
            <li>
              Stade non proliférant :
              lésions modérées
            </li>

            <li>
              Stade proliférant :
              risques élevés de
              complications sévères
            </li>
          </ul>

          <h3>
            Peut-on guérir
            définitivement de la
            rétinopathie diabétique ?
          </h3>

          <p>
            Il n’existe actuellement
            aucun traitement capable
            de guérir totalement la
            maladie une fois
            installée.
          </p>

          <p>
            En revanche, les
            traitements modernes
            permettent souvent de
            ralentir son évolution et
            parfois d’améliorer la
            vision.
          </p>

          <ul className="seo-list">
            <li>
              Injections
              intraoculaires
            </li>

            <li>
              Laser rétinien
            </li>

            <li>
              Vitrectomie dans les
              formes avancées
            </li>

            <li>
              Contrôle optimal du
              diabète
            </li>
          </ul>

          <h3>
            Quels conseils suivre
            pour prévenir la
            rétinopathie diabétique ?
          </h3>

          <p>
            La prévention repose
            principalement sur le
            contrôle du diabète et un
            suivi ophtalmologique
            régulier.
          </p>

          <ol className="seo-list">
            <li>
              Maintenir une glycémie
              stable
            </li>

            <li>
              Réaliser un fond d’œil
              annuel
            </li>

            <li>
              Contrôler la tension et
              le cholestérol
            </li>

            <li>
              Arrêter le tabac
            </li>

            <li>
              Adopter une alimentation
              équilibrée
            </li>

            <li>
              Pratiquer une activité
              physique régulière
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}