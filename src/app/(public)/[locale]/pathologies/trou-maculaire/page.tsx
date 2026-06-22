import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CircleDot,
  Eye,
  FileCheck2,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { getPageContent } from "@/content/pages/i18n";
import type { PathologyIconKey } from "@/content/pages/pathologies";
import { macularHoleContent } from "@/content/pages/trou-maculaire";

import "../pathologies.css";

export const dynamic = "force-dynamic";

const ICONS: Record<PathologyIconKey, typeof Eye> = {
  activity: HeartPulse,
  alert: AlertTriangle,
  calendar: CalendarCheck,
  circle: CircleDot,
  eye: Eye,
  heart: HeartPulse,
  layers: CircleDot,
  microscope: Microscope,
  shield: ShieldCheck,
  sparkles: CircleDot,
  stethoscope: Stethoscope,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale)
    ? rawLocale
    : "fr";
  const content = getPageContent(
    macularHoleContent,
    locale
  );

  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function MacularHolePage({
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
  const content = getPageContent(
    macularHoleContent,
    locale
  );

  return (
    <main className="pathologies-page macular-page">
      <section className="pathologies-hero macular-hero">
        <div className="pathologies-container">
          <div className="pathologies-hero-panel">
            <div className="pathologies-hero-copy">
              <span className="pathologies-kicker">
                {content.hero.kicker}
              </span>

              <h1>
                {content.hero.title}
                <span>{content.hero.subtitle}</span>
              </h1>

              <p>{content.hero.description}</p>

              <div className="pathologies-actions">
                <Link
                  href={`${prefix}/pathologies/trou-maculaire/convalescence`}
                  className="pathologies-btn pathologies-btn-primary"
                >
                  {content.hero.primaryCta}
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href={`${prefix}/annuaire`}
                  className="pathologies-btn pathologies-btn-secondary"
                >
                  <Stethoscope size={18} />
                  {content.hero.secondaryCta}
                </Link>
              </div>

              <div className="pathologies-update">
                <FileCheck2 size={16} />
                {content.hero.notice}
              </div>
            </div>

            <div className="pathologies-hero-visual">
              <Image
                src="/brand/home-retina.png"
                alt={content.hero.imageAlt}
                width={1400}
                height={934}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pathologies-trust">
        <div className="pathologies-container pathologies-trust-grid">
          {content.trust.map((item) => {
            const Icon = ICONS[item.icon];

            return (
              <TrustItem
                key={item.text}
                icon={<Icon />}
                text={item.text}
              />
            );
          })}
        </div>
      </section>

      <section className="pathologies-section">
        <div className="pathologies-container macular-intro-grid">
          <div className="pathologies-info-panel">
            <span className="pathologies-kicker">
              {content.intro.kicker}
            </span>

            <h2>{content.intro.title}</h2>

            {content.intro.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="macular-key-card">
            <strong>{content.intro.keyTitle}</strong>
            <ul>
              {content.intro.keyPoints.map((point) => (
                <li key={point}>
                  <CheckCircle2 size={17} />
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="pathologies-section pathologies-section--split">
        <div className="pathologies-container pathologies-split">
          <div className="pathologies-warning-card">
            <strong>{content.symptoms.title}</strong>
            <ul>
              {content.symptoms.signs.map((symptom) => (
                <li key={symptom}>
                  <AlertTriangle size={17} aria-hidden="true" />
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          <div className="pathologies-info-panel">
            <span className="pathologies-kicker">
              {content.symptoms.kicker}
            </span>

            <h2>{content.symptoms.panelTitle}</h2>

            <p>{content.symptoms.panelText}</p>
          </div>
        </div>
      </section>

      <section className="pathologies-section">
        <div className="pathologies-container">
          <div className="pathologies-section-head">
            <span className="pathologies-kicker">
              {content.journey.kicker}
            </span>

            <h2>{content.journey.title}</h2>
          </div>

          <div className="pathologies-journey">
            {content.journey.steps.map((step, index) => {
              const Icon = ICONS[step.icon];

              return (
                <article key={step.title} className="pathologies-step">
                  <span>{index + 1}</span>
                  <Icon size={23} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pathologies-section pathologies-section--split">
        <div className="pathologies-container macular-two-columns">
          <article className="pathologies-info-panel">
            <span className="pathologies-kicker">
              {content.causesTreatment.causes.kicker}
            </span>

            <h2>{content.causesTreatment.causes.title}</h2>

            <p>{content.causesTreatment.causes.text}</p>

            <ul className="macular-list">
              {content.causesTreatment.causes.list.map((cause) => (
                <li key={cause}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {cause}
                </li>
              ))}
            </ul>
          </article>

          <article className="pathologies-info-panel">
            <span className="pathologies-kicker">
              {content.causesTreatment.treatment.kicker}
            </span>

            <h2>{content.causesTreatment.treatment.title}</h2>

            <p>{content.causesTreatment.treatment.text}</p>

            <Link
              href={`${prefix}/operation`}
              className="pathologies-inline-link"
            >
              {content.causesTreatment.treatment.cta}
              <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>

      <section className="pathologies-section pathologies-section--education">
        <div className="pathologies-container pathologies-education">
          <div>
            <span className="pathologies-kicker">
              {content.recovery.kicker}
            </span>

            <h2>{content.recovery.title}</h2>

            {content.recovery.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <Link
              href={`${prefix}/pathologies/trou-maculaire/convalescence`}
              className="pathologies-inline-link"
            >
              {content.recovery.cta}
              <ArrowRight size={16} />
            </Link>
          </div>

          <aside>
            <Image
              src="/brand/home-product.png"
              alt={content.recovery.productAlt}
              width={360}
              height={260}
            />

            <strong>{content.recovery.productTitle}</strong>
            <p>{content.recovery.productText}</p>

            <Link href={`${prefix}/convalescence/coussin`}>
              {content.recovery.productCta} <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="pathologies-section">
        <div className="pathologies-container macular-faq">
          <div className="pathologies-section-head">
            <span className="pathologies-kicker">
              {content.faq.kicker}
            </span>

            <h2>{content.faq.title}</h2>
          </div>

          <div className="macular-faq-grid">
            {content.faq.items.map((item) => (
              <article key={item.question}>
                <HeartPulse size={22} aria-hidden="true" />
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="pathologies-trust-item">
      {icon}
      <span>{text}</span>
    </div>
  );
}
