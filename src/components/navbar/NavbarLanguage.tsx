"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { ChevronDown } from "lucide-react";

import {
  LANGUAGES,
} from "./navbar.data";

import type {
  Locale,
} from "./navbar.types";

import "./NavbarLanguage.css";

interface NavbarLanguageProps {
  locale: Locale;
}

export default function NavbarLanguage({
  locale,
}: NavbarLanguageProps) {
  const pathname =
    usePathname();

  const [open, setOpen] =
    useState(false);

  const ref =
    useRef<HTMLDivElement>(null);

  const currentLanguage =
    LANGUAGES.find(
      (language) =>
        language.code === locale
    );

  /* =====================================================
     CLOSE OUTSIDE
  ===================================================== */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     SWITCH LOCALE
  ===================================================== */

  const switchLocaleHref = (
    newLocale: Locale
  ) => {
    const cleanedPath =
      pathname.replace(
        /^\/(fr|en|es|de|it|nl)/,
        ""
      ) || "/";

    return `/${newLocale}${cleanedPath}`;
  };

  return (
    <div
      className="vm-language"
      ref={ref}
    >
      {/* TRIGGER */}

      <button
        type="button"
        className="vm-language__trigger"
        aria-label="Changer de langue"
        onClick={() =>
          setOpen(!open)
        }
      >
        <span>
          {
            currentLanguage?.code.toUpperCase()
          }
        </span>

        <ChevronDown
          size={15}
          className={`vm-language__icon ${
            open
              ? "vm-language__icon--open"
              : ""
          }`}
        />
      </button>

      {/* MENU */}

      <div
        className={`vm-language__menu ${
          open
            ? "vm-language__menu--open"
            : ""
        }`}
      >
        {LANGUAGES.map(
          (language) => (
            <Link
              key={language.code}
              href={switchLocaleHref(
                language.code
              )}
              className={`vm-language__item ${
                language.code === locale
                  ? "vm-language__item--active"
                  : ""
              }`}
              onClick={() =>
                setOpen(false)
              }
            >
              <span>
                {language.flag}
              </span>

              <span>
                {language.label}
              </span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
