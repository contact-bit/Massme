import type { LocalizedPageContent } from "./i18n";

export type PathologyIconKey =
  | "activity"
  | "alert"
  | "calendar"
  | "circle"
  | "eye"
  | "heart"
  | "layers"
  | "microscope"
  | "shield"
  | "sparkles"
  | "stethoscope";

export type PathologiesPageContent = {
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
    notice: string;
    imageAlt: string;
  };
  trust: Array<{
    icon: PathologyIconKey;
    text: string;
  }>;
  guides: {
    kicker: string;
    title: string;
    description: string;
    cards: Array<{
      title: string;
      text: string;
      href: string;
      icon: PathologyIconKey;
      tone: "cyan" | "navy";
      cta: string;
    }>;
  };
  warning: {
    kicker: string;
    title: string;
    text: string;
    cta: string;
    cardTitle: string;
    signs: string[];
  };
  journey: {
    kicker: string;
    title: string;
    steps: Array<{
      title: string;
      text: string;
      icon: PathologyIconKey;
    }>;
  };
  education: {
    kicker: string;
    title: string;
    paragraphs: string[];
    productAlt: string;
    productTitle: string;
    productText: string;
    productCta: string;
  };
};

export const pathologiesContent: LocalizedPageContent<PathologiesPageContent> = {
  fr: {
    metadata: {
      title:
        "Pathologies de la rétine et du vitré – Guides patients VitrectoMed",
      description:
        "Comprendre les principales pathologies rétiniennes, les symptômes à surveiller, la vitrectomie et les étapes de récupération.",
    },
    hero: {
      kicker: "Guides patients rétine et vitré",
      title: "Pathologies de la rétine :",
      subtitle:
        "comprendre les signes, les traitements et la récupération",
      description:
        "Un repère clair pour explorer les principales maladies de la rétine et du vitré, comprendre quand la vitrectomie intervient et préparer les étapes après l’opération.",
      primaryCta: "Explorer les pathologies",
      secondaryCta: "Trouver un spécialiste",
      notice:
        "Informations éducatives, à confirmer avec votre ophtalmologiste.",
      imageAlt: "Examen de rétine et imagerie ophtalmologique",
    },
    trust: [
      {
        icon: "shield",
        text: "Contenus pédagogiques structurés",
      },
      {
        icon: "eye",
        text: "Symptômes et signaux d’alerte",
      },
      {
        icon: "stethoscope",
        text: "Lien avec les traitements rétiniens",
      },
      {
        icon: "calendar",
        text: "Repères de récupération",
      },
    ],
    guides: {
      kicker: "Les guides essentiels",
      title:
        "Choisir une pathologie pour comprendre le parcours de soins",
      description:
        "Chaque guide explique les symptômes, les examens habituels, les options de prise en charge et les points de vigilance après traitement.",
      cards: [
        {
          title: "Trou maculaire",
          text:
            "Vision centrale déformée, tache sombre, indication fréquente de vitrectomie.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Lire le guide",
        },
        {
          title: "Décollement de rétine",
          text:
            "Urgence ophtalmologique avec flashes, voile noir ou perte rapide du champ visuel.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Lire le guide",
        },
        {
          title: "Corps flottants",
          text:
            "Opacités mobiles dans le champ visuel, parfois liées au décollement du vitré.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Lire le guide",
        },
        {
          title: "Myopie forte",
          text:
            "Rétine fragilisée, risque de déchirures, surveillance spécialisée régulière.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Lire le guide",
        },
        {
          title: "Rétinopathie diabétique",
          text:
            "Complications vasculaires de la rétine, hémorragies et formes chirurgicales sévères.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Lire le guide",
        },
        {
          title: "Uvéite",
          text:
            "Inflammation intraoculaire pouvant créer opacités, membranes et baisse visuelle.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Lire le guide",
        },
      ],
    },
    warning: {
      kicker: "Quand consulter rapidement ?",
      title:
        "Certains symptômes rétiniens ne doivent pas attendre",
      text:
        "Une apparition brutale de flashes, de corps flottants nombreux, d’un voile noir ou d’une baisse visuelle impose une évaluation ophtalmologique rapide. Ces signes peuvent correspondre à une déchirure ou un décollement de rétine.",
      cta: "Comprendre les risques rétiniens",
      cardTitle: "Signes à surveiller",
      signs: [
        "Flashs lumineux répétés",
        "Voile noir ou rideau dans la vision",
        "Déformation brutale des lignes",
        "Tache sombre centrale",
        "Baisse rapide de la vision",
      ],
    },
    journey: {
      kicker: "Parcours patient",
      title:
        "De la première gêne visuelle à la convalescence",
      steps: [
        {
          title: "Identifier les symptômes",
          text:
            "Repérer les signes qui doivent conduire à consulter rapidement.",
          icon: "alert",
        },
        {
          title: "Comprendre l’examen",
          text:
            "OCT, fond d’œil et imagerie guident la décision médicale.",
          icon: "microscope",
        },
        {
          title: "Préparer la chirurgie",
          text:
            "Certaines pathologies nécessitent une vitrectomie ou un geste rétinien.",
          icon: "stethoscope",
        },
        {
          title: "Organiser la récupération",
          text:
            "Positionnement, collyres et suivi conditionnent la convalescence.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrectomie et suites",
      title:
        "La chirurgie traite la cause, la récupération demande une organisation",
      paragraphs: [
        "La vitrectomie consiste à retirer tout ou partie du vitré pour accéder à la rétine, traiter une traction, une hémorragie ou une membrane. Selon l’indication, un gaz ou une huile de silicone peut être utilisé pour soutenir la cicatrisation.",
        "Après l’intervention, le respect des consignes, des collyres, du suivi et parfois d’une position de repos influence directement le confort de récupération.",
      ],
      productAlt:
        "Dispositif médical VitrectoMed pour la convalescence",
      productTitle: "Convalescence après vitrectomie",
      productText:
        "Une solution pensée pour faciliter le positionnement face vers le bas lorsque celui-ci est recommandé.",
      productCta: "Découvrir le dispositif",
    },
  },
  en: {
    metadata: {
      title:
        "Retinal and vitreous conditions – VitrectoMed patient guides",
      description:
        "Understand the main retinal conditions, warning symptoms, vitrectomy and the key stages of recovery.",
    },
    hero: {
      kicker: "Retina and vitreous patient guides",
      title: "Retinal conditions:",
      subtitle:
        "understand the warning signs, treatments and recovery",
      description:
        "A clear reference point to explore the main diseases of the retina and vitreous, understand when vitrectomy may be involved and prepare for the steps after surgery.",
      primaryCta: "Explore conditions",
      secondaryCta: "Find a specialist",
      notice:
        "Educational information to be confirmed with your ophthalmologist.",
      imageAlt: "Retinal examination and ophthalmic imaging",
    },
    trust: [
      {
        icon: "shield",
        text: "Structured educational content",
      },
      {
        icon: "eye",
        text: "Symptoms and warning signs",
      },
      {
        icon: "stethoscope",
        text: "Connected to retinal treatments",
      },
      {
        icon: "calendar",
        text: "Recovery landmarks",
      },
    ],
    guides: {
      kicker: "Essential guides",
      title:
        "Choose a condition to understand the care pathway",
      description:
        "Each guide explains symptoms, common examinations, treatment options and the key points to watch after treatment.",
      cards: [
        {
          title: "Macular hole",
          text:
            "Distorted central vision, dark spot, and a common indication for vitrectomy.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Read the guide",
        },
        {
          title: "Retinal detachment",
          text:
            "An ophthalmic emergency with flashes, a dark curtain or rapid visual field loss.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Read the guide",
        },
        {
          title: "Floaters",
          text:
            "Moving opacities in the visual field, sometimes linked to vitreous detachment.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Read the guide",
        },
        {
          title: "High myopia",
          text:
            "A more fragile retina, risk of tears, and regular specialist monitoring.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Read the guide",
        },
        {
          title: "Diabetic retinopathy",
          text:
            "Vascular complications of the retina, bleeding and severe surgical forms.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Read the guide",
        },
        {
          title: "Uveitis",
          text:
            "Intraocular inflammation that can cause opacities, membranes and reduced vision.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Read the guide",
        },
      ],
    },
    warning: {
      kicker: "When should you seek urgent care?",
      title:
        "Some retinal symptoms should not wait",
      text:
        "A sudden onset of flashes, numerous floaters, a dark curtain or reduced vision requires prompt ophthalmic assessment. These signs may indicate a retinal tear or detachment.",
      cta: "Understand retinal risks",
      cardTitle: "Warning signs",
      signs: [
        "Repeated flashes of light",
        "Dark curtain or veil in the vision",
        "Sudden distortion of straight lines",
        "Dark spot in central vision",
        "Rapid decrease in vision",
      ],
    },
    journey: {
      kicker: "Patient pathway",
      title:
        "From the first visual symptoms to recovery",
      steps: [
        {
          title: "Identify symptoms",
          text:
            "Recognize the signs that should lead to prompt consultation.",
          icon: "alert",
        },
        {
          title: "Understand the exam",
          text:
            "OCT, retinal examination and imaging guide medical decisions.",
          icon: "microscope",
        },
        {
          title: "Prepare for surgery",
          text:
            "Some conditions require vitrectomy or another retinal procedure.",
          icon: "stethoscope",
        },
        {
          title: "Plan recovery",
          text:
            "Positioning, eye drops and follow-up shape the recovery period.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrectomy and recovery",
      title:
        "Surgery treats the cause, recovery requires organization",
      paragraphs: [
        "Vitrectomy removes all or part of the vitreous to access the retina and treat traction, bleeding or a membrane. Depending on the indication, gas or silicone oil may be used to support healing.",
        "After surgery, following instructions, eye drops, appointments and sometimes a specific resting position directly affects recovery comfort.",
      ],
      productAlt:
        "VitrectoMed medical device for recovery",
      productTitle: "Recovery after vitrectomy",
      productText:
        "A solution designed to make face-down positioning easier when it is recommended.",
      productCta: "Discover the device",
    },
  },
  es: {
    metadata: {
      title:
        "Patologías de la retina y del vítreo – Guías para pacientes VitrectoMed",
      description:
        "Comprender las principales patologías retinianas, los síntomas de alerta, la vitrectomía y las etapas clave de la recuperación.",
    },
    hero: {
      kicker: "Guías para pacientes sobre retina y vítreo",
      title: "Patologías de la retina:",
      subtitle:
        "comprender los signos, los tratamientos y la recuperación",
      description:
        "Una referencia clara para explorar las principales enfermedades de la retina y del vítreo, entender cuándo puede intervenir la vitrectomía y preparar las etapas después de la operación.",
      primaryCta: "Explorar las patologías",
      secondaryCta: "Encontrar un especialista",
      notice:
        "Información educativa que debe confirmarse con su oftalmólogo.",
      imageAlt: "Examen de retina e imágenes oftalmológicas",
    },
    trust: [
      {
        icon: "shield",
        text: "Contenido educativo estructurado",
      },
      {
        icon: "eye",
        text: "Síntomas y señales de alerta",
      },
      {
        icon: "stethoscope",
        text: "Relación con los tratamientos retinianos",
      },
      {
        icon: "calendar",
        text: "Puntos clave de recuperación",
      },
    ],
    guides: {
      kicker: "Guías esenciales",
      title:
        "Elegir una patología para comprender el recorrido asistencial",
      description:
        "Cada guía explica los síntomas, los exámenes habituales, las opciones de tratamiento y los puntos de vigilancia después del tratamiento.",
      cards: [
        {
          title: "Agujero macular",
          text:
            "Visión central deformada, mancha oscura e indicación frecuente de vitrectomía.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Leer la guía",
        },
        {
          title: "Desprendimiento de retina",
          text:
            "Urgencia oftalmológica con destellos, cortina oscura o pérdida rápida del campo visual.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Leer la guía",
        },
        {
          title: "Moscas volantes",
          text:
            "Opacidades móviles en el campo visual, a veces relacionadas con el desprendimiento del vítreo.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Leer la guía",
        },
        {
          title: "Miopía alta",
          text:
            "Retina más frágil, riesgo de desgarros y seguimiento especializado regular.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Leer la guía",
        },
        {
          title: "Retinopatía diabética",
          text:
            "Complicaciones vasculares de la retina, hemorragias y formas quirúrgicas graves.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Leer la guía",
        },
        {
          title: "Uveítis",
          text:
            "Inflamación intraocular que puede provocar opacidades, membranas y disminución visual.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Leer la guía",
        },
      ],
    },
    warning: {
      kicker: "¿Cuándo consultar rápidamente?",
      title:
        "Algunos síntomas retinianos no deben esperar",
      text:
        "La aparición repentina de destellos, numerosas moscas volantes, una cortina oscura o una disminución de la visión requiere una evaluación oftalmológica rápida. Estos signos pueden corresponder a un desgarro o desprendimiento de retina.",
      cta: "Comprender los riesgos retinianos",
      cardTitle: "Signos que vigilar",
      signs: [
        "Destellos luminosos repetidos",
        "Cortina o velo oscuro en la visión",
        "Deformación repentina de las líneas",
        "Mancha oscura central",
        "Disminución rápida de la visión",
      ],
    },
    journey: {
      kicker: "Recorrido del paciente",
      title:
        "Desde las primeras molestias visuales hasta la recuperación",
      steps: [
        {
          title: "Identificar los síntomas",
          text:
            "Reconocer los signos que deben llevar a consultar rápidamente.",
          icon: "alert",
        },
        {
          title: "Comprender el examen",
          text:
            "La OCT, el fondo de ojo y las imágenes guían la decisión médica.",
          icon: "microscope",
        },
        {
          title: "Preparar la cirugía",
          text:
            "Algunas patologías requieren una vitrectomía u otro procedimiento retiniano.",
          icon: "stethoscope",
        },
        {
          title: "Organizar la recuperación",
          text:
            "El posicionamiento, los colirios y el seguimiento condicionan la convalecencia.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrectomía y recuperación",
      title:
        "La cirugía trata la causa, la recuperación requiere organización",
      paragraphs: [
        "La vitrectomía consiste en retirar todo o parte del vítreo para acceder a la retina y tratar una tracción, una hemorragia o una membrana. Según la indicación, puede utilizarse gas o aceite de silicona para apoyar la cicatrización.",
        "Después de la intervención, seguir las indicaciones, los colirios, las citas de control y, a veces, una posición de reposo específica influye directamente en el confort de la recuperación.",
      ],
      productAlt:
        "Dispositivo médico VitrectoMed para la recuperación",
      productTitle: "Recuperación después de la vitrectomía",
      productText:
        "Una solución diseñada para facilitar la posición boca abajo cuando está recomendada.",
      productCta: "Descubrir el dispositivo",
    },
  },
  de: {
    metadata: {
      title:
        "Erkrankungen der Netzhaut und des Glaskörpers – VitrectoMed Patientenratgeber",
      description:
        "Die wichtigsten Netzhauterkrankungen, Warnsymptome, Vitrektomie und zentrale Schritte der Erholung verstehen.",
    },
    hero: {
      kicker: "Patientenratgeber zu Netzhaut und Glaskörper",
      title: "Netzhauterkrankungen:",
      subtitle:
        "Warnzeichen, Behandlungen und Erholung verstehen",
      description:
        "Eine klare Orientierung zu den wichtigsten Erkrankungen der Netzhaut und des Glaskörpers, wann eine Vitrektomie infrage kommt und wie die Schritte nach der Operation vorbereitet werden.",
      primaryCta: "Erkrankungen entdecken",
      secondaryCta: "Spezialisten finden",
      notice:
        "Bildungsinformationen, die mit Ihrem Augenarzt bestätigt werden sollten.",
      imageAlt: "Netzhautuntersuchung und ophthalmologische Bildgebung",
    },
    trust: [
      {
        icon: "shield",
        text: "Strukturierte Bildungsinhalte",
      },
      {
        icon: "eye",
        text: "Symptome und Warnzeichen",
      },
      {
        icon: "stethoscope",
        text: "Bezug zu Netzhautbehandlungen",
      },
      {
        icon: "calendar",
        text: "Orientierungspunkte der Erholung",
      },
    ],
    guides: {
      kicker: "Wichtige Ratgeber",
      title:
        "Eine Erkrankung auswählen, um den Behandlungsweg zu verstehen",
      description:
        "Jeder Ratgeber erklärt Symptome, übliche Untersuchungen, Behandlungsmöglichkeiten und wichtige Punkte nach der Behandlung.",
      cards: [
        {
          title: "Makulaloch",
          text:
            "Verzerrte zentrale Sicht, dunkler Fleck und häufige Indikation für eine Vitrektomie.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Ratgeber lesen",
        },
        {
          title: "Netzhautablösung",
          text:
            "Augenärztlicher Notfall mit Lichtblitzen, dunklem Vorhang oder raschem Gesichtsfeldausfall.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Ratgeber lesen",
        },
        {
          title: "Glaskörpertrübungen",
          text:
            "Bewegliche Trübungen im Gesichtsfeld, manchmal im Zusammenhang mit einer Glaskörperabhebung.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Ratgeber lesen",
        },
        {
          title: "Hohe Myopie",
          text:
            "Empfindlichere Netzhaut, Risiko von Rissen und regelmäßige fachärztliche Kontrolle.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Ratgeber lesen",
        },
        {
          title: "Diabetische Retinopathie",
          text:
            "Gefäßkomplikationen der Netzhaut, Blutungen und schwere chirurgische Formen.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Ratgeber lesen",
        },
        {
          title: "Uveitis",
          text:
            "Intraokulare Entzündung, die Trübungen, Membranen und Sehverschlechterung verursachen kann.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Ratgeber lesen",
        },
      ],
    },
    warning: {
      kicker: "Wann sollte man schnell ärztlichen Rat suchen?",
      title:
        "Einige Netzhautsymptome sollten nicht warten",
      text:
        "Plötzlich auftretende Lichtblitze, zahlreiche Glaskörpertrübungen, ein dunkler Vorhang oder eine Sehverschlechterung erfordern eine rasche augenärztliche Untersuchung. Diese Zeichen können auf einen Netzhautriss oder eine Netzhautablösung hinweisen.",
      cta: "Netzhautrisiken verstehen",
      cardTitle: "Warnzeichen",
      signs: [
        "Wiederholte Lichtblitze",
        "Dunkler Vorhang oder Schleier im Sichtfeld",
        "Plötzliche Verzerrung gerader Linien",
        "Dunkler Fleck im zentralen Sehen",
        "Rasche Sehverschlechterung",
      ],
    },
    journey: {
      kicker: "Patientenweg",
      title:
        "Von den ersten Sehbeschwerden bis zur Erholung",
      steps: [
        {
          title: "Symptome erkennen",
          text:
            "Anzeichen erkennen, die zu einer schnellen Untersuchung führen sollten.",
          icon: "alert",
        },
        {
          title: "Untersuchung verstehen",
          text:
            "OCT, Augenhintergrund und Bildgebung leiten die medizinische Entscheidung.",
          icon: "microscope",
        },
        {
          title: "Operation vorbereiten",
          text:
            "Einige Erkrankungen erfordern eine Vitrektomie oder einen anderen Netzhauteingriff.",
          icon: "stethoscope",
        },
        {
          title: "Erholung organisieren",
          text:
            "Positionierung, Augentropfen und Nachsorge prägen die Genesung.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrektomie und Erholung",
      title:
        "Die Operation behandelt die Ursache, die Erholung braucht Organisation",
      paragraphs: [
        "Bei der Vitrektomie wird der Glaskörper ganz oder teilweise entfernt, um Zugang zur Netzhaut zu erhalten und Zugkräfte, Blutungen oder Membranen zu behandeln. Je nach Indikation können Gas oder Silikonöl eingesetzt werden, um die Heilung zu unterstützen.",
        "Nach dem Eingriff beeinflussen das Befolgen der Anweisungen, Augentropfen, Kontrolltermine und manchmal eine bestimmte Ruheposition direkt den Komfort der Erholung.",
      ],
      productAlt:
        "VitrectoMed Medizinprodukt für die Erholung",
      productTitle: "Erholung nach Vitrektomie",
      productText:
        "Eine Lösung, die die Bauchlage erleichtert, wenn diese empfohlen wird.",
      productCta: "Medizinprodukt entdecken",
    },
  },
  it: {
    metadata: {
      title:
        "Patologie della retina e del vitreo – Guide per pazienti VitrectoMed",
      description:
        "Comprendere le principali patologie retiniche, i sintomi da monitorare, la vitrectomia e le tappe fondamentali del recupero.",
    },
    hero: {
      kicker: "Guide per pazienti su retina e vitreo",
      title: "Patologie della retina:",
      subtitle:
        "comprendere i segnali, i trattamenti e il recupero",
      description:
        "Un riferimento chiaro per esplorare le principali malattie della retina e del vitreo, capire quando può intervenire la vitrectomia e preparare le fasi successive all’intervento.",
      primaryCta: "Esplorare le patologie",
      secondaryCta: "Trovare uno specialista",
      notice:
        "Informazioni educative da confermare con il proprio oculista.",
      imageAlt: "Esame della retina e imaging oftalmologico",
    },
    trust: [
      {
        icon: "shield",
        text: "Contenuti educativi strutturati",
      },
      {
        icon: "eye",
        text: "Sintomi e segnali d’allarme",
      },
      {
        icon: "stethoscope",
        text: "Collegamento con i trattamenti retinici",
      },
      {
        icon: "calendar",
        text: "Punti di riferimento per il recupero",
      },
    ],
    guides: {
      kicker: "Guide essenziali",
      title:
        "Scegliere una patologia per comprendere il percorso di cura",
      description:
        "Ogni guida spiega i sintomi, gli esami abituali, le opzioni di trattamento e i punti da monitorare dopo la cura.",
      cards: [
        {
          title: "Foro maculare",
          text:
            "Visione centrale deformata, macchia scura e frequente indicazione alla vitrectomia.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Leggere la guida",
        },
        {
          title: "Distacco di retina",
          text:
            "Urgenza oftalmologica con lampi, tenda scura o rapida perdita del campo visivo.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Leggere la guida",
        },
        {
          title: "Corpi mobili vitreali",
          text:
            "Opacità mobili nel campo visivo, talvolta legate al distacco del vitreo.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Leggere la guida",
        },
        {
          title: "Miopia elevata",
          text:
            "Retina più fragile, rischio di lacerazioni e controllo specialistico regolare.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Leggere la guida",
        },
        {
          title: "Retinopatia diabetica",
          text:
            "Complicanze vascolari della retina, emorragie e forme chirurgiche severe.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Leggere la guida",
        },
        {
          title: "Uveite",
          text:
            "Infiammazione intraoculare che può causare opacità, membrane e calo visivo.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Leggere la guida",
        },
      ],
    },
    warning: {
      kicker: "Quando consultare rapidamente?",
      title:
        "Alcuni sintomi retinici non devono aspettare",
      text:
        "La comparsa improvvisa di lampi, numerosi corpi mobili, una tenda scura o un calo della vista richiede una valutazione oftalmologica rapida. Questi segni possono indicare una lacerazione o un distacco di retina.",
      cta: "Comprendere i rischi retinici",
      cardTitle: "Segnali da monitorare",
      signs: [
        "Lampi luminosi ripetuti",
        "Tenda o velo scuro nella visione",
        "Deformazione improvvisa delle linee",
        "Macchia scura centrale",
        "Rapido calo della vista",
      ],
    },
    journey: {
      kicker: "Percorso del paziente",
      title:
        "Dai primi disturbi visivi al recupero",
      steps: [
        {
          title: "Identificare i sintomi",
          text:
            "Riconoscere i segnali che devono portare a consultare rapidamente.",
          icon: "alert",
        },
        {
          title: "Comprendere l’esame",
          text:
            "OCT, fondo oculare e imaging guidano la decisione medica.",
          icon: "microscope",
        },
        {
          title: "Preparare l’intervento",
          text:
            "Alcune patologie richiedono una vitrectomia o un altro gesto retinico.",
          icon: "stethoscope",
        },
        {
          title: "Organizzare il recupero",
          text:
            "Posizionamento, colliri e controlli condizionano la convalescenza.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrectomia e recupero",
      title:
        "La chirurgia tratta la causa, il recupero richiede organizzazione",
      paragraphs: [
        "La vitrectomia consiste nel rimuovere tutto o parte del vitreo per accedere alla retina e trattare una trazione, un’emorragia o una membrana. Secondo l’indicazione, possono essere utilizzati gas o olio di silicone per sostenere la guarigione.",
        "Dopo l’intervento, rispettare le indicazioni, i colliri, i controlli e talvolta una posizione di riposo specifica influisce direttamente sul comfort del recupero.",
      ],
      productAlt:
        "Dispositivo medico VitrectoMed per il recupero",
      productTitle: "Recupero dopo vitrectomia",
      productText:
        "Una soluzione pensata per facilitare la posizione a faccia in giù quando è raccomandata.",
      productCta: "Scoprire il dispositivo",
    },
  },
  nl: {
    metadata: {
      title:
        "Aandoeningen van netvlies en glasvocht – VitrectoMed patiëntengidsen",
      description:
        "Begrijp de belangrijkste netvliesaandoeningen, waarschuwingssymptomen, vitrectomie en de belangrijkste stappen van herstel.",
    },
    hero: {
      kicker: "Patiëntengidsen voor netvlies en glasvocht",
      title: "Netvliesaandoeningen:",
      subtitle:
        "signalen, behandelingen en herstel begrijpen",
      description:
        "Een helder vertrekpunt om de belangrijkste aandoeningen van netvlies en glasvocht te verkennen, te begrijpen wanneer vitrectomie een rol kan spelen en de stappen na de operatie voor te bereiden.",
      primaryCta: "Aandoeningen bekijken",
      secondaryCta: "Een specialist vinden",
      notice:
        "Educatieve informatie die u met uw oogarts moet bevestigen.",
      imageAlt: "Netvliesonderzoek en oftalmologische beeldvorming",
    },
    trust: [
      {
        icon: "shield",
        text: "Gestructureerde educatieve inhoud",
      },
      {
        icon: "eye",
        text: "Symptomen en waarschuwingssignalen",
      },
      {
        icon: "stethoscope",
        text: "Verband met netvliesbehandelingen",
      },
      {
        icon: "calendar",
        text: "Herstelpunten",
      },
    ],
    guides: {
      kicker: "Essentiële gidsen",
      title:
        "Kies een aandoening om het zorgtraject te begrijpen",
      description:
        "Elke gids legt symptomen, gebruikelijke onderzoeken, behandelingsopties en aandachtspunten na de behandeling uit.",
      cards: [
        {
          title: "Maculagat",
          text:
            "Vervormd centraal zicht, donkere vlek en een frequente indicatie voor vitrectomie.",
          href: "/pathologies/trou-maculaire",
          icon: "circle",
          tone: "cyan",
          cta: "Gids lezen",
        },
        {
          title: "Netvliesloslating",
          text:
            "Oogheelkundige spoed met lichtflitsen, een donker gordijn of snel verlies van gezichtsveld.",
          href: "/pathologies/decollement-retine",
          icon: "layers",
          tone: "navy",
          cta: "Gids lezen",
        },
        {
          title: "Glasvochttroebelingen",
          text:
            "Bewegende troebelingen in het gezichtsveld, soms gekoppeld aan glasvochtloslating.",
          href: "/pathologies/mouches-volantes-ou-corps-flottants",
          icon: "sparkles",
          tone: "cyan",
          cta: "Gids lezen",
        },
        {
          title: "Hoge myopie",
          text:
            "Kwetsbaarder netvlies, risico op scheurtjes en regelmatige specialistische controle.",
          href: "/pathologies/myopie-forte",
          icon: "eye",
          tone: "navy",
          cta: "Gids lezen",
        },
        {
          title: "Diabetische retinopathie",
          text:
            "Vasculaire complicaties van het netvlies, bloedingen en ernstige chirurgische vormen.",
          href: "/pathologies/retinopathie-diabetique",
          icon: "activity",
          tone: "cyan",
          cta: "Gids lezen",
        },
        {
          title: "Uveïtis",
          text:
            "Intraoculaire ontsteking die troebelingen, membranen en verminderd zicht kan veroorzaken.",
          href: "/pathologies/uveite",
          icon: "heart",
          tone: "navy",
          cta: "Gids lezen",
        },
      ],
    },
    warning: {
      kicker: "Wanneer snel raadplegen?",
      title:
        "Sommige netvliessymptomen mogen niet wachten",
      text:
        "Plots optredende lichtflitsen, veel glasvochttroebelingen, een donker gordijn of verminderd zicht vragen om snelle oogheelkundige beoordeling. Deze tekenen kunnen wijzen op een netvliesscheur of netvliesloslating.",
      cta: "Netvliesrisico’s begrijpen",
      cardTitle: "Signalen om op te letten",
      signs: [
        "Herhaalde lichtflitsen",
        "Donker gordijn of sluier in het zicht",
        "Plots vervormde lijnen",
        "Donkere centrale vlek",
        "Snelle vermindering van het zicht",
      ],
    },
    journey: {
      kicker: "Patiëntentraject",
      title:
        "Van de eerste visuele klachten tot herstel",
      steps: [
        {
          title: "Symptomen herkennen",
          text:
            "Herken de signalen die aanleiding moeten geven tot snelle raadpleging.",
          icon: "alert",
        },
        {
          title: "Het onderzoek begrijpen",
          text:
            "OCT, netvliesonderzoek en beeldvorming sturen de medische beslissing.",
          icon: "microscope",
        },
        {
          title: "De operatie voorbereiden",
          text:
            "Sommige aandoeningen vragen om vitrectomie of een andere netvliesingreep.",
          icon: "stethoscope",
        },
        {
          title: "Herstel organiseren",
          text:
            "Positionering, oogdruppels en opvolging bepalen de herstelperiode.",
          icon: "calendar",
        },
      ],
    },
    education: {
      kicker: "Vitrectomie en herstel",
      title:
        "De operatie behandelt de oorzaak, herstel vraagt organisatie",
      paragraphs: [
        "Bij een vitrectomie wordt het glasvocht geheel of gedeeltelijk verwijderd om toegang te krijgen tot het netvlies en tractie, bloeding of een membraan te behandelen. Afhankelijk van de indicatie kan gas of siliconenolie worden gebruikt om de genezing te ondersteunen.",
        "Na de ingreep hebben het opvolgen van instructies, oogdruppels, controles en soms een specifieke rusthouding direct invloed op het herstelcomfort.",
      ],
      productAlt:
        "VitrectoMed medisch hulpmiddel voor herstel",
      productTitle: "Herstel na vitrectomie",
      productText:
        "Een oplossing die is ontworpen om de buikligging makkelijker te maken wanneer die wordt aanbevolen.",
      productCta: "Het hulpmiddel ontdekken",
    },
  },
};
