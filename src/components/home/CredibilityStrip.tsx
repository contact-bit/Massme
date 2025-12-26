import "./CredibilityStrip.css";
import Image from "next/image";

type Props = {
  locale: "fr" | "en";
};

const OCULAREST_SMALL_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const CE_LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/3f902801-6b1c-45b3-b2f4-bb3e59e96900/public";

const CONTENT = {
  fr: {
    line1_left: "Coussin vitrectomie",
    brand: "OculaRest",
    line2: "Le 1er ",
    highlight: "DISPOSITIF MÉDICAL certifié CE",
    line2_end: " pour la convalescence après vitrectomie.",
    ceAlt: "Certification CE",
  },
  en: {
    line1_left: "Vitrectomy cushion",
    brand: "OculaRest",
    line2: "The first ",
    highlight: "CE-certified medical device",
    line2_end: " for recovery after vitrectomy.",
    ceAlt: "CE certification",
  },
} as const;

export default function CredibilityStrip({ locale }: Props) {
  const t = CONTENT[locale];

  return (
    <section className="cred">
      <div className="cred-inner">
        {/* Ligne 1 */}
        <div className="cred-line1">
          <span className="cred-muted">{t.line1_left}</span>
          <span className="cred-brand">
            <span className="cred-brand-text">{t.brand}</span>
            <span className="cred-brand-logo">
              <Image
                src={OCULAREST_SMALL_LOGO}
                alt="OculaRest"
                width={22}
                height={22}
                className="cred-logo-img"
              />
            </span>
          </span>
        </div>

        {/* Ligne 2 */}
        <p className="cred-line2">
          {t.line2}
          <span className="cred-highlight">{t.highlight}</span>
          {t.line2_end}
        </p>

        {/* Logo CE */}
        <div className="cred-ce">
          <Image
            src={CE_LOGO_URL}
            alt={t.ceAlt}
            width={44}
            height={44}
            className="cred-ce-img"
          />
        </div>
      </div>
    </section>
  );
}
