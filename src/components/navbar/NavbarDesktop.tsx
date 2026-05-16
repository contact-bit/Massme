"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  LOGO_URL,
  TRANSLATIONS,
  generateNavbarLinks,
  generateDropdowns,
} from "./navbar.data";

import type {
  Locale,
} from "./navbar.types";

import NavbarDropdown from "./NavbarDropdown";

import NavbarLanguage from "./NavbarLanguage";

import "./NavbarDesktop.css";

interface NavbarDesktopProps {
  locale: Locale;
}

export default function NavbarDesktop({
  locale,
}: NavbarDesktopProps) {
  const pathname =
    usePathname();

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

  return (
    <div className="vm-navbar-desktop">
      {/* =========================================
          LEFT
      ========================================= */}

      <div className="vm-navbar-desktop__left">
        <Link
          href={links.home}
          className="vm-navbar-desktop__logo"
          aria-label="VitrectoMed"
        >
          <img
            src={LOGO_URL}
            alt="VitrectoMed"
            className="vm-navbar-desktop__logo-image"
          />
        </Link>
      </div>

      {/* =========================================
          CENTER
      ========================================= */}

      <div className="vm-navbar-desktop__center">
        <NavLink
          href={links.home}
        >
          {t.nav.home}
        </NavLink>

        {dropdowns.map(
          (dropdown) => (
            <NavbarDropdown
              key={dropdown.label}
              label={
                dropdown.label
              }
              href={
                dropdown.href
              }
            >
              {dropdown.items.map(
                (item) => (
                  <DropdownLink
                    key={item.href}
                    href={
                      item.href
                    }
                  >
                    {item.label}
                  </DropdownLink>
                )
              )}
            </NavbarDropdown>
          )
        )}

        <NavLink
          href={
            links.testimonial
          }
        >
          {t.nav.testimonial}
        </NavLink>

        <NavLink href={links.faq}>
          {t.nav.faq}
        </NavLink>

        <NavLink
          href={links.contact}
        >
          {t.nav.contact}
        </NavLink>
      </div>

      {/* =========================================
          RIGHT
      ========================================= */}

      <div className="vm-navbar-desktop__right">
        {/* LANGUAGE */}

        <NavbarLanguage
          locale={locale}
        />

        {/* CTA */}

        <Link
          href={links.comfort}
          className="vm-navbar-desktop__cta"
        >
          {t.nav.comfort}
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   NAV LINK
========================================================= */

interface NavLinkProps {
  href: string;

  children:
    React.ReactNode;
}

function NavLink({
  href,
  children,
}: NavLinkProps) {
  const pathname =
    usePathname();

  const isActive =
    pathname === href;

  return (
    <Link
      href={href}
      className={`vm-navbar-desktop__link ${
        isActive
          ? "vm-navbar-desktop__link--active"
          : ""
      }`}
    >
      {children}
    </Link>
  );
}

/* =========================================================
   DROPDOWN LINK
========================================================= */

interface DropdownLinkProps {
  href: string;

  children:
    React.ReactNode;
}

function DropdownLink({
  href,
  children,
}: DropdownLinkProps) {
  const pathname =
    usePathname();

  const isActive =
    pathname === href;

  return (
    <Link
      href={href}
      className={`vm-navbar-desktop__dropdown-link ${
        isActive
          ? "vm-navbar-desktop__dropdown-link--active"
          : ""
      }`}
    >
      {children}
    </Link>
  );
}