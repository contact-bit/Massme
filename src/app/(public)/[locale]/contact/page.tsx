"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const CONTENT = {
  fr: {
    brand: "VitectroMed",
    title: "Contact VitectroMed",
    subtitle:
      "Une question sur le dispositif VitectroMed, votre commande ou la livraison ?",
    seoIntro:
      "Ce formulaire de contact vous permet de joindre directement l’équipe VitectroMed. Expliquez votre situation (vitrectomie, convalescence, utilisation du dispositif, commande, livraison), nous vous répondons dans les meilleurs délais.",
    helpTitle: "Pourquoi contacter VitectroMed ?",
    helpBullets: [
      "Obtenir des précisions sur l’utilisation du dispositif VitectroMed après vitrectomie.",
      "Poser une question sur la commande, la facture, la livraison ou un retour.",
      "Recevoir des informations sur les modèles, options et prix selon votre pays.",
    ],
    medicalNote:
      "Important : VitectroMed ne remplace jamais l’avis de votre ophtalmologue. Pour une urgence médicale, contactez immédiatement un professionnel de santé ou les services d’urgence.",
    emailLabel: "Adresse e‑mail de contact",
    email: "contact@vitectromed.com",
    form: {
      name: "Nom complet",
      email: "Adresse e‑mail",
      message: "Votre message détaillé",
      submit: "Envoyer mon message",
      success:
        "Message envoyé avec succès ✅ L’équipe VitectroMed vous répondra rapidement.",
      error:
        "Une erreur est survenue ❌. Merci de réessayer ou d’écrire à l’adresse e‑mail ci‑dessous.",
    },
  },
  en: {
    brand: "VitectroMed",
    title: "Contact VitectroMed",
    subtitle:
      "Questions about the VitectroMed device, your order or delivery?",
    seoIntro:
      "Use this contact form to reach the VitectroMed team directly. Describe your situation (vitrectomy recovery, device usage, order or shipping question) and we will get back to you as soon as possible.",
    helpTitle: "Why contact VitectroMed?",
    helpBullets: [
      "Get clear instructions on how to use the VitectroMed positioning device after vitrectomy.",
      "Ask about your order, invoice, delivery status or product return.",
      "Request information about models, options and pricing for your country.",
    ],
    medicalNote:
      "Important: VitectroMed does not replace medical advice. For emergencies, always contact your ophthalmologist or local emergency services.",
    emailLabel: "Contact e‑mail address",
    email: "contact@vitectromed.com",
    form: {
      name: "Full name",
      email: "Email address",
      message: "Your detailed message",
      submit: "Send my message",
      success:
        "Message sent successfully ✅ The VitectroMed team will answer you soon.",
      error:
        "Something went wrong ❌. Please try again or use the direct e‑mail address below.",
    },
  },
  es: {
    brand: "VitectroMed",
    title: "Contacto VitectroMed",
    subtitle:
      "¿Tienes alguna pregunta sobre el dispositivo VitectroMed, tu pedido o el envío?",
    seoIntro:
      "Utiliza este formulario de contacto para escribir directamente al equipo de VitectroMed. Explica tu situación (vitrectomía, recuperación, uso del dispositivo, pedido, entrega) y te responderemos lo antes posible.",
    helpTitle: "¿Por qué contactar con VitectroMed?",
    helpBullets: [
      "Recibir indicaciones claras sobre el uso del dispositivo VitectroMed después de una vitrectomía.",
      "Preguntar sobre tu pedido, factura, plazo de entrega o devolución.",
      "Solicitar información sobre modelos, opciones y precios según tu país.",
    ],
    medicalNote:
      "Importante: VitectroMed no sustituye el consejo médico. En caso de urgencia, contacta siempre con tu oftalmólogo o con los servicios de emergencia.",
    emailLabel: "Correo electrónico de contacto",
    email: "contact@vitectromed.com",
    form: {
      name: "Nombre completo",
      email: "Correo electrónico",
      message: "Tu mensaje detallado",
      submit: "Enviar mi mensaje",
      success:
        "Mensaje enviado correctamente ✅ El equipo de VitectroMed te contestará en breve.",
      error:
        "Se ha producido un error ❌. Inténtalo de nuevo o utiliza el correo electrónico indicado más abajo.",
    },
  },
  de: {
    brand: "VitectroMed",
    title: "Kontakt VitectroMed",
    subtitle:
      "Fragen zum VitectroMed‑Hilfsmittel, zu Ihrer Bestellung oder zur Lieferung?",
    seoIntro:
      "Über dieses Kontaktformular erreichen Sie direkt das VitectroMed‑Team. Schildern Sie Ihre Situation (Vitrektomie, Lagerung, Bestellung, Versand), wir melden uns so schnell wie möglich.",
    helpTitle: "Warum VitectroMed kontaktieren?",
    helpBullets: [
      "Erhalten Sie klare Hinweise zur Anwendung des VitectroMed‑Hilfsmittels nach einer Vitrektomie.",
      "Stellen Sie Fragen zu Bestellung, Rechnung, Lieferstatus oder Rücksendung.",
      "Fordern Sie Informationen zu Modellen, Optionen und Preisen in Ihrem Land an.",
    ],
    medicalNote:
      "Wichtig: VitectroMed ersetzt nicht die Beratung durch Ihren Augenarzt. In Notfällen wenden Sie sich immer an medizinisches Fachpersonal oder den Notruf.",
    emailLabel: "Kontakt‑E‑Mail‑Adresse",
    email: "contact@vitectromed.com",
    form: {
      name: "Vollständiger Name",
      email: "E‑Mail‑Adresse",
      message: "Ihre ausführliche Nachricht",
      submit: "Meine Nachricht senden",
      success:
        "Nachricht erfolgreich gesendet ✅ Das VitectroMed‑Team meldet sich in Kürze bei Ihnen.",
      error:
        "Es ist ein Fehler aufgetreten ❌. Bitte versuchen Sie es erneut oder nutzen Sie die unten angegebene E‑Mail‑Adresse.",
    },
  },
  it: {
    brand: "VitectroMed",
    title: "Contatto VitectroMed",
    subtitle:
      "Hai domande sul dispositivo VitectroMed, sul tuo ordine o sulla spedizione?",
    seoIntro:
      "Usa questo modulo di contatto per scrivere direttamente al team VitectroMed. Descrivi la tua situazione (vitrectomia, convalescenza, uso del dispositivo, ordine, consegna) e ti risponderemo il prima possibile.",
    helpTitle: "Perché contattare VitectroMed?",
    helpBullets: [
      "Ricevere istruzioni chiare sull’utilizzo del dispositivo VitectroMed dopo la vitrectomia.",
      "Fare domande su ordine, fattura, tempi di consegna o reso.",
      "Richiedere informazioni su modelli, opzioni e prezzi in base al tuo paese.",
    ],
    medicalNote:
      "Importante: VitectroMed non sostituisce mai il parere del tuo oculista. In caso di urgenza medica, contatta subito un professionista sanitario o i servizi di emergenza.",
    emailLabel: "Indirizzo e‑mail di contatto",
    email: "contact@vitectromed.com",
    form: {
      name: "Nome completo",
      email: "Indirizzo e‑mail",
      message: "Il tuo messaggio dettagliato",
      submit: "Invia il mio messaggio",
      success:
        "Messaggio inviato con successo ✅ Il team VitectroMed ti risponderà al più presto.",
      error:
        "Si è verificato un errore ❌. Riprova oppure utilizza l’indirizzo e‑mail indicato qui sotto.",
    },
  },
  nl: {
    brand: "VitectroMed",
    title: "Contact VitectroMed",
    subtitle:
      "Vragen over het VitectroMed‑hulpmiddel, uw bestelling of de levering?",
    seoIntro:
      "Gebruik dit contactformulier om rechtstreeks het VitectroMed‑team te bereiken. Beschrijf uw situatie (vitrectomie, herstel, gebruik van het hulpmiddel, bestelling, levering) en wij antwoorden zo snel mogelijk.",
    helpTitle: "Waarom contact opnemen met VitectroMed?",
    helpBullets: [
      "Heldere uitleg ontvangen over het gebruik van het VitectroMed‑hulpmiddel na een vitrectomie.",
      "Vragen stellen over bestelling, factuur, levertermijnen of retour.",
      "Informatie aanvragen over modellen, opties en prijzen per land.",
    ],
    medicalNote:
      "Belangrijk: VitectroMed vervangt nooit medisch advies. Neem bij spoed altijd contact op met uw oogarts of de hulpdiensten.",
    emailLabel: "E‑mailadres voor contact",
    email: "contact@vitectromed.com",
    form: {
      name: "Volledige naam",
      email: "E‑mailadres",
      message: "Uw uitgebreide bericht",
      submit: "Mijn bericht versturen",
      success:
        "Bericht succesvol verzonden ✅ Het VitectroMed‑team neemt snel contact met u op.",
      error:
        "Er is een fout opgetreden ❌. Probeer het opnieuw of gebruik het onderstaande e‑mailadres.",
    },
  },
} as const;

