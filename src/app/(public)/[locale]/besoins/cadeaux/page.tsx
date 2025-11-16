import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Idées cadeaux",
    subtitle: "Offrez du bien-être à vos proches.",
    body: ["Texte FR…"],
  },
  en: {
    title: "Gift ideas",
    subtitle: "A perfect wellness gift for your loved ones.",
    body: ["EN text…"],
  },
};

export default async function CadeauxPage({ params }: { params: Promise<{ locale: string }> }) {
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
