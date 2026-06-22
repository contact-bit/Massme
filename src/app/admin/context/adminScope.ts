"use client";

import { useEffect, useState } from "react";

import type { CountryCode } from "@/lib/shipping-i18n";

export type AdminCountryScope =
  | "ALL"
  | CountryCode;

export const ADMIN_COUNTRIES: Array<{
  code: AdminCountryScope;
  label: string;
  flag: string;
}> = [
  { code: "ALL", label: "Tous les pays", flag: "🌍" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "GB", label: "Angleterre", flag: "🇬🇧" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "NL", label: "Pays-Bas", flag: "🇳🇱" },
  { code: "CH", label: "Suisse", flag: "🇨🇭" },
];

const COUNTRY_STORAGE_KEY =
  "admin_scope_country";
const SCOPE_EVENT =
  "admin-scope-change";

function isAdminCountryScope(
  value: string | null
): value is AdminCountryScope {
  return ADMIN_COUNTRIES.some(
    (country) => country.code === value
  );
}

function readCountry(): AdminCountryScope {
  if (typeof window === "undefined") {
    return "ALL";
  }

  const value = localStorage.getItem(
    COUNTRY_STORAGE_KEY
  );

  return isAdminCountryScope(value)
    ? value
    : "ALL";
}

function emitScopeChange() {
  window.dispatchEvent(new Event(SCOPE_EVENT));
}

export function useAdminScope() {
  const [country, setCountryState] =
    useState<AdminCountryScope>(readCountry);

  useEffect(() => {
    const sync = () => {
      setCountryState(readCountry());
    };

    window.addEventListener(
      SCOPE_EVENT,
      sync
    );
    window.addEventListener(
      "storage",
      sync
    );

    return () => {
      window.removeEventListener(
        SCOPE_EVENT,
        sync
      );
      window.removeEventListener(
        "storage",
        sync
      );
    };
  }, []);

  function setCountry(
    nextCountry: AdminCountryScope
  ) {
    localStorage.setItem(
      COUNTRY_STORAGE_KEY,
      nextCountry
    );
    setCountryState(nextCountry);
    emitScopeChange();
  }

  return {
    country,
    setCountry,
  };
}

export function isConcreteCountry(
  country: AdminCountryScope
): country is CountryCode {
  return country !== "ALL";
}

export function normalizeAdminCountry(
  value: unknown
): CountryCode | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!normalized) {
    return null;
  }

  if (
    normalized === "fr" ||
    normalized === "fra" ||
    normalized.includes("france")
  ) {
    return "FR";
  }

  if (
    normalized === "en" ||
    normalized === "gb" ||
    normalized === "uk" ||
    normalized.includes("royaume") ||
    normalized.includes("angleterre") ||
    normalized.includes("united kingdom") ||
    normalized.includes("great britain")
  ) {
    return "GB";
  }

  if (
    normalized === "es" ||
    normalized.includes("espagne") ||
    normalized.includes("spain")
  ) {
    return "ES";
  }

  if (
    normalized === "de" ||
    normalized.includes("allemagne") ||
    normalized.includes("germany") ||
    normalized.includes("deutschland")
  ) {
    return "DE";
  }

  if (
    normalized === "it" ||
    normalized.includes("italie") ||
    normalized.includes("italy")
  ) {
    return "IT";
  }

  if (
    normalized === "nl" ||
    normalized.includes("pays-bas") ||
    normalized.includes("pays bas") ||
    normalized.includes("netherlands")
  ) {
    return "NL";
  }

  if (
    normalized === "ch" ||
    normalized.includes("suisse") ||
    normalized.includes("switzerland")
  ) {
    return "CH";
  }

  return null;
}

export function matchesAdminCountry(
  value: unknown,
  country: AdminCountryScope
) {
  if (country === "ALL") {
    return true;
  }

  return normalizeAdminCountry(value) === country;
}