type Locale = keyof typeof CONTENT;

export default function ContactPage() {
  const pathname = usePathname();
  const raw = (pathname?.split("/")[1] || "fr") as Locale;
  const locale: Locale = CONTENT[raw] ? raw : "fr";
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
    <main className="contact-page" aria-labelledby="contact-title">
      <header className="contact-header">
        <p className="contact-eyebrow">{t.brand} · Vitrectomy support</p>
        <h1 id="contact-title">{t.title}</h1>
        <p className="contact-subtitle">{t.subtitle}</p>
        <p className="contact-seo-intro">{t.seoIntro}</p>
      </header>

      <section className="contact-layout">
        {/* Formulaire */}
        <form
          className="contact-form"
          onSubmit={handleSubmit}
          aria-describedby="contact-help"
        >
          <div className="contact-field">
            <label htmlFor="contact-name">{t.form.name}</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">{t.form.email}</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">{t.form.message}</label>
            <textarea
              id="contact-message"
              name="message"
              required
            />
          </div>

          <button
            type="submit"
            className="contact-submit"
            disabled={loading}
          >
            {loading ? "…" : t.form.submit}
          </button>

          {status === "success" && (
            <p className="contact-status contact-status--success">
              {t.form.success}
            </p>
          )}
          {status === "error" && (
            <p className="contact-status contact-status--error">
              {t.form.error}
            </p>
          )}
        </form>

        {/* Colonne infos / SEO */}
        <aside className="contact-aside">
          <h2 className="contact-aside-title">{t.helpTitle}</h2>
          <ul id="contact-help" className="contact-aside-list">
            {t.helpBullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p className="contact-medical-note">{t.medicalNote}</p>

          <div className="contact-email">
            <span>{t.emailLabel} :</span>
            <a href={`mailto:${t.email}`}>{t.email}</a>
          </div>
        </aside>
      </section>
    </main>
  );
}
