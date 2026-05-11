import { notFound } from "next/navigation";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import "../pathologies.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title:
      "Mouches volantes : Comprendre les corps flottants en vision – VitrectoMed",

    description:
      "Découvrez tout sur les mouches volantes, leurs causes, symptômes et traitements. Apprenez à mieux gérer ce phénomène visuel courant et ses impacts.",
  };
}

export default async function FloatersPage({
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
            Corps flottants et vitré
          </span>

          <h1 className="pathologies-title">
            Tout comprendre sur les
            mouches volantes ou corps
            flottants dans le champ
            de vision
          </h1>

          <p className="pathologies-intro">
            Les mouches volantes,
            aussi appelées corps
            flottants ou
            myodésopsies, intriguent
            et parfois inquiètent
            celles et ceux qui les
            perçoivent.
          </p>

          <p className="pathologies-description">
            Ces petites taches
            sombres ou filaments
            mobiles, visibles surtout
            sur un ciel bleu ou une
            surface blanche, sont le
            plus souvent bénins mais
            peuvent parfois révéler
            une atteinte du vitré ou
            de la rétine.
          </p>

          <p className="pathologies-description">
            Comprendre les causes,
            symptômes et traitements
            des corps flottants aide
            à mieux réagir en cas
            d’apparition soudaine ou
            d’aggravation des troubles
            visuels.
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
            Que sont les mouches
            volantes ou corps
            flottants ?
          </h2>

          <p>
            Les mouches volantes
            correspondent à la
            perception de points
            noirs, de filaments
            translucides ou de
            petites taches mobiles
            dans le champ de vision.
          </p>

          <p>
            Ce phénomène est désigné
            médicalement sous le nom
            de myodésopsies.
          </p>

          <p>
            L’origine de ces troubles
            visuels se situe dans le
            corps vitré, une
            substance gélatineuse
            transparente occupant la
            majeure partie de
            l’intérieur de l’œil,
            entre le cristallin et
            la rétine.
          </p>

          <p>
            Lorsque des irrégularités
            apparaissent dans cette
            gelée transparente, elles
            projettent une ombre sur
            la rétine et créent la
            sensation de corps
            flottants mobiles devant
            les yeux.
          </p>

          <ul className="seo-list">
            <li>
              Points noirs isolés ou
              multiples
            </li>

            <li>
              Filaments évoquant une
              toile d’araignée
            </li>

            <li>
              Anneaux ou bulles
              translucides
            </li>

            <li>
              Mouvements synchronisés
              avec les déplacements
              oculaires
            </li>
          </ul>

          <p>
            Ces éléments semblent
            flotter dans le champ de
            vision et se déplacent
            souvent lentement après
            un mouvement du regard.
          </p>
        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quels sont les symptômes
            évocateurs des troubles
            visuels liés aux
            myodésopsies ?
          </h2>

          <p>
            La majorité des personnes
            concernées remarquent la
            présence de corps
            flottants principalement
            sur des fonds clairs et
            homogènes.
          </p>

          <p>
            Ces symptômes ne
            provoquent généralement
            aucune douleur et
            n’altèrent pas
            immédiatement la netteté
            globale de la vision.
          </p>

          <p>
            Certaines personnes
            ressentent néanmoins une
            gêne importante au
            quotidien, notamment lors
            de la lecture ou devant
            un écran lumineux.
          </p>

          <h3>
            L’impact sur la qualité
            de vie
          </h3>

          <p>
            Chez certains individus,
            la focalisation sur les
            taches ou points mobiles
            devient une source de
            distraction fréquente.
          </p>

          <p>
            Même si le cerveau
            apprend progressivement à
            ignorer ces défauts,
            l’inconfort peut parfois
            persister pendant de
            longs mois.
          </p>

          <p>
            Une apparition soudaine
            de myodésopsies associée
            à des flashs lumineux,
            une perte du champ visuel
            périphérique ou une
            baisse rapide de l’acuité
            visuelle nécessite une
            consultation urgente.
          </p>

          <h3>
            Variations dans la
            perception
          </h3>

          <p>
            L’intensité des mouches
            volantes varie selon la
            luminosité, la fatigue
            visuelle ou encore la
            position du regard.
          </p>

          <p>
            Certaines personnes
            remarquent davantage ces
            phénomènes après une
            exposition prolongée aux
            écrans ou à des surfaces
            très lumineuses.
          </p>

          <p>
            Avec le temps, la plupart
            des patients constatent
            une diminution subjective
            de la visibilité des
            corps flottants grâce à
            un mécanisme d’adaptation
            cérébrale.
          </p>
        </div>
      </section>

      {/* =====================================================
          CAUSES
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Quelles sont les
            principales causes et
            facteurs de risque ?
          </h2>

          <p>
            Plusieurs mécanismes
            peuvent expliquer
            l’apparition des mouches
            volantes.
          </p>

          <p>
            La cause la plus fréquente
            reste le vieillissement
            naturel du vitré.
          </p>

          <h3>
            Dégradation du vitré
          </h3>

          <p>
            Avec l’âge, le vitré se
            liquéfie progressivement
            et des agrégats
            microscopiques peuvent se
            former à l’intérieur de
            l’œil.
          </p>

          <p>
            Ces opacités deviennent
            visibles sous forme de
            corps flottants.
          </p>

          <h3>
            Décollement postérieur du
            vitré
          </h3>

          <p>
            Après 50 ans, le vitré
            peut se détacher de la
            rétine, provoquant
            l’apparition soudaine de
            nombreux points noirs,
            parfois associés à des
            flashs lumineux.
          </p>

          <h3>
            Hémorragie ou
            inflammation vitréenne
          </h3>

          <p>
            Certaines maladies comme
            l’uvéite ou la
            rétinopathie diabétique
            peuvent provoquer des
            saignements ou une
            inflammation interne
            responsables de corps
            flottants importants.
          </p>

          <h3>
            Traumatismes oculaires
          </h3>

          <p>
            Un choc direct sur l’œil
            peut endommager le vitré
            ou la rétine et favoriser
            l’apparition de troubles
            visuels atypiques.
          </p>

          <p>
            La fatigue oculaire,
            certaines maladies
            rétiniennes ou des
            chirurgies oculaires
            antérieures augmentent
            également le risque de
            myodésopsies.
          </p>

          <ul className="seo-list">
            <li>
              Vieillissement naturel
              du vitré
            </li>

            <li>
              Forte myopie
            </li>

            <li>
              Diabète
            </li>

            <li>
              Antécédents familiaux
              de maladies oculaires
            </li>

            <li>
              Inflammation
              intraoculaire
            </li>

            <li>
              Traumatisme ou chirurgie
              oculaire
            </li>
          </ul>
        </div>
      </section>

      {/* =====================================================
          PREVENTION
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Comment prévenir
            l'apparition ou
            l’aggravation des
            myodésopsies ?
          </h2>

          <p>
            Même si le vieillissement
            du vitré ne peut être
            totalement évité,
            certaines habitudes
            permettent de préserver
            plus durablement la santé
            visuelle.
          </p>

          <p>
            Une bonne hygiène de vie
            et un suivi ophtalmologique
            régulier contribuent à
            limiter l’apparition
            prématurée des corps
            flottants.
          </p>

          <ul className="seo-list">
            <li>
              Limiter les expositions
              prolongées aux écrans
            </li>

            <li>
              Faire des pauses
              régulières afin de
              réduire la fatigue
              oculaire
            </li>

            <li>
              Porter une protection
              adaptée lors des
              activités à risque
            </li>

            <li>
              Réaliser des contrôles
              ophtalmologiques
              réguliers
            </li>

            <li>
              Contrôler le diabète et
              l’hypertension
            </li>

            <li>
              Maintenir une
              alimentation équilibrée
              riche en vitamines
            </li>
          </ul>

          <p>
            Aucune goutte ou
            supplément alimentaire ne
            permet aujourd’hui de
            prévenir directement les
            myodésopsies.
          </p>
        </div>
      </section>

      {/* =====================================================
          DIAGNOSTIC
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Comment se passe le
            diagnostic des corps
            flottants ?
          </h2>

          <p>
            Une consultation
            ophtalmologique est
            recommandée en cas
            d’apparition récente ou
            inhabituelle de mouches
            volantes.
          </p>

          <p>
            Le praticien interroge le
            patient sur les
            symptômes, leur évolution
            et les éventuels
            antécédents médicaux.
          </p>

          <p>
            L’examen clinique permet
            d’évaluer l’état du vitré
            et de la rétine afin de
            rechercher une éventuelle
            complication.
          </p>

          <ul className="seo-list">
            <li>
              Examen du fond d’œil
            </li>

            <li>
              Observation directe du
              vitré
            </li>

            <li>
              Recherche d’une
              déchirure rétinienne
            </li>

            <li>
              Dépistage d’une
              hémorragie ou
              inflammation
            </li>

            <li>
              Échographie oculaire si
              nécessaire
            </li>
          </ul>

          <p>
            Dans la majorité des cas,
            aucun traitement n’est
            proposé lorsque la gêne
            reste modérée et stable.
          </p>
        </div>
      </section>

      {/* =====================================================
          TREATMENTS
      ===================================================== */}

      <section className="seo-section seo-section-alt">
        <div className="seo-container">
          <h2>
            Quelles sont les options
            de traitement disponibles
            ?
          </h2>

          <p>
            La majorité des mouches
            volantes ne nécessite
            aucune intervention
            spécifique.
          </p>

          <p>
            Toutefois, certains cas
            sévères ou très gênants
            peuvent nécessiter une
            prise en charge adaptée.
          </p>

          <h3>
            Les approches non
            invasives et la
            surveillance
          </h3>

          <p>
            Le cerveau humain
            s’adapte progressivement
            à la présence des corps
            flottants grâce à un
            phénomène d’habituation.
          </p>

          <p>
            Une surveillance
            ophtalmologique régulière
            suffit souvent lorsque
            les symptômes restent
            stables.
          </p>

          <h3>
            Traitements médicaux et
            chirurgicaux
          </h3>

          <p>
            Lorsque les myodésopsies
            deviennent handicapantes,
            plusieurs solutions
            peuvent être discutées
            avec un spécialiste.
          </p>

          <ul className="seo-list">
            <li>
              Laser YAG : fragmentation
              de certains corps
              flottants volumineux
            </li>

            <li>
              Vitrectomie : retrait
              partiel ou total du
              vitré afin d’éliminer
              définitivement les
              opacités gênantes
            </li>
          </ul>

          <p>
            La vitrectomie reste
            réservée à certaines
            situations en raison des
            risques possibles :
            infection,
            décollement de rétine ou
            cataracte secondaire.
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
              href={`${prefix}/convalescence/coussin`}
              className="pathologies-card pathologies-card--accent"
            >
              Voir le matériel de
              convalescence
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="seo-section">
        <div className="seo-container">
          <h2>
            Questions fréquentes sur
            les mouches volantes et
            les corps flottants
          </h2>

          <h3>
            Peut-on faire disparaître
            complètement les mouches
            volantes ?
          </h3>

          <p>
            Les mouches volantes
            persistent souvent mais
            deviennent généralement
            moins gênantes avec le
            temps grâce à
            l’habituation du cerveau.
          </p>

          <ul className="seo-list">
            <li>
              Adaptation progressive
              du cerveau
            </li>

            <li>
              Traitement laser
              possible dans certains
              cas
            </li>

            <li>
              Chirurgie réservée aux
              formes sévères
            </li>
          </ul>

          <h3>
            Doit-on s’inquiéter en
            cas d’apparition subite ?
          </h3>

          <p>
            Une apparition soudaine
            et massive de corps
            flottants, surtout
            associée à des flashs
            lumineux ou une baisse de
            vision, nécessite une
            consultation urgente.
          </p>

          <div className="seo-table-wrapper">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>
                    Symptôme associé
                  </th>

                  <th>
                    Signification
                    potentielle
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    Flashs lumineux
                  </td>

                  <td>
                    Traction ou
                    déchirure
                    rétinienne
                  </td>
                </tr>

                <tr>
                  <td>
                    Baisse brutale de
                    la vue
                  </td>

                  <td>
                    Hémorragie ou
                    œdème
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul className="seo-list">
            <li>
              Évaluation médicale
              indispensable
            </li>

            <li>
              Risque important pour
              la rétine en cas de
              diagnostic tardif
            </li>

            <li>
              Recherche d’autres
              anomalies visuelles
            </li>
          </ul>

          <h3>
            Qui est le plus exposé
            aux myodésopsies ?
          </h3>

          <p>
            Les personnes les plus
            concernées sont souvent
            âgées de plus de 50 ans,
            fortement myopes ou
            atteintes de maladies
            chroniques comme le
            diabète.
          </p>

          <ul className="seo-list">
            <li>
              Sujets âgés
            </li>

            <li>
              Myopes importants
            </li>

            <li>
              Patients diabétiques
            </li>

            <li>
              Antécédents de chirurgie
              ou traumatisme oculaire
            </li>
          </ul>

          <h3>
            Existe-t-il une
            prévention efficace
            contre les corps
            flottants ?
          </h3>

          <p>
           Aucune méthode ne garantit l’absence totale de mouches
           volantes avec l’âge. En revanche, adopter une hygiène de vie
           adaptée, protéger ses yeux des traumatismes, gérer ses maladies
           générales et consulter régulièrement un ophtalmologiste contribue à
           retarder l’apparition ou l’aggravation des troubles visuels :
          </p>

          <ol className="seo-list">
            <li>
              Adopter une alimentation
              équilibrée
            </li>

            <li>
              Réduire la fatigue
              oculaire liée aux
              écrans
            </li>

            <li>
              Réaliser des contrôles
              ophtalmologiques
              réguliers
            </li>

            <li>
              Contrôler les maladies
              chroniques
            </li>

            <li>
              Protéger ses yeux des
              traumatismes
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}