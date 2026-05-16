"use client";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import type {
  NavbarProps,
  Locale,
} from "./navbar.types";

import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

import {
  isLocale,
} from "./navbar.data";

import "./Navbar.css";

export default function Navbar({
  locale,
}: NavbarProps) {
  const pathname =
    usePathname() || "/";

  /* =====================================================
     ACTIVE LOCALE
  ===================================================== */

  const urlLocale =
    pathname.split("/")[1];

  const activeLocale: Locale =
    isLocale(urlLocale)
      ? urlLocale
      : locale;

  /* =====================================================
     SCROLLED
  ===================================================== */

  const [scrolled, setScrolled] =
    useState(false);

  /* =====================================================
     SCROLL EFFECT
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 12
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <header
      className={`vm-navbar ${
        scrolled
          ? "vm-navbar--scrolled"
          : ""
      }`}
    >
      <div className="vm-navbar__container">
        {/* =========================================
            DESKTOP
        ========================================= */}

        <div className="vm-navbar__desktop-wrapper">
          <NavbarDesktop
            locale={
              activeLocale
            }
          />
        </div>

        {/* =========================================
            MOBILE
        ========================================= */}

        <div className="vm-navbar__mobile-wrapper">
          <NavbarMobile
            locale={
              activeLocale
            }
          />
        </div>
      </div>
    </header>
  );
}