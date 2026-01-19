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

const CONTENT: Record<Locale, {
  line1_left: string;
  brand: string;
  line2: string;
  highlight: string;
  line2_end: string;
  ceAlt: string;
}> = {
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
  es: {
    line1_left: "Cojín para vitrectomía",
    brand: "OculaRest",
    line2: "El 1er ",
    highlight: "DISPOSITIVO MÉDICO certificado CE",
    line2_end: " para la convalecencia después de vitrectomía.",
    ceAlt: "Certificación CE",
  },
  de: {
    line1_left: "Vitrektomie-Kissen",
    brand: "OculaRest",
    line2: "Das 1. ",
    highlight: "CE-zertifizierte MEDIZINPRODUKT",
    line2_end: " für die Genesung nach Vitrektomie.",
    ceAlt: "CE-Zertifizierung",
  },
  it: {
    line1_left: "Cuscino per vitrectomia",
    brand: "OculaRest",
    line2: "Il 1° ",
    highlight: "DISPOSITIVO MEDICO certificato CE",
    line2_end: " per la convalescenza dopo vitrectomia.",
    ceAlt: "Certificazione CE",
  },
  nl: {
    line1_left: "Vitrectomie kussen",
    brand: "OculaRest",
    line2: "Het 1e ",
    highlight: "CE-gecertificeerd MEDISCH HULPMIDDEL",
    line2_end: " voor herstel na vitrectomie.",
    ceAlt: "CE-certificering",
  },
};

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