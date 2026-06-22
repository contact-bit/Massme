import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CircleDot,
  Eye,
  FileCheck2,
  HeartPulse,
  Layers,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { getPageContent } from "@/content/pages/i18n";
import {
  pathologiesContent,
  type PathologyIconKey,
} from "@/content/pages/pathologies";

import "./pathologies.css";

export const dynamic = "force-dynamic";

const ICONS: Record<PathologyIconKey, typeof Activity> = {
  activity: Activity,
  alert: AlertTriangle,
  calendar: CalendarCheck,
  circle: CircleDot,
  eye: Eye,
  heart: HeartPulse,
  layers: Layers,
  microscope: Microscope,
  shield: ShieldCheck,
  sparkles: Sparkles,
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
    pathologiesContent,
    locale
  );

  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function PathologiesPage({
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
    pathologiesContent,
    locale
  );

  return (
    <main className="pathologies-page">
      <section className="pathologies-hero">
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
                  href={`${prefix}/pathologies/trou-maculaire`}
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
        <div className="pathologies-container">
          <div className="pathologies-section-head">
            <span className="pathologies-kicker">
              {content.guides.kicker}
            </span>

            <h2>{content.guides.title}</h2>

            <p>{content.guides.description}</p>
          </div>

          <div className="pathologies-card-grid">
            {content.guides.cards.map((item) => {
              const Icon = ICONS[item.icon];

              return (
                <Link
                  key={item.href}
                  href={`${prefix}${item.href}`}
                  className={`pathologies-card pathologies-card--${item.tone}`}
                >
                  <span className="pathologies-card-icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>

                  <strong>{item.title}</strong>
                  <p>{item.text}</p>

                  <span className="pathologies-card-link">
                    {item.cta} <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pathologies-section pathologies-section--split">
        <div className="pathologies-container pathologies-split">
          <div className="pathologies-info-panel">
            <span className="pathologies-kicker">
              {content.warning.kicker}
            </span>

            <h2>{content.warning.title}</h2>

            <p>{content.warning.text}</p>

            <Link
              href={`${prefix}/operation/risque/dechirure-de-retine`}
              className="pathologies-inline-link"
            >
              {content.warning.cta}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="pathologies-warning-card">
            <strong>{content.warning.cardTitle}</strong>

            <ul>
              {content.warning.signs.map((sign) => (
                <li key={sign}>
                  <AlertTriangle size={17} aria-hidden="true" />
                  {sign}
                </li>
              ))}
            </ul>
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

      <section className="pathologies-section pathologies-section--education">
        <div className="pathologies-container pathologies-education">
          <div>
            <span className="pathologies-kicker">
              {content.education.kicker}
            </span>

            <h2>{content.education.title}</h2>

            {content.education.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside>
            <Image
              src="/brand/home-product.png"
              alt={content.education.productAlt}
              width={360}
              height={260}
            />

            <strong>{content.education.productTitle}</strong>
            <p>{content.education.productText}</p>

            <Link href={`${prefix}/convalescence/coussin`}>
              {content.education.productCta} <ArrowRight size={15} />
            </Link>
          </aside>
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
