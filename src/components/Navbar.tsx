"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import "@/styles/shop/components/navbar.css";

/* =========================================================
   VITRECTOMED — PREMIUM MEDICAL NAVBAR
========================================================= */

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/500df708-673d-4a48-549d-d1b311a8e600/public";

/* =========================================================
   LOCALES
========================================================= */

type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "nl";

const LANGUAGES: {
  code: Locale;
  label: string;
  flag: string;
}[] = [
  {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
  },

  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
  },

  {
    code: "es",
    label: "Español",
    flag: "🇪🇸",
  },

  {
    code: "de",
    label: "Deutsch",
    flag: "🇩🇪",
  },

  {
    code: "it",
    label: "Italiano",
    flag: "🇮🇹",
  },

  {
    code: "nl",
    label: "Nederlands",
    flag: "🇳🇱",
  },
];

/* =========================================================
   TRANSLATIONS
========================================================= */

const FR_TRANSLATIONS = {
  nav: {
    home: "Vitrectomie",

    pathologies: "Pathologies",

    operation: "Opération",

    recovery: "Convalescence",

    testimonial: "Témoignages",

    directory: "Annuaire",

    faq: "FAQ",

    contact: "Contact",

    comfort: "Coussin vitrectomie",

    menu: "Menu",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Vue d’ensemble",

      macularHole:
        "Trou maculaire",

      macularHoleRecovery:
        "Convalescence trou maculaire",

      macularHoleTestimonial:
        "Témoignage trou maculaire",

      retinalDetachment:
        "Décollement de rétine",

      floaters:
        "Mouches volantes / corps flottants",

      highMyopia:
        "Myopie forte",

      diabeticRetinopathy:
        "Rétinopathie diabétique",

      uveitis:
        "Uvéite",
    },

    operation: {
      overview:
        "Comment se déroule l'opération",

      risks:
        "Risques et complications",

      endophthalmitis:
        "Endophtalmie",

      vitreousHemorrhage:
        "Hémorragie du vitré",

      retinalTear:
        "Déchirure de rétine",

      glaucoma:
        "Glaucome",
    },

    recovery: {
      overview:
        "Convalescence vitrectomie",

      pillow:
        "Coussin vitrectomie",
    },

    directory: {
      overview:
        "Trouver un praticien rétine",

      ophthalmologists:
        "Ophtalmologues France",

      ophthalmologistsAM:
        "Ophtalmologues Alpes-Maritimes",

      ophthalmologistsNice:
        "Ophtalmologues Nice",

      clinics:
        "Hôpitaux & cliniques France",

      clinicsAM:
        "Hôpitaux & cliniques Alpes-Maritimes",

      clinicsNice:
        "Hôpitaux & cliniques Nice",
    },
  },
};

const EN_TRANSLATIONS = {
  nav: {
    home: "Vitrectomy",

    pathologies: "Conditions",

    operation: "Surgery",

    recovery: "Recovery",

    testimonial: "Testimonials",

    directory: "Directory",

    faq: "FAQ",

    contact: "Contact",

    comfort: "Vitrectomy pillow",

    menu: "Menu",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Overview",

      macularHole:
        "Macular hole",

      macularHoleRecovery:
        "Macular hole recovery",

      macularHoleTestimonial:
        "Macular hole testimonial",

      retinalDetachment:
        "Retinal detachment",

      floaters:
        "Eye floaters",

      highMyopia:
        "High myopia",

      diabeticRetinopathy:
        "Diabetic retinopathy",

      uveitis:
        "Uveitis",
    },

    operation: {
      overview:
        "How surgery works",

      risks:
        "Risks & complications",

      endophthalmitis:
        "Endophthalmitis",

      vitreousHemorrhage:
        "Vitreous hemorrhage",

      retinalTear:
        "Retinal tear",

      glaucoma:
        "Glaucoma",
    },

    recovery: {
      overview:
        "Vitrectomy recovery",

      pillow:
        "Vitrectomy pillow",
    },

    directory: {
      overview:
        "Find a retina specialist",

      ophthalmologists:
        "Ophthalmologists France",

      ophthalmologistsAM:
        "Ophthalmologists Alpes-Maritimes",

      ophthalmologistsNice:
        "Ophthalmologists Nice",

      clinics:
        "Clinics France",

      clinicsAM:
        "Clinics Alpes-Maritimes",

      clinicsNice:
        "Clinics Nice",
    },
  },
};

