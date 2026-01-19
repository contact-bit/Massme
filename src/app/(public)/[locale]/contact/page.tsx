import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/* =====================================================
   I18N CONTENT
===================================================== */

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

  it: {
    title: "Contatto",
    subtitle: "Siamo a tua disposizione.",
    form: {
      name: "Nome",
      email: "Email",
      message: "Messaggio",
      submit: "Invia",
    },
    emailLabel: "Email:",
  },

  es: {
    title: "Contacto",
    subtitle: "Estamos a tu disposición.",
    form: {
      name: "Nombre",
      email: "Email",
      message: "Mensaje",
      submit: "Enviar",
    },
    emailLabel: "Email:",
  },

  de: {
    title: "Kontakt",
    subtitle: "Wir sind für Sie da.",
    form: {
      name: "Name",
      email: "E-Mail",
      message: "Nachricht",
      submit: "Senden",
    },
    emailLabel: "E-Mail:",
  },

  nl: {
    title: "Contact",
    subtitle: "Wij staan voor u klaar.",
    form: {
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      submit: "Verzenden",
    },
    emailLabel: "E-mail:",
  },
} as const;

type Locale = keyof typeof CONTENT;

/* =====================================================
   PAGE
===================================================== */

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = CONTENT[locale as Locale];
  if (!t) return notFound();

  return (
    <main className="contact-page">
      {/* HEADER */}
      <header className="contact-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {/* FORM */}
      <form className="contact-form" method="POST" action="#">
        <div className="contact-field">
          <label htmlFor="name">{t.form.name}</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder={t.form.name}
            required
          />
        </div>

        <div className="contact-field">
          <label htmlFor="email">{t.form.email}</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder={t.form.email}
            required
          />
        </div>

        <div className="contact-field">
          <label htmlFor="message">{t.form.message}</label>
          <textarea
            id="message"
            name="message"
            placeholder={t.form.message}
            rows={5}
            required
          />
        </div>

        <button type="submit" className="contact-submit">
          {t.form.submit}
        </button>
      </form>

      {/* DIRECT EMAIL */}
      <div className="contact-email">
        <span>{t.emailLabel}</span>{" "}
        <a href="mailto:contact@massme.fr">contact@massme.fr</a>
      </div>
    </main>
  );
}
