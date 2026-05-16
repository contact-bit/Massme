import type {
  Locale,
  NavbarDropdown,
} from "./navbar.types";

/* =========================================================
   LOGO
========================================================= */

export const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/500df708-673d-4a48-549d-d1b311a8e600/public";

/* =========================================================
   LANGUAGES
========================================================= */

export const LANGUAGES: {
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

const DE_TRANSLATIONS = {
  nav: {
    home: "Vitrektomie",

    pathologies: "Erkrankungen",

    operation: "Operation",

    recovery: "Erholung",

    testimonial: "Erfahrungen",

    directory: "Verzeichnis",

    faq: "FAQ",

    contact: "Kontakt",

    comfort: "Vitrektomie-Kissen",

    menu: "Menü",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Übersicht",

      macularHole:
        "Makulaloch",

      macularHoleRecovery:
        "Erholung Makulaloch",

      macularHoleTestimonial:
        "Erfahrungsbericht Makulaloch",

      retinalDetachment:
        "Netzhautablösung",

      floaters:
        "Glaskörpertrübungen",

      highMyopia:
        "Hohe Myopie",

      diabeticRetinopathy:
        "Diabetische Retinopathie",

      uveitis:
        "Uveitis",
    },

    operation: {
      overview:
        "Wie die Operation abläuft",

      risks:
        "Risiken und Komplikationen",

      endophthalmitis:
        "Endophthalmitis",

      vitreousHemorrhage:
        "Glaskörperblutung",

      retinalTear:
        "Netzhautriss",

      glaucoma:
        "Glaukom",
    },

    recovery: {
      overview:
        "Erholung nach Vitrektomie",

      pillow:
        "Vitrektomie-Kissen",
    },

    directory: {
      overview:
        "Netzhautspezialist finden",

      ophthalmologists:
        "Augenärzte Frankreich",

      ophthalmologistsAM:
        "Augenärzte Alpes-Maritimes",

      ophthalmologistsNice:
        "Augenärzte Nizza",

      clinics:
        "Kliniken Frankreich",

      clinicsAM:
        "Kliniken Alpes-Maritimes",

      clinicsNice:
        "Kliniken Nizza",
    },
  },
};

const IT_TRANSLATIONS = {
  nav: {
    home: "Vitrectomia",

    pathologies: "Patologie",

    operation: "Operazione",

    recovery: "Recupero",

    testimonial: "Testimonianze",

    directory: "Directory",

    faq: "FAQ",

    contact: "Contatto",

    comfort: "Cuscino vitrectomia",

    menu: "Menu",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Panoramica",

      macularHole:
        "Foro maculare",

      macularHoleRecovery:
        "Recupero foro maculare",

      macularHoleTestimonial:
        "Testimonianza foro maculare",

      retinalDetachment:
        "Distacco della retina",

      floaters:
        "Miodesopsie / corpi mobili",

      highMyopia:
        "Miopia elevata",

      diabeticRetinopathy:
        "Retinopatia diabetica",

      uveitis:
        "Uveite",
    },

    operation: {
      overview:
        "Come funziona l'operazione",

      risks:
        "Rischi e complicazioni",

      endophthalmitis:
        "Endoftalmite",

      vitreousHemorrhage:
        "Emorragia vitreale",

      retinalTear:
        "Lacerazione retinica",

      glaucoma:
        "Glaucoma",
    },

    recovery: {
      overview:
        "Recupero vitrectomia",

      pillow:
        "Cuscino vitrectomia",
    },

    directory: {
      overview:
        "Trova uno specialista retina",

      ophthalmologists:
        "Oculisti Francia",

      ophthalmologistsAM:
        "Oculisti Alpes-Maritimes",

      ophthalmologistsNice:
        "Oculisti Nizza",

      clinics:
        "Cliniche Francia",

      clinicsAM:
        "Cliniche Alpes-Maritimes",

      clinicsNice:
        "Cliniche Nizza",
    },
  },
};

