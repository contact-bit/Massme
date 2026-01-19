import "./CredibilityStrip.css";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

type Dict = {
  line1_left: string;
  brand: string;
  line1_right: string;
  line2: string;
};

/* ======================================================
   TRANSLATIONS
====================================================== */
const TRANSLATIONS: Record<Locale, Dict> = {
  fr: {
    line1_left: "Déjà utilisé dans",
    brand: "les hôpitaux",
    line1_right: "et cliniques européennes",
    line2: "Dispositif médical certifié • Conçu avec des spécialistes",
  },

  en: {
    line1_left: "Already used in",
    brand: "hospitals",
    line1_right: "and European clinics",
    line2: "Certified medical device • Designed with specialists",
  },

  es: {
    line1_left: "Ya utilizado en",
    brand: "hospitales",
    line1_right: "y clínicas europeas",
    line2: "Dispositivo médico certificado • Diseñado con especialistas",
  },

  de: {
    line1_left: "Bereits im Einsatz in",
    brand: "Krankenhäusern",
    line1_right: "und europäischen Kliniken",
    line2: "Zertifiziertes Medizinprodukt • Entwickelt mit Spezialisten",
  },

  it: {
    line1_left: "Già utilizzato in",
    brand: "ospedali",
    line1_right: "e cliniche europee",
    line2: "Dispositivo medico certificato • Progettato con specialisti",
  },

  nl: {
    line1_left: "Reeds gebruikt in",
    brand: "ziekenhuizen",
    line1_right: "en Europese klinieken",
    line2: "Gecertificeerd medisch hulpmiddel • Ontworpen met specialisten",
  },
};

/* ======================================================
   COMPONENT
====================================================== */
export default function CredibilityStrip({ locale }: Props) {
  // ✅ fallback SAFE (ne plantera jamais)
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS.fr;

  return (
    <section className="credibility-strip">
      <div className="credibility-inner">
        {/* Ligne 1 */}
        <div className="cred-line1">
          <span className="cred-muted">{t.line1_left}</span>
          <span className="cred-brand">
            <span className="cred-brand-text">{t.brand}</span>
          </span>
          <span className="cred-muted">{t.line1_right}</span>
        </div>

        {/* Ligne 2 */}
        <div className="cred-line2">{t.line2}</div>
      </div>
    </section>
  );
}
