import type { CountryCode } from "@/lib/shipping-i18n";
import type {
  DirectoryEntry,
  DirectoryEntryStatus,
  DirectoryEntryType,
} from "./types";
import {
  DIRECTORY_ENTRY_STATUSES,
  DIRECTORY_ENTRY_TYPES,
} from "./types";

function cleanString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function normalizeDirectoryText(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueTokens(value: string) {
  return Array.from(
    new Set(
      normalizeDirectoryText(value)
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
    )
  ).slice(0, 80);
}

function cleanUrl(value: unknown) {
  const url = cleanString(value);

  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `https://${url}`;
}

function cleanTags(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map(cleanString)
      .filter(Boolean)
      .slice(0, 12);
  }

  return cleanString(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function isCountryCode(value: unknown): value is CountryCode {
  return (
    value === "FR" ||
    value === "GB" ||
    value === "DE" ||
    value === "ES" ||
    value === "IT" ||
    value === "NL" ||
    value === "CH"
  );
}

function isEntryType(
  value: unknown
): value is DirectoryEntryType {
  return (
    typeof value === "string" &&
    DIRECTORY_ENTRY_TYPES.includes(
      value as DirectoryEntryType
    )
  );
}

function isEntryStatus(
  value: unknown
): value is DirectoryEntryStatus {
  return (
    typeof value === "string" &&
    DIRECTORY_ENTRY_STATUSES.includes(
      value as DirectoryEntryStatus
    )
  );
}

export function normalizeDirectoryPayload(
  value: unknown,
  previous?: Partial<DirectoryEntry>
) {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const type = isEntryType(record.type)
    ? record.type
    : previous?.type || "surgeon";

  const status = isEntryStatus(record.status)
    ? record.status
    : previous?.status || "draft";
  const country = isCountryCode(record.country)
    ? record.country
    : previous?.country || "FR";

  const now = new Date().toISOString();
  const wasPublished =
    previous?.status === "published";
  const becomesPublished =
    status === "published";
  const name =
    cleanString(record.name) ||
    previous?.name ||
    "";
  const specialty =
    cleanString(record.specialty) ||
    previous?.specialty ||
    "Chirurgie vitréo-rétinienne";
  const category =
    cleanString(record.category) ||
    previous?.category ||
    (type === "surgeon"
      ? "Chirurgien rétine"
      : "Établissement spécialisé");
  const city =
    cleanString(record.city) ||
    previous?.city ||
    "";
  const department =
    cleanString(record.department) ||
    previous?.department ||
    "";
  const region =
    cleanString(record.region) ||
    previous?.region ||
    "";
  const postalCode =
    cleanString(record.postalCode) ||
    previous?.postalCode ||
    "";
  const address =
    cleanString(record.address) ||
    previous?.address ||
    "";
  const tags =
    cleanTags(record.tags).length > 0
      ? cleanTags(record.tags)
      : previous?.tags || [
          "Vitrectomie",
          "Rétine",
        ];
  const typeWords =
    type === "surgeon"
      ? "chirurgien chirurgienne docteur medecin praticien specialiste"
      : "etablissement hopital clinique centre";
  const retinaWords =
    "retine retinien retinienne vitrectomie vitreo retinien vitreo retinienne ophtalmologie";
  const searchText =
    normalizeDirectoryText(
      [
        name,
        type,
        country,
        category,
        specialty,
        city,
        department,
        region,
        postalCode,
        address,
        tags.join(" "),
        typeWords,
        retinaWords,
      ].join(" ")
    );

  return {
    country,
    type,
    status,
    name,
    specialty,
    category,
    city,
    department,
    region,
    postalCode,
    address,
    phone:
      cleanString(record.phone) ||
      previous?.phone ||
      "",
    website:
      cleanUrl(record.website) ||
      previous?.website ||
      "",
    appointmentUrl:
      cleanUrl(record.appointmentUrl) ||
      previous?.appointmentUrl ||
      "",
    tags,
    cityNormalized:
      normalizeDirectoryText(city),
    departmentNormalized:
      normalizeDirectoryText(department),
    regionNormalized:
      normalizeDirectoryText(region),
    postalCodeNormalized:
      normalizeDirectoryText(postalCode),
    searchText,
    searchTokens: uniqueTokens(searchText),
    notes:
      cleanString(record.notes) ||
      previous?.notes ||
      "",
    updatedAt: now,
    publishedAt:
      becomesPublished && !wasPublished
        ? now
        : previous?.publishedAt || null,
  };
}

export function serializeDirectoryEntry(
  id: string,
  data: FirebaseFirestore.DocumentData
): DirectoryEntry {
  const entry = {
    id,
    country: isCountryCode(data.country)
      ? data.country
      : "FR",
    type: isEntryType(data.type)
      ? data.type
      : "surgeon",
    status: isEntryStatus(data.status)
      ? data.status
      : "draft",
    name: cleanString(data.name),
    specialty: cleanString(data.specialty),
    category: cleanString(data.category),
    city: cleanString(data.city),
    department: cleanString(data.department),
    region: cleanString(data.region),
    postalCode: cleanString(data.postalCode),
    address: cleanString(data.address),
    phone: cleanString(data.phone),
    website: cleanString(data.website),
    appointmentUrl: cleanString(data.appointmentUrl),
    tags: cleanTags(data.tags),
    cityNormalized:
      cleanString(data.cityNormalized),
    departmentNormalized:
      cleanString(data.departmentNormalized),
    regionNormalized:
      cleanString(data.regionNormalized),
    postalCodeNormalized:
      cleanString(data.postalCodeNormalized),
    searchText:
      cleanString(data.searchText),
    searchTokens: cleanTags(data.searchTokens),
    notes: cleanString(data.notes),
    createdAt: cleanString(data.createdAt),
    updatedAt: cleanString(data.updatedAt),
    publishedAt:
      cleanString(data.publishedAt) || null,
  };

  return {
    ...entry,
    cityNormalized:
      entry.cityNormalized ||
      normalizeDirectoryText(entry.city),
    departmentNormalized:
      entry.departmentNormalized ||
      normalizeDirectoryText(entry.department),
    regionNormalized:
      entry.regionNormalized ||
      normalizeDirectoryText(entry.region),
    postalCodeNormalized:
      entry.postalCodeNormalized ||
      normalizeDirectoryText(entry.postalCode),
    searchText:
      entry.searchText ||
      normalizeDirectoryText(
        [
          entry.name,
          entry.type,
          entry.category,
          entry.specialty,
          entry.city,
          entry.department,
          entry.region,
          entry.postalCode,
          entry.address,
          entry.tags.join(" "),
        ].join(" ")
      ),
    searchTokens:
      entry.searchTokens.length > 0
        ? entry.searchTokens
        : uniqueTokens(
            [
              entry.name,
              entry.category,
              entry.specialty,
              entry.city,
              entry.department,
              entry.region,
              entry.postalCode,
              entry.address,
              entry.tags.join(" "),
            ].join(" ")
          ),
  };
}
