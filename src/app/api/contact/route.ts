import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

/* =====================================================
   I18N EMAIL TEMPLATES
===================================================== */

const EMAIL_CONTENT = {
  fr: {
    subject: "📩 Nouvelle demande de contact",
    title: "Nouvelle demande de contact",
    labels: {
      name: "Nom",
      email: "Email",
      message: "Message",
    },
  },
  en: {
    subject: "📩 New contact request",
    title: "New contact request",
    labels: {
      name: "Name",
      email: "Email",
      message: "Message",
    },
  },
  it: {
    subject: "📩 Nuova richiesta di contatto",
    title: "Nuova richiesta di contatto",
    labels: {
      name: "Nome",
      email: "Email",
      message: "Messaggio",
    },
  },
  es: {
    subject: "📩 Nueva solicitud de contacto",
    title: "Nueva solicitud de contacto",
    labels: {
      name: "Nombre",
      email: "Email",
      message: "Mensaje",
    },
  },
  de: {
    subject: "📩 Neue Kontaktanfrage",
    title: "Neue Kontaktanfrage",
    labels: {
      name: "Name",
      email: "E-Mail",
      message: "Nachricht",
    },
  },
  nl: {
    subject: "📩 Nieuw contactverzoek",
    title: "Nieuw contactverzoek",
    labels: {
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
    },
  },
} as const;

type Locale = keyof typeof EMAIL_CONTENT;

/* =====================================================
   POST
===================================================== */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, locale = "fr" } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const t = EMAIL_CONTENT[locale as Locale] ?? EMAIL_CONTENT.fr;

    await resend.emails.send({
      from: "Massme • Contact <contact@hdconnects.com>",
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: t.subject,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>${t.title}</h2>
          <p><b>${t.labels.name} :</b> ${name}</p>
          <p><b>${t.labels.email} :</b> ${email}</p>
          <hr />
          <p><b>${t.labels.message} :</b></p>
          <p style="white-space:pre-line">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Contact email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
