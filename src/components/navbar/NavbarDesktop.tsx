"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  TRANSLATIONS,
  generateNavbarLinks,
  generateDropdowns,
  LOGO_URL,
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
        <nav
          className="vm-navbar-desktop__primary-row"
          aria-label="Navigation principale"
        >
          <NavLink
            href={links.home}
          >
            {t.nav.home}
          </NavLink>

          {primaryDropdowns.map(
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

          <NavLink href={links.directory}>
            {t.nav.directory}
          </NavLink>
        </nav>
      </div>

      {/* =========================================
          RIGHT
      ========================================= */}

      <div className="vm-navbar-desktop__right">
        <nav
          className="vm-navbar-desktop__utility"
          aria-label="Navigation secondaire"
        >
          <NavLink
            href={
              links.testimonial
            }
            variant="utility"
          >
            {t.nav.testimonial}
          </NavLink>

          <NavLink
            href={links.faq}
            variant="utility"
          >
            {t.nav.faq}
          </NavLink>

          <NavLink
            href={links.contact}
            variant="utility"
          >
            {t.nav.contact}
          </NavLink>
        </nav>

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

  variant?: "primary" | "utility";
}

function NavLink({
  href,
  children,
  variant = "primary",
}: NavLinkProps) {
  const pathname =
    usePathname();

  const isActive =
    pathname === href;

  return (
    <Link
      href={href}
      className={`vm-navbar-desktop__link ${
        variant === "utility"
          ? "vm-navbar-desktop__link--utility"
          : ""
      } ${
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
