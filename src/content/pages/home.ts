import type { LocalizedPageContent } from "./i18n";
import type { PathologyIconKey } from "./pathologies";

export type HomeIconKey =
  | PathologyIconKey
  | "badge"
  | "check"
  | "clipboard"
  | "faq"
  | "file"
  | "globe"
  | "map"
  | "target"
  | "user";

export type HomePageContent = {
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    updatedAt: string;
    imageAlt: string;
  };
  certification: {
    title: string;
    items: Array<{
      icon: HomeIconKey;
      text: string;
    }>;
    productAlt: string;
    productTitle: string;
    productText: string;
    productCta: string;
  };
  trust: Array<{
    icon: HomeIconKey;
    text: string;
  }>;
  notice: {
    text: string;
    cta: string;
  };
  journey: {
    title: string;
    description: string;
    guideAria: string;
    guides: string[];
    cards: Array<{
      title: string;
      text: string;
      href: string;
      icon: HomeIconKey;
    }>;
  };
  understand: {
    label: string;
    title: string;
    description: string;
    stages: Array<{
      title: string;
      text: string;
      state: "normal" | "early" | "complete" | "advanced";
    }>;
    explainerTitle: string;
    explainerText: string;
    explainerCta: string;
  };
  infoCards: Array<{
    icon: HomeIconKey;
    title: string;
    items: string[];
  }>;
  treatment: {
    title: string;
    text: string;
    cta: string;
    imageAlt: string;
  };
  pathologies: {
    title: string;
    description: string;
    cta: string;
    cards: Array<{
      title: string;
      text: string;
      href: string;
      icon: HomeIconKey;
    }>;
  };
  recovery: {
    title: string;
    text: string;
    metrics: Array<{
      title: string;
      text: string;
    }>;
  };
  specialist: {
    imageAlt: string;
    title: string;
    text: string;
    items: string[];
    cta: string;
  };
  faq: {
    title: string;
    cta: string;
    items: string[];
  };
  final: {
    imageAlt: string;
    title: string;
    text: string;
    points: string[];
    cta: string;
  };
};

