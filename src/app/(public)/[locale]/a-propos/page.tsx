import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// --- CONTENU FR & EN STRUCTURÉ --- //
const CONTENT = {
  fr: {
    title: "À propos de MassMe",
    subtitle: "L’appui-tête universel de massage et de relaxation — conçu, fabriqué & assemblé en France",

    sections: [
      {
        heading: "Comment est né MassMe ?",
        text: `
MassMe est né d’une conviction simple : le massage, la relaxation et le bon positionnement du corps améliorent profondément le bien-être et la qualité de vie.

Très rapidement, nous avons réalisé que la posture du massé est aussi importante que les mains du masseur.

À domicile, impossible d'obtenir une position comparable à celle d’une table de massage professionnelle : torsions cervicales, respiration comprimée, muscles qui ne se relâchent pas, inconfort.

Nous avons donc décidé de réinventer la posture.

Notre objectif : créer un appui-tête universel permettant d’éviter les torsions cervicales, de favoriser un relâchement musculaire profond, de permettre une respiration fluide, et d’apporter une ergonomie professionnelle directement à la maison.

Ainsi est né MassMe : un appui-tête innovant, compatible avec tous les lits et toutes les hauteurs de matelas, sans installation complexe.
        `,
      },

      {
        heading: "Notre mission",
        text: `
Aujourd’hui, LazurCo – notre start-up basée à Nice – conçoit des appuis-tête adaptés à la relaxation, au massage, au bien-être au travail, à la convalescence post-vitrectomie et au soulagement des douleurs cervicales.

Notre mission : rendre le bien-être accessible, ergonomique et efficace pour tous.
        `,
      },

      {
        heading: "Un produit éco-responsable",
        text: `
Nos valeurs guident chacune de nos créations :

• Production raisonnée et fabrication française  
• Réduction de l’impact carbone grâce à des matériaux locaux  
• Conformité REACH garantissant sécurité et durabilité  
• Emballages recyclables et encres végétales  
• Collaboration avec le réseau Citéo

MassMe est pensé pour durer, pour respecter les utilisateurs et l’environnement.
        `,
      },

      {
        heading: "Comment utiliser MassMe au quotidien ?",
        text: `
MassMe transforme l’expérience du massage à la maison :

• Alignement naturel de la tête et de la colonne  
• Respiration fluide  
• Relâchement musculaire total  
• Fini les torsions cervicales  
• Réglage de la hauteur et de l’inclinaison  
• Compatible avec tous les lits

Il est aussi idéal pour les professionnels du massage, les spas, les hôtels, les locations saisonnières, les entreprises et les collectivités.

Sur un bureau, MassMe devient un outil de bien-être au travail permettant une pause ressourçante à tout moment.
        `,
      },

      {
        heading: "Le fondateur",
        text: `
« J’ai créé MassMe pour apporter à chacun un accès simple, ergonomique et professionnel au bien-être. »

— Olivier PETRI, Fondateur de LazurCo
        `,
      },
    ],
  },

  /* -------------------- VERSION EN ---------------------- */
  en: {
    title: "About MassMe",
    subtitle: "The universal headrest for massage & relaxation — designed, manufactured & assembled in France",

    sections: [
      {
        heading: "How was MassMe created?",
        text: `
MassMe was born from a simple belief: massage, relaxation and proper body alignment significantly improve comfort and well-being.

At home, achieving the ergonomics of a professional massage table is nearly impossible: neck torsion, restricted breathing and limited muscle release.

We wanted to change that.

Our goal was to create a universal ergonomic headrest that prevents cervical torsion, enhances muscle relaxation, allows natural breathing and offers professional-grade comfort at home.

MassMe is compatible with any bed, any mattress height, and requires no complex installation.
        `,
      },
      {
        heading: "Our mission",
        text: `
LazurCo, our company based in Nice (France), designs headrests dedicated to relaxation, massage, workplace wellbeing, post-vitrectomy recovery and cervical pain relief.

Our mission: making well-being accessible, ergonomic and effective for everyone.
        `,
      },
      {
        heading: "Eco-responsible manufacturing",
        text: `
Our values lead each creation:

• French manufacturing & local suppliers  
• Low-carbon materials  
• REACH-compliant components  
• Recyclable packaging with vegetable inks  
• Partnership with Citéo

MassMe is built to last, respectful of both users and the planet.
        `,
      },
      {
        heading: "Daily use of MassMe",
        text: `
MassMe improves the massage experience at home:

• Natural head & spine alignment  
• Comfortable breathing  
• Deep muscular relaxation  
• No more neck pain  
• Adjustable height & angle  
• Fits any bed

Perfect for massage therapists, spas, hotels, rentals, companies and wellness rooms.

On a desk, MassMe becomes a workplace-wellness tool for restorative micro-breaks.
        `,
      },
      {
        heading: "The founder",
        text: `
“I created MassMe to offer everyone a simple, ergonomic and professional access to well-being.”

— Olivier PETRI, Founder of LazurCo
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
