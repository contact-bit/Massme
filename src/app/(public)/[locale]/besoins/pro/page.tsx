import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Usage professionnel",
    subtitle: "MassMe pour les kinés, esthéticiennes et thérapeutes.",
    body: ["Texte FR…"],
  },
  en: {
    title: "Professional use",
    subtitle: "MassMe for physiotherapists, estheticians and therapists.",
    body: ["EN text…"],
  },
};

export default async function ProPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="text-lg opacity-80">{t.subtitle}</p>
      {t.body.map((p, i) => <p key={i}>{p}</p>)}
    </main>
  );
}
