import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

import HeroSection from "@/components/home/HeroSection";
import PostureSection from "@/components/home/PostureSection";
import CredibilityStrip from "@/components/home/CredibilityStrip";
import RecoverySupportSection from "@/components/home/RecoverySupportSection";
import StepsSection from "@/components/home/StepsSection";
import WhyDifferentSection from "@/components/home/WhyDifferentSection";
import DeviceInfoSection from "@/components/home/DeviceInfoSection";
import FaqSection from "@/components/home/FaqSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // ✅ NEXT 15/16 + TURBOPACK → params EST UNE PROMISE
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  return (
    <main>
      <HeroSection locale={locale} />
      <PostureSection locale={locale} />
      <CredibilityStrip locale={locale} />
      <RecoverySupportSection locale={locale} />
      <StepsSection locale={locale} />
      <WhyDifferentSection locale={locale} />
      <DeviceInfoSection locale={locale} />
      <FaqSection locale={locale} />
      <FinalCtaSection locale={locale} />
    </main>
  );
}
