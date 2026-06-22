export interface DirectoryEntry {
  id: string;
  name: string;
  type: "Praticien" | "Établissement";
  category: string;
  specialty: string;
  city: string;
  department: string;
  address: string;
  phone?: string;
  website?: string;
  status?: string;
  tags: string[];
}

export const directoryEntries: DirectoryEntry[] = [];
