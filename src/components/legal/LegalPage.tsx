import type { ReactNode } from "react";
import Link from "next/link";

import { LEGAL_IDENTITY } from "@/lib/legalIdentity";

import "./legal-page.css";

export function LegalPage({
  locale,
  eyebrow,
  title,
  intro,
  children,
}: {
  locale: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="legal-page">
      <header className="legal-hero">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <small>Dernière mise à jour : 28 juin 2026</small>
      </header>

      {locale !== "fr" && (
        <p className="legal-language-note">
          Ce document juridique est actuellement fourni en français. La version
          française constitue la version de référence.
        </p>
      )}

      <div className="legal-content">{children}</div>

      <footer className="legal-footer-note">
        <p>
          Pour toute question, écrivez à{" "}
          <a href={`mailto:${LEGAL_IDENTITY.email}`}>
            {LEGAL_IDENTITY.email}
          </a>
          .
        </p>
        <Link href={`/${locale}`}>Retour à l’accueil</Link>
      </footer>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
