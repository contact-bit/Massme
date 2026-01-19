import "./StepsSection.css";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

type Dict = {
  titleA: string;
  titleB: string;
  steps: {
    title: string;
    desc: string;
  }[];
};

/* ======================================================
   TRANSLATIONS — STEPS
====================================================== */
const TRANSLATIONS: Record<Locale, Dict> = {
  fr: {
    titleA: "Comment",
    titleB: "ça fonctionne",
    steps: [
      {
        title: "Installation simple",
        desc: "Installez OculaRest facilement sur votre lit ou fauteuil.",
      },
      {
        title: "Position prescrite",
        desc: "Adoptez la position recommandée par votre chirurgien.",
      },
      {
        title: "Convalescence sereine",
        desc: "Récupérez plus confortablement en réduisant les tensions.",
      },
    ],
  },

  en: {
    titleA: "How",
    titleB: "it works",
    steps: [
      {
        title: "Easy setup",
        desc: "Quickly install OculaRest on your bed or chair.",
      },
      {
        title: "Prescribed position",
        desc: "Maintain the position recommended by your surgeon.",
      },
      {
        title: "Smooth recovery",
        desc: "Recover comfortably while reducing strain.",
      },
    ],
  },

  es: {
    titleA: "Cómo",
    titleB: "funciona",
    steps: [
      {
        title: "Instalación sencilla",
        desc: "Instale OculaRest fácilmente en su cama o sillón.",
      },
      {
        title: "Posición prescrita",
        desc: "Mantenga la posición recomendada por su cirujano.",
      },
      {
        title: "Recuperación cómoda",
        desc: "Recupérese con mayor confort reduciendo la tensión.",
      },
    ],
  },

  de: {
    titleA: "So",
    titleB: "funktioniert es",
    steps: [
      {
        title: "Einfache Installation",
        desc: "OculaRest lässt sich leicht auf Bett oder Sessel montieren.",
      },
      {
        title: "Vorgeschriebene Position",
        desc: "Halten Sie die vom Chirurgen empfohlene Position ein.",
      },
      {
        title: "Entspannte Genesung",
        desc: "Erholen Sie sich komfortabler mit weniger Belastung.",
      },
    ],
  },

  it: {
    titleA: "Come",
    titleB: "funziona",
    steps: [
      {
        title: "Installazione semplice",
        desc: "Installa facilmente OculaRest su letto o poltrona.",
      },
      {
        title: "Posizione prescritta",
        desc: "Mantieni la posizione consigliata dal chirurgo.",
      },
      {
        title: "Recupero sereno",
        desc: "Recupera in modo più confortevole riducendo le tensioni.",
      },
    ],
  },

  nl: {
    titleA: "Hoe",
    titleB: "het werkt",
    steps: [
      {
        title: "Eenvoudige installatie",
        desc: "Installeer OculaRest eenvoudig op bed of stoel.",
      },
      {
        title: "Voorgeschreven houding",
        desc: "Houd de door de chirurg aanbevolen houding aan.",
      },
      {
        title: "Comfortabel herstel",
        desc: "Herstel comfortabel met minder belasting.",
      },
    ],
  },
};

/* ======================================================
   COMPONENT
====================================================== */
export default function StepsSection({ locale }: Props) {
  // ✅ FALLBACK SÉCURISÉ
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS.fr;

  return (
    <section className="steps">
      <div className="steps-inner">
        <h3 className="steps-title">
          {t.titleA}{" "}
          <span className="steps-accent">{t.titleB}</span>
        </h3>

        <div className="steps-list">
          {t.steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-index">{i + 1}</div>
              <div className="step-content">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
