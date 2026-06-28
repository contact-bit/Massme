import { dbAdmin } from "@/lib/firebase.admin";
import type { CountryCode } from "@/lib/shipping-i18n";

import {
  DIRECTORY_COLLECTION,
  type DirectoryEntry,
} from "./types";
import {
  normalizeDirectoryText,
  serializeDirectoryEntry,
} from "./normalize";

export type DirectorySearchResult = {
  entries: DirectoryEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const DEFAULT_SEARCH_LIMIT = 24;
const MAX_SEARCH_LIMIT = 48;
const DIRECTORY_CANDIDATE_LIMIT = 600;

function clampPage(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function clampLimit(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(
    MAX_SEARCH_LIMIT,
    Math.max(1, Math.floor(value))
  );
}

function getTokens(value: string) {
  return normalizeDirectoryText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function matchesText(
  text: string,
  rawValue: string
) {
  const cleanValue =
    normalizeDirectoryText(rawValue);

  if (!cleanValue) {
    return true;
  }

  if (text.includes(cleanValue)) {
    return true;
  }

  const tokens = getTokens(rawValue);

  return tokens.length === 0
    ? true
    : tokens.some((token) => text.includes(token));
}

function matchesLocation(
  entry: DirectoryEntry,
  rawLocation: string
) {
  const locationText =
    normalizeDirectoryText(
      [
        entry.cityNormalized,
        entry.departmentNormalized,
        entry.regionNormalized,
        entry.postalCodeNormalized,
        entry.address,
      ].join(" ")
    );

  return matchesText(locationText, rawLocation);
}

function matchesQuery(
  entry: DirectoryEntry,
  rawQuery: string
) {
  return matchesText(entry.searchText, rawQuery);
}

function sortEntries(
  entries: DirectoryEntry[],
  location: string
) {
  const cleanLocation =
    normalizeDirectoryText(location);

  return [...entries].sort((a, b) => {
    if (cleanLocation) {
      const aExact =
        [
          a.cityNormalized,
          a.departmentNormalized,
          a.regionNormalized,
          a.postalCodeNormalized,
        ].includes(cleanLocation)
          ? 0
          : 1;
      const bExact =
        [
          b.cityNormalized,
          b.departmentNormalized,
          b.regionNormalized,
          b.postalCodeNormalized,
        ].includes(cleanLocation)
          ? 0
          : 1;

      if (aExact !== bExact) {
        return aExact - bExact;
      }
    }

    return a.name.localeCompare(b.name, "fr", {
      sensitivity: "base",
    });
  });
}

export async function loadPublishedDirectoryEntries(
  options: { country?: CountryCode } = {}
): Promise<DirectoryEntry[]> {
  const query: FirebaseFirestore.Query = dbAdmin
    .collection(DIRECTORY_COLLECTION)
    .where("status", "==", "published");

  const snap = await query.get();

  return snap.docs
    .map((doc) =>
      serializeDirectoryEntry(
        doc.id,
        doc.data()
      )
    )
    .filter(
      (entry) =>
        !options.country ||
        entry.country === options.country
    )
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "fr",
        { sensitivity: "base" }
      )
    );
}

async function loadPublishedDirectoryCandidates(
  location: string,
  country?: CountryCode
) {
  const cleanLocation =
    normalizeDirectoryText(location);

  const baseQuery: FirebaseFirestore.Query = dbAdmin
    .collection(DIRECTORY_COLLECTION)
    .where("status", "==", "published");

  if (!cleanLocation) {
    const snap = await baseQuery
      .limit(DIRECTORY_CANDIDATE_LIMIT)
      .get();

    return snap.docs
      .map((doc) =>
        serializeDirectoryEntry(doc.id, doc.data())
      )
      .filter(
        (entry) =>
          !country ||
          entry.country === country
      );
  }

  const locationFields = [
    "cityNormalized",
    "departmentNormalized",
    "regionNormalized",
    "postalCodeNormalized",
  ];

  const queryResults = await Promise.allSettled(
    locationFields.map(async (field) => {
      const snap = await baseQuery
        .where(field, "==", cleanLocation)
        .limit(DIRECTORY_CANDIDATE_LIMIT)
        .get();

      return snap.docs
        .map((doc) =>
          serializeDirectoryEntry(doc.id, doc.data())
        )
        .filter(
          (entry) =>
            !country ||
            entry.country === country
        );
    })
  );

  return queryResults.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value
      : []
  );
}

function mergeEntries(
  primary: DirectoryEntry[],
  secondary: DirectoryEntry[]
) {
  const map = new Map<string, DirectoryEntry>();

  for (const entry of primary) {
    map.set(entry.id, entry);
  }

  for (const entry of secondary) {
    if (!map.has(entry.id)) {
      map.set(entry.id, entry);
    }
  }

  return Array.from(map.values());
}

export async function searchPublishedDirectoryEntries({
  query,
  location,
  country,
  page = 1,
  limit = DEFAULT_SEARCH_LIMIT,
}: {
  query: string;
  location: string;
  country?: CountryCode;
  page?: number;
  limit?: number;
}): Promise<DirectorySearchResult> {
  const currentPage = clampPage(page);
  const pageSize = clampLimit(limit);
  const cleanLocation =
    normalizeDirectoryText(location);

  let candidates =
    await loadPublishedDirectoryCandidates(location, country);

  if (cleanLocation) {
    const legacyCandidates =
      await loadPublishedDirectoryCandidates("", country);

    candidates = mergeEntries(
      candidates,
      legacyCandidates.filter((entry) =>
        matchesLocation(entry, location)
      )
    );
  }

  const filtered = sortEntries(
    candidates.filter(
      (entry) =>
        matchesQuery(entry, query) &&
        matchesLocation(entry, location)
    ),
    location
  );

  const start = (currentPage - 1) * pageSize;
  const entries = filtered.slice(
    start,
    start + pageSize
  );

  return {
    entries,
    total: filtered.length,
    page: currentPage,
    pageSize,
    hasPreviousPage: currentPage > 1,
    hasNextPage: start + pageSize < filtered.length,
  };
}
