"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  Search,
} from "lucide-react";

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
import NavbarCartButton from "./NavbarCartButton";

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

  const pathologiesDropdown =
    dropdowns.find(
      (dropdown) =>
        dropdown.href === links.pathologies
    );

  const recoveryDropdown =
    dropdowns.find(
      (dropdown) =>
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
          <NavLink href={links.operation}>
            {t.nav.home}
          </NavLink>

          {pathologiesDropdown ? (
            <NavbarDropdown
              label={pathologiesDropdown.label}
              href={pathologiesDropdown.href}
            >
              {pathologiesDropdown.items.map(
                (item) => (
                  <DropdownLink
                    key={item.href}
                    href={item.href}
                  >
                    {item.label}
                  </DropdownLink>
                )
              )}
            </NavbarDropdown>
          ) : (
            <NavLink href={links.pathologies}>
              {t.nav.pathologies}
            </NavLink>
          )}

          {recoveryDropdown ? (
            <NavbarDropdown
              label={locale === "fr" ? "Parcours" : recoveryDropdown.label}
              href={recoveryDropdown.href}
            >
              {recoveryDropdown.items.map(
                (item) => (
                  <DropdownLink
                    key={item.href}
                    href={item.href}
                  >
                    {item.label}
                  </DropdownLink>
                )
              )}
            </NavbarDropdown>
          ) : (
            <NavLink href={links.recovery}>
              {locale === "fr" ? "Parcours" : t.nav.recovery}
            </NavLink>
          )}

          <NavLink href={links.guides}>
            {t.nav.guides}
          </NavLink>

          <NavLink href={links.directory}>
            {t.nav.directory}
          </NavLink>

          <NavLink href={links.faq}>
            {t.nav.faq}
          </NavLink>

          <NavLink href={links.contact}>
            {t.nav.contact}
          </NavLink>
        </nav>
      </div>

      {/* =========================================
          RIGHT
      ========================================= */}

      <div className="vm-navbar-desktop__right">
        {/* LANGUAGE */}

        <NavbarLanguage
          locale={locale}
        />

        <Link
          href={links.search}
          className="vm-navbar-desktop__search"
          aria-label="Rechercher"
        >
          <Search size={24} />
        </Link>

        <NavbarCartButton locale={locale} />

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
