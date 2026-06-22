"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
  Youtube,
} from "lucide-react";

import { LOGO_URL } from "@/components/navbar/navbar.data";

import "../styles/shop/components/footer.css";

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

const CONTENT: Record<
  Locale,
  {
    about: string;
    resources: string;
    information: string;
    contact: string;
    medicalNotice: string;
    contactEmail: string;
    press: string;
    copyright: string;
    tagline: string;
    socialAria: string;
    aboutLinks: Array<{ label: string; href: string }>;
    resourceLinks: Array<{ label: string; href: string }>;
    infoLinks: Array<{ label: string; href: string }>;
  }
> = {
  fr: {
    about: "À propos",
    resources: "Ressources",
    information: "Informations",
    contact: "Contact",
    medicalNotice:
      "VitrectoMed accompagne les patients dans la compréhension de la vitrectomie et la récupération post-opératoire.",
    contactEmail: "Nous écrire",
    press: "Presse",
    copyright: "© 2026 VitrectoMed — Tous droits réservés.",
    tagline: "Comprendre. Se préparer. Récupérer.",
    socialAria: "Réseaux sociaux",
    aboutLinks: [
      { label: "Notre mission", href: "" },
      { label: "Comité éditorial", href: "/contact" },
      { label: "Méthodologie", href: "/blog" },
      { label: "Références médicales", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Guides pratiques", href: "/blog" },
      { label: "Vidéos explicatives", href: "/operation" },
      { label: "Témoignages patients", href: "/temoignage" },
      { label: "Questions fréquentes", href: "/faq" },
    ],
    infoLinks: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "CGU", href: "/cgu" },
    ],
  },
  en: {
    about: "About",
    resources: "Resources",
    information: "Information",
    contact: "Contact",
    medicalNotice:
      "VitrectoMed helps patients understand vitrectomy and post-operative recovery.",
    contactEmail: "Email us",
    press: "Press",
    copyright: "© 2026 VitrectoMed — All rights reserved.",
    tagline: "Understand. Prepare. Recover.",
    socialAria: "Social media",
    aboutLinks: [
      { label: "Our mission", href: "" },
      { label: "Editorial board", href: "/contact" },
      { label: "Methodology", href: "/blog" },
      { label: "Medical references", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Practical guides", href: "/blog" },
      { label: "Explainer videos", href: "/operation" },
      { label: "Patient stories", href: "/temoignage" },
      { label: "Frequently asked questions", href: "/faq" },
    ],
    infoLinks: [
      { label: "Legal notice", href: "/mentions-legales" },
      { label: "Privacy policy", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Terms of use", href: "/cgu" },
    ],
  },
  es: {
    about: "Acerca de",
    resources: "Recursos",
    information: "Información",
    contact: "Contacto",
    medicalNotice:
      "VitrectoMed ayuda a los pacientes a comprender la vitrectomía y la recuperación postoperatoria.",
    contactEmail: "Escríbenos",
    press: "Prensa",
    copyright: "© 2026 VitrectoMed — Todos los derechos reservados.",
    tagline: "Comprender. Prepararse. Recuperarse.",
    socialAria: "Redes sociales",
    aboutLinks: [
      { label: "Nuestra misión", href: "" },
      { label: "Comité editorial", href: "/contact" },
      { label: "Metodología", href: "/blog" },
      { label: "Referencias médicas", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Guías prácticas", href: "/blog" },
      { label: "Vídeos explicativos", href: "/operation" },
      { label: "Testimonios de pacientes", href: "/temoignage" },
      { label: "Preguntas frecuentes", href: "/faq" },
    ],
    infoLinks: [
      { label: "Aviso legal", href: "/mentions-legales" },
      { label: "Política de privacidad", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Condiciones de uso", href: "/cgu" },
    ],
  },
  de: {
    about: "Über uns",
    resources: "Ressourcen",
    information: "Informationen",
    contact: "Kontakt",
    medicalNotice:
      "VitrectoMed hilft Patienten, die Vitrektomie und die postoperative Erholung besser zu verstehen.",
    contactEmail: "E-Mail senden",
    press: "Presse",
    copyright: "© 2026 VitrectoMed — Alle Rechte vorbehalten.",
    tagline: "Verstehen. Vorbereiten. Erholen.",
    socialAria: "Soziale Netzwerke",
    aboutLinks: [
      { label: "Unsere Mission", href: "" },
      { label: "Redaktionsbeirat", href: "/contact" },
      { label: "Methodik", href: "/blog" },
      { label: "Medizinische Referenzen", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Praktische Leitfäden", href: "/blog" },
      { label: "Erklärvideos", href: "/operation" },
      { label: "Patientenerfahrungen", href: "/temoignage" },
      { label: "Häufige Fragen", href: "/faq" },
    ],
    infoLinks: [
      { label: "Impressum", href: "/mentions-legales" },
      { label: "Datenschutzerklärung", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Nutzungsbedingungen", href: "/cgu" },
    ],
  },
  it: {
    about: "Chi siamo",
    resources: "Risorse",
    information: "Informazioni",
    contact: "Contatto",
    medicalNotice:
      "VitrectoMed aiuta i pazienti a comprendere la vitrectomia e il recupero post-operatorio.",
    contactEmail: "Scrivici",
    press: "Stampa",
    copyright: "© 2026 VitrectoMed — Tutti i diritti riservati.",
    tagline: "Capire. Prepararsi. Recuperare.",
    socialAria: "Social media",
    aboutLinks: [
      { label: "La nostra missione", href: "" },
      { label: "Comitato editoriale", href: "/contact" },
      { label: "Metodologia", href: "/blog" },
      { label: "Riferimenti medici", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Guide pratiche", href: "/blog" },
      { label: "Video esplicativi", href: "/operation" },
      { label: "Testimonianze dei pazienti", href: "/temoignage" },
      { label: "Domande frequenti", href: "/faq" },
    ],
    infoLinks: [
      { label: "Note legali", href: "/mentions-legales" },
      { label: "Informativa sulla privacy", href: "/confidentialite" },
      { label: "Cookie", href: "/cookies" },
      { label: "Condizioni d'uso", href: "/cgu" },
    ],
  },
  nl: {
    about: "Over ons",
    resources: "Bronnen",
    information: "Informatie",
    contact: "Contact",
    medicalNotice:
      "VitrectoMed helpt patiënten vitrectomie en postoperatief herstel beter te begrijpen.",
    contactEmail: "Mail ons",
    press: "Pers",
    copyright: "© 2026 VitrectoMed — Alle rechten voorbehouden.",
    tagline: "Begrijpen. Voorbereiden. Herstellen.",
    socialAria: "Sociale media",
    aboutLinks: [
      { label: "Onze missie", href: "" },
      { label: "Redactieraad", href: "/contact" },
      { label: "Methodologie", href: "/blog" },
      { label: "Medische referenties", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Praktische gidsen", href: "/blog" },
      { label: "Uitlegvideo's", href: "/operation" },
      { label: "Patiëntverhalen", href: "/temoignage" },
      { label: "Veelgestelde vragen", href: "/faq" },
    ],
    infoLinks: [
      { label: "Wettelijke vermeldingen", href: "/mentions-legales" },
      { label: "Privacybeleid", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Gebruiksvoorwaarden", href: "/cgu" },
    ],
  },
  pt: {
    about: "Sobre",
    resources: "Recursos",
    information: "Informações",
    contact: "Contato",
    medicalNotice:
      "VitrectoMed ajuda pacientes a compreender a vitrectomia e a recuperação pós-operatória.",
    contactEmail: "Enviar email",
    press: "Imprensa",
    copyright: "© 2026 VitrectoMed — Todos os direitos reservados.",
    tagline: "Compreender. Preparar. Recuperar.",
    socialAria: "Redes sociais",
    aboutLinks: [
      { label: "Nossa missão", href: "" },
      { label: "Comitê editorial", href: "/contact" },
      { label: "Metodologia", href: "/blog" },
      { label: "Referências médicas", href: "/pathologies" },
    ],
    resourceLinks: [
      { label: "Guias práticos", href: "/blog" },
      { label: "Vídeos explicativos", href: "/operation" },
      { label: "Depoimentos de pacientes", href: "/temoignage" },
      { label: "Perguntas frequentes", href: "/faq" },
    ],
    infoLinks: [
      { label: "Aviso legal", href: "/mentions-legales" },
      { label: "Política de privacidade", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Termos de uso", href: "/cgu" },
    ],
  },
};

function localizeLinks(
  prefix: string,
  links: Array<{ label: string; href: string }>
) {
  return links.map((link) => ({
    ...link,
    href: `${prefix}${link.href}`,
  }));
}

export default function Footer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];
  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";
  const prefix = `/${locale}`;
  const t = CONTENT[locale];

  const aboutLinks = localizeLinks(prefix, t.aboutLinks);
  const resourceLinks = localizeLinks(prefix, t.resourceLinks);
  const infoLinks = localizeLinks(prefix, t.infoLinks);

  return (
    <footer className="footer vm-footer">
      <div className="vm-footer__inner">
        <div className="vm-footer__brand">
          <Link href={prefix} className="vm-footer__logo" aria-label="VitrectoMed">
            <Image
              src={LOGO_URL}
              alt="VitrectoMed"
              width={300}
              height={69}
            />
          </Link>

          <p>{t.medicalNotice}</p>

          <div className="vm-footer__socials" aria-label={t.socialAria}>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>

        <FooterColumn title={t.about} links={aboutLinks} />
        <FooterColumn title={t.resources} links={resourceLinks} />
        <FooterColumn title={t.information} links={infoLinks} />

        <div className="vm-footer__col">
          <h3>{t.contact}</h3>
          <ul>
            <li>
              <Mail size={15} />
              <Link href={`${prefix}/contact`}>{t.contactEmail}</Link>
            </li>
            <li>
              <MapPin size={15} />
              <span>Nice, France</span>
            </li>
            <li>
              <ShieldCheck size={15} />
              <span>{t.press}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="vm-footer__bottom">
        <span>{t.copyright}</span>
        <span>{t.tagline}</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="vm-footer__col">
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
