import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// --- Contenu FR & EN --- //
const CONTENT = {
  fr: {
    title: "À propos de MassMe",
    subtitle: "Têtière de massage et de convalescence",
    body: [
      "Paragraphe 1 en français...",
      "Paragraphe 2 en français...",
    ],
  },
  en: {
    title: "About MassMe",
    subtitle: "Massage and recovery headrest",
    body: [
      "Paragraph 1 in English...",
      "Paragraph 2 in English...",
    ],
  },
} as const;

// --- IMPORTANT : params est un Promise dans Next.js 16 --- //
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // <= OBLIGATOIRE

  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="text-lg opacity-80">{t.subtitle}</p>
      </header>

      <section className="space-y-4 leading-relaxed">
        {t.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>
    </main>
  );
}
