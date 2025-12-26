import "./StepsSection.css";
import Image from "next/image";

type Props = {
  locale: "fr" | "en";
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY = {
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
        brand: "OculaRest",
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
        brand: "OculaRest",
        textAfter: " in seconds, on your bed or on a table.",
      },
      {
        label: "Step 3:",
        text: "You maintain the prescribed position more comfortably while still being able to rest, read, and recover.",
      },
    ],
  },
} as const;

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
                  alt="OculaRest"
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
