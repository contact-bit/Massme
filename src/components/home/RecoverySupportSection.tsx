import "./RecoverySupportSection.css";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

type Props = {
  locale: Locale;
};

type Dict = {
  title1: string;
  title2: string;
  subtitle: string;
  items: string[];
};

/* ======================================================
   TRANSLATIONS — RECOVERY SUPPORT
====================================================== */
const TRANSLATIONS: Record<Locale, Dict> = {
  fr: {
    title1: "Un accompagnement pensé pour",
    title2: "la convalescence post-opératoire",
    subtitle:
      "OculaRest aide à maintenir la position prescrite tout en réduisant les douleurs cervicales.",
    items: [
      "Maintien confortable de la position",
      "Réduction des tensions cervicales",
      "Compatible lit et fauteuil",
    ],
  },

  en: {
    title1: "Support designed for",
    title2: "post-operative recovery",
    subtitle:
      "OculaRest helps maintain the prescribed position while reducing neck strain.",
    items: [
      "Comfortable position support",
      "Reduced neck tension",
      "Bed and chair compatible",
    ],
  },

  es: {
    title1: "Un acompañamiento diseñado para",
    title2: "la recuperación postoperatoria",
    subtitle:
      "OculaRest ayuda a mantener la posición prescrita reduciendo la tensión cervical.",
    items: [
      "Mantenimiento cómodo de la posición",
      "Reducción de la tensión cervical",
      "Compatible con cama y sillón",
    ],
  },

  de: {
    title1: "Unterstützung für",
    title2: "die postoperative Genesung",
    subtitle:
      "OculaRest hilft, die vorgeschriebene Position einzuhalten und entlastet den Nacken.",
    items: [
      "Bequeme Positionshaltung",
      "Weniger Nackenbelastung",
      "Für Bett und Sessel geeignet",
    ],
  },

  it: {
    title1: "Un supporto pensato per",
    title2: "la convalescenza post-operatoria",
    subtitle:
      "OculaRest aiuta a mantenere la posizione prescritta alleviando la tensione cervicale.",
    items: [
      "Mantenimento confortevole della posizione",
      "Riduzione della tensione cervicale",
      "Compatibile con letto e poltrona",
    ],
  },

  nl: {
    title1: "Ondersteuning ontworpen voor",
    title2: "postoperatief herstel",
    subtitle:
      "OculaRest helpt de voorgeschreven houding aan te houden en ontlast de nek.",
    items: [
      "Comfortabele houding",
      "Minder nekbelasting",
      "Geschikt voor bed en stoel",
    ],
  },
};

/* ======================================================
   COMPONENT
====================================================== */
export default function RecoverySupportSection({ locale }: Props) {
  // ✅ fallback SAFE
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS.fr;

  return (
    <section className="recovery-support">
      <div className="rs-inner">
        <h2 className="rs-title">
          <span className="rs-brand">
            {t.title1}
            <Image
              src={MINI_LOGO}
              alt="OculaRest"
              width={26}
              height={26}
            />
          </span>
          <br />
          {t.title2}
        </h2>

        <p className="rs-subtitle">{t.subtitle}</p>

        <ul className="rs-list">
          {t.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
