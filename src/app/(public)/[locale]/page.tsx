import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bed,
  BriefcaseMedical,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Eye,
  GraduationCap,
  Heart,
  HeartHandshake,
  Languages,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const faqItems = [
  {
    question: "Combien de temps dure la récupération après une vitrectomie ?",
    answer:
      "La récupération varie d'une personne à l'autre et selon la pathologie traitée. En général, l'amélioration visuelle commence dans les jours qui suivent l'opération et peut se poursuivre pendant plusieurs semaines, voire plusieurs mois.",
  },
  {
    question: "Quand la bulle de gaz disparaît-elle ?",
    answer:
      "La bulle de gaz se résorbe naturellement avec le temps. Selon le type de gaz utilisé, elle peut disparaître en 1 à 8 semaines. Votre chirurgien vous informera précisément en fonction de votre cas.",
  },
  "Puis-je reprendre mes activités sportives ?",
  "Comment dormir après une vitrectomie ?",
  "Quels sont les signes d'alerte après une vitrectomie ?",
  "Combien de temps dure la convalescence totale ?",
  "Quand puis-je reprendre le travail ?",
];

const pathologyCards = [
  {
    title: "Trou maculaire",
    text: "Qu'est-ce qu'un trou maculaire ? Quels symptômes ? Comment évolue la maladie ?",
    href: "/pathologies/trou-maculaire",
    visual: "macular",
  },
  {
    title: "Décollement de rétine",
    text: "Comprendre cette urgence ophtalmologique et les options de traitement.",
    href: "/pathologies/decollement-retine",
    visual: "detachment",
  },
  {
    title: "Membrane épirétinienne",
    text: "Comprendre les symptômes, l'évolution et le moment d'envisager une chirurgie.",
    href: "/pathologies",
    visual: "diabetic",
  },
  {
    title: "Corps flottants",
    text: "Comprendre les causes et savoir quand consulter.",
    href: "/pathologies/mouches-volantes-ou-corps-flottants",
    visual: "floaters",
  },
];

