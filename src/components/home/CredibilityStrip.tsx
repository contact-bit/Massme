// CredibilityStrip.tsx
import "./CredibilityStrip.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const OCULAREST_SMALL_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const CE_LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/3f902801-6b1c-45b3-b2f4-bb3e59e96900/public";

type Content = {
  line1_left: string;
  brand: string;
  line2: string;
  highlight: string;
  line2_end: string;
  ceAlt: string;
  explTitle: string;
  explText: string;
  explBulletsTitle: string;
  explBullets: string[];
};

const CONTENT: Record<Locale, Content> = {
  fr: {
    line1_left: "Coussin vitrectomie",
    brand: "VitectroMed",
    line2: "Le 1er ",
    highlight: "DISPOSITIF MÉDICAL certifié CE",
    line2_end: " pour la convalescence après vitrectomie.",
    ceAlt: "Certification CE",
    explTitle: "Un dispositif médical, pas un simple coussin de confort",
    explText:
      "VitectroMed a été conçu spécifiquement pour la récupération après vitrectomie : matériaux, ergonomie et mode d’emploi sont pensés pour aider à maintenir la position prescrite par l’ophtalmologue et protéger la rétine pendant la phase de cicatrisation.",
    explBulletsTitle: "Concrètement, la certification CE signifie que :",
    explBullets: [
      "Le produit est classé comme dispositif médical et répond à des exigences de sécurité et de performance.",
      "Les matériaux sont adaptés à un usage prolongé au contact de la peau.",
      "Le mode d’utilisation a été défini pour accompagner la position face contre la table après vitrectomie.",
    ],
  },
  en: {
    line1_left: "Vitrectomy cushion",
    brand: "VitectroMed",
    line2: "The first ",
    highlight: "CE-certified medical device",
    line2_end: " for recovery after vitrectomy.",
    ceAlt: "CE certification",
    explTitle: "A medical device, not just a comfort pillow",
    explText:
      "VitectroMed is purpose‑built for vitrectomy recovery: its design, materials and instructions are made to help you maintain the prescribed face‑down position and support the retina while it heals.",
    explBulletsTitle: "In practice, CE certification means:",
    explBullets: [
      "The product is registered as a medical device and meets safety and performance requirements.",
      "Materials are suitable for prolonged skin contact during recovery.",
      "The use instructions are aligned with the face‑down positioning recommended after vitrectomy.",
    ],
  },
  es: {
    line1_left: "Cojín para vitrectomía",
    brand: "VitectroMed",
    line2: "El 1er ",
    highlight: "DISPOSITIVO MÉDICO certificado CE",
    line2_end: " para la convalecencia después de vitrectomía.",
    ceAlt: "Certificación CE",
    explTitle: "Un dispositivo médico, no solo un cojín cómodo",
    explText:
      "VitectroMed está diseñado específicamente para la recuperación tras una vitrectomía: su forma, materiales e instrucciones ayudan a mantener la posición prescrita y a proteger la retina mientras cicatriza.",
    explBulletsTitle: "En la práctica, la certificación CE implica que:",
    explBullets: [
      "El producto está registrado como dispositivo médico y cumple requisitos de seguridad y rendimiento.",
      "Los materiales son adecuados para un uso prolongado en contacto con la piel.",
      "El modo de uso acompaña la posición boca abajo recomendada tras la vitrectomía.",
    ],
  },
  de: {
    line1_left: "Vitrektomie-Kissen",
    brand: "VitectroMed",
    line2: "Das 1. ",
    highlight: "CE-zertifizierte MEDIZINPRODUKT",
    line2_end: " für die Genesung nach Vitrektomie.",
    ceAlt: "CE-Zertifizierung",
    explTitle: "Ein Medizinprodukt – nicht nur ein Komfortkissen",
    explText:
      "VitectroMed wurde speziell für die Zeit nach der Vitrektomie entwickelt: Design, Materialien und Anwendungshinweise unterstützen die vorgeschriebene Haltung und entlasten die Netzhaut während der Heilung.",
    explBulletsTitle: "Die CE-Kennzeichnung bedeutet unter anderem:",
    explBullets: [
      "Das Produkt ist als Medizinprodukt eingestuft und erfüllt Sicherheits- und Leistungsanforderungen.",
      "Die Materialien sind für den längeren Hautkontakt während der Erholungsphase geeignet.",
      "Die Anwendung orientiert sich an der nach der Vitrektomie empfohlenen Bauch‑/Kopfstellung.",
    ],
  },
  it: {
    line1_left: "Cuscino per vitrectomia",
    brand: "VitectroMed",
    line2: "Il 1° ",
    highlight: "DISPOSITIVO MEDICO certificato CE",
    line2_end: " per la convalescenza dopo vitrectomia.",
    ceAlt: "Certificazione CE",
    explTitle: "Un dispositivo medico, non un semplice cuscino di comfort",
    explText:
      "VitectroMed è progettato apposta per il post‑vitrectomia: forma, materiali e istruzioni d’uso aiutano a mantenere la posizione prescritta dall’oculista e a proteggere la retina durante la guarigione.",
    explBulletsTitle: "In pratica, la certificazione CE garantisce che:",
    explBullets: [
      "Il prodotto è registrato come dispositivo medico e rispetta requisiti di sicurezza e prestazione.",
      "I materiali sono adatti a un contatto prolungato con la pelle.",
      "Le modalità d’uso sono pensate per accompagnare la posizione a faccia in giù dopo la vitrectomia.",
    ],
  },
  nl: {
    line1_left: "Vitrectomie kussen",
    brand: "VitectroMed",
    line2: "Het 1e ",
    highlight: "CE-gecertificeerd MEDISCH HULPMIDDEL",
    line2_end: " voor herstel na vitrectomie.",
    ceAlt: "CE-certificering",
    explTitle: "Een medisch hulpmiddel, geen gewoon kussen",
    explText:
      "VitectroMed is specifiek ontwikkeld voor herstel na een vitrectomie: ontwerp, materialen en gebruiksadvies helpen u om de voorgeschreven houding aan te houden en het netvlies te beschermen tijdens het herstel.",
    explBulletsTitle: "CE-certificering betekent onder meer dat:",
    explBullets: [
      "Het product is ingeschreven als medisch hulpmiddel en voldoet aan eisen rond veiligheid en werking.",
      "De materialen zijn geschikt voor langdurig contact met de huid.",
      "De gebruikswijze sluit aan bij de gezicht‑naar‑beneden houding na een vitrectomie.",
    ],
  },
};

