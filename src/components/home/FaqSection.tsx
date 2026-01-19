"use client";

import "./FaqSection.css";
import { useMemo, useState } from "react";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

type Item = { q: string; a: string };

const DATA: Record<Locale, { title: string; items: Item[] }> = {
  fr: {
    title: "FAQ",
    items: [
      {
        q: "Combien de temps faut-il garder la position après une vitrectomie ?",
        a: "La durée varie selon la pathologie et le gaz utilisé. Votre chirurgien vous indiquera la durée exacte à respecter (souvent plusieurs jours).",
      },
      {
        q: "Comment dormir après une vitrectomie avec injection de gaz ?",
        a: "En général, il faut maintenir la position prescrite (souvent tête vers le sol). L'objectif est de garder la bulle en appui sur la zone à traiter. Suivez toujours les consignes de votre chirurgien.",
      },
      {
        q: "Quand commander OculaRest ?",
        a: "Idéalement avant l'intervention, afin d'être prêt dès le retour à domicile et d'organiser sereinement votre convalescence.",
      },
      {
        q: "Est-ce un dispositif médical certifié ?",
        a: "OculaRest est présenté comme un dispositif médical certifié CE. Référez-vous aux informations officielles du produit (notice / marquage) pour les détails exacts.",
      },
      {
        q: "Est-il réutilisable après la convalescence ?",
        a: "Oui, il peut être réutilisé (selon le produit) pour le confort au quotidien : repos, lecture, relaxation, etc.",
      },
    ],
  },
  en: {
    title: "FAQ",
    items: [
      {
        q: "How long do I need to keep the position after a vitrectomy?",
        a: "The duration depends on your condition and the type of gas used. Your surgeon will give you the exact time to follow (often several days).",
      },
      {
        q: "How can I sleep after a vitrectomy with gas injection?",
        a: "In many cases, you must keep the prescribed position (often face-down). The goal is to keep the gas bubble pressing on the treated area. Always follow your surgeon's instructions.",
      },
      {
        q: "When should I order OculaRest?",
        a: "Ideally before surgery, so you're ready as soon as you return home and can plan recovery with peace of mind.",
      },
      {
        q: "Is it a certified medical device?",
        a: "OculaRest is presented as CE-certified. Please refer to the official product information (labeling / documentation) for exact details.",
      },
      {
        q: "Can it be reused after recovery?",
        a: "Yes—depending on the product, it can be reused for everyday comfort: resting, reading, relaxation, etc.",
      },
    ],
  },
  es: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Cuánto tiempo debo mantener la posición después de una vitrectomía?",
        a: "La duración depende de su condición y del tipo de gas utilizado. Su cirujano le indicará el tiempo exacto a seguir (a menudo varios días).",
      },
      {
        q: "¿Cómo puedo dormir después de una vitrectomía con inyección de gas?",
        a: "En muchos casos, debe mantener la posición prescrita (a menudo boca abajo). El objetivo es mantener la burbuja de gas presionando sobre el área tratada. Siempre siga las instrucciones de su cirujano.",
      },
      {
        q: "¿Cuándo debo pedir OculaRest?",
        a: "Idealmente antes de la cirugía, para estar preparado tan pronto como regrese a casa y pueda planificar la recuperación con tranquilidad.",
      },
      {
        q: "¿Es un dispositivo médico certificado?",
        a: "OculaRest se presenta como certificado CE. Consulte la información oficial del producto (etiquetado / documentación) para conocer los detalles exactos.",
      },
      {
        q: "¿Se puede reutilizar después de la recuperación?",
        a: "Sí, según el producto, se puede reutilizar para comodidad diaria: descanso, lectura, relajación, etc.",
      },
    ],
  },
  de: {
    title: "Häufig gestellte Fragen",
    items: [
      {
        q: "Wie lange muss ich die Position nach einer Vitrektomie einhalten?",
        a: "Die Dauer hängt von Ihrer Erkrankung und der Art des verwendeten Gases ab. Ihr Chirurg wird Ihnen die genaue Zeit mitteilen (oft mehrere Tage).",
      },
      {
        q: "Wie kann ich nach einer Vitrektomie mit Gasinjektion schlafen?",
        a: "In vielen Fällen müssen Sie die vorgeschriebene Position einhalten (oft mit dem Gesicht nach unten). Ziel ist es, die Gasblase auf den behandelten Bereich zu drücken. Befolgen Sie immer die Anweisungen Ihres Chirurgen.",
      },
      {
        q: "Wann sollte ich OculaRest bestellen?",
        a: "Idealerweise vor der Operation, damit Sie bereit sind, sobald Sie nach Hause zurückkehren, und die Genesung in Ruhe planen können.",
      },
      {
        q: "Ist es ein zertifiziertes Medizinprodukt?",
        a: "OculaRest wird als CE-zertifiziert präsentiert. Weitere Einzelheiten finden Sie in den offiziellen Produktinformationen (Kennzeichnung / Dokumentation).",
      },
      {
        q: "Kann es nach der Genesung wiederverwendet werden?",
        a: "Ja – je nach Produkt kann es für den täglichen Komfort wiederverwendet werden: Ruhe, Lesen, Entspannung usw.",
      },
    ],
  },
  it: {
    title: "Domande frequenti",
    items: [
      {
        q: "Per quanto tempo devo mantenere la posizione dopo una vitrectomia?",
        a: "La durata dipende dalla condizione e dal tipo di gas utilizzato. Il chirurgo ti darà il tempo esatto da seguire (spesso diversi giorni).",
      },
      {
        q: "Come posso dormire dopo una vitrectomia con iniezione di gas?",
        a: "In molti casi, devi mantenere la posizione prescritta (spesso a faccia in giù). L'obiettivo è mantenere la bolla di gas premuta sull'area trattata. Segui sempre le istruzioni del chirurgo.",
      },
      {
        q: "Quando devo ordinare OculaRest?",
        a: "Idealmente prima dell'intervento, così sarai pronto non appena torni a casa e potrai pianificare il recupero con tranquillità.",
      },
      {
        q: "È un dispositivo medico certificato?",
        a: "OculaRest è presentato come certificato CE. Fare riferimento alle informazioni ufficiali del prodotto (etichettatura / documentazione) per i dettagli esatti.",
      },
      {
        q: "Può essere riutilizzato dopo il recupero?",
        a: "Sì, a seconda del prodotto, può essere riutilizzato per il comfort quotidiano: riposo, lettura, relax, ecc.",
      },
    ],
  },
  nl: {
    title: "Veelgestelde vragen",
    items: [
      {
        q: "Hoe lang moet ik de positie aanhouden na een vitrectomie?",
        a: "De duur hangt af van uw aandoening en het type gas dat wordt gebruikt. Uw chirurg zal u de exacte tijd geven die u moet volgen (vaak meerdere dagen).",
      },
      {
        q: "Hoe kan ik slapen na een vitrectomie met gasinjectie?",
        a: "In veel gevallen moet u de voorgeschreven positie aanhouden (vaak met het gezicht naar beneden). Het doel is om de gasbel op het behandelde gebied te houden. Volg altijd de instructies van uw chirurg.",
      },
      {
        q: "Wanneer moet ik OculaRest bestellen?",
        a: "Idealiter vóór de operatie, zodat u klaar bent zodra u thuiskomt en met een gerust hart kunt plannen voor herstel.",
      },
      {
        q: "Is het een gecertificeerd medisch hulpmiddel?",
        a: "OculaRest wordt gepresenteerd als CE-gecertificeerd. Raadpleeg de officiële productinformatie (etikettering / documentatie) voor exacte details.",
      },
      {
        q: "Kan het na herstel opnieuw worden gebruikt?",
        a: "Ja, afhankelijk van het product kan het opnieuw worden gebruikt voor dagelijks comfort: rusten, lezen, ontspannen, enz.",
      },
    ],
  },
};

export default function FaqSection({ locale }: Props) {
  const t = DATA[locale];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = useMemo(() => t.items, [t]);

  return (
    <section className="faq">
      <div className="faq-inner">
        <h3 className="faq-title">{t.title}</h3>

        <div className="faq-list">
          {items.map((it, idx) => {
            const open = openIndex === idx;
            return (
              <div key={idx} className={`faq-item ${open ? "is-open" : ""}`}>
                <button
                  className="faq-btn"
                  type="button"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                >
                  <span className="faq-q">{it.q}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>

                <div
                  className="faq-panel"
                  style={{ maxHeight: open ? 240 : 0 }}
                >
                  <div className="faq-a">{it.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}