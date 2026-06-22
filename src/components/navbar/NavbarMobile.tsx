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
  generateDropdowns,
  LOGO_URL,
} from "./navbar.data";

import type { Locale } from "./navbar.types";

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

interface MobileDropdownProps {
  label: string;
  children: React.ReactNode;
}

interface MobileSectionProps {
  label: string;
  children: React.ReactNode;
}

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

  const dropdowns =
    generateDropdowns(
      locale
    );

  const primaryDropdowns =
    dropdowns.filter(
      (dropdown) =>
        dropdown.href === links.pathologies ||
        dropdown.href === links.operation ||
        dropdown.href === links.recovery
    );

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
            src={LOGO_URL}
            alt="VitrectoMed"
            className="vm-mobile-navbar__logo-image"
          />
        </Link>

        {/* BURGER */}

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
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
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
          <MobileSection label={t.nav.menu}>
            <MobileLink
              href={links.home}
              label={t.nav.home}
              onClick={closeMenu}
            />

            {primaryDropdowns.map(
              (dropdown) => (
                <MobileDropdown
                  key={
                    dropdown.label
                  }
                  label={
                    dropdown.label
                  }
                >
                  {dropdown.items.map(
                    (item) => (
                      <MobileLink
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        label={
                          item.label
                        }
                        onClick={
                          closeMenu
                        }
                      />
                    )
                  )}
                </MobileDropdown>
              )
            )}
          </MobileSection>

          <MobileSection label={t.nav.directory}>
            <MobileLink
              href={links.directory}
              label={t.dropdowns.directory.overview}
              onClick={closeMenu}
            />
          </MobileSection>

          <MobileSection label={t.nav.contact}>
            <MobileLink
              href={
                links.testimonial
              }
              label={
                t.nav.testimonial
              }
              onClick={closeMenu}
            />

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

          {/* CTA */}

          <Link
            href={links.comfort}
            className="vm-mobile-menu__cta"
            onClick={closeMenu}
          >
            {t.nav.comfort}
          </Link>
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
   MOBILE DROPDOWN
========================================================= */

function MobileDropdown({
  label,
  children,
}: MobileDropdownProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  return (
    <div className="vm-mobile-dropdown">
      <button
        type="button"
        className="vm-mobile-dropdown__trigger"
        onClick={() =>
          setIsOpen(
            (prev) => !prev
          )
        }
        aria-expanded={
          isOpen
        }
      >
        <span>{label}</span>

        <ChevronDown
          size={18}
          className={`vm-mobile-dropdown__icon ${
            isOpen
              ? "vm-mobile-dropdown__icon--open"
              : ""
          }`}
        />
      </button>

      <div
        className={`vm-mobile-dropdown__content ${
          isOpen
            ? "vm-mobile-dropdown__content--open"
            : ""
        }`}
      >
        {children}
      </div>
    </div>
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
