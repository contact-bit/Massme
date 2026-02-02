import "./HeroSection.css";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

type HeroProps = {
  locale: Locale;
};

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/5112d871-7854-47e2-2838-1790ba171700/public";

const PRODUCT_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/63950d11-1ac7-4c4d-13a1-f7278cd7b600/public";

const HERO_CONTENT: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    body: string;
    badge: string;
    cta: string;
    secondary: string;
  }
> = {
  fr: {
    title: "Convalescence après vitrectomie avec injection de gaz",
    subtitle:
      "Maintenez facilement la position prescrite après une opération du trou maculaire ou du décollement de la rétine.",
    body:
      "VitectroMed est un dispositif médical certifié conçu pour accompagner les patients durant leur convalescence post-opératoire tout en soulageant les cervicales.",
    badge: "Dispositif médical certifié",
    cta: "Découvrir VitectroMed",
    secondary: "Positionnez-vous sans effort", // ✅ ajouté
  },
  en: {
    title: "Recovery after vitrectomy with gas injection",
    subtitle:
      "Easily maintain the prescribed position after macular hole or retinal detachment surgery.",
    body:
      "VitectroMed is a certified medical device designed to support patients during post-operative recovery while relieving neck strain.",
    badge: "Certified medical device",
    cta: "Discover VitectroMed",
    secondary: "Position yourself effortlessly", // ✅ ajouté
  },
  es: {
    title: "Recuperación tras vitrectomía con inyección de gas",
    subtitle:
      "Mantenga fácilmente la posición prescrita tras una cirugía del agujero macular o desprendimiento de retina.",
    body:
      "VitectroMed es un dispositivo médico certificado diseñado para acompañar a los pacientes durante su recuperación postoperatoria y aliviar las cervicales.",
    badge: "Dispositivo médico certificado",
    cta: "Descubrir VitectroMed",
    secondary: "Colóquese sin esfuerzo", // ✅ ajouté
  },
  de: {
    title: "Genesung nach Vitrektomie mit Gasinjektion",
    subtitle:
      "Halten Sie nach einer Makulaloch- oder Netzhautablösungsoperation einfach die vorgeschriebene Position ein.",
    body:
      "VitectroMed ist ein zertifiziertes Medizinprodukt zur Unterstützung der postoperativen Genesung und zur Entlastung der Halswirbelsäule.",
    badge: "Zertifiziertes Medizinprodukt",
    cta: "VitectroMed entdecken",
    secondary: "Positionieren Sie sich mühelos", // ✅ ajouté
  },
  it: {
    title: "Recupero dopo vitrectomia con iniezione di gas",
    subtitle:
      "Mantieni facilmente la posizione prescritta dopo un intervento al foro maculare o al distacco della retina.",
    body:
      "VitectroMed è un dispositivo medico certificato progettato per supportare i pazienti durante la convalescenza post-operatoria alleviando la tensione cervicale.",
    badge: "Dispositivo medico certificato",
    cta: "Scopri VitectroMed",
    secondary: "Posizionati senza sforzo", // ✅ ajouté
  },
  nl: {
    title: "Herstel na vitrectomie met gasinjectie",
    subtitle:
      "Houd eenvoudig de voorgeschreven houding aan na een maculagat- of netvliesloslatingsoperatie.",
    body:
      "VitectroMed is een gecertificeerd medisch hulpmiddel dat patiënten ondersteunt tijdens het postoperatieve herstel en de nek ontlast.",
    badge: "Gecertificeerd medisch hulpmiddel",
    cta: "Ontdek VitectroMed",
    secondary: "Positioneer jezelf moeiteloos", // ✅ ajouté
  },
};

export default function HeroSection({ locale }: HeroProps) {
  const t = HERO_CONTENT[locale] ?? HERO_CONTENT.fr;

  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        {/* Colonne gauche : branding + texte */}
        <div className="home-hero-content">
          <div className="home-hero-brand">
            <div className="home-hero-logo-wrap">
              <Image
                src={LOGO_URL}
                alt="VitectroMed"
                width={72}
                height={72}
                className="hero-logo"
                priority
              />
            </div>
            <span className="home-hero-brand-name">VitectroMed.com</span>
          </div>

          <h1>{t.title}</h1>
          <p className="home-hero-subtitle">{t.subtitle}</p>
          <p>{t.body}</p>

          <div className="home-hero-cta-row">
            <button className="home-hero-cta">{t.cta}</button>
            <span className="home-hero-secondary">{t.secondary}</span>
          </div>
        </div>

        {/* Colonne droite : visuel produit */}
        <div className="home-hero-img">
          <Image
            src={PRODUCT_URL}
            alt="VitectroMed"
            fill
            className="img-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
