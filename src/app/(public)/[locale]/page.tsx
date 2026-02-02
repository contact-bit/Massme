// app/(public)/[locale]/page.tsx
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import Navbar from "@/components/Navbar";

import HeroSection from "@/components/home/HeroSection";
import PostureSection from "@/components/home/PostureSection";
import CredibilityStrip from "@/components/home/CredibilityStrip";
import RecoverySupportSection from "@/components/home/RecoverySupportSection";
import StepsSection from "@/components/home/StepsSection";
import WhyDifferentSection from "@/components/home/WhyDifferentSection";
import DeviceInfoSection from "@/components/home/DeviceInfoSection";
import FaqSection from "@/components/home/FaqSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

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

  return (
    <main className="home snap-container">
      {/* halo global */}
      <div className="home__halo-right" aria-hidden />

      {/* 1er écran = navbar + hero dans la même snap-section */}
      <section id="hero" className="snap-section">
        <HeroSection locale={locale} />
      </section>

      <section id="final" className="snap-section">
        <FinalCtaSection locale={locale} />
      </section>

      <section id="posture" className="snap-section">
        <PostureSection locale={locale} />
      </section>

      <section id="credibility" className="snap-section">
        <CredibilityStrip locale={locale} />
      </section>

      <section id="recovery" className="snap-section">
        <RecoverySupportSection locale={locale} />
      </section>

      <section id="steps" className="snap-section">
        <StepsSection locale={locale} />
      </section>

      <section id="why" className="snap-section">
        <WhyDifferentSection locale={locale} />
      </section>

      <section id="device" className="snap-section">
        <DeviceInfoSection locale={locale} />
      </section>

      <section id="faq" className="snap-section">
        <FaqSection locale={locale} />
      </section>

      <section id="final" className="snap-section">
        <FinalCtaSection locale={locale} />
      </section>
    </main>
  );
}
