import { notFound } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import PostureSection from "@/components/home/PostureSection";

const CONTENT = {
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main>
      {/* Navbar déjà existante */}
      <HeroSection locale={locale as "fr" | "en"} {...t.hero} />

      {/* Image posture juste après le hero */}
      <PostureSection />

      {/* prochaines sections */}
    </main>
  );
}
