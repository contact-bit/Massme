"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
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
    nav: { home: string; about: string; products: string; blog: string; contact: string };
  }
> = {
  fr: {
    notice: "🚧 Site en construction — certaines fonctionnalités peuvent être indisponibles.",
    nav: { home: "Accueil", about: "Fonctionnement", products: "Commander", blog: "Blog", contact: "Contact" },
  },
  en: {
    notice: "🚧 Website under construction — some features may be unavailable.",
    nav: { home: "Home", about: "How it works", products: "Order", blog: "Blog", contact: "Contact" },
  },
  es: {
    notice: "🚧 Sitio en construcción.",
    nav: { home: "Inicio", about: "Funcionamiento", products: "Comprar", blog: "Blog", contact: "Contacto" },
  },
  de: {
    notice: "🚧 Website im Aufbau.",
    nav: { home: "Start", about: "Funktionsweise", products: "Bestellen", blog: "Blog", contact: "Kontakt" },
  },
  it: {
    notice: "🚧 Sito in costruzione.",
    nav: { home: "Home", about: "Funzionamento", products: "Ordina", blog: "Blog", contact: "Contatto" },
  },
  nl: {
    notice: "🚧 Website in aanbouw.",
    nav: { home: "Home", about: "Werking", products: "Bestellen", blog: "Blog", contact: "Contact" },
  },
};

interface NavbarProps {
  locale: Locale; // fallback si jamais l’URL n’a pas de locale
}

function isLocale(value: string): value is Locale {
  return LANGUAGES.some((l) => l.code === value);
}

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname() || "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // ✅ Locale SOURCE OF TRUTH = URL, prop = fallback
  const urlLocale = pathname.split("/")[1];
  const activeLocale: Locale = isLocale(urlLocale) ? urlLocale : locale;

  const t = TRANSLATIONS[activeLocale];
  const currentLang = LANGUAGES.find((l) => l.code === activeLocale)!;

  const switchLocaleHref = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    // remplace /xx/... par /newLocale/...
    if (isLocale(pathname.split("/")[1] || "")) {
      return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${newLocale}`);
    }
    // si l’URL n’a pas de locale, on la préfixe
    return `/${newLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  };

  // (optionnel mais propre) fermer menus au changement de route
  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [pathname]);

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
          <Link href={`/${activeLocale}`} className="navbar-logo">
            <img
              src={LOGO_URL}
              alt="VitectroMed"
              className="navbar-logo-img"
              loading="eager"
            />
          </Link>

          {/* NAV DESKTOP */}
          <div className="nav-links nav-desktop">
            <NavLink href={`/${activeLocale}`}>{t.nav.home}</NavLink>
            <NavLink href={`/${activeLocale}/a-propos`}>{t.nav.about}</NavLink>
            <NavLink href={`/${activeLocale}/products`}>{t.nav.products}</NavLink>
            <NavLink href={`/${activeLocale}/blog`}>{t.nav.blog}</NavLink>
            <NavLink href={`/${activeLocale}/contact`}>{t.nav.contact}</NavLink>

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

          {/* BURGER MOBILE */}
          <button
            className="navbar-mobile-btn nav-mobile-only"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* MENU MOBILE */}
        {mobileOpen && (
          <div className="mobile-menu nav-mobile-only">
            <MobileLink href={`/${activeLocale}`} label={t.nav.home} onClick={() => setMobileOpen(false)} />
            <MobileLink href={`/${activeLocale}/a-propos`} label={t.nav.about} onClick={() => setMobileOpen(false)} />
            <MobileLink href={`/${activeLocale}/products`} label={t.nav.products} onClick={() => setMobileOpen(false)} />
            <MobileLink href={`/${activeLocale}/blog`} label={t.nav.blog} onClick={() => setMobileOpen(false)} />
            <MobileLink href={`/${activeLocale}/contact`} label={t.nav.contact} onClick={() => setMobileOpen(false)} />

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

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
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