const NL_TRANSLATIONS = {
  nav: {
    home: "Vitrectomie",

    pathologies: "Aandoeningen",

    operation: "Operatie",

    recovery: "Herstel",

    testimonial: "Getuigenissen",

    directory: "Directory",

    faq: "FAQ",

    contact: "Contact",

    comfort: "Vitrectomie-kussen",

    menu: "Menu",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Overzicht",

      macularHole:
        "Maculagat",

      macularHoleRecovery:
        "Herstel maculagat",

      macularHoleTestimonial:
        "Getuigenis maculagat",

      retinalDetachment:
        "Netvliesloslating",

      floaters:
        "Floaters / glasvochttroebelingen",

      highMyopia:
        "Hoge myopie",

      diabeticRetinopathy:
        "Diabetische retinopathie",

      uveitis:
        "Uveïtis",
    },

    operation: {
      overview:
        "Hoe de operatie verloopt",

      risks:
        "Risico's en complicaties",

      endophthalmitis:
        "Endoftalmitis",

      vitreousHemorrhage:
        "Glasvochtbloeding",

      retinalTear:
        "Netvliesscheur",

      glaucoma:
        "Glaucoom",
    },

    recovery: {
      overview:
        "Herstel vitrectomie",

      pillow:
        "Vitrectomie-kussen",
    },

    directory: {
      overview:
        "Vind een netvliesspecialist",

      ophthalmologists:
        "Oogartsen Frankrijk",

      ophthalmologistsAM:
        "Oogartsen Alpes-Maritimes",

      ophthalmologistsNice:
        "Oogartsen Nice",

      clinics:
        "Klinieken Frankrijk",

      clinicsAM:
        "Klinieken Alpes-Maritimes",

      clinicsNice:
        "Klinieken Nice",
    },
  },
};

const ES_TRANSLATIONS = {
  nav: {
    home: "Vitrectomía",

    pathologies: "Patologías",

    operation: "Operación",

    recovery: "Recuperación",

    testimonial: "Testimonios",

    directory: "Directorio",

    faq: "FAQ",

    contact: "Contacto",

    comfort: "Cojín vitrectomía",

    menu: "Menú",
  },

  dropdowns: {
    pathologies: {
      overview:
        "Resumen",

      macularHole:
        "Agujero macular",

      macularHoleRecovery:
        "Recuperación agujero macular",

      macularHoleTestimonial:
        "Testimonio agujero macular",

      retinalDetachment:
        "Desprendimiento de retina",

      floaters:
        "Moscas volantes / cuerpos flotantes",

      highMyopia:
        "Miopía alta",

      diabeticRetinopathy:
        "Retinopatía diabética",

      uveitis:
        "Uveítis",
    },

    operation: {
      overview:
        "Cómo funciona la operación",

      risks:
        "Riesgos y complicaciones",

      endophthalmitis:
        "Endoftalmitis",

      vitreousHemorrhage:
        "Hemorragia vítrea",

      retinalTear:
        "Desgarro de retina",

      glaucoma:
        "Glaucoma",
    },

    recovery: {
      overview:
        "Recuperación vitrectomía",

      pillow:
        "Cojín vitrectomía",
    },

    directory: {
      overview:
        "Encontrar un especialista retina",

      ophthalmologists:
        "Oftalmólogos Francia",

      ophthalmologistsAM:
        "Oftalmólogos Alpes Marítimos",

      ophthalmologistsNice:
        "Oftalmólogos Niza",

      clinics:
        "Hospitales y clínicas Francia",

      clinicsAM:
        "Hospitales y clínicas Alpes Marítimos",

      clinicsNice:
        "Hospitales y clínicas Niza",
    },
  },
};

export const TRANSLATIONS = {
  fr: FR_TRANSLATIONS,

  en: EN_TRANSLATIONS,

  es: ES_TRANSLATIONS,

  de: DE_TRANSLATIONS,

  it: IT_TRANSLATIONS,

  nl: NL_TRANSLATIONS,
} as const;

/* =========================================================
   HELPERS
========================================================= */

