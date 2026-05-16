export type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "nl";

export interface NavbarProps {
  locale: Locale;
}

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarDropdownItem {
  label: string;
  href: string;
}

export interface NavbarDropdown {
  label: string;
  href?: string;

  items: NavbarDropdownItem[];
}