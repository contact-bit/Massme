"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import {
  TRANSLATIONS,
  generateNavbarLinks,
  LOGO_COMPACT_URL,
} from "./navbar.data";

import type { Locale } from "./navbar.types";
import NavbarCartButton from "./NavbarCartButton";

import "./NavbarMobile.css";

/* =========================================================
   TYPES
========================================================= */

interface NavbarMobileProps {
  locale: Locale;
}

interface MobileLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

interface MobileSectionProps {
  label: string;
  children: React.ReactNode;
}

const MOBILE_LABELS: Record<Locale, { journey: string; surgeon: string }> = {
  fr: { journey: "Parcours", surgeon: "Trouver un chirurgien" },
  en: { journey: "Patient journey", surgeon: "Find a surgeon" },
  es: { journey: "Recorrido", surgeon: "Encontrar un cirujano" },
  de: { journey: "Patientenweg", surgeon: "Chirurgen finden" },
  it: { journey: "Percorso", surgeon: "Trova un chirurgo" },
  nl: { journey: "Patiëntenreis", surgeon: "Vind een chirurg" },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NavbarMobile({
  locale,
}: NavbarMobileProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const t =
    TRANSLATIONS[locale];

  const links =
    generateNavbarLinks(
      locale
    );

  const mobileLabels = MOBILE_LABELS[locale];

  /* =====================================================
     LOCK BODY SCROLL
  ===================================================== */

  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [isMenuOpen]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(
      (prev) => !prev
    );
  };

  return (
    <>
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="vm-mobile-navbar">
        {/* LOGO */}

        <Link
          href={links.home}
          className="vm-mobile-navbar__logo"
          onClick={closeMenu}
        >
          <img
            src={LOGO_COMPACT_URL}
            alt="VitrectoMed"
            className="vm-mobile-navbar__logo-image"
          />
        </Link>

        <div className="vm-mobile-navbar__actions">
          <NavbarCartButton locale={locale} />

          <button
            type="button"
            className="vm-mobile-navbar__burger"
            onClick={toggleMenu}
            aria-label={
              isMenuOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={
              isMenuOpen
            }
          >
            {isMenuOpen ? (
              <X size={30} />
            ) : (
              <Menu size={30} />
            )}
          </button>
        </div>
      </header>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className={`vm-mobile-overlay ${
          isMenuOpen
            ? "vm-mobile-overlay--open"
            : ""
        }`}
        onClick={closeMenu}
      />

      {/* =====================================================
          MENU
      ===================================================== */}

      <aside
        className={`vm-mobile-menu ${
          isMenuOpen
            ? "vm-mobile-menu--open"
            : ""
        }`}
      >
        <div className="vm-mobile-menu__content">
          <div className="vm-mobile-menu__brand">
            <Link
              href={links.home}
              className="vm-mobile-menu__brand-link"
              onClick={closeMenu}
            >
              <img
                src={LOGO_COMPACT_URL}
                alt="VitrectoMed"
                className="vm-mobile-menu__brand-image"
              />
            </Link>

            <button
              type="button"
              className="vm-mobile-menu__close"
              onClick={closeMenu}
              aria-label="Fermer le menu"
            >
              <X size={24} />
            </button>
          </div>

          <MobileSection label={t.nav.menu}>
            <MobileLink
              href={links.home}
              label={t.nav.home}
              onClick={closeMenu}
            />

            <MobileLink
              href={links.pathologies}
              label={t.nav.pathologies}
              onClick={closeMenu}
            />

            <MobileLink
              href={links.recovery}
              label={mobileLabels.journey}
              onClick={closeMenu}
            />

            <MobileLink
              href={links.guides}
              label={t.nav.guides}
              onClick={closeMenu}
            />
          </MobileSection>

          <MobileSection label={t.nav.directory}>
            <MobileLink
              href={links.directory}
              label={mobileLabels.surgeon}
              onClick={closeMenu}
            />
          </MobileSection>

          <MobileSection label={t.nav.contact}>
            <MobileLink
              href={links.faq}
              label={t.nav.faq}
              onClick={closeMenu}
            />

            <MobileLink
              href={
                links.contact
              }
              label={
                t.nav.contact
              }
              onClick={closeMenu}
            />
          </MobileSection>

          {/* LANGUAGE */}

          <MobileLanguageSelector
            locale={locale}
          />

        </div>
      </aside>
    </>
  );
}

/* =========================================================
   MOBILE SECTION
========================================================= */

function MobileSection({
  label,
  children,
}: MobileSectionProps) {
  return (
    <section className="vm-mobile-section">
      <p className="vm-mobile-section__label">
        {label}
      </p>

      <div className="vm-mobile-section__items">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   MOBILE LINK
========================================================= */

function MobileLink({
  href,
  label,
  onClick,
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      className="vm-mobile-link"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

/* =========================================================
   MOBILE LANGUAGE SELECTOR
========================================================= */

function MobileLanguageSelector({
  locale,
}: {
  locale: Locale;
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const languages = [
    {
      code: "fr",
      label: "Français",
      flag: "🇫🇷",
    },

    {
      code: "en",
      label: "English",
      flag: "🇬🇧",
    },

    {
      code: "es",
      label: "Español",
      flag: "🇪🇸",
    },

    {
      code: "de",
      label: "Deutsch",
      flag: "🇩🇪",
    },

    {
      code: "it",
      label: "Italiano",
      flag: "🇮🇹",
    },

    {
      code: "nl",
      label: "Nederlands",
      flag: "🇳🇱",
    },
  ];

  const currentLanguage =
    languages.find(
      (language) =>
        language.code ===
        locale
    );

  return (
    <div className="vm-mobile-language">
      {/* TRIGGER */}

      <button
        type="button"
        className="vm-mobile-language__trigger"
        onClick={() =>
          setIsOpen(
            (prev) => !prev
          )
        }
        aria-expanded={
          isOpen
        }
      >
        <div className="vm-mobile-language__left">
          <span className="vm-mobile-language__flag">
            {
              currentLanguage?.flag
            }
          </span>

          <span>
            {
              currentLanguage?.label
            }
          </span>
        </div>

        <ChevronDown
          size={18}
          className={`vm-mobile-language__icon ${
            isOpen
              ? "vm-mobile-language__icon--open"
              : ""
          }`}
        />
      </button>

      {/* CONTENT */}

      <div
        className={`vm-mobile-language__content ${
          isOpen
            ? "vm-mobile-language__content--open"
            : ""
        }`}
      >
        <div className="vm-mobile-language__inner">
          {languages.map(
            (language) => (
              <Link
                key={
                  language.code
                }
                href={`/${language.code}`}
                className={`vm-mobile-language__item ${
                  locale ===
                  language.code
                    ? "vm-mobile-language__item--active"
                    : ""
                }`}
              >
                <span className="vm-mobile-language__flag">
                  {
                    language.flag
                  }
                </span>

                <span>
                  {
                    language.label
                  }
                </span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