export const homeContent: LocalizedPageContent<HomePageContent> = {
  fr: {
    metadata: {
      title: "VitrectoMed : comprendre, se préparer, récupérer",
      description:
        "Guides médicaux, ressources sur la vitrectomie et solution de confort pour accompagner la récupération après chirurgie rétinienne.",
    },
    hero: {
      kicker: "Guide patient après vitrectomie",
      title: "Vitrectomie :",
      subtitle:
        "comprendre l’intervention, les indications et le parcours de soins",
      description:
        "Des informations fiables pour comprendre votre intervention, votre récupération et votre convalescence après une vitrectomie.",
      primaryCta: "Comprendre ma récupération",
      secondaryCta: "Trouver un spécialiste",
      updatedAt: "Dernière mise à jour : Juin 2026",
      imageAlt:
        "Consultation entre un ophtalmologue et une patiente devant des examens de rétine",
    },
    certification: {
      title: "Dispositif médical",
      items: [
        {
          icon: "badge",
          text: "Dispositif médical marqué CE",
        },
        {
          icon: "user",
          text: "Français, English, Deutsch",
        },
        {
          icon: "file",
          text: "Disponible en +20 langues",
        },
        {
          icon: "heart",
          text: "Accompagnement patient",
        },
      ],
      productAlt: "Dispositif médical VitrectoMed",
      productTitle: "Dispositif médical Vitrectomed",
      productText:
        "Conçu pour faciliter le positionnement après vitrectomie.",
      productCta: "Découvrir la solution",
    },
    trust: [
      {
        icon: "shield",
        text: "Informations validées par des spécialistes",
      },
      {
        icon: "stethoscope",
        text: "Chirurgiens référencés et vérifiés",
      },
      {
        icon: "calendar",
        text: "Mise à jour régulière des contenus",
      },
      {
        icon: "globe",
        text: "Disponible en +20 langues",
      },
    ],
    notice: {
      text:
        "Les informations publiées sur VitrectoMed sont fournies à titre éducatif et ne remplacent pas l’avis d’un ophtalmologiste ou d’un professionnel de santé.",
      cta: "En savoir plus",
    },
    journey: {
      title: "Parcours patient",
      description:
        "Un accompagnement pas à pas, avant, pendant et après votre opération, avec les repères pratiques pour votre récupération.",
      guideAria: "Guides les plus consultés",
      guides: [
        "Dormir après vitrectomie",
        "Positionnement face vers le bas",
        "Bulle de gaz",
        "Voyager après vitrectomie",
      ],
      cards: [
        {
          title: "Avant l’opération",
          text:
            "Préparation, examens et étapes clés avant l’intervention.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "Après l’opération",
          text:
            "Récupération, suivi médical et premières étapes de convalescence.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Retour à la vie quotidienne",
          text:
            "Conseils et repères pour reprendre vos activités avec prudence.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Comprendre",
      title: "Comprendre le trou maculaire",
      description:
        "L’évolution d’un trou maculaire se fait par étapes. La zone centrale de la vision peut devenir floue ou déformée.",
      stages: [
        {
          title: "Rétine normale",
          text:
            "La macula reste régulière, la vision centrale est stable.",
          state: "normal",
        },
        {
          title: "Début du trou maculaire",
          text:
            "Une traction commence à déformer la zone centrale.",
          state: "early",
        },
        {
          title: "Trou maculaire complet",
          text:
            "L’ouverture centrale est installée et gêne la lecture.",
          state: "complete",
        },
        {
          title: "Trou maculaire avancé",
          text:
            "La perte de précision centrale devient plus marquée.",
          state: "advanced",
        },
      ],
      explainerTitle: "Qu’est-ce qu’un trou maculaire ?",
      explainerText:
        "Le trou maculaire est une ouverture qui se forme au centre de la macula, la zone de la rétine responsable de la vision centrale fine et des détails.",
      explainerCta: "En savoir plus sur le trou maculaire",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Symptômes fréquents",
        items: [
          "Baisse de la vision centrale",
          "Vision floue ou déformée",
          "Difficulté à lire ou voir les détails",
          "Tache sombre au centre du champ visuel",
        ],
      },
      {
        icon: "target",
        title: "Causes et facteurs de risque",
        items: [
          "Âge supérieur à 60 ans",
          "Myopie forte",
          "Antécédents oculaires",
          "Chirurgie oculaire antérieure",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnostic",
        items: [
          "Examen du fond d’œil",
          "OCT de la macula",
          "Test de la vision et déformation",
          "Évaluation de l’acuité visuelle",
        ],
      },
    ],
    treatment: {
      title: "Traitement : la vitrectomie",
      text:
        "La vitrectomie est le traitement de référence pour traiter un trou maculaire. Elle consiste à retirer le vitré et à favoriser la fermeture du trou.",
      cta: "En savoir plus sur la vitrectomie",
      imageAlt: "Visualisation médicale de la rétine",
    },
    pathologies: {
      title: "Pathologies traitées par vitrectomie",
      description:
        "Comprendre votre maladie et les traitements possibles.",
      cta: "Toutes les pathologies",
      cards: [
        {
          title: "Trou maculaire",
          text: "Symptômes, traitement et récupération",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Décollement de rétine",
          text: "Urgence, chirurgie et suivi",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Rétinopathie diabétique",
          text: "Surveillance et prise en charge",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Corps flottants",
          text: "Causes, traitement et solutions",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Récupération et résultats",
      text:
        "La récupération visuelle prend du temps et varie selon chaque patient. Le respect des consignes post-opératoires aide à optimiser les résultats.",
      metrics: [
        {
          title: "Durée de récupération",
          text: "Plusieurs semaines à plusieurs mois selon les cas.",
        },
        {
          title: "Amélioration de la vision",
          text:
            "Progressive, parfois incomplète, mais souvent significative.",
        },
        {
          title: "Suivi médical",
          text:
            "Des contrôles réguliers sont essentiels pour suivre l’évolution.",
        },
        {
          title: "Respect des consignes",
          text:
            "Le positionnement et les recommandations sont essentiels.",
        },
      ],
    },
    specialist: {
      imageAlt: "Ophtalmologue spécialiste de la rétine",
      title: "Trouver un spécialiste près de chez vous",
      text:
        "Trouvez un chirurgien ou un centre spécialisé près de chez vous parmi notre réseau international de spécialistes.",
      items: [
        "Chirurgiens vérifiés et qualifiés",
        "Centres experts par pays et par ville",
        "Informations mises à jour régulièrement",
      ],
      cta: "Rechercher un spécialiste",
    },
    faq: {
      title: "Questions fréquentes sur le trou maculaire",
      cta: "Voir toutes les questions",
      items: [
        "Un trou maculaire peut-il se refermer seul ?",
        "L’opération est-elle douloureuse ?",
        "La vision revient-elle complètement après l’opération ?",
        "Peut-on avoir un trou maculaire aux deux yeux ?",
        "Combien de temps doit-on rester positionné face vers le bas ?",
        "Quels sont les risques de l’opération ?",
      ],
    },
    final: {
      imageAlt: "Dispositif médical VitrectoMed",
      title: "Une solution pour votre confort",
      text:
        "Dispositif médical Vitrectomed, conçu pour faciliter le positionnement et améliorer votre confort après vitrectomie.",
      points: [
        "Soutien efficace",
        "Utilisation prolongée",
        "Recommandé par les patients",
        "Facile à utiliser",
      ],
      cta: "Découvrir la solution",
    },
  },
  en: {
    metadata: {
      title: "VitrectoMed: understand, prepare, recover",
      description:
        "Medical guides, vitrectomy resources and a comfort solution to support recovery after retinal surgery.",
    },
    hero: {
      kicker: "Patient guide after vitrectomy",
      title: "Vitrectomy:",
      subtitle:
        "understand the procedure, indications and care pathway",
      description:
        "Reliable information to understand your procedure, your recovery and your convalescence after vitrectomy.",
      primaryCta: "Understand my recovery",
      secondaryCta: "Find a specialist",
      updatedAt: "Last updated: June 2026",
      imageAlt:
        "Consultation between an ophthalmologist and a patient in front of retinal scans",
    },
    certification: {
      title: "Medical device",
      items: [
        {
          icon: "badge",
          text: "CE-marked medical device",
        },
        {
          icon: "user",
          text: "French, English, German",
        },
        {
          icon: "file",
          text: "Available in +20 languages",
        },
        {
          icon: "heart",
          text: "Patient support",
        },
      ],
      productAlt: "VitrectoMed medical device",
      productTitle: "VitrectoMed medical device",
      productText:
        "Designed to make positioning easier after vitrectomy.",
      productCta: "Discover the solution",
    },
    trust: [
      {
        icon: "shield",
        text: "Information reviewed by specialists",
      },
      {
        icon: "stethoscope",
        text: "Verified surgeons and centers",
      },
      {
        icon: "calendar",
        text: "Content updated regularly",
      },
      {
        icon: "globe",
        text: "Available in +20 languages",
      },
    ],
    notice: {
      text:
        "Information published on VitrectoMed is educational and does not replace advice from an ophthalmologist or healthcare professional.",
      cta: "Learn more",
    },
    journey: {
      title: "Patient pathway",
      description:
        "Step-by-step support before, during and after your operation, with practical landmarks for recovery.",
      guideAria: "Most viewed guides",
      guides: [
        "Sleeping after vitrectomy",
        "Face-down positioning",
        "Gas bubble",
        "Traveling after vitrectomy",
      ],
      cards: [
        {
          title: "Before surgery",
          text:
            "Preparation, examinations and key steps before the procedure.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "After surgery",
          text:
            "Recovery, medical follow-up and the first convalescence steps.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Back to everyday life",
          text:
            "Practical guidance to resume activities carefully.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Understand",
      title: "Understanding macular holes",
      description:
        "A macular hole progresses in stages. The central area of vision may become blurred or distorted.",
      stages: [
        {
          title: "Normal retina",
          text:
            "The macula remains regular and central vision is stable.",
          state: "normal",
        },
        {
          title: "Early macular hole",
          text:
            "Traction begins to distort the central area.",
          state: "early",
        },
        {
          title: "Full-thickness macular hole",
          text:
            "A central opening is present and reading becomes difficult.",
          state: "complete",
        },
        {
          title: "Advanced macular hole",
          text:
            "Loss of central precision becomes more pronounced.",
          state: "advanced",
        },
      ],
      explainerTitle: "What is a macular hole?",
      explainerText:
        "A macular hole is an opening that forms in the center of the macula, the retinal area responsible for fine central vision and details.",
      explainerCta: "Learn more about macular holes",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Common symptoms",
        items: [
          "Reduced central vision",
          "Blurred or distorted vision",
          "Difficulty reading or seeing details",
          "Dark spot in the center of the visual field",
        ],
      },
      {
        icon: "target",
        title: "Causes and risk factors",
        items: [
          "Age over 60",
          "High myopia",
          "Previous eye conditions",
          "Previous eye surgery",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnosis",
        items: [
          "Retinal examination",
          "Macular OCT",
          "Vision and distortion testing",
          "Visual acuity assessment",
        ],
      },
    ],
    treatment: {
      title: "Treatment: vitrectomy",
      text:
        "Vitrectomy is the reference treatment for a macular hole. It consists of removing the vitreous and helping the hole close.",
      cta: "Learn more about vitrectomy",
      imageAlt: "Medical visualization of the retina",
    },
    pathologies: {
      title: "Conditions treated with vitrectomy",
      description:
        "Understand your condition and the treatment options.",
      cta: "All conditions",
      cards: [
        {
          title: "Macular hole",
          text: "Symptoms, treatment and recovery",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Retinal detachment",
          text: "Emergency, surgery and follow-up",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Diabetic retinopathy",
          text: "Monitoring and management",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Floaters",
          text: "Causes, treatment and solutions",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Recovery and outcomes",
      text:
        "Visual recovery takes time and varies for each patient. Following post-operative instructions helps optimize results.",
      metrics: [
        {
          title: "Recovery duration",
          text: "Several weeks to several months depending on the case.",
        },
        {
          title: "Vision improvement",
          text:
            "Progressive, sometimes incomplete, but often significant.",
        },
        {
          title: "Medical follow-up",
          text:
            "Regular check-ups are essential to monitor progress.",
        },
        {
          title: "Following instructions",
          text:
            "Positioning and recommendations are essential.",
        },
      ],
    },
    specialist: {
      imageAlt: "Retina specialist ophthalmologist",
      title: "Find a specialist near you",
      text:
        "Find a surgeon or specialized center near you through our international network of specialists.",
      items: [
        "Verified and qualified surgeons",
        "Expert centers by country and city",
        "Information updated regularly",
      ],
      cta: "Search for a specialist",
    },
    faq: {
      title: "Frequently asked questions about macular holes",
      cta: "View all questions",
      items: [
        "Can a macular hole close on its own?",
        "Is the operation painful?",
        "Does vision fully recover after surgery?",
        "Can a macular hole affect both eyes?",
        "How long should I stay face down?",
        "What are the risks of the operation?",
      ],
    },
    final: {
      imageAlt: "VitrectoMed medical device",
      title: "A solution for your comfort",
      text:
        "VitrectoMed medical device, designed to make positioning easier and improve comfort after vitrectomy.",
      points: [
        "Effective support",
        "Extended use",
        "Recommended by patients",
        "Easy to use",
      ],
      cta: "Discover the solution",
    },
  },
  es: {
    metadata: {
      title: "VitrectoMed: comprender, prepararse, recuperarse",
      description:
        "Guías médicas, recursos sobre la vitrectomía y una solución de confort para acompañar la recuperación después de una cirugía retiniana.",
    },
    hero: {
      kicker: "Guía para pacientes después de una vitrectomía",
      title: "Vitrectomía:",
      subtitle:
        "comprender la intervención, las indicaciones y el recorrido asistencial",
      description:
        "Información fiable para comprender su intervención, su recuperación y su convalecencia después de una vitrectomía.",
      primaryCta: "Comprender mi recuperación",
      secondaryCta: "Encontrar un especialista",
      updatedAt: "Última actualización: junio de 2026",
      imageAlt:
        "Consulta entre un oftalmólogo y una paciente frente a exámenes de retina",
    },
    certification: {
      title: "Dispositivo médico",
      items: [
        {
          icon: "badge",
          text: "Dispositivo médico con marcado CE",
        },
        {
          icon: "user",
          text: "Francés, inglés, alemán",
        },
        {
          icon: "file",
          text: "Disponible en más de 20 idiomas",
        },
        {
          icon: "heart",
          text: "Acompañamiento del paciente",
        },
      ],
      productAlt: "Dispositivo médico VitrectoMed",
      productTitle: "Dispositivo médico VitrectoMed",
      productText:
        "Diseñado para facilitar el posicionamiento después de una vitrectomía.",
      productCta: "Descubrir la solución",
    },
    trust: [
      {
        icon: "shield",
        text: "Información revisada por especialistas",
      },
      {
        icon: "stethoscope",
        text: "Cirujanos y centros verificados",
      },
      {
        icon: "calendar",
        text: "Contenido actualizado regularmente",
      },
      {
        icon: "globe",
        text: "Disponible en más de 20 idiomas",
      },
    ],
    notice: {
      text:
        "La información publicada en VitrectoMed tiene fines educativos y no sustituye el consejo de un oftalmólogo o de un profesional sanitario.",
      cta: "Más información",
    },
    journey: {
      title: "Recorrido del paciente",
      description:
        "Un acompañamiento paso a paso antes, durante y después de la operación, con referencias prácticas para su recuperación.",
      guideAria: "Guías más consultadas",
      guides: [
        "Dormir después de una vitrectomía",
        "Posicionamiento boca abajo",
        "Burbuja de gas",
        "Viajar después de una vitrectomía",
      ],
      cards: [
        {
          title: "Antes de la operación",
          text:
            "Preparación, exámenes y etapas clave antes de la intervención.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "Después de la operación",
          text:
            "Recuperación, seguimiento médico y primeras etapas de convalecencia.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Vuelta a la vida cotidiana",
          text:
            "Consejos y referencias para retomar sus actividades con prudencia.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Comprender",
      title: "Comprender el agujero macular",
      description:
        "La evolución de un agujero macular se produce por etapas. La zona central de la visión puede volverse borrosa o deformada.",
      stages: [
        {
          title: "Retina normal",
          text:
            "La mácula permanece regular y la visión central es estable.",
          state: "normal",
        },
        {
          title: "Inicio del agujero macular",
          text:
            "Una tracción empieza a deformar la zona central.",
          state: "early",
        },
        {
          title: "Agujero macular completo",
          text:
            "La abertura central está presente y dificulta la lectura.",
          state: "complete",
        },
        {
          title: "Agujero macular avanzado",
          text:
            "La pérdida de precisión central se vuelve más marcada.",
          state: "advanced",
        },
      ],
      explainerTitle: "¿Qué es un agujero macular?",
      explainerText:
        "Un agujero macular es una abertura que se forma en el centro de la mácula, la zona de la retina responsable de la visión central fina y de los detalles.",
      explainerCta: "Más información sobre el agujero macular",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Síntomas frecuentes",
        items: [
          "Disminución de la visión central",
          "Visión borrosa o deformada",
          "Dificultad para leer o ver detalles",
          "Mancha oscura en el centro del campo visual",
        ],
      },
      {
        icon: "target",
        title: "Causas y factores de riesgo",
        items: [
          "Edad superior a 60 años",
          "Miopía alta",
          "Antecedentes oculares",
          "Cirugía ocular previa",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnóstico",
        items: [
          "Examen del fondo de ojo",
          "OCT de la mácula",
          "Prueba de visión y deformación",
          "Evaluación de la agudeza visual",
        ],
      },
    ],
    treatment: {
      title: "Tratamiento: la vitrectomía",
      text:
        "La vitrectomía es el tratamiento de referencia para tratar un agujero macular. Consiste en retirar el vítreo y favorecer el cierre del agujero.",
      cta: "Más información sobre la vitrectomía",
      imageAlt: "Visualización médica de la retina",
    },
    pathologies: {
      title: "Patologías tratadas mediante vitrectomía",
      description:
        "Comprender su enfermedad y los tratamientos posibles.",
      cta: "Todas las patologías",
      cards: [
        {
          title: "Agujero macular",
          text: "Síntomas, tratamiento y recuperación",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Desprendimiento de retina",
          text: "Urgencia, cirugía y seguimiento",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Retinopatía diabética",
          text: "Seguimiento y manejo",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Moscas volantes",
          text: "Causas, tratamiento y soluciones",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Recuperación y resultados",
      text:
        "La recuperación visual requiere tiempo y varía según cada paciente. Respetar las indicaciones postoperatorias ayuda a optimizar los resultados.",
      metrics: [
        {
          title: "Duración de la recuperación",
          text: "Varias semanas a varios meses según el caso.",
        },
        {
          title: "Mejora de la visión",
          text:
            "Progresiva, a veces incompleta, pero a menudo significativa.",
        },
        {
          title: "Seguimiento médico",
          text:
            "Los controles regulares son esenciales para seguir la evolución.",
        },
        {
          title: "Respeto de las indicaciones",
          text:
            "El posicionamiento y las recomendaciones son esenciales.",
        },
      ],
    },
    specialist: {
      imageAlt: "Oftalmólogo especialista en retina",
      title: "Encontrar un especialista cerca de usted",
      text:
        "Encuentre un cirujano o un centro especializado cerca de usted dentro de nuestra red internacional de especialistas.",
      items: [
        "Cirujanos verificados y cualificados",
        "Centros expertos por país y ciudad",
        "Información actualizada regularmente",
      ],
      cta: "Buscar un especialista",
    },
    faq: {
      title: "Preguntas frecuentes sobre el agujero macular",
      cta: "Ver todas las preguntas",
      items: [
        "¿Un agujero macular puede cerrarse solo?",
        "¿La operación es dolorosa?",
        "¿La visión se recupera completamente después de la operación?",
        "¿Se puede tener un agujero macular en ambos ojos?",
        "¿Cuánto tiempo hay que permanecer boca abajo?",
        "¿Cuáles son los riesgos de la operación?",
      ],
    },
    final: {
      imageAlt: "Dispositivo médico VitrectoMed",
      title: "Una solución para su confort",
      text:
        "Dispositivo médico VitrectoMed, diseñado para facilitar el posicionamiento y mejorar su confort después de una vitrectomía.",
      points: [
        "Soporte eficaz",
        "Uso prolongado",
        "Recomendado por pacientes",
        "Fácil de usar",
      ],
      cta: "Descubrir la solución",
    },
  },
  de: {
    metadata: {
      title: "VitrectoMed: verstehen, vorbereiten, erholen",
      description:
        "Medizinische Ratgeber, Informationen zur Vitrektomie und eine Komfortlösung zur Unterstützung der Erholung nach Netzhautchirurgie.",
    },
    hero: {
      kicker: "Patientenratgeber nach Vitrektomie",
      title: "Vitrektomie:",
      subtitle:
        "den Eingriff, die Indikationen und den Behandlungsweg verstehen",
      description:
        "Zuverlässige Informationen, um Ihren Eingriff, Ihre Erholung und Ihre Genesung nach einer Vitrektomie besser zu verstehen.",
      primaryCta: "Meine Erholung verstehen",
      secondaryCta: "Spezialisten finden",
      updatedAt: "Zuletzt aktualisiert: Juni 2026",
      imageAlt:
        "Beratung zwischen einem Augenarzt und einer Patientin vor Netzhautaufnahmen",
    },
    certification: {
      title: "Medizinprodukt",
      items: [
        {
          icon: "badge",
          text: "CE-gekennzeichnetes Medizinprodukt",
        },
        {
          icon: "user",
          text: "Französisch, Englisch, Deutsch",
        },
        {
          icon: "file",
          text: "In mehr als 20 Sprachen verfügbar",
        },
        {
          icon: "heart",
          text: "Patientenbegleitung",
        },
      ],
      productAlt: "VitrectoMed Medizinprodukt",
      productTitle: "VitrectoMed Medizinprodukt",
      productText:
        "Entwickelt, um die Positionierung nach einer Vitrektomie zu erleichtern.",
      productCta: "Lösung entdecken",
    },
    trust: [
      {
        icon: "shield",
        text: "Von Spezialisten geprüfte Informationen",
      },
      {
        icon: "stethoscope",
        text: "Verifizierte Chirurgen und Zentren",
      },
      {
        icon: "calendar",
        text: "Regelmäßig aktualisierte Inhalte",
      },
      {
        icon: "globe",
        text: "In mehr als 20 Sprachen verfügbar",
      },
    ],
    notice: {
      text:
        "Die auf VitrectoMed veröffentlichten Informationen dienen der Aufklärung und ersetzen nicht den Rat eines Augenarztes oder einer medizinischen Fachperson.",
      cta: "Mehr erfahren",
    },
    journey: {
      title: "Patientenweg",
      description:
        "Schrittweise Begleitung vor, während und nach der Operation, mit praktischen Orientierungspunkten für Ihre Erholung.",
      guideAria: "Meistgelesene Ratgeber",
      guides: [
        "Schlafen nach Vitrektomie",
        "Bauchlage",
        "Gasblase",
        "Reisen nach Vitrektomie",
      ],
      cards: [
        {
          title: "Vor der Operation",
          text:
            "Vorbereitung, Untersuchungen und wichtige Schritte vor dem Eingriff.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "Nach der Operation",
          text:
            "Erholung, medizinische Nachsorge und erste Schritte der Genesung.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Zurück in den Alltag",
          text:
            "Praktische Hinweise, um Aktivitäten vorsichtig wieder aufzunehmen.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Verstehen",
      title: "Das Makulaloch verstehen",
      description:
        "Ein Makulaloch entwickelt sich in Stadien. Der zentrale Sehbereich kann verschwommen oder verzerrt werden.",
      stages: [
        {
          title: "Normale Netzhaut",
          text:
            "Die Makula bleibt regelmäßig und das zentrale Sehen ist stabil.",
          state: "normal",
        },
        {
          title: "Beginnendes Makulaloch",
          text:
            "Zugkräfte beginnen, den zentralen Bereich zu verformen.",
          state: "early",
        },
        {
          title: "Vollständiges Makulaloch",
          text:
            "Die zentrale Öffnung ist vorhanden und erschwert das Lesen.",
          state: "complete",
        },
        {
          title: "Fortgeschrittenes Makulaloch",
          text:
            "Der Verlust zentraler Sehschärfe wird deutlicher.",
          state: "advanced",
        },
      ],
      explainerTitle: "Was ist ein Makulaloch?",
      explainerText:
        "Ein Makulaloch ist eine Öffnung, die sich im Zentrum der Makula bildet, dem Netzhautbereich für feines zentrales Sehen und Details.",
      explainerCta: "Mehr über das Makulaloch erfahren",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Häufige Symptome",
        items: [
          "Abnahme des zentralen Sehens",
          "Verschwommenes oder verzerrtes Sehen",
          "Schwierigkeiten beim Lesen oder Erkennen von Details",
          "Dunkler Fleck im Zentrum des Gesichtsfelds",
        ],
      },
      {
        icon: "target",
        title: "Ursachen und Risikofaktoren",
        items: [
          "Alter über 60 Jahre",
          "Hohe Myopie",
          "Augenvorerkrankungen",
          "Frühere Augenoperation",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnose",
        items: [
          "Untersuchung des Augenhintergrunds",
          "OCT der Makula",
          "Test von Sehen und Verzerrungen",
          "Messung der Sehschärfe",
        ],
      },
    ],
    treatment: {
      title: "Behandlung: die Vitrektomie",
      text:
        "Die Vitrektomie ist die Referenzbehandlung für ein Makulaloch. Dabei wird der Glaskörper entfernt und der Verschluss des Lochs unterstützt.",
      cta: "Mehr über die Vitrektomie erfahren",
      imageAlt: "Medizinische Darstellung der Netzhaut",
    },
    pathologies: {
      title: "Erkrankungen, die mit Vitrektomie behandelt werden",
      description:
        "Ihre Erkrankung und mögliche Behandlungen verstehen.",
      cta: "Alle Erkrankungen",
      cards: [
        {
          title: "Makulaloch",
          text: "Symptome, Behandlung und Erholung",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Netzhautablösung",
          text: "Notfall, Operation und Nachsorge",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Diabetische Retinopathie",
          text: "Kontrolle und Behandlung",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Glaskörpertrübungen",
          text: "Ursachen, Behandlung und Lösungen",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Erholung und Ergebnisse",
      text:
        "Die visuelle Erholung braucht Zeit und ist bei jedem Patienten unterschiedlich. Das Befolgen der postoperativen Anweisungen hilft, die Ergebnisse zu optimieren.",
      metrics: [
        {
          title: "Dauer der Erholung",
          text: "Mehrere Wochen bis mehrere Monate, je nach Fall.",
        },
        {
          title: "Verbesserung des Sehens",
          text:
            "Schrittweise, manchmal unvollständig, aber häufig deutlich.",
        },
        {
          title: "Medizinische Nachsorge",
          text:
            "Regelmäßige Kontrollen sind wichtig, um den Verlauf zu überwachen.",
        },
        {
          title: "Anweisungen befolgen",
          text:
            "Positionierung und Empfehlungen sind entscheidend.",
        },
      ],
    },
    specialist: {
      imageAlt: "Augenarzt mit Spezialisierung auf Netzhaut",
      title: "Einen Spezialisten in Ihrer Nähe finden",
      text:
        "Finden Sie einen Chirurgen oder ein spezialisiertes Zentrum in Ihrer Nähe über unser internationales Netzwerk von Spezialisten.",
      items: [
        "Verifizierte und qualifizierte Chirurgen",
        "Fachzentren nach Land und Stadt",
        "Regelmäßig aktualisierte Informationen",
      ],
      cta: "Spezialisten suchen",
    },
    faq: {
      title: "Häufige Fragen zum Makulaloch",
      cta: "Alle Fragen ansehen",
      items: [
        "Kann sich ein Makulaloch von selbst schließen?",
        "Ist die Operation schmerzhaft?",
        "Erholt sich das Sehen nach der Operation vollständig?",
        "Kann ein Makulaloch beide Augen betreffen?",
        "Wie lange muss ich die Bauchlage einhalten?",
        "Welche Risiken hat die Operation?",
      ],
    },
    final: {
      imageAlt: "VitrectoMed Medizinprodukt",
      title: "Eine Lösung für Ihren Komfort",
      text:
        "VitrectoMed Medizinprodukt, entwickelt, um die Positionierung zu erleichtern und den Komfort nach einer Vitrektomie zu verbessern.",
      points: [
        "Wirksame Unterstützung",
        "Längere Anwendung",
        "Von Patienten empfohlen",
        "Einfach zu verwenden",
      ],
      cta: "Lösung entdecken",
    },
  },
  it: {
    metadata: {
      title: "VitrectoMed: capire, prepararsi, recuperare",
      description:
        "Guide mediche, risorse sulla vitrectomia e una soluzione di comfort per accompagnare il recupero dopo chirurgia retinica.",
    },
    hero: {
      kicker: "Guida per pazienti dopo vitrectomia",
      title: "Vitrectomia:",
      subtitle:
        "comprendere l’intervento, le indicazioni e il percorso di cura",
      description:
        "Informazioni affidabili per comprendere il proprio intervento, il recupero e la convalescenza dopo una vitrectomia.",
      primaryCta: "Comprendere il mio recupero",
      secondaryCta: "Trovare uno specialista",
      updatedAt: "Ultimo aggiornamento: giugno 2026",
      imageAlt:
        "Consulto tra un oculista e una paziente davanti a esami della retina",
    },
    certification: {
      title: "Dispositivo medico",
      items: [
        {
          icon: "badge",
          text: "Dispositivo medico con marcatura CE",
        },
        {
          icon: "user",
          text: "Francese, inglese, tedesco",
        },
        {
          icon: "file",
          text: "Disponibile in oltre 20 lingue",
        },
        {
          icon: "heart",
          text: "Supporto al paziente",
        },
      ],
      productAlt: "Dispositivo medico VitrectoMed",
      productTitle: "Dispositivo medico VitrectoMed",
      productText:
        "Progettato per facilitare il posizionamento dopo vitrectomia.",
      productCta: "Scoprire la soluzione",
    },
    trust: [
      {
        icon: "shield",
        text: "Informazioni revisionate da specialisti",
      },
      {
        icon: "stethoscope",
        text: "Chirurghi e centri verificati",
      },
      {
        icon: "calendar",
        text: "Contenuti aggiornati regolarmente",
      },
      {
        icon: "globe",
        text: "Disponibile in oltre 20 lingue",
      },
    ],
    notice: {
      text:
        "Le informazioni pubblicate su VitrectoMed hanno finalità educative e non sostituiscono il parere di un oculista o di un professionista sanitario.",
      cta: "Saperne di più",
    },
    journey: {
      title: "Percorso del paziente",
      description:
        "Un accompagnamento passo dopo passo prima, durante e dopo l’operazione, con riferimenti pratici per il recupero.",
      guideAria: "Guide più consultate",
      guides: [
        "Dormire dopo vitrectomia",
        "Posizionamento a faccia in giù",
        "Bolla di gas",
        "Viaggiare dopo vitrectomia",
      ],
      cards: [
        {
          title: "Prima dell’operazione",
          text:
            "Preparazione, esami e tappe chiave prima dell’intervento.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "Dopo l’operazione",
          text:
            "Recupero, follow-up medico e prime tappe della convalescenza.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Ritorno alla vita quotidiana",
          text:
            "Consigli e riferimenti per riprendere le attività con prudenza.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Capire",
      title: "Capire il foro maculare",
      description:
        "L’evoluzione di un foro maculare avviene per tappe. La zona centrale della visione può diventare sfocata o deformata.",
      stages: [
        {
          title: "Retina normale",
          text:
            "La macula rimane regolare e la visione centrale è stabile.",
          state: "normal",
        },
        {
          title: "Inizio del foro maculare",
          text:
            "Una trazione inizia a deformare la zona centrale.",
          state: "early",
        },
        {
          title: "Foro maculare completo",
          text:
            "L’apertura centrale è presente e rende difficile la lettura.",
          state: "complete",
        },
        {
          title: "Foro maculare avanzato",
          text:
            "La perdita di precisione centrale diventa più marcata.",
          state: "advanced",
        },
      ],
      explainerTitle: "Che cos’è un foro maculare?",
      explainerText:
        "Il foro maculare è un’apertura che si forma al centro della macula, la zona della retina responsabile della visione centrale fine e dei dettagli.",
      explainerCta: "Saperne di più sul foro maculare",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Sintomi frequenti",
        items: [
          "Calo della visione centrale",
          "Visione sfocata o deformata",
          "Difficoltà a leggere o vedere i dettagli",
          "Macchia scura al centro del campo visivo",
        ],
      },
      {
        icon: "target",
        title: "Cause e fattori di rischio",
        items: [
          "Età superiore a 60 anni",
          "Miopia elevata",
          "Precedenti oculari",
          "Precedente chirurgia oculare",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnosi",
        items: [
          "Esame del fondo oculare",
          "OCT della macula",
          "Test della visione e della deformazione",
          "Valutazione dell’acuità visiva",
        ],
      },
    ],
    treatment: {
      title: "Trattamento: la vitrectomia",
      text:
        "La vitrectomia è il trattamento di riferimento per un foro maculare. Consiste nel rimuovere il vitreo e favorire la chiusura del foro.",
      cta: "Saperne di più sulla vitrectomia",
      imageAlt: "Visualizzazione medica della retina",
    },
    pathologies: {
      title: "Patologie trattate con vitrectomia",
      description:
        "Comprendere la propria malattia e i trattamenti possibili.",
      cta: "Tutte le patologie",
      cards: [
        {
          title: "Foro maculare",
          text: "Sintomi, trattamento e recupero",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Distacco di retina",
          text: "Urgenza, chirurgia e follow-up",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Retinopatia diabetica",
          text: "Monitoraggio e presa in carico",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Corpi mobili vitreali",
          text: "Cause, trattamento e soluzioni",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Recupero e risultati",
      text:
        "Il recupero visivo richiede tempo e varia per ogni paziente. Rispettare le indicazioni post-operatorie aiuta a ottimizzare i risultati.",
      metrics: [
        {
          title: "Durata del recupero",
          text: "Da diverse settimane a diversi mesi secondo il caso.",
        },
        {
          title: "Miglioramento della visione",
          text:
            "Progressivo, talvolta incompleto, ma spesso significativo.",
        },
        {
          title: "Follow-up medico",
          text:
            "Controlli regolari sono essenziali per seguire l’evoluzione.",
        },
        {
          title: "Rispetto delle indicazioni",
          text:
            "Posizionamento e raccomandazioni sono essenziali.",
        },
      ],
    },
    specialist: {
      imageAlt: "Oculista specialista della retina",
      title: "Trovare uno specialista vicino a te",
      text:
        "Trova un chirurgo o un centro specializzato vicino a te tramite la nostra rete internazionale di specialisti.",
      items: [
        "Chirurghi verificati e qualificati",
        "Centri esperti per paese e città",
        "Informazioni aggiornate regolarmente",
      ],
      cta: "Cercare uno specialista",
    },
    faq: {
      title: "Domande frequenti sul foro maculare",
      cta: "Vedere tutte le domande",
      items: [
        "Un foro maculare può chiudersi da solo?",
        "L’operazione è dolorosa?",
        "La vista recupera completamente dopo l’operazione?",
        "Si può avere un foro maculare in entrambi gli occhi?",
        "Per quanto tempo bisogna restare a faccia in giù?",
        "Quali sono i rischi dell’operazione?",
      ],
    },
    final: {
      imageAlt: "Dispositivo medico VitrectoMed",
      title: "Una soluzione per il tuo comfort",
      text:
        "Dispositivo medico VitrectoMed, progettato per facilitare il posizionamento e migliorare il comfort dopo vitrectomia.",
      points: [
        "Supporto efficace",
        "Uso prolungato",
        "Raccomandato dai pazienti",
        "Facile da usare",
      ],
      cta: "Scoprire la soluzione",
    },
  },
  nl: {
    metadata: {
      title: "VitrectoMed: begrijpen, voorbereiden, herstellen",
      description:
        "Medische gidsen, informatie over vitrectomie en een comfortoplossing om herstel na netvlieschirurgie te ondersteunen.",
    },
    hero: {
      kicker: "Patiëntengids na vitrectomie",
      title: "Vitrectomie:",
      subtitle:
        "de ingreep, indicaties en het zorgtraject begrijpen",
      description:
        "Betrouwbare informatie om uw ingreep, herstel en revalidatie na een vitrectomie beter te begrijpen.",
      primaryCta: "Mijn herstel begrijpen",
      secondaryCta: "Een specialist vinden",
      updatedAt: "Laatst bijgewerkt: juni 2026",
      imageAlt:
        "Consult tussen een oogarts en een patiënt voor netvliesonderzoeken",
    },
    certification: {
      title: "Medisch hulpmiddel",
      items: [
        {
          icon: "badge",
          text: "CE-gemarkeerd medisch hulpmiddel",
        },
        {
          icon: "user",
          text: "Frans, Engels, Duits",
        },
        {
          icon: "file",
          text: "Beschikbaar in meer dan 20 talen",
        },
        {
          icon: "heart",
          text: "Patiëntondersteuning",
        },
      ],
      productAlt: "VitrectoMed medisch hulpmiddel",
      productTitle: "VitrectoMed medisch hulpmiddel",
      productText:
        "Ontworpen om positionering na vitrectomie makkelijker te maken.",
      productCta: "De oplossing ontdekken",
    },
    trust: [
      {
        icon: "shield",
        text: "Informatie beoordeeld door specialisten",
      },
      {
        icon: "stethoscope",
        text: "Geverifieerde chirurgen en centra",
      },
      {
        icon: "calendar",
        text: "Regelmatig bijgewerkte inhoud",
      },
      {
        icon: "globe",
        text: "Beschikbaar in meer dan 20 talen",
      },
    ],
    notice: {
      text:
        "De informatie op VitrectoMed is educatief en vervangt niet het advies van een oogarts of zorgprofessional.",
      cta: "Meer weten",
    },
    journey: {
      title: "Patiëntentraject",
      description:
        "Stap-voor-stap begeleiding vóór, tijdens en na uw operatie, met praktische herkenningspunten voor herstel.",
      guideAria: "Meest geraadpleegde gidsen",
      guides: [
        "Slapen na vitrectomie",
        "Buikligging",
        "Gasbel",
        "Reizen na vitrectomie",
      ],
      cards: [
        {
          title: "Voor de operatie",
          text:
            "Voorbereiding, onderzoeken en belangrijke stappen vóór de ingreep.",
          href: "/operation",
          icon: "clipboard",
        },
        {
          title: "Na de operatie",
          text:
            "Herstel, medische opvolging en eerste stappen van revalidatie.",
          href: "/convalescence",
          icon: "calendar",
        },
        {
          title: "Terug naar het dagelijks leven",
          text:
            "Praktische adviezen om activiteiten voorzichtig te hervatten.",
          href: "/convalescence",
          icon: "heart",
        },
      ],
    },
    understand: {
      label: "Begrijpen",
      title: "Het maculagat begrijpen",
      description:
        "Een maculagat ontwikkelt zich in fasen. Het centrale zicht kan wazig of vervormd worden.",
      stages: [
        {
          title: "Normaal netvlies",
          text:
            "De macula blijft regelmatig en het centrale zicht is stabiel.",
          state: "normal",
        },
        {
          title: "Beginnend maculagat",
          text:
            "Tractie begint het centrale gebied te vervormen.",
          state: "early",
        },
        {
          title: "Volledig maculagat",
          text:
            "De centrale opening is aanwezig en bemoeilijkt het lezen.",
          state: "complete",
        },
        {
          title: "Gevorderd maculagat",
          text:
            "Het verlies van centrale scherpte wordt duidelijker.",
          state: "advanced",
        },
      ],
      explainerTitle: "Wat is een maculagat?",
      explainerText:
        "Een maculagat is een opening die ontstaat in het centrum van de macula, het netvliesgebied dat verantwoordelijk is voor fijn centraal zicht en details.",
      explainerCta: "Meer weten over het maculagat",
    },
    infoCards: [
      {
        icon: "eye",
        title: "Veelvoorkomende symptomen",
        items: [
          "Verminderd centraal zicht",
          "Wazig of vervormd zicht",
          "Moeite met lezen of details zien",
          "Donkere vlek in het centrum van het gezichtsveld",
        ],
      },
      {
        icon: "target",
        title: "Oorzaken en risicofactoren",
        items: [
          "Leeftijd boven 60 jaar",
          "Hoge myopie",
          "Eerdere oogaandoeningen",
          "Eerdere oogoperatie",
        ],
      },
      {
        icon: "clipboard",
        title: "Diagnose",
        items: [
          "Onderzoek van de oogfundus",
          "OCT van de macula",
          "Test van zicht en vervorming",
          "Beoordeling van gezichtsscherpte",
        ],
      },
    ],
    treatment: {
      title: "Behandeling: vitrectomie",
      text:
        "Vitrectomie is de referentiebehandeling voor een maculagat. Hierbij wordt het glasvocht verwijderd en wordt het sluiten van het gat bevorderd.",
      cta: "Meer weten over vitrectomie",
      imageAlt: "Medische visualisatie van het netvlies",
    },
    pathologies: {
      title: "Aandoeningen behandeld met vitrectomie",
      description:
        "Begrijp uw aandoening en de mogelijke behandelingen.",
      cta: "Alle aandoeningen",
      cards: [
        {
          title: "Maculagat",
          text: "Symptomen, behandeling en herstel",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
        },
        {
          title: "Netvliesloslating",
          text: "Spoed, chirurgie en opvolging",
          href: "/pathologies/decollement-retine",
          icon: "layers",
        },
        {
          title: "Diabetische retinopathie",
          text: "Controle en behandeling",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
        },
        {
          title: "Glasvochttroebelingen",
          text: "Oorzaken, behandeling en oplossingen",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
        },
      ],
    },
    recovery: {
      title: "Herstel en resultaten",
      text:
        "Visueel herstel kost tijd en verschilt per patiënt. Het volgen van postoperatieve instructies helpt de resultaten te optimaliseren.",
      metrics: [
        {
          title: "Duur van herstel",
          text: "Meerdere weken tot meerdere maanden, afhankelijk van de situatie.",
        },
        {
          title: "Verbetering van het zicht",
          text:
            "Geleidelijk, soms onvolledig, maar vaak merkbaar.",
        },
        {
          title: "Medische opvolging",
          text:
            "Regelmatige controles zijn essentieel om de evolutie te volgen.",
        },
        {
          title: "Instructies opvolgen",
          text:
            "Positionering en aanbevelingen zijn essentieel.",
        },
      ],
    },
    specialist: {
      imageAlt: "Oogarts gespecialiseerd in netvlies",
      title: "Vind een specialist in uw buurt",
      text:
        "Vind een chirurg of gespecialiseerd centrum in uw buurt via ons internationale netwerk van specialisten.",
      items: [
        "Geverifieerde en gekwalificeerde chirurgen",
        "Expertcentra per land en stad",
        "Regelmatig bijgewerkte informatie",
      ],
      cta: "Een specialist zoeken",
    },
    faq: {
      title: "Veelgestelde vragen over het maculagat",
      cta: "Alle vragen bekijken",
      items: [
        "Kan een maculagat vanzelf sluiten?",
        "Is de operatie pijnlijk?",
        "Herstelt het zicht volledig na de operatie?",
        "Kan een maculagat beide ogen treffen?",
        "Hoe lang moet ik buikligging aanhouden?",
        "Wat zijn de risico’s van de operatie?",
      ],
    },
    final: {
      imageAlt: "VitrectoMed medisch hulpmiddel",
      title: "Een oplossing voor uw comfort",
      text:
        "VitrectoMed medisch hulpmiddel, ontworpen om positionering makkelijker te maken en het comfort na vitrectomie te verbeteren.",
      points: [
        "Effectieve ondersteuning",
        "Langdurig gebruik",
        "Aanbevolen door patiënten",
        "Eenvoudig te gebruiken",
      ],
      cta: "De oplossing ontdekken",
    },
  },
};