const TRANSLATIONS = {
  fr: FR_TRANSLATIONS,

  en: EN_TRANSLATIONS,

  es: EN_TRANSLATIONS,

  de: EN_TRANSLATIONS,

  it: EN_TRANSLATIONS,

  nl: EN_TRANSLATIONS,
} as const;

/* =========================================================
   TYPES
========================================================= */

interface NavbarProps {
  locale: Locale;
}

/* =========================================================
   HELPERS
========================================================= */

function isLocale(
  value: string
): value is Locale {
  return LANGUAGES.some(
    (language) =>
      language.code === value
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Navbar({
  locale,
}: NavbarProps) {
  const pathname =
    usePathname() || "";

  /* =====================================================
     STATES
  ===================================================== */

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [langOpen, setLangOpen] =
    useState(false);

  const [openDropdown, setOpenDropdown] =
    useState<
      | null
      | "pathologies"
      | "operation"
      | "recovery"
      | "directory"
    >(null);

  /* =====================================================
     REFS
  ===================================================== */

  const langRef =
    useRef<HTMLDivElement>(null);

  const dropdownsRef =
    useRef<HTMLDivElement>(null);

  /* =====================================================
     ACTIVE LOCALE
  ===================================================== */

  const urlLocale =
    pathname.split("/")[1];

  const activeLocale: Locale =
    isLocale(urlLocale)
      ? urlLocale
      : locale;

  const t =
    TRANSLATIONS[activeLocale];

  const currentLang =
    LANGUAGES.find(
      (language) =>
        language.code === activeLocale
    )!;

  /* =====================================================
     URLS
     EXACT MATCH WITH REQUIRED URL STRUCTURE
  ===================================================== */

 const prefix = `/${activeLocale}`;

  const links = useMemo(
    () => ({
      home: `${prefix}/`,

      /* =========================
         PATHOLOGIES
      ========================= */

      pathologies:
        `${prefix}/pathologies`,

      macularHole:
        `${prefix}/pathologies/trou-maculaire`,

      macularHoleRecovery:
        `${prefix}/pathologies/trou-maculaire/convalescence`,

      macularHoleTestimonial:
        `${prefix}/pathologies/trou-maculaire/temoignage`,

      retinalDetachment:
        `${prefix}/pathologies/decollement-retine`,

      floaters:
        `${prefix}/pathologies/mouches-volantes-ou-corps-flottants`,

      highMyopia:
        `${prefix}/pathologies/myopie-forte`,

      diabeticRetinopathy:
        `${prefix}/pathologies/retinopathie-diabetique`,

      uveitis:
        `${prefix}/pathologies/uveite`,

      /* =========================
         OPERATION
      ========================= */

      operation:
        `${prefix}/operation`,

      operationRisks:
        `${prefix}/operation/risque`,

      endophthalmitis:
  `${prefix}/operation/risques/endophtalmie`,
  
      vitreousHemorrhage:
        `${prefix}/operation/risque/hemorragie-du-vitre`,

      retinalTear:
        `${prefix}/operation/risque/dechirure-de-retine`,

      glaucoma:
        `${prefix}/operation/risque/glaucome`,

      /* =========================
         RECOVERY
      ========================= */

      recovery:
        `${prefix}/convalescence`,

      comfort:
        `${prefix}/convalescence/coussin`,

      /* =========================
         TESTIMONIAL
      ========================= */

      testimonial:
        `${prefix}/temoignage`,

      /* =========================
         DIRECTORY
      ========================= */

      directory:
        `${prefix}/annuaire`,

      ophthalmologists:
        `${prefix}/annuaire/ophtalmologue`,

      ophthalmologistsAM:
        `${prefix}/annuaire/ophtalmologue/alpes-maritimes`,

      ophthalmologistsNice:
        `${prefix}/annuaire/ophtalmologue/alpes-maritimes/nice`,

      clinics:
        `${prefix}/annuaire/hopitaux-cliniques`,

      clinicsAM:
        `${prefix}/annuaire/hopitaux-cliniques/alpes-maritimes`,

      clinicsNice:
        `${prefix}/annuaire/hopitaux-cliniques/alpes-maritimes/nice`,

      /* =========================
         STATIC
      ========================= */

      faq:
        `${prefix}/faq`,

      contact:
        `${prefix}/contact`,
    }),
    [prefix]
  );

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

  /* =====================================================
     EFFECTS
  ===================================================== */

  useEffect(() => {
    setMobileOpen(false);

    setLangOpen(false);

    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        langRef.current &&
        !langRef.current.contains(
          event.target as Node
        )
      ) {
        setLangOpen(false);
      }

      if (
        dropdownsRef.current &&
        !dropdownsRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenDropdown(null);
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

  return (
    <header className="vm-navbar">
      <nav className="vm-navbar__inner">
        {/* =================================================
           LEFT
        ================================================= */}

        <div className="vm-navbar__left">
          <Link
            href={links.home}
            className="vm-navbar__logo"
            aria-label="VitrectoMed"
          >
            <img
              src={LOGO_URL}
              alt="VitrectoMed"
              className="vm-navbar__logo-image"
              loading="eager"
            />
          </Link>
        </div>

        {/* =================================================
           DESKTOP NAV
        ================================================= */}

        <div
          className="vm-navbar__desktop"
          ref={dropdownsRef}
        >
          <NavLink href={links.home}>
            {t.nav.home}
          </NavLink>

          {/* PATHOLOGIES */}

<DesktopDropdown
  label={t.nav.pathologies}
  href={links.pathologies}
  isOpen={
    openDropdown ===
    "pathologies"
  }
  onToggle={() =>
    setOpenDropdown(
      openDropdown ===
        "pathologies"
        ? null
        : "pathologies"
    )
  }
>

            <DropdownLink
              href={links.pathologies}
            >
              {
                t.dropdowns.pathologies
                  .overview
              }
            </DropdownLink>

            <DropdownLink
              href={links.macularHole}
            >
              {
                t.dropdowns.pathologies
                  .macularHole
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.macularHoleRecovery
              }
            >
              {
                t.dropdowns.pathologies
                  .macularHoleRecovery
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.macularHoleTestimonial
              }
            >
              {
                t.dropdowns.pathologies
                  .macularHoleTestimonial
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.retinalDetachment
              }
            >
              {
                t.dropdowns.pathologies
                  .retinalDetachment
              }
            </DropdownLink>

            <DropdownLink
              href={links.floaters}
            >
              {
                t.dropdowns.pathologies
                  .floaters
              }
            </DropdownLink>

            <DropdownLink
              href={links.highMyopia}
            >
              {
                t.dropdowns.pathologies
                  .highMyopia
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.diabeticRetinopathy
              }
            >
              {
                t.dropdowns.pathologies
                  .diabeticRetinopathy
              }
            </DropdownLink>

            <DropdownLink
              href={links.uveitis}
            >
              {
                t.dropdowns.pathologies
                  .uveitis
              }
            </DropdownLink>
          </DesktopDropdown>

          {/* OPERATION */}

          <DesktopDropdown
  label={t.nav.operation}
  href={links.operation}
  isOpen={
    openDropdown ===
    "operation"
  }
  onToggle={() =>
    setOpenDropdown(
      openDropdown ===
        "operation"
        ? null
        : "operation"
    )
  }
>
            <DropdownLink
              href={links.operation}
            >
              {
                t.dropdowns.operation
                  .overview
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.operationRisks
              }
            >
              {
                t.dropdowns.operation
                  .risks
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.endophthalmitis
              }
            >
              {
                t.dropdowns.operation
                  .endophthalmitis
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.vitreousHemorrhage
              }
            >
              {
                t.dropdowns.operation
                  .vitreousHemorrhage
              }
            </DropdownLink>

            <DropdownLink
              href={links.retinalTear}
            >
              {
                t.dropdowns.operation
                  .retinalTear
              }
            </DropdownLink>

            <DropdownLink
              href={links.glaucoma}
            >
              {
                t.dropdowns.operation
                  .glaucoma
              }
            </DropdownLink>
          </DesktopDropdown>

          {/* RECOVERY */}

          <DesktopDropdown
  label={t.nav.recovery}
  href={links.recovery}
  isOpen={
    openDropdown ===
    "recovery"
  }
  onToggle={() =>
    setOpenDropdown(
      openDropdown ===
        "recovery"
        ? null
        : "recovery"
    )
  }
>
            <DropdownLink
              href={links.recovery}
            >
              {
                t.dropdowns.recovery
                  .overview
              }
            </DropdownLink>

            <DropdownLink
              href={links.comfort}
            >
              {
                t.dropdowns.recovery
                  .pillow
              }
            </DropdownLink>
          </DesktopDropdown>

          <NavLink
            href={links.testimonial}
          >
            {t.nav.testimonial}
          </NavLink>

          {/* DIRECTORY */}

          <DesktopDropdown
  label={t.nav.directory}
  href={links.directory}
  isOpen={
    openDropdown ===
    "directory"
  }
  onToggle={() =>
    setOpenDropdown(
      openDropdown ===
        "directory"
        ? null
        : "directory"
    )
  }
>
            <DropdownLink
              href={links.directory}
            >
              {
                t.dropdowns.directory
                  .overview
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.ophthalmologists
              }
            >
              {
                t.dropdowns.directory
                  .ophthalmologists
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.ophthalmologistsAM
              }
            >
              {
                t.dropdowns.directory
                  .ophthalmologistsAM
              }
            </DropdownLink>

            <DropdownLink
              href={
                links.ophthalmologistsNice
              }
            >
              {
                t.dropdowns.directory
                  .ophthalmologistsNice
              }
            </DropdownLink>

            <DropdownLink
              href={links.clinics}
            >
              {
                t.dropdowns.directory
                  .clinics
              }
            </DropdownLink>

            <DropdownLink
              href={links.clinicsAM}
            >
              {
                t.dropdowns.directory
                  .clinicsAM
              }
            </DropdownLink>

            <DropdownLink
              href={links.clinicsNice}
            >
              {
                t.dropdowns.directory
                  .clinicsNice
              }
            </DropdownLink>
          </DesktopDropdown>

          <NavLink href={links.faq}>
            {t.nav.faq}
          </NavLink>

          <NavLink href={links.contact}>
            {t.nav.contact}
          </NavLink>
        </div>

        {/* =================================================
           RIGHT
        ================================================= */}

        <div className="vm-navbar__right">
          <Link
            href={links.comfort}
            className="vm-navbar__cta"
          >
            {t.nav.comfort}
          </Link>

          {/* LANGUAGE */}

          <div
            className="vm-navbar__lang"
            ref={langRef}
          >
            <button
              type="button"
              className="vm-navbar__lang-button"
              aria-label="Change language"
              onClick={() =>
                setLangOpen(
                  !langOpen
                )
              }
            >
              <span>
                {currentLang.flag}
              </span>

              <ChevronDown
                size={15}
              />
            </button>

            {langOpen && (
              <div className="vm-navbar__lang-dropdown">
                {LANGUAGES.map(
                  (
                    language
                  ) => (
                    <Link
                      key={
                        language.code
                      }
                      href={switchLocaleHref(
                        language.code
                      )}
                      className="vm-navbar__lang-item"
                      onClick={() =>
                        setLangOpen(
                          false
                        )
                      }
                    >
                      <span>
                        {
                          language.flag
                        }
                      </span>

                      <span>
                        {
                          language.label
                        }
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* BURGER */}

          <button
            type="button"
            className="vm-navbar__burger"
            aria-label={
              t.nav.menu
            }
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
          >
            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </nav>

      {/* ===================================================
         MOBILE MENU
      =================================================== */}

      {mobileOpen && (
        <div className="vm-mobile-menu">
          <MobileLink
            href={links.home}
            label={t.nav.home}
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <MobileDropdown
            label={t.nav.pathologies}
          >
            <MobileLink
              href={links.pathologies}
              label={
                t.dropdowns
                  .pathologies
                  .overview
              }
            />

            <MobileLink
              href={links.macularHole}
              label={
                t.dropdowns
                  .pathologies
                  .macularHole
              }
            />

            <MobileLink
              href={
                links.macularHoleRecovery
              }
              label={
                t.dropdowns
                  .pathologies
                  .macularHoleRecovery
              }
            />

            <MobileLink
              href={
                links.macularHoleTestimonial
              }
              label={
                t.dropdowns
                  .pathologies
                  .macularHoleTestimonial
              }
            />

            <MobileLink
              href={
                links.retinalDetachment
              }
              label={
                t.dropdowns
                  .pathologies
                  .retinalDetachment
              }
            />

            <MobileLink
              href={links.floaters}
              label={
                t.dropdowns
                  .pathologies
                  .floaters
              }
            />

            <MobileLink
              href={links.highMyopia}
              label={
                t.dropdowns
                  .pathologies
                  .highMyopia
              }
            />

            <MobileLink
              href={
                links.diabeticRetinopathy
              }
              label={
                t.dropdowns
                  .pathologies
                  .diabeticRetinopathy
              }
            />

            <MobileLink
              href={links.uveitis}
              label={
                t.dropdowns
                  .pathologies
                  .uveitis
              }
            />
          </MobileDropdown>

          <MobileDropdown
            label={t.nav.operation}
          >
            <MobileLink
              href={links.operation}
              label={
                t.dropdowns
                  .operation
                  .overview
              }
            />

            <MobileLink
              href={
                links.operationRisks
              }
              label={
                t.dropdowns
                  .operation
                  .risks
              }
            />

            <MobileLink
              href={
                links.endophthalmitis
              }
              label={
                t.dropdowns
                  .operation
                  .endophthalmitis
              }
            />

            <MobileLink
              href={
                links.vitreousHemorrhage
              }
              label={
                t.dropdowns
                  .operation
                  .vitreousHemorrhage
              }
            />

            <MobileLink
              href={links.retinalTear}
              label={
                t.dropdowns
                  .operation
                  .retinalTear
              }
            />

            <MobileLink
              href={links.glaucoma}
              label={
                t.dropdowns
                  .operation
                  .glaucoma
              }
            />
          </MobileDropdown>

          <MobileDropdown
            label={t.nav.recovery}
          >
            <MobileLink
              href={links.recovery}
              label={
                t.dropdowns
                  .recovery
                  .overview
              }
            />

            <MobileLink
              href={links.comfort}
              label={
                t.dropdowns
                  .recovery
                  .pillow
              }
            />
          </MobileDropdown>

          <MobileLink
            href={links.testimonial}
            label={
              t.nav.testimonial
            }
          />

          <MobileDropdown
            label={t.nav.directory}
          >
            <MobileLink
              href={links.directory}
              label={
                t.dropdowns
                  .directory
                  .overview
              }
            />

            <MobileLink
              href={
                links.ophthalmologists
              }
              label={
                t.dropdowns
                  .directory
                  .ophthalmologists
              }
            />

            <MobileLink
              href={
                links.ophthalmologistsAM
              }
              label={
                t.dropdowns
                  .directory
                  .ophthalmologistsAM
              }
            />

            <MobileLink
              href={
                links.ophthalmologistsNice
              }
              label={
                t.dropdowns
                  .directory
                  .ophthalmologistsNice
              }
            />

            <MobileLink
              href={links.clinics}
              label={
                t.dropdowns
                  .directory
                  .clinics
              }
            />

            <MobileLink
              href={links.clinicsAM}
              label={
                t.dropdowns
                  .directory
                  .clinicsAM
              }
            />

            <MobileLink
              href={links.clinicsNice}
              label={
                t.dropdowns
                  .directory
                  .clinicsNice
              }
            />
          </MobileDropdown>

          <MobileLink
            href={links.faq}
            label={t.nav.faq}
          />

          <MobileLink
            href={links.contact}
            label={t.nav.contact}
          />

          <Link
            href={links.comfort}
            className="vm-mobile-menu__cta"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            {t.nav.comfort}
          </Link>
        </div>
      )}
    </header>
  );
}

/* =========================================================
   SUB COMPONENTS
========================================================= */

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="vm-navbar__link"
  >
    {children}
  </Link>
);

const DropdownLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="vm-navbar__dropdown-link"
  >
    {children}
  </Link>
);

const DesktopDropdown = ({
  label,
  children,
  isOpen,
  onToggle,
}: {
  label: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="vm-navbar__dropdown-wrapper">
      <button
        type="button"
        className="vm-navbar__link vm-navbar__trigger"
        onClick={onToggle}
      >
        <span>{label}</span>

        <ChevronDown
          size={15}
          className={
            isOpen
              ? "rotate-180"
              : ""
          }
        />
      </button>

      {isOpen && (
        <div className="vm-navbar__dropdown">
          {children}
        </div>
      )}
    </div>
  );
};

const MobileLink = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    className="vm-mobile-menu__link"
    onClick={onClick}
  >
    {label}
  </Link>
);

const MobileDropdown = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const [open, setOpen] =
    useState(false);

  return (
    <div
      className={`vm-mobile-dropdown ${
        open
          ? "vm-mobile-dropdown--open"
          : ""
      }`}
    >
      <button
        type="button"
        className="vm-mobile-dropdown__trigger"
        onClick={() =>
          setOpen(!open)
        }
      >
        <span>{label}</span>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="vm-mobile-dropdown__content">
          {children}
        </div>
      )}
    </div>
  );
};