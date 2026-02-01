import "./WhyDifferentSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const TOP_MONTAGE_IMG =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/b4966255-a6dc-4fb9-4d9e-4934e8aaa400/public";

const COPY: Record<Locale, {
  titleA: string;
  brand: string;
  titleB: string;
  bullets: string[];
}> = {
  fr: {
    titleA: "Pourquoi",
    brand: "VitectroMed",
    titleB: "est différent",
    bullets: [
      "Maintien fiable de la position post-opératoire",
      "Soulagement des douleurs cervicales et musculaires",
      "Meilleur confort pendant toute la durée de la convalescence",
      "Favorise une récupération dans de bonnes conditions",
      "Alternative durable à la location de matériel",
    ],
  },
  en: {
    titleA: "Why",
    brand: "VitectroMed",
    titleB: "is different",
    bullets: [
      "Reliable support for the prescribed post-op position",
      "Helps reduce neck and muscular discomfort",
      "Improved comfort throughout the recovery period",
      "Supports recovery in better conditions",
      "A durable alternative to renting equipment",
    ],
  },
  es: {
    titleA: "Por qué",
    brand: "VitectroMed",
    titleB: "es diferente",
    bullets: [
      "Soporte fiable para la posición postoperatoria prescrita",
      "Ayuda a reducir las molestias cervicales y musculares",
      "Mayor comodidad durante todo el período de recuperación",
      "Apoya la recuperación en mejores condiciones",
      "Una alternativa duradera al alquiler de equipos",
    ],
  },
  de: {
    titleA: "Warum",
    brand: "VitectroMed",
    titleB: "anders ist",
    bullets: [
      "Zuverlässige Unterstützung für die vorgeschriebene postoperative Position",
      "Hilft, Nacken- und Muskelbeschwerden zu reduzieren",
      "Verbesserter Komfort während der gesamten Erholungsphase",
      "Unterstützt die Genesung unter besseren Bedingungen",
      "Eine dauerhafte Alternative zur Miete von Ausrüstung",
    ],
  },
  it: {
    titleA: "Perché",
    brand: "VitectroMed",
    titleB: "è diverso",
    bullets: [
      "Supporto affidabile per la posizione post-operatoria prescritta",
      "Aiuta a ridurre il disagio cervicale e muscolare",
      "Maggiore comfort durante tutto il periodo di recupero",
      "Supporta il recupero in condizioni migliori",
      "Un'alternativa durevole al noleggio di attrezzature",
    ],
  },
  nl: {
    titleA: "Waarom",
    brand: "VitectroMed",
    titleB: "anders is",
    bullets: [
      "Betrouwbare ondersteuning voor de voorgeschreven postoperatieve positie",
      "Helpt nek- en spierongemak te verminderen",
      "Verbeterd comfort gedurende de hele herstelperiode",
      "Ondersteunt herstel onder betere omstandigheden",
      "Een duurzaam alternatief voor het huren van apparatuur",
    ],
  },
};

export default function WhyDifferentSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="why">
      <div className="why-inner">
        {/* Montage top */}
        <Image
          src={TOP_MONTAGE_IMG}
          alt=""
          width={1200}
          height={260}
          className="why-top-img"
        />

        {/* Title */}
        <h3 className="why-title">
          {t.titleA}{" "}
          <span className="why-brand">
            {t.brand}
            <Image
              src={MINI_LOGO}
              alt="VitectroMed"
              width={18}
              height={18}
              className="why-mini"
            />
          </span>{" "}
          {t.titleB}
        </h3>

        {/* Bullets */}
        <ul className="why-list">
          {t.bullets.map((b, i) => (
            <li key={i} className="why-item">
              <span className="why-check" aria-hidden="true">
                ✓
              </span>
              <span className="why-text">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}