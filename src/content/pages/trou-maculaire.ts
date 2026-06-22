import type { LocalizedPageContent } from "./i18n";
import type { PathologyIconKey } from "./pathologies";

export type MacularHolePageContent = {
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
  intro: {
    kicker: string;
    title: string;
    paragraphs: string[];
    keyTitle: string;
    keyPoints: string[];
  };
  symptoms: {
    title: string;
    signs: string[];
    kicker: string;
    panelTitle: string;
    panelText: string;
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
  causesTreatment: {
    causes: {
      kicker: string;
      title: string;
      text: string;
      list: string[];
    };
    treatment: {
      kicker: string;
      title: string;
      text: string;
      cta: string;
    };
  };
  recovery: {
    kicker: string;
    title: string;
    paragraphs: string[];
    cta: string;
    productAlt: string;
    productTitle: string;
    productText: string;
    productCta: string;
  };
  faq: {
    kicker: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
};

export const macularHoleContent: LocalizedPageContent<MacularHolePageContent> = {
  fr: {
    metadata: {
      title:
        "Trou maculaire : symptômes, diagnostic, vitrectomie et récupération – VitrectoMed",
      description:
        "Comprendre le trou maculaire, ses symptômes, le diagnostic par OCT, la vitrectomie et les étapes de récupération après l’intervention.",
    },
    hero: {
      kicker: "Macula et vision centrale",
      title: "Trou maculaire :",
      subtitle:
        "comprendre les symptômes, le traitement et la récupération",
      description:
        "Le trou maculaire touche la zone centrale de la rétine. Il peut gêner la lecture, les détails fins et la reconnaissance des visages, même lorsque la vision périphérique reste présente.",
      primaryCta: "Voir la convalescence",
      secondaryCta: "Trouver un spécialiste",
      notice:
        "Guide éducatif, ne remplace pas l’avis de votre ophtalmologiste.",
      imageAlt:
        "Image de rétine illustrant la macula et la vision centrale",
    },
    trust: [
      {
        icon: "circle",
        text: "Atteinte de la macula",
      },
      {
        icon: "eye",
        text: "Vision centrale déformée",
      },
      {
        icon: "microscope",
        text: "Diagnostic par OCT",
      },
      {
        icon: "shield",
        text: "Traitement spécialisé",
      },
    ],
    intro: {
      kicker: "Définition",
      title: "Qu’est-ce qu’un trou maculaire ?",
      paragraphs: [
        "Le trou maculaire correspond à une ouverture située au centre de la macula, la zone de la rétine responsable de la vision fine et détaillée. Cette petite région est essentielle pour lire, regarder un visage ou distinguer les détails.",
        "Contrairement à une atteinte diffuse, le trou maculaire touche un point très précis. La gêne peut donc être forte au centre du regard alors que la vision périphérique reste relativement conservée.",
      ],
      keyTitle: "À retenir",
      keyPoints: [
        "La macula sert à la vision centrale.",
        "Le diagnostic repose souvent sur l’OCT.",
        "La vitrectomie est le traitement principal.",
        "La récupération visuelle est progressive.",
      ],
    },
    symptoms: {
      title: "Symptômes fréquents",
      signs: [
        "Vision centrale floue ou moins précise",
        "Lignes droites qui paraissent ondulées",
        "Tache sombre au centre du regard",
        "Difficulté à lire ou reconnaître les visages",
        "Gêne souvent plus nette lorsqu’un œil est fermé",
      ],
      kicker: "Premiers signes",
      panelTitle:
        "Une gêne centrale parfois compensée par l’autre œil",
      panelText:
        "Au début, le trouble peut sembler discret. Beaucoup de patients s’en rendent compte en fermant un œil, en lisant, ou lorsque les lignes droites paraissent courbées. Une consultation permet de confirmer le diagnostic et d’évaluer le stade.",
    },
    journey: {
      kicker: "Parcours de soins",
      title: "Du diagnostic à la récupération après vitrectomie",
      steps: [
        {
          title: "Symptômes",
          text:
            "La gêne touche surtout la vision centrale : lecture, détails, visages.",
          icon: "eye",
        },
        {
          title: "Diagnostic",
          text:
            "L’OCT permet de visualiser précisément la macula et le stade du trou.",
          icon: "microscope",
        },
        {
          title: "Traitement",
          text:
            "La vitrectomie retire les tractions et peut associer une bulle de gaz.",
          icon: "stethoscope",
        },
        {
          title: "Récupération",
          text:
            "La vision évolue progressivement sur plusieurs semaines ou mois.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Causes",
        title: "Pourquoi un trou maculaire apparaît-il ?",
        text:
          "Le mécanisme le plus fréquent est une traction du vitré sur la macula. Avec l’âge, le vitré se modifie et peut tirer sur la rétine centrale jusqu’à créer une ouverture.",
        list: [
          "Vieillissement et traction du vitré",
          "Décollement postérieur du vitré",
          "Traumatisme oculaire",
          "Myopie forte ou fragilité rétinienne",
          "Antécédent d’inflammation ou de chirurgie oculaire",
        ],
      },
      treatment: {
        kicker: "Traitement",
        title: "La vitrectomie vise à relâcher la traction",
        text:
          "Le chirurgien retire le vitré responsable des tractions, puis peut peler une fine membrane à la surface de la macula. Une bulle de gaz est parfois placée dans l’œil pour favoriser la fermeture du trou.",
        cta: "Comprendre l’intervention",
      },
    },
    recovery: {
      kicker: "Après l’opération",
      title:
        "La convalescence demande du suivi, du temps et parfois une position spécifique",
      paragraphs: [
        "Selon la technique utilisée et la présence d’une bulle de gaz, le chirurgien peut demander une position de repos précise pendant une période limitée. Les collyres, les contrôles et les consignes de déplacement sont adaptés à chaque patient.",
        "La récupération de la vision centrale est progressive. Elle dépend notamment de l’ancienneté du trou, de sa taille et de l’état de la macula avant l’intervention.",
      ],
      cta: "Lire le guide convalescence",
      productAlt:
        "Dispositif médical VitrectoMed pour aider au positionnement",
      productTitle: "Positionnement après vitrectomie",
      productText:
        "Une solution conçue pour améliorer le confort lorsque la position face vers le bas est recommandée.",
      productCta: "Découvrir le dispositif",
    },
    faq: {
      kicker: "Questions fréquentes",
      title:
        "Les réponses rapides avant d’en parler avec un spécialiste",
      items: [
        {
          question:
            "Un trou maculaire peut-il se refermer seul ?",
          answer:
            "Cela reste possible dans certains stades très précoces, mais la majorité des trous maculaires confirmés nécessite un avis spécialisé et parfois une chirurgie.",
        },
        {
          question: "La chirurgie est-elle urgente ?",
          answer:
            "Le délai dépend du stade, de l’ancienneté et de la gêne visuelle. Une consultation rapide améliore les chances de décision adaptée.",
        },
        {
          question: "La vision redevient-elle normale ?",
          answer:
            "La récupération varie selon l’ancienneté du trou, l’état de la macula et la cicatrisation. Une amélioration est fréquente, mais elle peut être progressive.",
        },
      ],
    },
  },
  en: {
    metadata: {
      title:
        "Macular hole: symptoms, diagnosis, vitrectomy and recovery – VitrectoMed",
      description:
        "Understand macular holes, their symptoms, OCT diagnosis, vitrectomy and the main stages of recovery after surgery.",
    },
    hero: {
      kicker: "Macula and central vision",
      title: "Macular hole:",
      subtitle:
        "understand the symptoms, treatment and recovery",
      description:
        "A macular hole affects the central area of the retina. It can interfere with reading, fine details and recognizing faces, even when peripheral vision remains present.",
      primaryCta: "View recovery guide",
      secondaryCta: "Find a specialist",
      notice:
        "Educational guide, not a substitute for advice from your ophthalmologist.",
      imageAlt:
        "Retinal image illustrating the macula and central vision",
    },
    trust: [
      {
        icon: "circle",
        text: "Macula involvement",
      },
      {
        icon: "eye",
        text: "Distorted central vision",
      },
      {
        icon: "microscope",
        text: "OCT diagnosis",
      },
      {
        icon: "shield",
        text: "Specialist treatment",
      },
    ],
    intro: {
      kicker: "Definition",
      title: "What is a macular hole?",
      paragraphs: [
        "A macular hole is an opening in the center of the macula, the area of the retina responsible for fine and detailed vision. This small region is essential for reading, looking at faces and seeing details.",
        "Unlike a diffuse retinal condition, a macular hole affects a very precise central point. This means central vision can be significantly affected while peripheral vision remains relatively preserved.",
      ],
      keyTitle: "Key points",
      keyPoints: [
        "The macula is responsible for central vision.",
        "Diagnosis is often based on OCT imaging.",
        "Vitrectomy is the main treatment.",
        "Visual recovery is progressive.",
      ],
    },
    symptoms: {
      title: "Common symptoms",
      signs: [
        "Blurred or less precise central vision",
        "Straight lines appearing wavy",
        "Dark spot in the center of vision",
        "Difficulty reading or recognizing faces",
        "Symptoms often become clearer when one eye is closed",
      ],
      kicker: "Early signs",
      panelTitle:
        "Central visual disturbance can be masked by the other eye",
      panelText:
        "At first, the problem may seem subtle. Many patients notice it when closing one eye, reading, or seeing straight lines appear curved. A consultation can confirm the diagnosis and assess the stage.",
    },
    journey: {
      kicker: "Care pathway",
      title: "From diagnosis to recovery after vitrectomy",
      steps: [
        {
          title: "Symptoms",
          text:
            "The disturbance mainly affects central vision: reading, details and faces.",
          icon: "eye",
        },
        {
          title: "Diagnosis",
          text:
            "OCT provides a precise view of the macula and the stage of the hole.",
          icon: "microscope",
        },
        {
          title: "Treatment",
          text:
            "Vitrectomy removes traction and may be combined with a gas bubble.",
          icon: "stethoscope",
        },
        {
          title: "Recovery",
          text:
            "Vision improves progressively over several weeks or months.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Causes",
        title: "Why does a macular hole develop?",
        text:
          "The most common mechanism is traction from the vitreous on the macula. With age, the vitreous changes and can pull on the central retina until an opening forms.",
        list: [
          "Aging and vitreous traction",
          "Posterior vitreous detachment",
          "Eye trauma",
          "High myopia or retinal fragility",
          "History of inflammation or eye surgery",
        ],
      },
      treatment: {
        kicker: "Treatment",
        title: "Vitrectomy aims to release traction",
        text:
          "The surgeon removes the vitreous responsible for traction and may peel a fine membrane from the surface of the macula. A gas bubble is sometimes placed in the eye to help the hole close.",
        cta: "Understand the procedure",
      },
    },
    recovery: {
      kicker: "After surgery",
      title:
        "Recovery requires follow-up, time and sometimes a specific position",
      paragraphs: [
        "Depending on the technique used and the presence of a gas bubble, the surgeon may recommend a specific resting position for a limited time. Eye drops, check-ups and travel instructions are adapted to each patient.",
        "Recovery of central vision is gradual. It depends in particular on how long the hole has been present, its size and the condition of the macula before surgery.",
      ],
      cta: "Read the recovery guide",
      productAlt:
        "VitrectoMed medical device to help with positioning",
      productTitle: "Positioning after vitrectomy",
      productText:
        "A solution designed to improve comfort when face-down positioning is recommended.",
      productCta: "Discover the device",
    },
    faq: {
      kicker: "Frequently asked questions",
      title:
        "Quick answers before discussing with a specialist",
      items: [
        {
          question:
            "Can a macular hole close on its own?",
          answer:
            "This can happen in some very early stages, but most confirmed macular holes require specialist advice and sometimes surgery.",
        },
        {
          question: "Is surgery urgent?",
          answer:
            "Timing depends on the stage, duration and level of visual disturbance. A prompt consultation improves the chances of making the right decision.",
        },
        {
          question: "Will vision return to normal?",
          answer:
            "Recovery varies depending on how long the hole has been present, the condition of the macula and healing. Improvement is common, but it may be gradual.",
        },
      ],
    },
  },
  es: {
    metadata: {
      title:
        "Agujero macular: síntomas, diagnóstico, vitrectomía y recuperación – VitrectoMed",
      description:
        "Comprender el agujero macular, sus síntomas, el diagnóstico por OCT, la vitrectomía y las principales etapas de recuperación después de la cirugía.",
    },
    hero: {
      kicker: "Mácula y visión central",
      title: "Agujero macular:",
      subtitle:
        "comprender los síntomas, el tratamiento y la recuperación",
      description:
        "El agujero macular afecta la zona central de la retina. Puede dificultar la lectura, los detalles finos y el reconocimiento de rostros, incluso cuando la visión periférica se conserva.",
      primaryCta: "Ver la recuperación",
      secondaryCta: "Encontrar un especialista",
      notice:
        "Guía educativa, no sustituye el consejo de su oftalmólogo.",
      imageAlt:
        "Imagen de retina que ilustra la mácula y la visión central",
    },
    trust: [
      {
        icon: "circle",
        text: "Afectación de la mácula",
      },
      {
        icon: "eye",
        text: "Visión central deformada",
      },
      {
        icon: "microscope",
        text: "Diagnóstico por OCT",
      },
      {
        icon: "shield",
        text: "Tratamiento especializado",
      },
    ],
    intro: {
      kicker: "Definición",
      title: "¿Qué es un agujero macular?",
      paragraphs: [
        "Un agujero macular es una abertura situada en el centro de la mácula, la zona de la retina responsable de la visión fina y detallada. Esta pequeña región es esencial para leer, mirar un rostro o distinguir detalles.",
        "A diferencia de una afectación difusa, el agujero macular afecta un punto central muy preciso. Por eso la molestia puede ser importante en el centro de la mirada mientras la visión periférica se mantiene relativamente conservada.",
      ],
      keyTitle: "Puntos clave",
      keyPoints: [
        "La mácula sirve para la visión central.",
        "El diagnóstico se basa a menudo en la OCT.",
        "La vitrectomía es el tratamiento principal.",
        "La recuperación visual es progresiva.",
      ],
    },
    symptoms: {
      title: "Síntomas frecuentes",
      signs: [
        "Visión central borrosa o menos precisa",
        "Líneas rectas que parecen onduladas",
        "Mancha oscura en el centro de la visión",
        "Dificultad para leer o reconocer rostros",
        "Molestia a menudo más evidente al cerrar un ojo",
      ],
      kicker: "Primeros signos",
      panelTitle:
        "Una molestia central a veces compensada por el otro ojo",
      panelText:
        "Al principio, el problema puede parecer discreto. Muchos pacientes lo notan al cerrar un ojo, al leer o cuando las líneas rectas parecen curvadas. Una consulta permite confirmar el diagnóstico y evaluar el estadio.",
    },
    journey: {
      kicker: "Recorrido asistencial",
      title: "Del diagnóstico a la recuperación después de la vitrectomía",
      steps: [
        {
          title: "Síntomas",
          text:
            "La molestia afecta sobre todo la visión central: lectura, detalles y rostros.",
          icon: "eye",
        },
        {
          title: "Diagnóstico",
          text:
            "La OCT permite visualizar con precisión la mácula y el estadio del agujero.",
          icon: "microscope",
        },
        {
          title: "Tratamiento",
          text:
            "La vitrectomía elimina las tracciones y puede asociarse a una burbuja de gas.",
          icon: "stethoscope",
        },
        {
          title: "Recuperación",
          text:
            "La visión evoluciona progresivamente durante varias semanas o meses.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Causas",
        title: "¿Por qué aparece un agujero macular?",
        text:
          "El mecanismo más frecuente es una tracción del vítreo sobre la mácula. Con la edad, el vítreo se modifica y puede tirar de la retina central hasta crear una abertura.",
        list: [
          "Envejecimiento y tracción del vítreo",
          "Desprendimiento posterior del vítreo",
          "Traumatismo ocular",
          "Miopía alta o fragilidad retiniana",
          "Antecedente de inflamación o cirugía ocular",
        ],
      },
      treatment: {
        kicker: "Tratamiento",
        title: "La vitrectomía busca liberar la tracción",
        text:
          "El cirujano retira el vítreo responsable de las tracciones y puede pelar una fina membrana en la superficie de la mácula. A veces se coloca una burbuja de gas en el ojo para favorecer el cierre del agujero.",
        cta: "Comprender la intervención",
      },
    },
    recovery: {
      kicker: "Después de la operación",
      title:
        "La recuperación requiere seguimiento, tiempo y a veces una posición específica",
      paragraphs: [
        "Según la técnica utilizada y la presencia de una burbuja de gas, el cirujano puede indicar una posición de reposo precisa durante un tiempo limitado. Los colirios, los controles y las indicaciones de desplazamiento se adaptan a cada paciente.",
        "La recuperación de la visión central es progresiva. Depende especialmente de la antigüedad del agujero, de su tamaño y del estado de la mácula antes de la intervención.",
      ],
      cta: "Leer la guía de recuperación",
      productAlt:
        "Dispositivo médico VitrectoMed para ayudar al posicionamiento",
      productTitle: "Posicionamiento después de la vitrectomía",
      productText:
        "Una solución diseñada para mejorar el confort cuando se recomienda la posición boca abajo.",
      productCta: "Descubrir el dispositivo",
    },
    faq: {
      kicker: "Preguntas frecuentes",
      title:
        "Respuestas rápidas antes de hablar con un especialista",
      items: [
        {
          question:
            "¿Un agujero macular puede cerrarse solo?",
          answer:
            "Puede ocurrir en algunos estadios muy iniciales, pero la mayoría de los agujeros maculares confirmados requieren una opinión especializada y a veces cirugía.",
        },
        {
          question: "¿La cirugía es urgente?",
          answer:
            "El plazo depende del estadio, la antigüedad y la molestia visual. Una consulta rápida mejora las posibilidades de tomar una decisión adecuada.",
        },
        {
          question: "¿La visión vuelve a ser normal?",
          answer:
            "La recuperación varía según la antigüedad del agujero, el estado de la mácula y la cicatrización. La mejoría es frecuente, pero puede ser progresiva.",
        },
      ],
    },
  },
  de: {
    metadata: {
      title:
        "Makulaloch: Symptome, Diagnose, Vitrektomie und Erholung – VitrectoMed",
      description:
        "Das Makulaloch, seine Symptome, die OCT-Diagnose, die Vitrektomie und die wichtigsten Erholungsschritte nach der Operation verstehen.",
    },
    hero: {
      kicker: "Makula und zentrales Sehen",
      title: "Makulaloch:",
      subtitle:
        "Symptome, Behandlung und Erholung verstehen",
      description:
        "Ein Makulaloch betrifft den zentralen Bereich der Netzhaut. Es kann Lesen, feine Details und das Erkennen von Gesichtern erschweren, auch wenn das periphere Sehen erhalten bleibt.",
      primaryCta: "Erholung ansehen",
      secondaryCta: "Spezialisten finden",
      notice:
        "Bildungsratgeber, ersetzt nicht die Beratung durch Ihren Augenarzt.",
      imageAlt:
        "Netzhautbild zur Darstellung der Makula und des zentralen Sehens",
    },
    trust: [
      {
        icon: "circle",
        text: "Beteiligung der Makula",
      },
      {
        icon: "eye",
        text: "Verzerrtes zentrales Sehen",
      },
      {
        icon: "microscope",
        text: "Diagnose per OCT",
      },
      {
        icon: "shield",
        text: "Spezialisierte Behandlung",
      },
    ],
    intro: {
      kicker: "Definition",
      title: "Was ist ein Makulaloch?",
      paragraphs: [
        "Ein Makulaloch ist eine Öffnung im Zentrum der Makula, dem Bereich der Netzhaut, der für feines und detailreiches Sehen verantwortlich ist. Diese kleine Region ist wesentlich für Lesen, das Betrachten von Gesichtern und das Erkennen von Details.",
        "Im Gegensatz zu einer diffusen Netzhauterkrankung betrifft ein Makulaloch einen sehr präzisen zentralen Punkt. Die Einschränkung kann daher im Zentrum des Blicks deutlich sein, während das periphere Sehen relativ erhalten bleibt.",
      ],
      keyTitle: "Wichtig zu wissen",
      keyPoints: [
        "Die Makula ist für das zentrale Sehen verantwortlich.",
        "Die Diagnose stützt sich häufig auf die OCT.",
        "Die Vitrektomie ist die wichtigste Behandlung.",
        "Die visuelle Erholung erfolgt schrittweise.",
      ],
    },
    symptoms: {
      title: "Häufige Symptome",
      signs: [
        "Verschwommenes oder weniger präzises zentrales Sehen",
        "Gerade Linien erscheinen wellig",
        "Dunkler Fleck im Zentrum des Sehens",
        "Schwierigkeiten beim Lesen oder Erkennen von Gesichtern",
        "Beschwerden fallen oft stärker auf, wenn ein Auge geschlossen wird",
      ],
      kicker: "Erste Anzeichen",
      panelTitle:
        "Eine zentrale Sehbeeinträchtigung kann durch das andere Auge ausgeglichen werden",
      panelText:
        "Am Anfang kann die Störung unauffällig wirken. Viele Patienten bemerken sie beim Schließen eines Auges, beim Lesen oder wenn gerade Linien gekrümmt erscheinen. Eine Untersuchung kann die Diagnose bestätigen und das Stadium einschätzen.",
    },
    journey: {
      kicker: "Behandlungsweg",
      title: "Von der Diagnose bis zur Erholung nach Vitrektomie",
      steps: [
        {
          title: "Symptome",
          text:
            "Die Beschwerden betreffen vor allem das zentrale Sehen: Lesen, Details und Gesichter.",
          icon: "eye",
        },
        {
          title: "Diagnose",
          text:
            "Die OCT ermöglicht eine präzise Darstellung der Makula und des Stadiums des Lochs.",
          icon: "microscope",
        },
        {
          title: "Behandlung",
          text:
            "Die Vitrektomie entfernt Zugkräfte und kann mit einer Gasblase kombiniert werden.",
          icon: "stethoscope",
        },
        {
          title: "Erholung",
          text:
            "Das Sehen entwickelt sich über mehrere Wochen oder Monate schrittweise.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Ursachen",
        title: "Warum entsteht ein Makulaloch?",
        text:
          "Der häufigste Mechanismus ist ein Zug des Glaskörpers an der Makula. Mit zunehmendem Alter verändert sich der Glaskörper und kann an der zentralen Netzhaut ziehen, bis eine Öffnung entsteht.",
        list: [
          "Alterung und Zug des Glaskörpers",
          "Hintere Glaskörperabhebung",
          "Augentrauma",
          "Hohe Myopie oder Netzhautfragilität",
          "Vorgeschichte mit Entzündung oder Augenoperation",
        ],
      },
      treatment: {
        kicker: "Behandlung",
        title: "Die Vitrektomie soll den Zug lösen",
        text:
          "Der Chirurg entfernt den Glaskörper, der für die Zugkräfte verantwortlich ist, und kann eine feine Membran von der Oberfläche der Makula ablösen. Manchmal wird eine Gasblase in das Auge eingebracht, um den Verschluss des Lochs zu fördern.",
        cta: "Den Eingriff verstehen",
      },
    },
    recovery: {
      kicker: "Nach der Operation",
      title:
        "Die Erholung erfordert Nachsorge, Zeit und manchmal eine bestimmte Position",
      paragraphs: [
        "Je nach Technik und Vorhandensein einer Gasblase kann der Chirurg für eine begrenzte Zeit eine bestimmte Ruheposition empfehlen. Augentropfen, Kontrollen und Hinweise zu Reisen oder Bewegungen werden individuell angepasst.",
        "Die Erholung des zentralen Sehens erfolgt schrittweise. Sie hängt insbesondere davon ab, wie lange das Loch besteht, wie groß es ist und wie der Zustand der Makula vor dem Eingriff war.",
      ],
      cta: "Ratgeber zur Erholung lesen",
      productAlt:
        "VitrectoMed Medizinprodukt zur Unterstützung der Positionierung",
      productTitle: "Positionierung nach Vitrektomie",
      productText:
        "Eine Lösung, die den Komfort verbessert, wenn die Bauchlage empfohlen wird.",
      productCta: "Medizinprodukt entdecken",
    },
    faq: {
      kicker: "Häufige Fragen",
      title:
        "Kurze Antworten vor dem Gespräch mit einem Spezialisten",
      items: [
        {
          question:
            "Kann sich ein Makulaloch von selbst schließen?",
          answer:
            "Das ist in sehr frühen Stadien möglich, aber die meisten bestätigten Makulalöcher erfordern eine fachärztliche Einschätzung und manchmal eine Operation.",
        },
        {
          question: "Ist die Operation dringend?",
          answer:
            "Der Zeitpunkt hängt vom Stadium, der Dauer und der Sehbeeinträchtigung ab. Eine schnelle Untersuchung verbessert die Chance auf eine passende Entscheidung.",
        },
        {
          question: "Wird das Sehen wieder normal?",
          answer:
            "Die Erholung variiert je nach Dauer des Lochs, Zustand der Makula und Heilung. Eine Verbesserung ist häufig, kann aber schrittweise erfolgen.",
        },
      ],
    },
  },
  it: {
    metadata: {
      title:
        "Foro maculare: sintomi, diagnosi, vitrectomia e recupero – VitrectoMed",
      description:
        "Comprendere il foro maculare, i suoi sintomi, la diagnosi con OCT, la vitrectomia e le principali tappe del recupero dopo l’intervento.",
    },
    hero: {
      kicker: "Macula e visione centrale",
      title: "Foro maculare:",
      subtitle:
        "comprendere i sintomi, il trattamento e il recupero",
      description:
        "Il foro maculare interessa la zona centrale della retina. Può rendere difficili la lettura, i dettagli fini e il riconoscimento dei volti, anche quando la visione periferica rimane presente.",
      primaryCta: "Vedere il recupero",
      secondaryCta: "Trovare uno specialista",
      notice:
        "Guida educativa, non sostituisce il parere del proprio oculista.",
      imageAlt:
        "Immagine della retina che illustra la macula e la visione centrale",
    },
    trust: [
      {
        icon: "circle",
        text: "Interessamento della macula",
      },
      {
        icon: "eye",
        text: "Visione centrale deformata",
      },
      {
        icon: "microscope",
        text: "Diagnosi con OCT",
      },
      {
        icon: "shield",
        text: "Trattamento specialistico",
      },
    ],
    intro: {
      kicker: "Definizione",
      title: "Che cos’è un foro maculare?",
      paragraphs: [
        "Il foro maculare è un’apertura situata al centro della macula, la zona della retina responsabile della visione fine e dettagliata. Questa piccola regione è essenziale per leggere, guardare un volto o distinguere i dettagli.",
        "A differenza di una patologia retinica diffusa, il foro maculare interessa un punto centrale molto preciso. Il disturbo può quindi essere importante al centro dello sguardo, mentre la visione periferica rimane relativamente conservata.",
      ],
      keyTitle: "Da ricordare",
      keyPoints: [
        "La macula serve alla visione centrale.",
        "La diagnosi si basa spesso sull’OCT.",
        "La vitrectomia è il trattamento principale.",
        "Il recupero visivo è progressivo.",
      ],
    },
    symptoms: {
      title: "Sintomi frequenti",
      signs: [
        "Visione centrale sfocata o meno precisa",
        "Linee dritte che sembrano ondulate",
        "Macchia scura al centro della visione",
        "Difficoltà a leggere o riconoscere i volti",
        "Disturbo spesso più evidente quando si chiude un occhio",
      ],
      kicker: "Primi segnali",
      panelTitle:
        "Un disturbo centrale talvolta compensato dall’altro occhio",
      panelText:
        "All’inizio il disturbo può sembrare discreto. Molti pazienti se ne accorgono chiudendo un occhio, leggendo o quando le linee dritte sembrano curve. Una visita permette di confermare la diagnosi e valutare lo stadio.",
    },
    journey: {
      kicker: "Percorso di cura",
      title: "Dalla diagnosi al recupero dopo vitrectomia",
      steps: [
        {
          title: "Sintomi",
          text:
            "Il disturbo interessa soprattutto la visione centrale: lettura, dettagli, volti.",
          icon: "eye",
        },
        {
          title: "Diagnosi",
          text:
            "L’OCT permette di visualizzare con precisione la macula e lo stadio del foro.",
          icon: "microscope",
        },
        {
          title: "Trattamento",
          text:
            "La vitrectomia rimuove le trazioni e può essere associata a una bolla di gas.",
          icon: "stethoscope",
        },
        {
          title: "Recupero",
          text:
            "La visione evolve progressivamente nell’arco di settimane o mesi.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Cause",
        title: "Perché compare un foro maculare?",
        text:
          "Il meccanismo più frequente è una trazione del vitreo sulla macula. Con l’età, il vitreo si modifica e può tirare sulla retina centrale fino a creare un’apertura.",
        list: [
          "Invecchiamento e trazione del vitreo",
          "Distacco posteriore del vitreo",
          "Trauma oculare",
          "Miopia elevata o fragilità retinica",
          "Precedente infiammazione o chirurgia oculare",
        ],
      },
      treatment: {
        kicker: "Trattamento",
        title: "La vitrectomia mira a rilasciare la trazione",
        text:
          "Il chirurgo rimuove il vitreo responsabile delle trazioni e può pelare una sottile membrana sulla superficie della macula. Talvolta viene inserita una bolla di gas nell’occhio per favorire la chiusura del foro.",
        cta: "Comprendere l’intervento",
      },
    },
    recovery: {
      kicker: "Dopo l’intervento",
      title:
        "Il recupero richiede controlli, tempo e talvolta una posizione specifica",
      paragraphs: [
        "Secondo la tecnica utilizzata e la presenza di una bolla di gas, il chirurgo può indicare una posizione di riposo precisa per un periodo limitato. Colliri, controlli e indicazioni sugli spostamenti sono adattati a ogni paziente.",
        "Il recupero della visione centrale è progressivo. Dipende in particolare da quanto tempo è presente il foro, dalle sue dimensioni e dallo stato della macula prima dell’intervento.",
      ],
      cta: "Leggere la guida al recupero",
      productAlt:
        "Dispositivo medico VitrectoMed per aiutare il posizionamento",
      productTitle: "Posizionamento dopo vitrectomia",
      productText:
        "Una soluzione progettata per migliorare il comfort quando è raccomandata la posizione a faccia in giù.",
      productCta: "Scoprire il dispositivo",
    },
    faq: {
      kicker: "Domande frequenti",
      title:
        "Risposte rapide prima di parlarne con uno specialista",
      items: [
        {
          question:
            "Un foro maculare può chiudersi da solo?",
          answer:
            "Può accadere in alcuni stadi molto iniziali, ma la maggior parte dei fori maculari confermati richiede un parere specialistico e talvolta un intervento.",
        },
        {
          question: "L’intervento è urgente?",
          answer:
            "Il tempo dipende dallo stadio, dalla durata e dal disturbo visivo. Una visita rapida migliora le possibilità di una decisione adeguata.",
        },
        {
          question: "La vista torna normale?",
          answer:
            "Il recupero varia secondo la durata del foro, lo stato della macula e la guarigione. Il miglioramento è frequente, ma può essere progressivo.",
        },
      ],
    },
  },
  nl: {
    metadata: {
      title:
        "Maculagat: symptomen, diagnose, vitrectomie en herstel – VitrectoMed",
      description:
        "Begrijp het maculagat, de symptomen, OCT-diagnose, vitrectomie en de belangrijkste herstelstappen na de operatie.",
    },
    hero: {
      kicker: "Macula en centraal zicht",
      title: "Maculagat:",
      subtitle:
        "symptomen, behandeling en herstel begrijpen",
      description:
        "Een maculagat treft het centrale deel van het netvlies. Het kan lezen, fijne details en het herkennen van gezichten bemoeilijken, ook wanneer het perifere zicht behouden blijft.",
      primaryCta: "Herstel bekijken",
      secondaryCta: "Een specialist vinden",
      notice:
        "Educatieve gids, vervangt het advies van uw oogarts niet.",
      imageAlt:
        "Netvliesbeeld dat de macula en het centrale zicht illustreert",
    },
    trust: [
      {
        icon: "circle",
        text: "Aantasting van de macula",
      },
      {
        icon: "eye",
        text: "Vervormd centraal zicht",
      },
      {
        icon: "microscope",
        text: "Diagnose met OCT",
      },
      {
        icon: "shield",
        text: "Gespecialiseerde behandeling",
      },
    ],
    intro: {
      kicker: "Definitie",
      title: "Wat is een maculagat?",
      paragraphs: [
        "Een maculagat is een opening in het centrum van de macula, het deel van het netvlies dat verantwoordelijk is voor fijn en gedetailleerd zicht. Dit kleine gebied is essentieel om te lezen, gezichten te bekijken en details te onderscheiden.",
        "In tegenstelling tot een diffuse netvliesaandoening treft een maculagat een zeer precies centraal punt. De hinder kan dus sterk zijn in het midden van de blik, terwijl het perifere zicht relatief behouden blijft.",
      ],
      keyTitle: "Belangrijk om te onthouden",
      keyPoints: [
        "De macula is belangrijk voor centraal zicht.",
        "De diagnose steunt vaak op OCT.",
        "Vitrectomie is de belangrijkste behandeling.",
        "Visueel herstel verloopt geleidelijk.",
      ],
    },
    symptoms: {
      title: "Veelvoorkomende symptomen",
      signs: [
        "Wazig of minder precies centraal zicht",
        "Rechte lijnen lijken golvend",
        "Donkere vlek in het centrum van het zicht",
        "Moeite met lezen of gezichten herkennen",
        "Klachten vallen vaak meer op wanneer één oog gesloten is",
      ],
      kicker: "Eerste signalen",
      panelTitle:
        "Een centrale hinder kan soms door het andere oog worden gecompenseerd",
      panelText:
        "In het begin kan de stoornis subtiel lijken. Veel patiënten merken het bij het sluiten van één oog, bij het lezen of wanneer rechte lijnen gebogen lijken. Een consult kan de diagnose bevestigen en het stadium beoordelen.",
    },
    journey: {
      kicker: "Zorgtraject",
      title: "Van diagnose tot herstel na vitrectomie",
      steps: [
        {
          title: "Symptomen",
          text:
            "De hinder treft vooral het centrale zicht: lezen, details en gezichten.",
          icon: "eye",
        },
        {
          title: "Diagnose",
          text:
            "OCT maakt de macula en het stadium van het gat nauwkeurig zichtbaar.",
          icon: "microscope",
        },
        {
          title: "Behandeling",
          text:
            "Vitrectomie verwijdert tractie en kan worden gecombineerd met een gasbel.",
          icon: "stethoscope",
        },
        {
          title: "Herstel",
          text:
            "Het zicht ontwikkelt zich geleidelijk over meerdere weken of maanden.",
          icon: "calendar",
        },
      ],
    },
    causesTreatment: {
      causes: {
        kicker: "Oorzaken",
        title: "Waarom ontstaat een maculagat?",
        text:
          "Het meest voorkomende mechanisme is tractie van het glasvocht op de macula. Met de leeftijd verandert het glasvocht en kan het aan het centrale netvlies trekken tot er een opening ontstaat.",
        list: [
          "Veroudering en glasvochttractie",
          "Achterste glasvochtloslating",
          "Oogtrauma",
          "Hoge myopie of kwetsbaar netvlies",
          "Voorgeschiedenis van ontsteking of oogchirurgie",
        ],
      },
      treatment: {
        kicker: "Behandeling",
        title: "Vitrectomie is bedoeld om de tractie los te maken",
        text:
          "De chirurg verwijdert het glasvocht dat verantwoordelijk is voor de tractie en kan een dun membraan van het oppervlak van de macula pellen. Soms wordt een gasbel in het oog geplaatst om het sluiten van het gat te bevorderen.",
        cta: "De ingreep begrijpen",
      },
    },
    recovery: {
      kicker: "Na de operatie",
      title:
        "Herstel vraagt opvolging, tijd en soms een specifieke houding",
      paragraphs: [
        "Afhankelijk van de gebruikte techniek en de aanwezigheid van een gasbel kan de chirurg gedurende een beperkte periode een specifieke rusthouding aanbevelen. Oogdruppels, controles en reis- of bewegingsinstructies worden aangepast aan elke patiënt.",
        "Het herstel van centraal zicht verloopt geleidelijk. Het hangt onder meer af van hoe lang het gat bestaat, de grootte ervan en de toestand van de macula vóór de ingreep.",
      ],
      cta: "De herstelgids lezen",
      productAlt:
        "VitrectoMed medisch hulpmiddel om positionering te ondersteunen",
      productTitle: "Positionering na vitrectomie",
      productText:
        "Een oplossing die is ontworpen om het comfort te verbeteren wanneer buikligging wordt aanbevolen.",
      productCta: "Het hulpmiddel ontdekken",
    },
    faq: {
      kicker: "Veelgestelde vragen",
      title:
        "Korte antwoorden voordat u dit met een specialist bespreekt",
      items: [
        {
          question:
            "Kan een maculagat vanzelf sluiten?",
          answer:
            "Dat kan in sommige zeer vroege stadia gebeuren, maar de meeste bevestigde maculagaten vragen om specialistisch advies en soms een operatie.",
        },
        {
          question: "Is de operatie dringend?",
          answer:
            "De timing hangt af van het stadium, de duur en de visuele hinder. Een snelle raadpleging vergroot de kans op een passende beslissing.",
        },
        {
          question: "Wordt het zicht weer normaal?",
          answer:
            "Het herstel varieert volgens de duur van het gat, de toestand van de macula en de genezing. Verbetering komt vaak voor, maar kan geleidelijk verlopen.",
        },
      ],
    },
  },
};