export function isLocale(
  value: string
): value is Locale {
  return LANGUAGES.some(
    (language) =>
      language.code === value
  );
}

/* =========================================================
   LINKS
========================================================= */

export function generateNavbarLinks(
  locale: Locale
) {
  const prefix = `/${locale}`;

  return {
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
  };
}

/* =========================================================
   DROPDOWNS
========================================================= */

export function generateDropdowns(
  locale: Locale
): NavbarDropdown[] {

  const t =
    TRANSLATIONS[locale] ??
    EN_TRANSLATIONS;

  const dropdowns =
    t.dropdowns ??
    EN_TRANSLATIONS.dropdowns;

  const links =
    generateNavbarLinks(locale);

  return [
    {
      label:
        t.nav.pathologies,

      href: links.pathologies,

      items: [
        {
          label:
            dropdowns
              .pathologies
              .overview,

          href:
            links.pathologies,
        },

        {
          label:
            dropdowns
              .pathologies
              .macularHole,

          href:
            links.macularHole,
        },

        {
          label:
            dropdowns
              .pathologies
              .macularHoleRecovery,

          href:
            links.macularHoleRecovery,
        },

        {
          label:
            dropdowns
              .pathologies
              .macularHoleTestimonial,

          href:
            links.macularHoleTestimonial,
        },

        {
          label:
            dropdowns
              .pathologies
              .retinalDetachment,

          href:
            links.retinalDetachment,
        },

        {
          label:
            dropdowns
              .pathologies
              .floaters,

          href:
            links.floaters,
        },

        {
          label:
            dropdowns
              .pathologies
              .highMyopia,

          href:
            links.highMyopia,
        },

        {
          label:
            dropdowns
              .pathologies
              .diabeticRetinopathy,

          href:
            links.diabeticRetinopathy,
        },

        {
          label:
            dropdowns
              .pathologies
              .uveitis,

          href:
            links.uveitis,
        },
      ],
    },

    {
      label:
        t.nav.operation,

      href: links.operation,

      items: [
        {
          label:
            dropdowns
              .operation
              .overview,

          href:
            links.operation,
        },

        {
          label:
            dropdowns
              .operation
              .risks,

          href:
            links.operationRisks,
        },

        {
          label:
            dropdowns
              .operation
              .endophthalmitis,

          href:
            links.endophthalmitis,
        },

        {
          label:
            dropdowns
              .operation
              .vitreousHemorrhage,

          href:
            links.vitreousHemorrhage,
        },

        {
          label:
            dropdowns
              .operation
              .retinalTear,

          href:
            links.retinalTear,
        },

        {
          label:
            dropdowns
              .operation
              .glaucoma,

          href:
            links.glaucoma,
        },
      ],
    },

    {
      label:
        t.nav.recovery,

      href: links.recovery,

      items: [
        {
          label:
            dropdowns
              .recovery
              .overview,

          href:
            links.recovery,
        },

        {
          label:
            dropdowns
              .recovery
              .pillow,

          href:
            links.comfort,
        },
      ],
    },

    {
      label:
        t.nav.directory,

      href: links.directory,

      items: [
        {
          label:
            dropdowns
              .directory
              .overview,

          href:
            links.directory,
        },

        {
          label:
            dropdowns
              .directory
              .ophthalmologists,

          href:
            links.ophthalmologists,
        },

        {
          label:
            dropdowns
              .directory
              .ophthalmologistsAM,

          href:
            links.ophthalmologistsAM,
        },

        {
          label:
            dropdowns
              .directory
              .ophthalmologistsNice,

          href:
            links.ophthalmologistsNice,
        },

        {
          label:
            dropdowns
              .directory
              .clinics,

          href:
            links.clinics,
        },

        {
          label:
            dropdowns
              .directory
              .clinicsAM,

          href:
            links.clinicsAM,
        },

        {
          label:
            dropdowns
              .directory
              .clinicsNice,

          href:
            links.clinicsNice,
        },
      ],
    },
  ];
}