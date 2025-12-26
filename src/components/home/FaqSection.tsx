"use client";

import "./FaqSection.css";
import { useMemo, useState } from "react";

type Props = {
  locale: "fr" | "en";
};

type Item = { q: string; a: string };

const DATA: Record<"fr" | "en", { title: string; items: Item[] }> = {
  fr: {
    title: "FAQ",
    items: [
      {
        q: "Combien de temps faut-il garder la position après une vitrectomie ?",
        a: "La durée varie selon la pathologie et le gaz utilisé. Votre chirurgien vous indiquera la durée exacte à respecter (souvent plusieurs jours).",
      },
      {
        q: "Comment dormir après une vitrectomie avec injection de gaz ?",
        a: "En général, il faut maintenir la position prescrite (souvent tête vers le sol). L’objectif est de garder la bulle en appui sur la zone à traiter. Suivez toujours les consignes de votre chirurgien.",
      },
      {
        q: "Quand commander OculaRest ?",
        a: "Idéalement avant l’intervention, afin d’être prêt dès le retour à domicile et d’organiser sereinement votre convalescence.",
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
        a: "In many cases, you must keep the prescribed position (often face-down). The goal is to keep the gas bubble pressing on the treated area. Always follow your surgeon’s instructions.",
      },
      {
        q: "When should I order OculaRest?",
        a: "Ideally before surgery, so you’re ready as soon as you return home and can plan recovery with peace of mind.",
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
