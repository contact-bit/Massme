import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// --- CONTENU FR & EN STRUCTURÉ --- //
const CONTENT = {
  fr: {
    title: "À propos d’OculaRest",
    subtitle:
      "Le dispositif conçu pour accompagner la convalescence après vitrectomie avec injection de gaz",

    sections: [
      {
        heading: "Pourquoi OculaRest a été créé ?",
        text: `
OculaRest est né d’un constat simple : après une vitrectomie avec injection de gaz, le respect strict de la position post-opératoire est essentiel.

Pour de nombreux patients, maintenir cette position pendant plusieurs jours (parfois plus) est difficile. L’inconfort, les tensions cervicales et la fatigue rendent la convalescence plus éprouvante.

OculaRest a été conçu pour faciliter le maintien de la position prescrite tout en améliorant le confort au quotidien.
        `,
      },

      {
        heading: "À quoi sert OculaRest pendant la convalescence ?",
        text: `
OculaRest aide à maintenir plus facilement la posture recommandée par le chirurgien afin d’optimiser les conditions de récupération.

En réduisant les contraintes liées à la position, il permet au patient de mieux tenir la durée nécessaire, avec moins de douleurs et moins de compensations musculaires.

L’objectif est simple : aider le patient à rester correctement positionné, plus longtemps, et dans de meilleures conditions.
        `,
      },

      {
        heading: "Confort et stabilité",
        text: `
OculaRest a été pensé pour offrir un bon maintien, de jour comme de nuit, tout en favorisant une posture plus stable.

Il contribue à diminuer les tensions au niveau du cou et des épaules, souvent liées au maintien prolongé de la position.

Chaque élément a été conçu pour être simple à utiliser et rassurant pendant la période post-opératoire.
        `,
      },

      {
        heading: "Pour qui est conçu OculaRest ?",
        text: `
OculaRest s’adresse aux patients opérés d’une vitrectomie avec injection de gaz, lorsque le chirurgien prescrit une position post-opératoire.

Il est également utile pour les personnes qui souhaitent une solution plus confortable afin de respecter au mieux les recommandations médicales pendant la convalescence.
        `,
      },

      {
        heading: "Important",
        text: `
OculaRest ne remplace pas un avis médical.

La position à respecter, la durée et les consignes dépendent de votre situation et doivent être validées par votre chirurgien ou votre équipe médicale.
        `,
      },
    ],
  },

  /* -------------------- VERSION EN ---------------------- */
  en: {
    title: "About OculaRest",
    subtitle:
      "The device designed to support recovery after vitrectomy with gas injection",

    sections: [
      {
        heading: "Why was OculaRest created?",
        text: `
OculaRest was created from a simple observation: after a vitrectomy with gas injection, strictly maintaining the post-operative position is essential.

For many patients, holding this position for several days (sometimes longer) can be difficult. Discomfort, neck strain and fatigue can make recovery more challenging.

OculaRest was designed to make it easier to maintain the prescribed position while improving everyday comfort.
        `,
      },

      {
        heading: "What is OculaRest used for during recovery?",
        text: `
OculaRest helps patients maintain the position recommended by their surgeon in order to support optimal recovery conditions.

By reducing physical constraints associated with prolonged positioning, it helps patients hold the required posture longer, with less pain and fewer muscular compensations.

The goal is simple: help patients stay correctly positioned for longer periods, in better conditions.
        `,
      },

      {
        heading: "Comfort and stability",
        text: `
OculaRest is designed to provide stable support, day and night, while promoting a more consistent posture.

It can help reduce strain in the neck and shoulders, which often occurs when maintaining the recovery position.

Every detail is designed to be easy to use and reassuring throughout the post-operative period.
        `,
      },

      {
        heading: "Who is OculaRest designed for?",
        text: `
OculaRest is intended for patients who have undergone a vitrectomy with gas injection when a specific post-operative position is prescribed by the surgeon.

It is also helpful for anyone looking for a more comfortable solution to follow medical positioning instructions during recovery.
        `,
      },

      {
        heading: "Important",
        text: `
OculaRest does not replace medical advice.

The position to follow, the duration and instructions depend on your individual case and must be confirmed by your surgeon or medical team.
        `,
      },
    ],
  },
} as const;

// --- PAGE ABOUT --- //
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="about-page">
      <div className="about-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="about-content">
        {t.sections.map((section, index) => (
          <section key={index} className="about-section">
            <h2>{section.heading}</h2>
            {section.text.split("\n").map((p, i) =>
              p.trim() ? <p key={i}>{p.trim()}</p> : null
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
