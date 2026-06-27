"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import "./NavbarDropdown.css";

interface NavbarDropdownProps {
  label: string;

  href?: string;

  children: ReactNode;
}

export default function NavbarDropdown({
  label,
  href,
  children,
}: NavbarDropdownProps) {
  const [open, setOpen] =
    useState(false);

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  /* =====================================================
     OPEN
  ===================================================== */

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(
        timeoutRef.current
      );
    }

    setOpen(true);
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    timeoutRef.current =
      setTimeout(() => {
        setOpen(false);
      }, 180);
  };

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, []);

  return (
    <div
      className="vm-dropdown"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* =========================================
          TRIGGER
      ========================================= */}

      <div className="vm-dropdown__trigger">
        {href ? (
          <Link
            href={href}
            className="vm-dropdown__link"
          >
            {label}
          </Link>
        ) : (
          <span className="vm-dropdown__link">
            {label}
          </span>
        )}

        <button
          type="button"
          className="vm-dropdown__button"
          aria-label={label}
        >
          <ChevronDown
            size={20}
            className={`vm-dropdown__icon ${
              open
                ? "vm-dropdown__icon--open"
                : ""
            }`}
          />
        </button>
      </div>

      {/* =========================================
          MENU
      ========================================= */}

      <div
        className={`vm-dropdown__menu ${
          open
            ? "vm-dropdown__menu--open"
            : ""
        }`}
      >
        <div className="vm-dropdown__content">
          {children}
        </div>
      </div>
    </div>
  );
}
