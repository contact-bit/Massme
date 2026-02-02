"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/components/navbar.css";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/500df708-673d-4a48-549d-d1b311a8e600/public";

type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

const TRANSLATIONS: Record<
  Locale,
  {
    notice: string;
    nav: {
      home: string;
      about: string;
      products: string;
      blog: string;
      contact: string;
    };
  }
> = {
  fr: {
    notice:
      "🚧 Site en construction — certaines fonctionnalités peuvent être indisponibles.",
    nav: {
      home: "Accueil",
      about: "Fonctionnement",
      products: "Commander",
      blog: "Blog",
      contact: "Contact",
    },
  },
  en: {
    notice:
      "🚧 Website under construction — some features may be unavailable.",
    nav: {
      home: "Home",
      about: "How it works",
      products: "Order",
      blog: "Blog",
      contact: "Contact",
    },
  },
  es: {
    notice: "🚧 Sitio en construcción.",
    nav: {
      home: "Inicio",
      about: "Funcionamiento",
      products: "Comprar",
      blog: "Blog",
      contact: "Contacto",
    },
  },
  de: {
    notice: "🚧 Website im Aufbau.",
    nav: {
      home: "Start",
      about: "Funktionsweise",
      products: "Bestellen",
      blog: "Blog",
      contact: "Kontakt",
    },
  },
  it: {
    notice: "🚧 Sito in costruzione.",
    nav: {
      home: "Home",
      about: "Funzionamento",
      products: "Ordina",
      blog: "Blog",
      contact: "Contatto",
    },
  },
  nl: {
    notice: "🚧 Website in aanbouw.",
    nav: {
      home: "Home",
      about: "Werking",
      products: "Bestellen",
      blog: "Blog",
      contact: "Contact",
    },
  },
};

export default function Navbar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const rawLocale = pathname?.split("/")[1];
  const locale: Locale =
    LANGUAGES.some((l) => l.code === rawLocale) ? (rawLocale as Locale) : "fr";

  const t = TRANSLATIONS[locale];
  const currentLang = LANGUAGES.find((l) => l.code === locale)!;

  const switchLocaleHref = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    return pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <div className="site-notice">{t.notice}</div>

      <nav className="navbar">
        <div className="navbar-container">
          {/* LOGO */}
          <Link href={`/${locale}`} className="navbar-logo">
            <img
              src={LOGO_URL}
              alt="VitectroMed"
              className="navbar-logo-img"
              loading="eager"
            />
          </Link>

          {/* NAV DESKTOP (doit ABSOLUMENT avoir nav-desktop) */}
          <div className="nav-links nav-desktop">
            <NavLink href={`/${locale}`}>{t.nav.home}</NavLink>
            <NavLink href={`/${locale}/a-propos`}>{t.nav.about}</NavLink>
            <NavLink href={`/${locale}/products`}>{t.nav.products}</NavLink>
            <NavLink href={`/${locale}/blog`}>{t.nav.blog}</NavLink>
            <NavLink href={`/${locale}/contact`}>{t.nav.contact}</NavLink>

            <div className="nav-lang-wrapper" ref={langRef}>
              <button
                className="nav-lang-btn"
                onClick={() => setLangOpen((v) => !v)}
                type="button"
                aria-label="Change language"
              >
                <span className="nav-lang-flag">{currentLang.flag}</span>
              </button>

              {langOpen && (
                <div className="nav-lang-dropdown">
                  {LANGUAGES.map((l) => (
                    <Link
                      key={l.code}
                      href={switchLocaleHref(l.code)}
                      className="nav-lang-item"
                      onClick={() => setLangOpen(false)}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BURGER MOBILE (doit avoir nav-mobile-only) */}
          <button
            className="navbar-mobile-btn nav-mobile-only"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* MENU MOBILE (doit avoir nav-mobile-only) */}
        {mobileOpen && (
          <div className="mobile-menu nav-mobile-only">
            <MobileLink
              href={`/${locale}`}
              label={t.nav.home}
              onClick={() => setMobileOpen(false)}
            />
            <MobileLink
              href={`/${locale}/a-propos`}
              label={t.nav.about}
              onClick={() => setMobileOpen(false)}
            />
            <MobileLink
              href={`/${locale}/products`}
              label={t.nav.products}
              onClick={() => setMobileOpen(false)}
            />
            <MobileLink
              href={`/${locale}/blog`}
              label={t.nav.blog}
              onClick={() => setMobileOpen(false)}
            />
            <MobileLink
              href={`/${locale}/contact`}
              label={t.nav.contact}
              onClick={() => setMobileOpen(false)}
            />

            <div className="mobile-lang-list">
              {LANGUAGES.map((l) => (
                <Link
                  key={l.code}
                  href={switchLocaleHref(l.code)}
                  className="mobile-lang-item"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.flag} {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href} className="nav-link">
    {children}
  </Link>
);

const MobileLink = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) => (
  <Link href={href} className="mobile-link" onClick={onClick}>
    {label}
  </Link>
);
