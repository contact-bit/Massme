import { notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Convalescence après vitrectomie",
    subtitle: "Comment MassMe vous aide après une opération de la vitrectomie.",
    body: [
      "Texte description FR…",
      "Autre paragraphe FR…",
    ],
  },
  en: {
    title: "Vitrectomy recovery",
    subtitle: "How MassMe helps during your post-vitrectomy healing.",
    body: [
      "English description…",
      "Another EN paragraph…",
    ],
  },
} as const;

export default async function VitrectomiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="text-lg opacity-80">{t.subtitle}</p>

      <section className="space-y-4 leading-relaxed">
        {t.body.map((p, i) => <p key={i}>{p}</p>)}
      </section>
    </main>
  );
}
