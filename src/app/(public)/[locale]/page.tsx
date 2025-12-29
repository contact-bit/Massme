import { notFound } from "next/navigation";
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

/**
 * Locales Europe (tu peux retirer/ajouter)
 */
type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "sv"
  | "da"
  | "no"
  | "fi"
  | "cs"
  | "hu"
  | "ro"
  | "bg"
  | "el"
  | "sk"
  | "sl"
  | "hr"
  | "et"
  | "lv"
  | "lt"
  | "mt"
  | "ga";

type Content = {
  hero: {
    title: string;
    subtitle: string;
    body: string;
  };
};

/**
 * ✅ Pour l’instant tu écris seulement FR/EN.
 * Les autres langues = fallback EN (tu pourras remplir après).
 */
const CONTENT: Partial<Record<Locale, Content>> = {
  fr: {
    hero: {
      title: "Convalescence après vitrectomie avec injection de gaz",
      subtitle:
        "Maintenez facilement la position prescrite après une opération du trou maculaire ou du décollement de la rétine.",
      body:
        "OculaRest est un dispositif médical certifié qui accompagne les patients durant leur convalescence post-opératoire en facilitant le maintien de la position prescrite et en soulageant les cervicales.",
    },
  },
  en: {
    hero: {
      title: "Recovery after vitrectomy with gas injection",
      subtitle:
        "Easily maintain the prescribed position after macular hole or retinal detachment surgery.",
      body:
        "OculaRest is a certified medical device designed to support post-operative recovery by helping patients maintain the prescribed position comfortably.",
    },
  },
} as const;

function isLocale(v: string): v is Locale {
  return [
    "fr","en","es","de","it","pt","nl","pl","sv","da","no","fi","cs","hu","ro","bg","el","sk","sl","hr","et","lv","lt","mt","ga",
  ].includes(v);
}

/**
 * 🔥 Locale “effective” : tes composants home ne gèrent que fr/en
 * Donc on mappe toutes les langues vers EN (ou FR si tu veux).
 */
function toEffectiveLocale(locale: Locale): "fr" | "en" {
  return locale === "fr" ? "fr" : "en";
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!rawLocale || !isLocale(rawLocale)) return notFound();

  const locale = rawLocale as Locale;

  // content: locale -> sinon EN -> sinon FR
  const t = CONTENT[locale] ?? CONTENT.en ?? CONTENT.fr;
  if (!t) return notFound();

  const effectiveLocale = toEffectiveLocale(locale);

  return (
    <main>
      <HeroSection locale={effectiveLocale} {...t.hero} />

      <PostureSection />

      <CredibilityStrip locale={effectiveLocale} />
      <RecoverySupportSection locale={effectiveLocale} />
      <StepsSection locale={effectiveLocale} />
      <WhyDifferentSection locale={effectiveLocale} />
      <DeviceInfoSection locale={effectiveLocale} />
      <FaqSection locale={effectiveLocale} />
      <FinalCtaSection locale={effectiveLocale} />
    </main>
  );
}
