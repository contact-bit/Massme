import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  CircleHelp,
  CircleDot,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Globe2,
  HeartPulse,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  UserRoundCheck,
} from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { getPageContent } from "@/content/pages/i18n";
import {
  homeContent,
  type HomeIconKey,
} from "@/content/pages/home";

export const dynamic = "force-dynamic";

const ICONS: Record<HomeIconKey, ReactNode> = {
  activity: <Activity />,
  alert: <CircleHelp />,
  badge: <BadgeCheck />,
  calendar: <CalendarCheck />,
  check: <Check />,
  circle: <CircleDot />,
  clipboard: <ClipboardCheck />,
  eye: <Eye />,
  faq: <CircleHelp />,
  file: <FileCheck2 />,
  globe: <Globe2 />,
  heart: <HeartPulse />,
  layers: <Layers />,
  map: <MapPin />,
  microscope: <Eye />,
  shield: <ShieldCheck />,
  sparkles: <Sparkles />,
  stethoscope: <Stethoscope />,
  target: <Target />,
  user: <UserRoundCheck />,
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
    homeContent,
    locale
  );

  return {
    title: content.metadata.title,
    description: content.metadata.description,
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
  const content = getPageContent(
    homeContent,
    locale
  );

  return (
    <main className="home">
      <section className="home-hero">
        <div className="home-container">
          <div className="home-hero-grid">
            <div className="home-hero-panel">
              <div className="home-hero-copy">
                <span className="home-kicker">
                  {content.hero.kicker}
                </span>

                <h1>
                  {content.hero.title}
                  <span>{content.hero.subtitle}</span>
                </h1>

                <p>{content.hero.description}</p>

                <div className="home-actions">
                  <Link
                    href={`${prefix}/convalescence`}
                    className="home-btn home-btn-primary"
                  >
                    {content.hero.primaryCta}
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href={`${prefix}/annuaire`}
                    className="home-btn home-btn-secondary"
                  >
                    <MapPin size={18} />
                    {content.hero.secondaryCta}
                  </Link>
                </div>

                <div className="home-hero-update">
                  <CalendarCheck size={15} />
                  {content.hero.updatedAt}
                </div>
              </div>

              <div className="home-hero-visual">
                <Image
                  src="/brand/home-hero-consultation.png"
                  alt={content.hero.imageAlt}
                  width={1536}
                  height={1024}
                  priority
                />
              </div>
            </div>

            <aside className="home-cert-card">
              <div className="home-card-title">
                <ShieldCheck size={24} />
                <strong>{content.certification.title}</strong>
              </div>

              <ul>
                {content.certification.items.map((item) => (
                  <li key={item.text}>
                    {ICONS[item.icon]}
                    {item.text}
                  </li>
                ))}
              </ul>

              <div className="home-product-mini">
                <div className="home-product-mini-visual">
                  <Image
                    src="/brand/home-product.png"
                    alt={content.certification.productAlt}
                    width={220}
                    height={160}
                  />
                </div>
                <div>
                  <strong>{content.certification.productTitle}</strong>
                  <p>{content.certification.productText}</p>
                  <Link href={`${prefix}/convalescence/coussin`}>
                    {content.certification.productCta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="home-container home-trust-grid">
          {content.trust.map((item) => (
            <TrustItem
              key={item.text}
              icon={ICONS[item.icon]}
              text={item.text}
            />
          ))}
        </div>
      </section>

      <section className="home-notice-section">
        <div className="home-container home-notice">
          <span><FileCheck2 size={18} /></span>
          <p>{content.notice.text}</p>
          <Link href={`${prefix}/contact`}>
            {content.notice.cta} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-card home-journey">
          <div className="home-journey-head">
            <div>
              <div className="home-card-title">
                <UserRoundCheck size={24} />
                <h2>{content.journey.title}</h2>
              </div>
              <p>{content.journey.description}</p>
            </div>

            <div className="home-guide-list" aria-label={content.journey.guideAria}>
              {content.journey.guides.map((guide) => (
                <Link href={`${prefix}/convalescence`} key={guide} className="home-guide-chip">
                  {guide}
                </Link>
              ))}
            </div>
          </div>

          <div className="home-journey-grid">
            {content.journey.cards.map((item) => (
              <JourneyCard
                key={item.title}
                href={`${prefix}${item.href}`}
                icon={ICONS[item.icon]}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-card home-understand">
          <div>
            <span className="home-section-label">{content.understand.label}</span>
            <h2>{content.understand.title}</h2>
            <p>{content.understand.description}</p>

            <div className="home-stage-row">
              {content.understand.stages.map((stage, index) => (
                <div className="home-stage" key={stage.title}>
                  <div className={`home-stage-visual home-stage-visual--${stage.state}`}>
                    <span className="home-stage-ring" />
                    <span className="home-stage-focus" />
                    <span className="home-stage-signal home-stage-signal--one" />
                    <span className="home-stage-signal home-stage-signal--two" />
                  </div>
                  <strong>{stage.title}</strong>
                  <span>{stage.text}</span>
                  {index < content.understand.stages.length - 1 && (
                    <ArrowRight className="home-stage-arrow" size={18} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="home-explainer">
            <h3>{content.understand.explainerTitle}</h3>
            <p>{content.understand.explainerText}</p>
            <Link href={`${prefix}/pathologies/trou-maculaire`}>
              {content.understand.explainerCta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-grid-section">
        <div className="home-container home-info-grid">
          {content.infoCards.map((card) => (
            <InfoCard
              key={card.title}
              icon={ICONS[card.icon]}
              title={card.title}
              items={card.items}
            />
          ))}

          <article className="home-card home-treatment">
            <div>
              <div className="home-card-title">
                <Stethoscope size={24} />
                <h3>{content.treatment.title}</h3>
              </div>
              <p>{content.treatment.text}</p>
              <Link href={`${prefix}/operation`}>
                {content.treatment.cta} <ArrowRight size={16} />
              </Link>
            </div>
            <Image
              src="/brand/home-retina.png"
              alt={content.treatment.imageAlt}
              width={230}
              height={230}
            />
          </article>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-card home-pathologies">
          <div className="home-section-head">
            <div>
              <div className="home-card-title">
                <Target size={24} />
                <h2>{content.pathologies.title}</h2>
              </div>
              <p>{content.pathologies.description}</p>
            </div>
            <Link href={`${prefix}/pathologies`}>
              {content.pathologies.cta} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-pathology-grid">
            {content.pathologies.cards.map((item) => (
              <PathologyCard
                key={item.title}
                href={`${prefix}${item.href}`}
                title={item.title}
                text={item.text}
                icon={ICONS[item.icon]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-card home-recovery">
          <div className="home-card-title">
            <Eye size={24} />
            <h2>{content.recovery.title}</h2>
          </div>
          <p>{content.recovery.text}</p>

          <div className="home-recovery-grid">
            {content.recovery.metrics.map((metric) => (
              <MiniMetric
                key={metric.title}
                title={metric.title}
                text={metric.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-specialist">
          <Image
            src="/brand/home-specialist.png"
            alt={content.specialist.imageAlt}
            width={720}
            height={420}
          />
          <div>
            <h2>{content.specialist.title}</h2>
            <p>{content.specialist.text}</p>
            <ul>
              {content.specialist.items.map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`${prefix}/annuaire`} className="home-btn home-btn-primary">
              {content.specialist.cta} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container home-card">
          <div className="home-faq-head">
            <div className="home-card-title">
              <CircleHelp size={24} />
              <h2>{content.faq.title}</h2>
            </div>
            <Link href={`${prefix}/faq`}>
              {content.faq.cta} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-faq-grid">
            {content.faq.items.map((item) => (
              <Link href={`${prefix}/faq`} key={item} className="home-faq-item">
                {item}
                <span>+</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-final">
        <div className="home-container home-final-card">
          <Image
            src="/brand/home-product.png"
            alt={content.final.imageAlt}
            width={300}
            height={220}
          />
          <div>
            <h2>{content.final.title}</h2>
            <p>{content.final.text}</p>
          </div>
          <div className="home-final-points">
            {content.final.points.map((point) => (
              <span key={point}>
                <Check size={16} />
                {point}
              </span>
            ))}
          </div>
          <Link href={`${prefix}/convalescence/coussin`} className="home-btn home-btn-light">
            {content.final.cta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function JourneyCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="home-journey-card">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
      <ArrowRight size={18} />
    </Link>
  );
}

function PathologyCard({
  href,
  title,
  text,
  icon,
}: {
  href: string;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="home-pathology-card">
      <span className="home-pathology-icon">
        {icon}
      </span>
      <strong>{title}</strong>
      <span>{text}</span>
      <ArrowRight size={16} />
    </Link>
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
    <div className="home-trust-item">
      {icon}
      <strong>{text}</strong>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="home-card home-info-card">
      <div className="home-card-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Check size={15} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function MiniMetric({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="home-mini-metric">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