export default function CredibilityStrip({ locale }: Props) {
  const t = CONTENT[locale];

  return (
    <section className="cred">
      <div className="cred-inner">
        <div className="cred-top">
          <div className="cred-line1">
            <span className="cred-muted">{t.line1_left}</span>
            <span className="cred-brand">
              <span className="cred-brand-text">{t.brand}</span>
              <span className="cred-brand-logo">
                <Image
                  src={OCULAREST_SMALL_LOGO}
                  alt="VitectroMed"
                  width={22}
                  height={22}
                  className="cred-logo-img"
                />
              </span>
            </span>
          </div>

          <p className="cred-line2">
            {t.line2}
            <span className="cred-highlight">{t.highlight}</span>
            {t.line2_end}
          </p>

          <div className="cred-ce-pill">
            <Image
              src={CE_LOGO_URL}
              alt={t.ceAlt}
              width={32}
              height={32}
              className="cred-ce-img"
            />
            <span className="cred-ce-text">{t.ceAlt}</span>
          </div>
        </div>

        <div className="cred-body">
          <div className="cred-main">
            <h2 className="cred-expl-title">{t.explTitle}</h2>
            <p className="cred-expl-text">{t.explText}</p>
          </div>

          <div className="cred-side">
            <h3 className="cred-expl-subtitle">{t.explBulletsTitle}</h3>
            <ul className="cred-expl-list">
              {t.explBullets.map((item, i) => (
                <li key={i} className="cred-expl-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
