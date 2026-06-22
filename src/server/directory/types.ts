import type { CountryCode } from "@/lib/shipping-i18n";

export type DirectoryEntryType =
  | "surgeon"
  | "establishment";

export type DirectoryEntryStatus =
  | "draft"
  | "published"
  | "archived";

export interface DirectoryEntry {
  id: string;
  country: CountryCode;
  type: DirectoryEntryType;
  status: DirectoryEntryStatus;
  name: string;
  specialty: string;
  category: string;
  city: string;
  department: string;
  region: string;
  postalCode: string;
  address: string;
  phone: string;
  website: string;
  appointmentUrl: string;
  tags: string[];
  cityNormalized: string;
  departmentNormalized: string;
  regionNormalized: string;
  postalCodeNormalized: string;
  searchText: string;
  searchTokens: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export const DIRECTORY_COLLECTION =
  "directory_entries";

export const DIRECTORY_ENTRY_TYPES: DirectoryEntryType[] = [
  "surgeon",
  "establishment",
];

export const DIRECTORY_ENTRY_STATUSES: DirectoryEntryStatus[] = [
  "draft",
  "published",
  "archived",
];
