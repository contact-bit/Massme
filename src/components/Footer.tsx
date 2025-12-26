"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "@/styles/components/footer.css";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

export default function Footer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];
  const locale = rawLocale === "en" ? "en" : "fr";

  const T = {
    fr: {
      desc:
        "Dispositif médical d’accompagnement de la convalescence après vitrectomie.",
      badges: [
        "Dispositif médical certifié CE",
        "Conçu et fabriqué en France",
        "Accompagnement post-opératoire vitrectomie",
      ],
      nav: {
        title: "Navigation",
        links: [
          { label: "Accueil", href: "/fr" },
          { label: "Fonctionnement", href: "/fr/a-propos" },
          { label: "Commander OculaRest", href: "/fr/products" },
        ],
      },
      info: {
        title: "Infos médicales",
        items: [
          "Conforme aux recommandations médicales",
          "Ne remplace pas l’avis de votre ophtalmologue",
        ],
      },
      contact: {
        title: "Contact",
        ship: "Livraison France & Europe",
        email: "contact@ocularest.com",
        country: "France",
      },
      legalLinks: [
        { label: "Mentions légales", href: "/fr/mentions-legales" },
        { label: "Confidentialité", href: "/fr/confidentialite" },
        { label: "CGV", href: "/fr/cgv" },
        { label: "Remboursement", href: "/fr/remboursement" },
      ],
      bottom:
        "© 2025 OculaRest — Tous droits réservés. Dispositif médical destiné à l’accompagnement post-opératoire après vitrectomie.",
    },
    en: {
      desc: "Medical device supporting recovery after vitrectomy.",
      badges: [
        "CE-certified medical device",
        "Designed and made in France",
        "Post-operative vitrectomy support",
      ],
      nav: {
        title: "Navigation",
        links: [
          { label: "Home", href: "/en" },
          { label: "How it works", href: "/en/a-propos" },
          { label: "Order OculaRest", href: "/en/products" },
        ],
      },
      info: {
        title: "Medical info",
        items: [
          "Use in accordance with medical recommendations",
          "Does not replace your ophthalmologist’s advice",
        ],
      },
      contact: {
        title: "Contact",
        ship: "Delivery in France & Europe",
        email: "contact@ocularest.com",
        country: "France",
      },
      legalLinks: [
        { label: "Legal notice", href: "/en/mentions-legales" },
        { label: "Privacy", href: "/en/confidentialite" },
        { label: "Terms (T&C)", href: "/en/cgv" },
        { label: "Refunds", href: "/en/remboursement" },
      ],
      bottom:
        "© 2025 OculaRest — All rights reserved. Medical device intended for post-operative support after vitrectomy.",
    },
  }[locale];

  return (
    <footer className="footer">
      <div className="footer-container footer-compact">
        {/* Brand */}
        <div className="footer-brand">
          <Image src={LOGO_URL} alt="OculaRest" width={140} height={44} />
          <p className="footer-desc">{T.desc}</p>

          <ul className="footer-badges">
            {T.badges.map((b, i) => (
              <li key={i} className="footer-badge">
                ✓ {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <h3>{T.nav.title}</h3>
          <div className="footer-links">
            {T.nav.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Medical */}
        <div className="footer-col">
          <h3>{T.info.title}</h3>
          <ul className="footer-list">
            {T.info.items.map((x, i) => (
              <li key={i}>✓ {x}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3>{T.contact.title}</h3>
          <ul className="footer-list">
            <li>• {T.contact.ship}</li>
            <li>
              ✉ <a href={`mailto:${T.contact.email}`}>{T.contact.email}</a>
            </li>
            <li>📍 {T.contact.country}</li>
          </ul>
        </div>
      </div>

      {/* sub-footer: legal links on one line */}
      <div className="footer-subbar">
        <div className="footer-subbar-inner">
          {T.legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="footer-subbar-link">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer-bottom">{T.bottom}</div>
    </footer>
  );
}
