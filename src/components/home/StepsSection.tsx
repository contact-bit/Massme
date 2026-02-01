import "./StepsSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY: Record<Locale, {
  titleA: string;
  titleB: string;
  steps: Array<{
    label: string;
    text?: string;
    textBefore?: string;
    brand?: string;
    textAfter?: string;
  }>;
}> = {
  fr: {
    titleA: "Votre accompagnement en",
    titleB: "3 étapes",
    steps: [
      {
        label: "Étape 1:",
        text: "Vous rentrez chez vous après votre opération et devez respecter la position bulle.",
      },
      {
        label: "Étape 2:",
        textBefore: "Vous installez ",
        brand: "VitectroMed",
        textAfter: " en quelques secondes, sur votre lit ou sur une table.",
      },
      {
        label: "Étape 3:",
        text: "Vous maintenez la position prescrite sans souffrir, tout en pouvant dormir, manger, lire ou vous reposer.",
      },
    ],
  },
  en: {
    titleA: "Your support in",
    titleB: "3 steps",
    steps: [
      {
        label: "Step 1:",
        text: "You return home after your surgery and must follow the face-down position instructions.",
      },
      {
        label: "Step 2:",
        textBefore: "You set up ",
        brand: "VitectroMed",
        textAfter: " in seconds, on your bed or on a table.",
      },
      {
        label: "Step 3:",
        text: "You maintain the prescribed position more comfortably while still being able to rest, read, and recover.",
      },
    ],
  },
  es: {
    titleA: "Su acompañamiento en",
    titleB: "3 pasos",
    steps: [
      {
        label: "Paso 1:",
        text: "Regresa a casa después de su cirugía y debe seguir las instrucciones de posición boca abajo.",
      },
      {
        label: "Paso 2:",
        textBefore: "Instala ",
        brand: "VitectroMed",
        textAfter: " en segundos, en su cama o en una mesa.",
      },
      {
        label: "Paso 3:",
        text: "Mantiene la posición prescrita con mayor comodidad mientras puede descansar, leer y recuperarse.",
      },
    ],
  },
  de: {
    titleA: "Ihre Begleitung in",
    titleB: "3 Schritten",
    steps: [
      {
        label: "Schritt 1:",
        text: "Sie kehren nach Ihrer Operation nach Hause zurück und müssen die Gesicht-nach-unten-Position einhalten.",
      },
      {
        label: "Schritt 2:",
        textBefore: "Sie richten ",
        brand: "VitectroMed",
        textAfter: " in Sekunden ein, auf Ihrem Bett oder auf einem Tisch.",
      },
      {
        label: "Schritt 3:",
        text: "Sie halten die vorgeschriebene Position bequemer ein, während Sie sich ausruhen, lesen und erholen können.",
      },
    ],
  },
  it: {
    titleA: "Il tuo supporto in",
    titleB: "3 passaggi",
    steps: [
      {
        label: "Passaggio 1:",
        text: "Torni a casa dopo l'intervento e devi seguire le istruzioni di posizione a faccia in giù.",
      },
      {
        label: "Passaggio 2:",
        textBefore: "Installi ",
        brand: "VitectroMed",
        textAfter: " in pochi secondi, sul tuo letto o su un tavolo.",
      },
      {
        label: "Passaggio 3:",
        text: "Mantieni la posizione prescritta in modo più confortevole mentre puoi riposare, leggere e recuperare.",
      },
    ],
  },
  nl: {
    titleA: "Uw ondersteuning in",
    titleB: "3 stappen",
    steps: [
      {
        label: "Stap 1:",
        text: "U keert thuis terug na uw operatie en moet de gezicht-naar-beneden positie instructies volgen.",
      },
      {
        label: "Stap 2:",
        textBefore: "U installeert ",
        brand: "VitectroMed",
        textAfter: " in enkele seconden, op uw bed of op een tafel.",
      },
      {
        label: "Stap 3:",
        text: "U behoudt de voorgeschreven positie comfortabeler terwijl u nog steeds kunt rusten, lezen en herstellen.",
      },
    ],
  },
};

export default function StepsSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="steps">
      <div className="steps-inner">
        <h3 className="steps-title">
          {t.titleA} <span className="steps-accent">{t.titleB}:</span>
        </h3>

        <div className="steps-list">
          {/* Step 1 */}
          <div className="step">
            <div className="step-label">{t.steps[0].label}</div>
            <p className="step-text">{t.steps[0].text}</p>
          </div>

          {/* Step 2 */}
          <div className="step">
            <div className="step-label">{t.steps[1].label}</div>
            <p className="step-text">
              {t.steps[1].textBefore}
              <span className="step-brand">
                {t.steps[1].brand}
                <Image
                  src={MINI_LOGO}
                  alt="VitectroMed"
                  width={18}
                  height={18}
                  className="step-mini"
                />
              </span>
              {t.steps[1].textAfter}
            </p>
          </div>

          {/* Step 3 */}
          <div className="step">
            <div className="step-label">{t.steps[2].label}</div>
            <p className="step-text">{t.steps[2].text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}