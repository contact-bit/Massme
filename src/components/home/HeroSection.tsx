import "./HeroSection.css";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

/* =========================
   PROPS
========================= */
type HeroProps = {
  locale: Locale;
};

/* =========================
   ASSETS
========================= */
const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2db3d899-6352-4cf7-26bb-f27c541f4200/public";

const PRODUCT_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/63950d11-1ac7-4c4d-13a1-f7278cd7b600/public";

/* =========================
   TRANSLATIONS — HERO
   ⚠️ STRICTEMENT aligné
   avec LOCALES = ["fr","en","es","de","it","nl"]
========================= */
const HERO_CONTENT: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  }
> = {
  fr: {
    title: "Convalescence après vitrectomie avec injection de gaz",
    subtitle:
      "Maintenez facilement la position prescrite après une opération du trou maculaire ou du décollement de la rétine.",
    body:
      "OculaRest est un dispositif médical certifié conçu pour accompagner les patients durant leur convalescence post-opératoire tout en soulageant les cervicales.",
    ctaPrimary: "Être accompagné",
    ctaSecondary: "Voir le fonctionnement",
  },

  en: {
    title: "Recovery after vitrectomy with gas injection",
    subtitle:
      "Easily maintain the prescribed position after macular hole or retinal detachment surgery.",
    body:
      "OculaRest is a certified medical device designed to support patients during post-operative recovery while relieving neck strain.",
    ctaPrimary: "Get support",
    ctaSecondary: "How it works",
  },

  es: {
    title: "Recuperación tras vitrectomía con inyección de gas",
    subtitle:
      "Mantenga fácilmente la posición prescrita tras una cirugía del agujero macular o desprendimiento de retina.",
    body:
      "OculaRest es un dispositivo médico certificado diseñado para acompañar a los pacientes durante su recuperación postoperatoria y aliviar las cervicales.",
    ctaPrimary: "Recibir acompañamiento",
    ctaSecondary: "Ver funcionamiento",
  },

  de: {
    title: "Genesung nach Vitrektomie mit Gasinjektion",
    subtitle:
      "Halten Sie nach einer Makulaloch- oder Netzhautablösungsoperation einfach die vorgeschriebene Position ein.",
    body:
      "OculaRest ist ein zertifiziertes Medizinprodukt zur Unterstützung der postoperativen Genesung und zur Entlastung der Halswirbelsäule.",
    ctaPrimary: "Begleitung erhalten",
    ctaSecondary: "Funktionsweise ansehen",
  },

  it: {
    title: "Recupero dopo vitrectomia con iniezione di gas",
    subtitle:
      "Mantieni facilmente la posizione prescritta dopo un intervento al foro maculare o al distacco della retina.",
    body:
      "OculaRest è un dispositivo medico certificato progettato per supportare i pazienti durante la convalescenza post-operatoria alleviando la tensione cervicale.",
    ctaPrimary: "Ricevere supporto",
    ctaSecondary: "Scopri come funziona",
  },

  nl: {
    title: "Herstel na vitrectomie met gasinjectie",
    subtitle:
      "Houd eenvoudig de voorgeschreven houding aan na een maculagat- of netvliesloslatingsoperatie.",
    body:
      "OculaRest is een gecertificeerd medisch hulpmiddel dat patiënten ondersteunt tijdens het postoperatieve herstel en de nek ontlast.",
    ctaPrimary: "Begeleiding krijgen",
    ctaSecondary: "Bekijk de werking",
  },
};

/* =========================
   COMPONENT
========================= */
export default function HeroSection({ locale }: HeroProps) {
  // ✅ fallback sécurisé (au cas où)
  const t = HERO_CONTENT[locale] ?? HERO_CONTENT.fr;

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-grid">
          {/* LEFT */}
          <div className="hero-left">
            <Image
              src={LOGO_URL}
              alt="OculaRest"
              width={180}
              height={56}
              className="hero-logo"
              priority
            />

            <h1 className="hero-title">{t.title}</h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            <p className="hero-body">{t.body}</p>

            <div className="hero-ctas">
              <a
                href={`/${locale}/convalescence`}
                className="btn btn-primary"
              >
                {t.ctaPrimary}
              </a>

              <a
                href={`/${locale}/fonctionnement`}
                className="btn btn-outline"
              >
                {t.ctaSecondary}
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero-right">
            <div className="hero-card">
              <div className="hero-product">
                <Image
                  src={PRODUCT_URL}
                  alt="OculaRest"
                  fill
                  className="hero-product-img"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
