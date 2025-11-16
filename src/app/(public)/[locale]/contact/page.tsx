import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Contact",
    subtitle: "Nous sommes à votre écoute.",
    form: {
      name: "Nom",
      email: "Email",
      message: "Message",
      submit: "Envoyer",
    },
  },
  en: {
    title: "Contact",
    subtitle: "We're here to help you.",
    form: {
      name: "Name",
      email: "Email",
      message: "Message",
      submit: "Send",
    },
  },
} as const;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-semibold">{t.title}</h1>
        <p className="text-lg opacity-80">{t.subtitle}</p>
      </header>

      <form
        className="space-y-6 bg-white shadow-md p-8 rounded-xl border"
        method="POST"
        action="#"
      >
        <div className="space-y-2">
          <label className="block font-medium">{t.form.name}</label>
          <input
            type="text"
            name="name"
            className="w-full border rounded-lg px-4 py-2"
            placeholder={t.form.name}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">{t.form.email}</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded-lg px-4 py-2"
            placeholder={t.form.email}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">{t.form.message}</label>
          <textarea
            name="message"
            className="w-full border rounded-lg px-4 py-2 h-32 resize-none"
            placeholder={t.form.message}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          {t.form.submit}
        </button>
      </form>

      <div className="text-center opacity-70 text-sm">
        Email :{" "}
        <a
          href="mailto:contact@massme.fr"
          className="underline hover:text-black"
        >
          contact@massme.fr
        </a>
      </div>
    </main>
  );
}
