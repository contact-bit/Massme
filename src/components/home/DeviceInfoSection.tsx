import "./DeviceInfoSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY: Record<Locale, {
  h1: string;
  p1: string;
  p2: string;
  made: string;
  h2a: string;
  brand: string;
  h2b: string;
  bullets: string[];
}> = {
  fr: {
    h1: "Un dispositif pensé pour votre confort et votre sécurité",
    p1: "VitectroMed est équipé d'une mousse à mémoire de forme et d'une housse en textile de bambou Oeko-Tex®, douce, respirante, antiallergique et antibactérienne.",
    p2: "Son design ergonomique permet une bonne ventilation du visage, l'utilisation avec des lunettes et un alignement optimal de la colonne vertébrale.",
    made: "Conçu et fabriqué en France 🇫🇷",
    h2a: "À qui s'adresse",
    brand: "VitectroMed",
    h2b: " ?",
    bullets: [
      "Patients opérés d'un trou maculaire",
      "Patients opérés d'un décollement de la rétine",
      "Patients devant respecter une position bulle après vitrectomie",
      "Patients recherchant une solution confortable et durable",
    ],
  },
  en: {
    h1: "A device designed for your comfort and safety",
    p1: "VitectroMed features memory foam and a bamboo Oeko-Tex® cover that is soft, breathable, hypoallergenic and antibacterial.",
    p2: "Its ergonomic design ensures good facial ventilation, allows use with glasses, and supports optimal spinal alignment.",
    made: "Designed & made in France 🇫🇷",
    h2a: "Who is",
    brand: "VitectroMed",
    h2b: " for?",
    bullets: [
      "Patients after macular hole surgery",
      "Patients after retinal detachment surgery",
      "Patients who must follow a face-down position after vitrectomy",
      "Patients looking for a comfortable, durable solution",
    ],
  },
  es: {
    h1: "Un dispositivo diseñado para tu comodidad y seguridad",
    p1: "VitectroMed cuenta con espuma viscoelástica y una funda de bambú Oeko-Tex® que es suave, transpirable, hipoalergénica y antibacteriana.",
    p2: "Su diseño ergonómico garantiza una buena ventilación facial, permite el uso con gafas y favorece una alineación óptima de la columna vertebral.",
    made: "Diseñado y fabricado en Francia 🇫🇷",
    h2a: "¿Para quién es",
    brand: "VitectroMed",
    h2b: "?",
    bullets: [
      "Pacientes operados de agujero macular",
      "Pacientes operados de desprendimiento de retina",
      "Pacientes que deben mantener una posición boca abajo después de vitrectomía",
      "Pacientes que buscan una solución cómoda y duradera",
    ],
  },
  de: {
    h1: "Ein Gerät für Ihren Komfort und Ihre Sicherheit",
    p1: "VitectroMed ist mit Memory-Schaum und einem Bambus-Oeko-Tex®-Bezug ausgestattet, der weich, atmungsaktiv, hypoallergen und antibakteriell ist.",
    p2: "Sein ergonomisches Design sorgt für gute Gesichtsbelüftung, ermöglicht die Verwendung mit Brille und unterstützt eine optimale Ausrichtung der Wirbelsäule.",
    made: "Entwickelt und hergestellt in Frankreich 🇫🇷",
    h2a: "Für wen ist",
    brand: "VitectroMed",
    h2b: "?",
    bullets: [
      "Patienten nach Makulaloch-Operation",
      "Patienten nach Netzhautablösung",
      "Patienten, die nach Vitrektomie eine Bauchlage einhalten müssen",
      "Patienten, die eine komfortable und dauerhafte Lösung suchen",
    ],
  },
  it: {
    h1: "Un dispositivo pensato per il tuo comfort e la tua sicurezza",
    p1: "VitectroMed è dotato di schiuma memory e di una fodera in bambù Oeko-Tex® morbida, traspirante, ipoallergenica e antibatterica.",
    p2: "Il suo design ergonomico garantisce una buona ventilazione del viso, consente l'uso con gli occhiali e favorisce un allineamento ottimale della colonna vertebrale.",
    made: "Progettato e prodotto in Francia 🇫🇷",
    h2a: "Per chi è",
    brand: "VitectroMed",
    h2b: "?",
    bullets: [
      "Pazienti operati di foro maculare",
      "Pazienti operati di distacco di retina",
      "Pazienti che devono mantenere una posizione a faccia in giù dopo vitrectomia",
      "Pazienti alla ricerca di una soluzione confortevole e duratura",
    ],
  },
  nl: {
    h1: "Een apparaat ontworpen voor uw comfort en veiligheid",
    p1: "VitectroMed is uitgerust met geheugenschuim en een bamboe Oeko-Tex® hoes die zacht, ademend, hypoallergeen en antibacterieel is.",
    p2: "Het ergonomische ontwerp zorgt voor goede gezichtsventilatie, maakt gebruik met een bril mogelijk en ondersteunt een optimale uitlijning van de wervelkolom.",
    made: "Ontworpen en gemaakt in Frankrijk 🇫🇷",
    h2a: "Voor wie is",
    brand: "VitectroMed",
    h2b: "?",
    bullets: [
      "Patiënten na maculagat-operatie",
      "Patiënten na netvliesloslating",
      "Patiënten die een buikligging moeten aanhouden na vitrectomie",
      "Patiënten op zoek naar een comfortabele, duurzame oplossing",
    ],
  },
};

export default function DeviceInfoSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="dev">
      <div className="dev-inner">
        <h3 className="dev-title">{t.h1}</h3>
        <p className="dev-p">{t.p1}</p>
        <p className="dev-p">{t.p2}</p>
        <div className="dev-made">{t.made}</div>

        <h3 className="dev-title2">
          {t.h2a}{" "}
          <span className="dev-brand">
            {t.brand}
            <Image
              src={MINI_LOGO}
              alt="VitectroMed"
              width={18}
              height={18}
              className="dev-mini"
            />
          </span>
          {t.h2b}
        </h3>

        <ul className="dev-list">
          {t.bullets.map((b, i) => (
            <li key={i} className="dev-li">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}