const guideCards = [
  { label: "Dormir après vitrectomie", icon: <Bed />, href: "/blog" },
  { label: "Temps de récupération et convalescence", icon: <Clock3 />, href: "/convalescence" },
  { label: "Vision après vitrectomie", icon: <Eye />, href: "/convalescence" },
  { label: "Positionnement face vers le bas", icon: <UserRound />, href: "/convalescence" },
  { label: "Bulle de gaz", icon: <CheckCircle2 />, href: "/convalescence" },
  { label: "Voyager après vitrectomie", icon: <Plane />, href: "/blog" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  return {
    title: "Vitrectomie : votre parcours, notre accompagnement | VitrectoMed",
    description:
      "Informations fiables, parcours patient, guides de récupération, annuaire de chirurgiens et dispositif médical Vitrectomed.",
    alternates: {
      canonical: isLocale(rawLocale) ? `/${rawLocale}` : "/fr",
    },
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
    <main className="home-exact">
      <section className="home-exact-hero home-exact-wrap">
        <div className="home-exact-hero-main">
          <div className="home-exact-hero-copy">
            <h1>
              Vitrectomie :<br />
              votre <span>parcours</span>,<br />
              notre <span>accompagnement</span>
            </h1>

            <h2 className="home-exact-lead">
              Comprendre votre pathologie, préparer votre intervention, choisir un chirurgien{" "}
              <br className="home-exact-lead-break" />
              spécialisé et réussir votre récupération après vitrectomie.
            </h2>

            <div className="home-exact-hero-cta-row">
              <section className="home-exact-support" aria-labelledby="home-support-title">
                <HeartHandshake aria-hidden="true" />
                <div>
                  <h3 id="home-support-title">
                    VitrectoMed accompagne les patients
                  </h3>
                  <p>
                    du diagnostic jusqu’au retour à la vie quotidienne après une
                    vitrectomie.
                  </p>
                </div>
              </section>

              <div className="home-exact-actions">
                <Link href={`${prefix}/convalescence`} className="home-exact-btn home-exact-btn-primary">
                  Commencer mon parcours <ArrowRight />
                </Link>
                <Link href={`${prefix}/annuaire`} className="home-exact-btn home-exact-btn-secondary">
                  <UserRound /> Trouver un chirurgien
                </Link>
              </div>
            </div>
          </div>

          <div className="home-exact-hero-image">
            <Image
              src="/brand/home-hero-patient-v2.png"
              alt="Patiente en position face vers le bas après une vitrectomie"
              width={2020}
              height={778}
              priority
            />
          </div>

          <aside className="home-exact-image-card">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h3>Position postopératoire prescrite&nbsp;?</h3>
              <p>
                Découvrez une solution pensée pour aider les patients à
                respecter la position recommandée par leur chirurgien.
              </p>
              <Link href={`${prefix}/convalescence/coussin`}>
                En savoir plus <ArrowRight />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-exact-trust home-exact-wrap" aria-label="Garanties éditoriales">
        <Trust icon={<ShieldCheck />} text="Contenus rédigés et relus par un comité éditorial spécialisé en chirurgie vitréo-rétinienne" />
        <Trust icon={<GraduationCap />} text="Informations médicales à caractère éducatif" />
        <Trust icon={<Languages />} text="Disponible en 6 langues" />
      </section>

      <section className="home-exact-panel home-exact-wrap">
        <SectionTitle title="Vous venez d’être diagnostiqué ?" text="Les pathologies les plus fréquemment traitées par vitrectomie." />
        <div className="home-exact-pathologies">
          {pathologyCards.map((card) => (
            <Link href={`${prefix}${card.href}`} className="home-exact-pathology" key={card.title}>
              <span className={`home-exact-pathology-visual home-exact-pathology-visual--${card.visual}`}>
                <span className="home-exact-pathology-orbit" />
                <span className="home-exact-pathology-mark home-exact-pathology-mark--one" />
                <span className="home-exact-pathology-mark home-exact-pathology-mark--two" />
              </span>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
              <em>En savoir plus <ArrowRight size={16} /></em>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-exact-panel home-exact-wrap home-exact-journey">
        <SectionTitle title="Votre parcours patient" text="Nous vous accompagnons à chaque étape de votre vitrectomie." />
        <div className="home-exact-steps">
          <Step icon={<ClipboardCheck />} step="ÉTAPE 1" title="Préparer son intervention" subtitle="Avant l'opération" text="Comprendre l'opération, les examens, les étapes clés et les conseils avant votre intervention." />
          <ArrowRight className="home-exact-step-arrow" />
          <Step icon={<Heart />} step="ÉTAPE 2" title="Réussir sa récupération" subtitle="Après l'opération" text="Récupération et suivi. Les étapes clés de votre convalescence après vitrectomie." />
          <ArrowRight className="home-exact-step-arrow" />
          <Step icon={<UserRound />} step="ÉTAPE 3" title="Retrouver ses activités" subtitle="Retour à la vie quotidienne" text="Conseils et repères pour retrouver vos activités en toute sécurité." />
        </div>

        <div className="home-exact-guides-head">
          <div>
            <h2>Guides essentiels après vitrectomie</h2>
            <p>Des ressources pratiques pour chaque étape de votre récupération.</p>
          </div>
          <Link href={`${prefix}/blog`}>Voir tous les guides <ArrowRight size={16} /></Link>
        </div>

        <div className="home-exact-guides">
          {guideCards.map((guide) => (
            <Link href={`${prefix}${guide.href}`} key={guide.label}>
              {guide.icon}
              <span>{guide.label}</span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-exact-directory home-exact-wrap">
        <div className="home-exact-directory-copy">
          <SectionTitle
            title="Trouver un chirurgien spécialisé"
            text="Un annuaire conçu pour faciliter la mise en relation entre patients et chirurgiens spécialisés."
          />
          <p>
            Trouvez un chirurgien spécialisé en vitrectomie ou un centre expert en chirurgie vitréo-rétinienne près de chez vous.
          </p>
          <div className="home-exact-directory-points">
            <span><UserRound /> Chirurgiens spécialisés en vitrectomie</span>
            <span><MapPin /> Recherche par pays et par ville</span>
            <span><ShieldCheck /> Centres experts en chirurgie rétinienne</span>
            <span><BriefcaseMedical /> Informations vérifiées et mises à jour</span>
          </div>
          <Link href={`${prefix}/annuaire`} className="home-exact-btn home-exact-btn-primary">
            Trouver un chirurgien <ArrowRight />
          </Link>
        </div>

        <div className="home-exact-map-search">
          <div className="home-exact-map" aria-hidden="true">
            <Image
              src="/brand/home-directory-map-v2.png"
              alt=""
              width={1536}
              height={512}
              sizes="(max-width: 1260px) 100vw, 820px"
              unoptimized
            />
          </div>
          <div className="home-exact-search-card">
            <label>
              Où ?
              <span>Pays, ville ou code postal <MapPin size={16} /></span>
            </label>
            <label>
              Spécialité recherchée
              <span>Sélectionner une spécialité <ChevronDown size={16} /></span>
            </label>
            <Link href={`${prefix}/annuaire`}><Search size={18} /> Rechercher</Link>
            <small>Exemples : Vitrectomie, Trou maculaire, Décollement de rétine, Membrane épirétinienne...</small>
          </div>
        </div>
      </section>

      <section id="faq" className="home-exact-faq home-exact-wrap">
        <div className="home-exact-faq-title">
          <div>
            <h2>FAQ</h2>
            <p>Les questions les plus fréquentes après une vitrectomie.</p>
          </div>
          <Link href={`${prefix}#faq`}>Voir toutes les questions <ArrowRight size={16} /></Link>
        </div>
        <div className="home-exact-faq-grid">
          <div className="home-exact-faq-column home-exact-faq-column-open">
            {faqItems.slice(0, 2).map((item) => (
              <FaqItem item={item} key={typeof item === "string" ? item : item.question} />
            ))}
          </div>
          <div className="home-exact-faq-column home-exact-faq-column-closed">
            {faqItems.slice(2).map((item) => (
              <FaqItem item={item} key={typeof item === "string" ? item : item.question} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-exact-bottom-trust home-exact-wrap">
        <Trust icon={<ClipboardCheck />} text="Informations basées sur des sources médicales reconnues" />
        <Trust icon={<UserRound />} text="Comité éditorial spécialisé en chirurgie vitréo-rétinienne" />
        <Trust icon={<Clock3 />} text="Mises à jour régulières et rigoureuses" />
        <Trust icon={<Languages />} text="Plateforme internationale disponible en 6 langues" />
      </section>
    </main>
  );
}

function SectionTitle({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="home-exact-section-title">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Trust({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="home-exact-trust-item">
      {icon}
      <strong>{text}</strong>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  subtitle,
  text,
}: {
  icon: ReactNode;
  step: string;
  title: string;
  subtitle: string;
  text: string;
}) {
  return (
    <article className="home-exact-step">
      <span>{icon}</span>
      <div>
        <small>{step}</small>
        <h3>{title}</h3>
        <strong>{subtitle}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function FaqItem({
  item,
}: {
  item: string | { question: string; answer: string };
}) {
  if (typeof item === "string") {
    return (
      <details className="home-exact-faq-item">
        <summary>{item}</summary>
      </details>
    );
  }

  return (
    <details className="home-exact-faq-item" open>
      <summary>{item.question}</summary>
      <p>{item.answer}</p>
    </details>
  );
}
