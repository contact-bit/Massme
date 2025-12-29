"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import "@/styles/components/navbar.css";

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2456d5ba-af23-4219-7115-f54286a7c600/public";

type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
] as const;

const TRANSLATIONS = {
  fr: {
    nav: { home: "Accueil", about: "Fonctionnement", products: "Commander", contact: "Contact" },
    cart: "Panier",
    notice: "🚧 Site en construction — certaines fonctionnalités peuvent être indisponibles.",
  },
  en: {
    nav: { home: "Home", about: "How it works", products: "Order", contact: "Contact" },
    cart: "Cart",
    notice: "🚧 Website under construction — some features may be unavailable.",
  },
  es: {
    nav: { home: "Inicio", about: "Funcionamiento", products: "Comprar", contact: "Contacto" },
    cart: "Carrito",
    notice: "🚧 Sitio en construcción.",
  },
  de: {
    nav: { home: "Start", about: "Funktionsweise", products: "Bestellen", contact: "Kontakt" },
    cart: "Warenkorb",
    notice: "🚧 Website im Aufbau.",
  },
  it: {
    nav: { home: "Home", about: "Funzionamento", products: "Ordina", contact: "Contatto" },
    cart: "Carrello",
    notice: "🚧 Sito in costruzione.",
  },
  nl: {
    nav: { home: "Home", about: "Werking", products: "Bestellen", contact: "Contact" },
    cart: "Winkelwagen",
    notice: "🚧 Website in aanbouw.",
  },
} satisfies Record<Locale, any>;

export default function Navbar() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];
  const locale: Locale = LANGUAGES.some(l => l.code === rawLocale) ? (rawLocale as Locale) : "fr";

  const { items, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const t = TRANSLATIONS[locale];

  const switchLocaleHref = (newLocale: Locale) => {
    if (!pathname) return `/${newLocale}`;
    return pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
  };

  const currentLang = LANGUAGES.find(l => l.code === locale)!;

  return (
    <nav className="navbar">
      <div className="site-notice">{t.notice}</div>

      <div className="navbar-container">
        {/* LOGO */}
        <Link href={`/${locale}`} className="navbar-logo">
          <img src={LOGO_URL} alt="OculaRest" className="navbar-logo-img" />
        </Link>

        {/* DESKTOP */}
        <div className="nav-links nav-desktop">
          <NavLink href={`/${locale}`}>{t.nav.home}</NavLink>
          <NavLink href={`/${locale}/a-propos`}>{t.nav.about}</NavLink>
          <NavLink href={`/${locale}/products`}>{t.nav.products}</NavLink>
          <NavLink href={`/${locale}/contact`}>{t.nav.contact}</NavLink>

          {/* 🌍 LANG DROPDOWN */}
          <div className="nav-lang-wrapper">
            <button
              className="nav-lang-btn"
              onClick={() => setLangOpen(v => !v)}
              type="button"
            >
              <span className="nav-lang-flag">{currentLang.flag}</span>
              <span className="nav-lang-code">{locale.toUpperCase()}</span>
            </button>

            {langOpen && (
              <div className="nav-lang-dropdown">
                {LANGUAGES.map(l => (
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

          {/* CART */}
          <button className="nav-cart-btn" onClick={toggleCart} type="button">
            <ShoppingCart size={22} />
            {items.length > 0 && <span className="nav-cart-badge">{items.length}</span>}
          </button>
        </div>

        {/* MOBILE BUTTON */}
        <button className="navbar-mobile-btn nav-mobile-only" onClick={() => setMobileOpen(v => !v)}>
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu nav-mobile-only">
          <MobileLink href={`/${locale}`} label={t.nav.home} onClick={() => setMobileOpen(false)} />
          <MobileLink href={`/${locale}/a-propos`} label={t.nav.about} onClick={() => setMobileOpen(false)} />
          <MobileLink href={`/${locale}/products`} label={t.nav.products} onClick={() => setMobileOpen(false)} />
          <MobileLink href={`/${locale}/contact`} label={t.nav.contact} onClick={() => setMobileOpen(false)} />

          <div className="mobile-lang-list">
            {LANGUAGES.map(l => (
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

          <button className="mobile-cart" onClick={toggleCart} type="button">
            <ShoppingCart size={22} />
            <span>{t.cart} ({items.length})</span>
          </button>
        </div>
      )}
    </nav>
  );
}

const NavLink = ({ href, children }: { href: string; children: any }) => (
  <Link href={href} className="nav-link">{children}</Link>
);

const MobileLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
  <Link href={href} className="mobile-link" onClick={onClick}>{label}</Link>
);
