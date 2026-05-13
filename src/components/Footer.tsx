"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "../styles/shop/components/footer.css";

/* ------------------------------------------
   🌍 LOGO
------------------------------------------ */
const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/5112d871-7854-47e2-2838-1790ba171700/public";

/* ------------------------------------------
   🌍 LOCALES
------------------------------------------ */
type Locale = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";

const SUPPORTED_LOCALES: Locale[] = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
  "pt",
];

/* ------------------------------------------
   🌍 TRADUCTIONS FOOTER
------------------------------------------ */
const CONTENT: Record<
  Locale,
  {
    desc: string;
    badges: string[];
    nav: {
      title: string;
      links: { label: string; href: string }[];
    };
    info: {
      title: string;
      items: string[];
    };
    contact: {
      title: string;
      ship: string;
      email: string;
      country: string;
    };
    legalLinks: { label: string; href: string }[];
    bottom: string;
  }
> = {
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
        { label: "Commander VitectroMed", href: "/fr/products" },
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
      email: "contact@vitectromed.com",
      country: "France",
    },
    legalLinks: [
      { label: "Mentions légales", href: "/fr/mentions-legales" },
      { label: "Confidentialité", href: "/fr/confidentialite" },
      { label: "CGV", href: "/fr/cgv" },
      { label: "Remboursement", href: "/fr/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Tous droits réservés. Dispositif médical destiné à l’accompagnement post-opératoire après vitrectomie.",
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
        { label: "Order VitectroMed", href: "/en/products" },
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
      ship: "Delivery in Europe",
      email: "contact@vitectromed.com",
      country: "France",
    },
    legalLinks: [
      { label: "Legal notice", href: "/en/mentions-legales" },
      { label: "Privacy", href: "/en/confidentialite" },
      { label: "Terms & Conditions", href: "/en/cgv" },
      { label: "Refunds", href: "/en/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — All rights reserved. Medical device for post-operative vitrectomy recovery.",
  },

  es: {
    desc:
      "Dispositivo médico para apoyar la recuperación tras una vitrectomía.",
    badges: [
      "Dispositivo médico con certificación CE",
      "Diseñado y fabricado en Francia",
      "Soporte postoperatorio de vitrectomía",
    ],
    nav: {
      title: "Navegación",
      links: [
        { label: "Inicio", href: "/es" },
        { label: "Funcionamiento", href: "/es/a-propos" },
        { label: "Comprar VitectroMed", href: "/es/products" },
      ],
    },
    info: {
      title: "Información médica",
      items: [
        "Cumple las recomendaciones médicas",
        "No sustituye el consejo del oftalmólogo",
      ],
    },
    contact: {
      title: "Contacto",
      ship: "Envíos en Europa",
      email: "contact@vitectromed.com",
      country: "Francia",
    },
    legalLinks: [
      { label: "Aviso legal", href: "/es/mentions-legales" },
      { label: "Privacidad", href: "/es/confidentialite" },
      { label: "Condiciones", href: "/es/cgv" },
      { label: "Reembolsos", href: "/es/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Todos los derechos reservados.",
  },

  de: {
    desc:
      "Medizinisches Gerät zur Unterstützung der Genesung nach Vitrektomie.",
    badges: [
      "CE-zertifiziertes Medizinprodukt",
      "Entwickelt und hergestellt in Frankreich",
      "Postoperative Vitrektomie-Unterstützung",
    ],
    nav: {
      title: "Navigation",
      links: [
        { label: "Startseite", href: "/de" },
        { label: "Funktionsweise", href: "/de/a-propos" },
        { label: "VitectroMed bestellen", href: "/de/products" },
      ],
    },
    info: {
      title: "Medizinische Infos",
      items: [
        "Gemäß medizinischen Empfehlungen",
        "Ersetzt nicht den Rat Ihres Augenarztes",
      ],
    },
    contact: {
      title: "Kontakt",
      ship: "Lieferung in Europa",
      email: "contact@vitectromed.com",
      country: "Frankreich",
    },
    legalLinks: [
      { label: "Impressum", href: "/de/mentions-legales" },
      { label: "Datenschutz", href: "/de/confidentialite" },
      { label: "AGB", href: "/de/cgv" },
      { label: "Rückerstattung", href: "/de/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Alle Rechte vorbehalten.",
  },

  it: {
    desc:
      "Dispositivo medico per supportare il recupero dopo vitrectomia.",
    badges: [
      "Dispositivo medico certificato CE",
      "Progettato e prodotto in Francia",
      "Supporto post-operatorio vitrectomia",
    ],
    nav: {
      title: "Navigazione",
      links: [
        { label: "Home", href: "/it" },
        { label: "Funzionamento", href: "/it/a-propos" },
        { label: "Acquista VitectroMed", href: "/it/products" },
      ],
    },
    info: {
      title: "Info mediche",
      items: [
        "Conforme alle raccomandazioni mediche",
        "Non sostituisce il parere medico",
      ],
    },
    contact: {
      title: "Contatto",
      ship: "Spedizione in Europa",
      email: "contact@vitectromed.com",
      country: "Francia",
    },
    legalLinks: [
      { label: "Note legali", href: "/it/mentions-legales" },
      { label: "Privacy", href: "/it/confidentialite" },
      { label: "Condizioni", href: "/it/cgv" },
      { label: "Rimborsi", href: "/it/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Tutti i diritti riservati.",
  },

  nl: {
    desc:
      "Medisch hulpmiddel ter ondersteuning van herstel na vitrectomie.",
    badges: [
      "CE-gecertificeerd medisch hulpmiddel",
      "Ontworpen en gemaakt in Frankrijk",
      "Postoperatieve vitrectomie-ondersteuning",
    ],
    nav: {
      title: "Navigatie",
      links: [
        { label: "Home", href: "/nl" },
        { label: "Werking", href: "/nl/a-propos" },
        { label: "VitectroMed bestellen", href: "/nl/products" },
      ],
    },
    info: {
      title: "Medische info",
      items: [
        "Conform medische aanbevelingen",
        "Vervangt geen medisch advies",
      ],
    },
    contact: {
      title: "Contact",
      ship: "Levering in Europa",
      email: "contact@vitectromed.com",
      country: "Frankrijk",
    },
    legalLinks: [
      { label: "Juridische info", href: "/nl/mentions-legales" },
      { label: "Privacy", href: "/nl/confidentialite" },
      { label: "Voorwaarden", href: "/nl/cgv" },
      { label: "Terugbetaling", href: "/nl/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Alle rechten voorbehouden.",
  },

  pt: {
    desc:
      "Dispositivo médico para apoiar a recuperação após vitrectomia.",
    badges: [
      "Dispositivo médico certificado CE",
      "Projetado e fabricado na França",
      "Suporte pós-operatório de vitrectomia",
    ],
    nav: {
      title: "Navegação",
      links: [
        { label: "Início", href: "/pt" },
        { label: "Funcionamento", href: "/pt/a-propos" },
        { label: "Comprar VitectroMed", href: "/pt/products" },
      ],
    },
    info: {
      title: "Informações médicas",
      items: [
        "Conforme recomendações médicas",
        "Não substitui aconselhamento médico",
      ],
    },
    contact: {
      title: "Contato",
      ship: "Envio para a Europa",
      email: "contact@vitectromed.com",
      country: "França",
    },
    legalLinks: [
      { label: "Aviso legal", href: "/pt/mentions-legales" },
      { label: "Privacidade", href: "/pt/confidentialite" },
      { label: "Condições", href: "/pt/cgv" },
      { label: "Reembolsos", href: "/pt/remboursement" },
    ],
    bottom:
      "© 2025 VitectroMed — Todos os direitos reservados.",
  },
};

/* ------------------------------------------
   🦶 FOOTER
------------------------------------------ */
export default function Footer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];

  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";

  const T = CONTENT[locale];

  return (
    <footer className="footer">
      <div className="footer-container footer-compact">
        {/* Brand */}
        <div className="footer-brand">
          <Image src={LOGO_URL} alt="VitectroMed" width={140} height={44} />
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

      {/* Legal links */}
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
