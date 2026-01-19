"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const CONTENT = {
  fr: {
    title: "Contact",
    subtitle: "Nous sommes à votre écoute.",
    form: {
      name: "Nom",
      email: "Email",
      message: "Message",
      submit: "Envoyer",
      success: "Message envoyé avec succès ✅",
      error: "Une erreur est survenue ❌",
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
      success: "Message sent successfully ✅",
      error: "Something went wrong ❌",
    },
  },
  it: {
    title: "Contatto",
    subtitle: "Siamo a tua disposizione.",
    form: {
      name: "Nome",
      email: "Email",
      message: "Messaggio",
      submit: "Invia",
      success: "Messaggio inviato con successo ✅",
      error: "Si è verificato un errore ❌",
    },
  },
  es: {
    title: "Contacto",
    subtitle: "Estamos a tu disposición.",
    form: {
      name: "Nombre",
      email: "Email",
      message: "Mensaje",
      submit: "Enviar",
      success: "Mensaje enviado correctamente ✅",
      error: "Ocurrió un error ❌",
    },
  },
  de: {
    title: "Kontakt",
    subtitle: "Wir sind für Sie da.",
    form: {
      name: "Name",
      email: "E-Mail",
      message: "Nachricht",
      submit: "Senden",
      success: "Nachricht erfolgreich gesendet ✅",
      error: "Ein Fehler ist aufgetreten ❌",
    },
  },
  nl: {
    title: "Contact",
    subtitle: "Wij staan voor u klaar.",
    form: {
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      submit: "Verzenden",
      success: "Bericht succesvol verzonden ✅",
      error: "Er is een fout opgetreden ❌",
    },
  },
} as const;

type Locale = keyof typeof CONTENT;

export default function ContactPage() {
  const pathname = usePathname();
  const locale = (pathname?.split("/")[1] as Locale) || "fr";
  const t = CONTENT[locale];

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
        locale,
      }),
    });

    setLoading(false);
    setStatus(res.ok ? "success" : "error");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <main className="contact-page">
      <header className="contact-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input name="name" placeholder={t.form.name} required />
        <input name="email" type="email" placeholder={t.form.email} required />
        <textarea name="message" placeholder={t.form.message} required />

        <button type="submit" disabled={loading}>
          {loading ? "..." : t.form.submit}
        </button>

        {status === "success" && <p className="success">{t.form.success}</p>}
        {status === "error" && <p className="error">{t.form.error}</p>}
      </form>
    </main>
  );
}
