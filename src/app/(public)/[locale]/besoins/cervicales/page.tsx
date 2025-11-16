import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Soulager les douleurs cervicales",
    subtitle: "Des solutions ergonomiques adaptées grâce à MassMe.",
    body: ["Texte FR…"],
  },
  en: {
    title: "Relieving neck pain",
    subtitle: "Ergonomic support solutions with MassMe.",
    body: ["EN text…"],
  },
};

export default async function CervicalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="text-lg opacity-80">{t.subtitle}</p>

      {t.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </main>
  );
}
