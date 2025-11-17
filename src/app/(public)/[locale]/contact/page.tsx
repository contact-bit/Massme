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
    emailLabel: "Email :",
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
    emailLabel: "Email:",
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
    <main className="contact-page">

      {/* HEADER */}
      <header className="contact-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {/* FORMULAIRE */}
      <form className="contact-form" method="POST" action="#">
        <div className="contact-field">
          <label>{t.form.name}</label>
          <input type="text" name="name" placeholder={t.form.name} />
        </div>

        <div className="contact-field">
          <label>{t.form.email}</label>
          <input type="email" name="email" placeholder={t.form.email} />
        </div>

        <div className="contact-field">
          <label>{t.form.message}</label>
          <textarea name="message" placeholder={t.form.message} />
        </div>

        <button type="submit" className="contact-submit">
          {t.form.submit}
        </button>
      </form>

      {/* EMAIL DIRECT */}
      <div className="contact-email">
        {t.emailLabel}
        <a href="mailto:contact@massme.fr">contact@massme.fr</a>
      </div>
    </main>
  );
}
