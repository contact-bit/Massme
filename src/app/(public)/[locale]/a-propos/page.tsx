// src/app/(public)/[locale]/a-propos/page.tsx
import { notFound } from "next/navigation";
import "@/styles/pages/a-propos.css";

export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

type Section = {
  heading: string;
  text: string;
};

type FAQ = {
  q: string;
  a: string;
};

type Content = {
  title: string;
  subtitle: string;
  lead: string;
  highlights: string[];
  sections: Section[];
  faq: FAQ[];
  seoTopics: string[];
};

const CONTENT: Record<Locale, Content> = {
  fr: {
    title: "À propos de VitectroMed",
    subtitle:
      "Un dispositif d’accompagnement conçu pour la convalescence après vitrectomie avec injection de gaz.",
    lead:
      "VitectroMed a été pensé en collaboration avec des professionnels de santé pour aider les patients opérés d’une vitrectomie à mieux respecter la position post‑opératoire recommandée, tout en améliorant le confort au quotidien. Il ne remplace pas un avis médical et doit toujours être utilisé conformément aux recommandations de l’équipe soignante.",
    highlights: [
      "Dispositif d’accompagnement après vitrectomie avec injection de gaz.",
      "Aide à maintenir la position prescrite plus facilement et plus longtemps.",
      "Contribue à réduire l’inconfort lié au maintien prolongé de la posture.",
      "Conçu comme un complément aux recommandations de votre ophtalmologue.",
    ],
    sections: [
      {
        heading: "Pourquoi VitectroMed a été créé ?",
        text:
          "VitectroMed est né d’un constat simple : après une vitrectomie avec injection de gaz, le respect strict de la position post‑opératoire est essentiel pour créer de bonnes conditions de récupération.\n\n" +
          "Dans la pratique, de nombreux patients témoignent de la difficulté à maintenir cette position pendant plusieurs jours : douleurs cervicales, tensions dans le dos, fatigue, gêne lors du sommeil ou des activités du quotidien.\n\n" +
          "L’objectif de VitectroMed est d’apporter un soutien pratique pendant cette période, en proposant un dispositif dédié au maintien de la posture recommandée par le chirurgien.",
      },
      {
        heading: "À quoi sert VitectroMed pendant la convalescence ?",
        text:
          "VitectroMed aide le patient à adopter et à maintenir plus facilement la posture indiquée par le chirurgien après l’intervention.\n\n" +
          "En réduisant les contraintes liées au maintien prolongé de la position (pression sur les cervicales, recherche constante d’appuis, positions de compensation), le dispositif peut contribuer à rendre la convalescence plus supportable au quotidien.\n\n" +
          "Il s’inscrit comme un outil d’accompagnement : il ne modifie pas la prescription médicale, mais aide le patient à mieux la suivre.",
      },
      {
        heading: "Confort et stabilité au quotidien",
        text:
          "VitectroMed a été pensé pour offrir un maintien stable, de jour comme de nuit, tout en restant simple à installer et à ajuster.\n\n" +
          "Le dispositif vise à favoriser une posture plus régulière, à limiter les mouvements de compensation et à diminuer les tensions au niveau du cou, des épaules et du haut du dos.\n\n" +
          "Sa conception privilégie la praticité : possibilité d’utilisation dans différentes situations du quotidien (repos, lecture, moments calmes), sans mécanisme complexe.",
      },
      {
        heading: "Pour qui VitectroMed est‑il destiné ?",
        text:
          "VitectroMed est destiné aux patients opérés d’une vitrectomie avec injection de gaz, lorsque le chirurgien prescrit une position post‑opératoire spécifique.\n\n" +
          "Il peut également intéresser les patients qui recherchent une solution d’accompagnement pour mieux respecter les consignes de positionnement, lorsque cela leur est recommandé par leur équipe médicale.\n\n" +
          "En cas de doute sur la pertinence du dispositif dans votre situation, il est indispensable d’en parler à votre ophtalmologue ou à un professionnel de santé.",
      },
      {
        heading: "Important – rôle du médecin",
        text:
          "VitectroMed ne remplace pas un avis médical, un examen clinique ni un suivi spécialisé.\n\n" +
          "La position à respecter, la durée pendant laquelle elle doit être maintenue, ainsi que l’ensemble des consignes post‑opératoires dépendent de chaque patient et doivent être définies par le chirurgien ou l’équipe soignante.\n\n" +
          "Avant d’utiliser VitectroMed, et en cas de douleur inhabituelle, d’inconfort important ou de question sur votre récupération, il est essentiel de consulter votre médecin.",
      },
    ],
    faq: [
      {
        q: "VitectroMed remplace‑t‑il un dispositif médical prescrit par le chirurgien ?",
        a: "Non. VitectroMed est un dispositif d’accompagnement. Il ne remplace ni les équipements spécifiques éventuellement prescrits, ni les recommandations de votre chirurgien. Toute décision concernant votre traitement ou votre position doit rester médicale.",
      },
      {
        q: "Puis‑je utiliser VitectroMed sans avis médical préalable ?",
        a: "Il est toujours recommandé d’en parler à votre ophtalmologue ou à l’équipe soignante, afin de vérifier que le dispositif est adapté à votre situation et compatible avec les consignes qui vous ont été données.",
      },
      {
        q: "Combien de temps dois‑je garder la position recommandée après l’opération ?",
        a: "La durée dépend entièrement de votre cas, du type d’intervention réalisée et des choix de votre chirurgien. Seul votre médecin peut vous indiquer la durée et les modalités de la position à respecter.",
      },
    ],
    seoTopics: [
      "vitrectomie",
      "position post‑opératoire face‑down",
      "récupération après chirurgie de la rétine",
      "dispositif d’accompagnement post‑chirurgical",
    ],
  },

  en: {
    title: "About VitectroMed",
    subtitle:
      "A support device designed for recovery after vitrectomy with gas injection.",
    lead:
      "VitectroMed was developed with input from healthcare professionals to help patients who have undergone vitrectomy better follow their prescribed post‑operative positioning, while improving day‑to‑day comfort. It does not replace medical advice and must always be used according to your medical team’s recommendations.",
    highlights: [
      "Support device for recovery after vitrectomy with intraocular gas.",
      "Helps maintain the prescribed post‑operative position more easily.",
      "May reduce discomfort related to prolonged positioning.",
      "Designed as a complement to your ophthalmologist’s recommendations.",
    ],
    sections: [
      {
        heading: "Why was VitectroMed created?",
        text:
          "VitectroMed was created from a simple observation: after vitrectomy with gas injection, strictly maintaining the post‑operative position is essential to support proper healing conditions.\n\n" +
          "In real life, many patients find it difficult to hold this position for several days: neck and back pain, fatigue, and discomfort during sleep or everyday activities are frequently reported.\n\n" +
          "VitectroMed aims to provide practical support during this period by offering a dedicated device to help maintain the position recommended by the surgeon.",
      },
      {
        heading: "How does VitectroMed help during recovery?",
        text:
          "VitectroMed helps patients adopt and maintain the posture indicated by their surgeon after the procedure.\n\n" +
          "By reducing the physical constraints associated with prolonged positioning (pressure on the neck, constant search for support, compensatory positions), the device can make the recovery period more manageable.\n\n" +
          "It is an aid to adherence: it does not replace the medical prescription, but supports patients in following it more easily.",
      },
      {
        heading: "Comfort and stability in everyday life",
        text:
          "VitectroMed is designed to provide stable support, day and night, while remaining easy to set up and adjust.\n\n" +
          "The device promotes a more consistent posture, limits compensation movements and may help reduce strain in the neck, shoulders and upper back.\n\n" +
          "Its design focuses on practicality: it can be used in various daily situations (rest, quiet activities), without complex mechanisms.",
      },
      {
        heading: "Who is VitectroMed for?",
        text:
          "VitectroMed is intended for patients who have undergone vitrectomy with gas injection when a specific post‑operative position is prescribed by their surgeon.\n\n" +
          "It may also be useful for patients looking for additional support to better follow positioning instructions, when recommended by their medical team.\n\n" +
          "If you are unsure whether VitectroMed is appropriate in your situation, you should discuss it with your ophthalmologist or another healthcare professional.",
      },
      {
        heading: "Important – the role of your medical team",
        text:
          "VitectroMed does not replace medical advice, clinical examination or specialized follow‑up.\n\n" +
          "The position to maintain, how long it should be held and all post‑operative instructions depend on each individual case and must be defined by your surgeon or medical team.\n\n" +
          "Before using VitectroMed, and in case of unusual pain, significant discomfort or any concern about your recovery, you should contact a doctor.",
      },
    ],
    faq: [
      {
        q: "Does VitectroMed replace a medical device prescribed by the surgeon?",
        a: "No. VitectroMed is a support device. It does not replace specific equipment or recommendations prescribed by your surgeon. All treatment decisions, including positioning, must remain medical.",
      },
      {
        q: "Can I use VitectroMed without talking to my doctor?",
        a: "You should always check with your ophthalmologist or care team first, to ensure that the device is suitable for your situation and consistent with the instructions you have been given.",
      },
      {
        q: "How long do I need to maintain the post‑operative position?",
        a: "The duration depends entirely on your individual case, the procedure performed and your surgeon’s choices. Only your doctor can tell you how long and how strictly the position should be maintained.",
      },
    ],
    seoTopics: [
      "vitrectomy recovery",
      "face‑down positioning after vitrectomy",
      "post‑operative retinal surgery support",
      "medical positioning aid device",
    ],
  },

  es: {
    title: "Acerca de VitectroMed",
    subtitle:
      "Dispositivo de apoyo para la recuperación tras una vitrectomía con inyección de gas.",
    lead:
      "VitectroMed se ha desarrollado con el apoyo de profesionales sanitarios para ayudar a los pacientes operados de vitrectomía a seguir mejor la postura posoperatoria recomendada, mejorando al mismo tiempo el confort diario. No sustituye el consejo médico y debe utilizarse siempre según las indicaciones del equipo sanitario.",
    highlights: [
      "Dispositivo de apoyo tras vitrectomía con inyección de gas.",
      "Ayuda a mantener la postura prescrita de forma más sencilla.",
      "Puede reducir el malestar asociado al mantenimiento prolongado de la posición.",
      "Pensado como complemento a las recomendaciones de su oftalmólogo.",
    ],
    sections: [
      {
        heading: "¿Por qué se creó VitectroMed?",
        text:
          "VitectroMed nació de una observación sencilla: tras una vitrectomía con inyección de gas, respetar estrictamente la postura posoperatoria es esencial para favorecer buenas condiciones de recuperación.\n\n" +
          "En la práctica, muchos pacientes describen la dificultad de mantener esa postura durante varios días: dolor cervical, tensión en la espalda, cansancio y molestias durante el sueño o las actividades cotidianas.\n\n" +
          "VitectroMed tiene como objetivo aportar un apoyo práctico durante este periodo mediante un dispositivo dedicado a facilitar el mantenimiento de la postura recomendada por el cirujano.",
      },
      {
        heading: "¿Cómo ayuda VitectroMed durante la recuperación?",
        text:
          "VitectroMed ayuda al paciente a adoptar y mantener más fácilmente la postura indicada por el cirujano tras la intervención.\n\n" +
          "Al reducir parte de las limitaciones físicas asociadas al mantenimiento prolongado de la posición, el dispositivo puede contribuir a que la recuperación resulte más llevadera en el día a día.\n\n" +
          "Se trata de una herramienta de acompañamiento: no modifica la prescripción médica, sino que ayuda al paciente a seguirla mejor.",
      },
      {
        heading: "Comodidad y estabilidad en el día a día",
        text:
          "VitectroMed está diseñado para ofrecer un apoyo estable, tanto de día como de noche, y seguir siendo fácil de colocar y ajustar.\n\n" +
          "Favorece una postura más constante, limita los movimientos de compensación y puede ayudar a reducir la tensión en cuello, hombros y parte alta de la espalda.\n\n" +
          "Su diseño prioriza la practicidad: puede utilizarse en distintos momentos del día (descanso, lectura, actividades tranquilas) sin mecanismos complejos.",
      },
      {
        heading: "¿Para quién está indicado VitectroMed?",
        text:
          "VitectroMed está destinado a pacientes operados de vitrectomía con inyección de gas cuando el cirujano prescribe una postura posoperatoria específica.\n\n" +
          "También puede ser útil para quienes buscan una solución de apoyo adicional para cumplir mejor las indicaciones de posicionamiento, siempre que su equipo médico lo considere adecuado.\n\n" +
          "En caso de duda sobre si el dispositivo es apropiado para usted, es importante consultarlo con su oftalmólogo o con otro profesional de la salud.",
      },
      {
        heading: "Importante: el papel del equipo médico",
        text:
          "VitectroMed no sustituye el consejo médico, la exploración clínica ni el seguimiento especializado.\n\n" +
          "La postura que debe mantenerse, el tiempo durante el que hay que conservarla y el resto de las recomendaciones posoperatorias dependen de cada paciente y deben definirse con el cirujano o el equipo sanitario.\n\n" +
          "Antes de utilizar VitectroMed, y ante cualquier dolor inusual, molestia importante o duda sobre la recuperación, es esencial consultar al médico.",
      },
    ],
    faq: [
      {
        q: "¿Sustituye VitectroMed a un dispositivo médico prescrito por el cirujano?",
        a: "No. VitectroMed es un dispositivo de apoyo. No sustituye a los equipos específicos ni a las recomendaciones indicadas por el cirujano. Todas las decisiones relativas a su tratamiento deben seguir siendo médicas.",
      },
      {
        q: "¿Puedo usar VitectroMed sin comentarlo con mi médico?",
        a: "Siempre se recomienda hablarlo primero con su oftalmólogo o con el equipo sanitario, para comprobar que el dispositivo es adecuado para su situación y compatible con las indicaciones que ha recibido.",
      },
      {
        q: "¿Durante cuánto tiempo debo mantener la postura recomendada?",
        a: "La duración depende por completo de su caso, del tipo de intervención y de las decisiones del cirujano. Solo su médico puede indicarle cuánto tiempo y de qué manera debe mantener la postura.",
      },
    ],
    seoTopics: [
      "recuperación tras vitrectomía",
      "postura boca abajo después de vitrectomía",
      "soporte posoperatorio para cirugía de retina",
      "dispositivo de apoyo para posicionamiento médico",
    ],
  },

  de: {
    title: "Über VitectroMed",
    subtitle:
      "Medizinisches Hilfsmittel zur Unterstützung der Erholung nach Vitrektomie mit Gasinjektion.",
    lead:
      "VitectroMed wurde mit Unterstützung von medizinischen Fachkräften entwickelt, um Patientinnen und Patienten nach einer Vitrektomie dabei zu helfen, die verordnete postoperative Lagerung besser einzuhalten und den Alltagskomfort zu verbessern. Das Produkt ersetzt keine ärztliche Beratung und muss immer gemäß den Empfehlungen des Behandlungsteams verwendet werden.",
    highlights: [
      "Begleitendes Hilfsmittel nach Vitrektomie mit Gasinjektion.",
      "Unterstützt das Einhalten der verordneten postoperativen Lagerung.",
      "Kann Belastungen und Beschwerden durch langfristige Lagerung reduzieren.",
      "Als Ergänzung zu den Empfehlungen Ihrer Augenärztin/Ihres Augenarztes konzipiert.",
    ],
    sections: [
      {
        heading: "Warum wurde VitectroMed entwickelt?",
        text:
          "VitectroMed entstand aus einer einfachen Beobachtung: Nach einer Vitrektomie mit Gasinjektion ist die konsequente Einhaltung der verordneten Lagerung wichtig, um gute Voraussetzungen für die Heilung zu schaffen.\n\n" +
          "In der Realität berichten viele Patientinnen und Patienten von Schwierigkeiten, die Position über mehrere Tage zu halten: Nacken‑ und Rückenschmerzen, Müdigkeit und Unbehagen beim Schlafen oder im Alltag.\n\n" +
          "VitectroMed soll in dieser Phase eine praktische Unterstützung bieten, indem es ein Hilfsmittel zur Verfügung stellt, das speziell für die postoperative Lagerung entwickelt wurde.",
      },
      {
        heading: "Wie unterstützt VitectroMed in der Erholungsphase?",
        text:
          "VitectroMed hilft, die vom Operateur empfohlene Position nach der Operation leichter einzunehmen und zu halten.\n\n" +
          "Durch die Reduktion bestimmter Belastungen, die mit einer langen Lagerung einhergehen, kann das Hilfsmittel dazu beitragen, die Erholungszeit im Alltag besser zu bewältigen.\n\n" +
          "Es versteht sich als Ergänzung zur ärztlichen Verordnung und ersetzt diese nicht.",
      },
      {
        heading: "Komfort und Stabilität im Alltag",
        text:
          "VitectroMed ist auf stabilen Halt ausgelegt – tagsüber und nachts – und gleichzeitig einfach zu positionieren und anzupassen.\n\n" +
          "Es fördert eine gleichmäßigere Haltung, begrenzt kompensatorische Bewegungen und kann Verspannungen im Nacken‑, Schulter‑ und oberen Rückenbereich verringern.\n\n" +
          "Der Fokus liegt auf Alltagstauglichkeit: Das Hilfsmittel kann in ruhigen Alltagssituationen genutzt werden, ohne komplexe Mechanik.",
      },
      {
        heading: "Für wen ist VitectroMed gedacht?",
        text:
          "VitectroMed richtet sich an Patientinnen und Patienten nach einer Vitrektomie mit Gasinjektion, wenn eine spezielle postoperative Position verordnet wurde.\n\n" +
          "Es kann zudem für Personen interessant sein, die eine zusätzliche Unterstützung wünschen, um medizinische Lagerungsempfehlungen besser umzusetzen – sofern dies mit dem Behandlungsteam abgestimmt ist.\n\n" +
          "Im Zweifelsfall sollte immer die Augenärztin/der Augenarzt oder eine andere medizinische Fachkraft einbezogen werden.",
      },
      {
        heading: "Wichtig – Rolle der Ärztin/des Arztes",
        text:
          "VitectroMed ersetzt keine ärztliche Beratung, keine klinische Untersuchung und keinen spezialisierten Verlauf.\n\n" +
          "Lagerung, Dauer und postoperatives Vorgehen sind individuell und müssen von der Operateurin/dem Operateur oder dem Behandlungsteam festgelegt werden.\n\n" +
          "Vor der Anwendung von VitectroMed – und bei ungewöhnlichen Schmerzen, starkem Unbehagen oder Unsicherheit hinsichtlich des Heilungsverlaufs – sollte unbedingt ärztlicher Rat eingeholt werden.",
      },
    ],
    faq: [
      {
        q: "Ersetzt VitectroMed ein vom Operateur verordnetes Medizinprodukt?",
        a: "Nein. VitectroMed ist ein begleitendes Hilfsmittel und ersetzt weder spezifische medizinische Produkte noch individuelle ärztliche Empfehlungen. Entscheidungen zur Behandlung und Lagerung bleiben immer medizinische Entscheidungen.",
      },
      {
        q: "Kann ich VitectroMed ohne Rücksprache mit meiner Ärztin/meinem Arzt verwenden?",
        a: "Es wird dringend empfohlen, die Anwendung vorab mit der Augenärztin/dem Augenarzt oder dem medizinischen Team zu besprechen, um sicherzustellen, dass VitectroMed für Ihre Situation geeignet ist.",
      },
      {
        q: "Wie lange muss ich die verordnete Position halten?",
        a: "Die Dauer richtet sich nach Ihrem individuellen Fall, der durchgeführten Operation und den Entscheidungen der Operateurin/des Operateurs. Nur die behandelnde Ärztin/der behandelnde Arzt kann hierzu eine verlässliche Angabe machen.",
      },
    ],
    seoTopics: [
      "Vitrektomie Erholungsphase",
      "Bauchlage nach Vitrektomie",
      "Unterstützung nach Netzhautchirurgie",
      "medizinisches Lagerungshilfsmittel",
    ],
  },

  it: {
    title: "Chi è VitectroMed",
    subtitle:
      "Dispositivo di supporto per la convalescenza dopo vitrectomia con iniezione di gas.",
    lead:
      "VitectroMed è stato progettato con il contributo di professionisti sanitari per aiutare i pazienti sottoposti a vitrectomia a seguire meglio la posizione post‑operatoria raccomandata, migliorando al tempo stesso il comfort quotidiano. Non sostituisce il parere medico e deve essere utilizzato solo secondo le indicazioni del team curante.",
    highlights: [
      "Dispositivo di supporto dopo vitrectomia con iniezione di gas.",
      "Aiuta a mantenere la posizione prescritta in modo più semplice.",
      "Può contribuire a ridurre il disagio legato al mantenimento prolungato della postura.",
      "Pensato come complemento alle raccomandazioni dell’oculista.",
    ],
    sections: [
      {
        heading: "Perché è stato creato VitectroMed?",
        text:
          "VitectroMed nasce da una constatazione semplice: dopo una vitrectomia con iniezione di gas, il rispetto rigoroso della posizione post‑operatoria è fondamentale per favorire buone condizioni di recupero.\n\n" +
          "Nella pratica, molti pazienti riferiscono che è difficile mantenere la postura indicata per diversi giorni: compaiono spesso dolori cervicali, tensioni dorsali, stanchezza e disturbi del sonno.\n\n" +
          "L’obiettivo di VitectroMed è fornire un supporto pratico in questa fase, attraverso un dispositivo dedicato al mantenimento della postura raccomandata dal chirurgo.",
      },
      {
        heading: "Come aiuta VitectroMed durante la convalescenza?",
        text:
          "VitectroMed aiuta il paziente ad adottare e mantenere più facilmente la postura indicata dal chirurgo dopo l’intervento.\n\n" +
          "Riducendo parte dei vincoli legati al mantenimento prolungato della stessa posizione, il dispositivo può contribuire a rendere la convalescenza più gestibile nella vita di tutti i giorni.\n\n" +
          "Si tratta di uno strumento di accompagnamento: non sostituisce la prescrizione medica, ma ne facilita il rispetto.",
      },
      {
        heading: "Comfort e stabilità nella vita quotidiana",
        text:
          "VitectroMed è pensato per offrire un supporto stabile, giorno e notte, rimanendo semplice da posizionare e regolare.\n\n" +
          "Favorisce una postura più costante, limita i movimenti di compensazione e può contribuire a ridurre le tensioni a livello di collo, spalle e parte alta della schiena.\n\n" +
          "Il design privilegia la praticità: può essere utilizzato in diversi momenti della giornata (riposo, lettura, attività tranquille) senza meccanismi complessi.",
      },
      {
        heading: "A chi è destinato VitectroMed?",
        text:
          "VitectroMed è destinato ai pazienti sottoposti a vitrectomia con iniezione di gas quando il chirurgo prescrive una specifica posizione post‑operatoria.\n\n" +
          "Può essere utile anche a chi cerca un supporto aggiuntivo per seguire al meglio le indicazioni di posizionamento, sempre previo confronto con il team medico.\n\n" +
          "In caso di dubbi sull’utilizzo del dispositivo nella propria situazione, è importante parlarne con il proprio oculista o con un professionista sanitario.",
      },
      {
        heading: "Importante – il ruolo del medico",
        text:
          "VitectroMed non sostituisce il parere medico, la visita clinica o il follow‑up specialistico.\n\n" +
          "Posizione, durata e modalità del posizionamento post‑operatorio dipendono dal singolo caso e devono essere definite dal chirurgo o dal team curante.\n\n" +
          "Prima di utilizzare VitectroMed, e in presenza di dolore insolito, forte disagio o qualsiasi dubbio sull’andamento della convalescenza, è essenziale consultare il medico.",
      },
    ],
    faq: [
      {
        q: "VitectroMed sostituisce un dispositivo medico prescritto dal chirurgo?",
        a: "No. VitectroMed è un dispositivo di supporto. Non sostituisce gli eventuali dispositivi specifici né le indicazioni terapeutiche del chirurgo. Le decisioni sul trattamento devono rimanere mediche.",
      },
      {
        q: "Posso usare VitectroMed senza consultare prima il medico?",
        a: "È sempre consigliabile parlarne prima con l’oculista o con il team sanitario, per verificare che il dispositivo sia adatto al proprio caso e coerente con le indicazioni ricevute.",
      },
      {
        q: "Per quanto tempo devo mantenere la posizione raccomandata?",
        a: "La durata dipende dal singolo caso, dal tipo di intervento e dalle decisioni del chirurgo. Solo il medico può indicare quanto a lungo va mantenuta la posizione prescritta.",
      },
    ],
    seoTopics: [
      "recupero dopo vitrectomia",
      "posizione faccia in giù dopo vitrectomia",
      "supporto post‑operatorio per chirurgia retinica",
      "dispositivo di supporto per il posizionamento",
    ],
  },

  nl: {
    title: "Over VitectroMed",
    subtitle:
      "Hulpmiddel ter ondersteuning van het herstel na vitrectomie met gasinjectie.",
    lead:
      "VitectroMed is ontwikkeld in samenwerking met zorgprofessionals om patiënten na een vitrectomie te helpen de voorgeschreven postoperatieve houding beter aan te houden, met meer comfort in het dagelijks leven. Het vervangt geen medisch advies en moet altijd volgens de aanbevelingen van het behandelteam worden gebruikt.",
    highlights: [
      "Hulpmiddel ter ondersteuning na vitrectomie met gasinjectie.",
      "Helpt de voorgeschreven houding eenvoudiger en langer vol te houden.",
      "Kan ongemak door langdurige houding verminderen.",
      "Ontworpen als aanvulling op het advies van uw oogarts.",
    ],
    sections: [
      {
        heading: "Waarom is VitectroMed ontwikkeld?",
        text:
          "VitectroMed is ontstaan vanuit een eenvoudige vaststelling: na een vitrectomie met gasinjectie is het strikt aanhouden van de postoperatieve houding belangrijk om goede omstandigheden voor herstel te creëren.\n\n" +
          "In de praktijk geven veel patiënten aan dat het moeilijk is om deze houding meerdere dagen achter elkaar vol te houden: nek‑ en rugklachten, vermoeidheid en slaapproblemen komen vaak voor.\n\n" +
          "VitectroMed wil in deze periode praktische ondersteuning bieden met een hulpmiddel dat specifiek is ontworpen om de door de chirurg aanbevolen houding aan te houden.",
      },
      {
        heading: "Hoe helpt VitectroMed tijdens het herstel?",
        text:
          "VitectroMed helpt patiënten de voorgeschreven houding na de ingreep makkelijker aan te nemen en vast te houden.\n\n" +
          "Door bepaalde fysieke belasting van langdurige positionering te verminderen, kan het hulpmiddel het herstel in het dagelijks leven beter hanteerbaar maken.\n\n" +
          "Het is een begeleidend hulpmiddel: het vervangt de medische voorschriften niet, maar ondersteunt de patiënt om deze beter op te volgen.",
      },
      {
        heading: "Comfort en stabiliteit in het dagelijks leven",
        text:
          "VitectroMed is ontworpen voor stabiele ondersteuning, overdag en ’s nachts, en is eenvoudig te plaatsen en aan te passen.\n\n" +
          "Het bevordert een constantere houding, beperkt compenserende bewegingen en kan spanning in nek, schouders en bovenrug helpen verminderen.\n\n" +
          "Het ontwerp is gericht op praktische toepasbaarheid: te gebruiken in rustige dagelijkse situaties zonder complexe mechanismen.",
      },
      {
        heading: "Voor wie is VitectroMed bedoeld?",
        text:
          "VitectroMed is bedoeld voor patiënten die een vitrectomie met gasinjectie hebben ondergaan en van wie de chirurg een specifieke postoperatieve houding heeft voorgeschreven.\n\n" +
          "Het kan ook nuttig zijn voor mensen die extra ondersteuning zoeken om medische houdingsinstructies beter op te volgen, mits dit is afgestemd met het behandelteam.\n\n" +
          "Bij twijfel of VitectroMed in uw geval geschikt is, is het belangrijk dit met uw oogarts of een andere zorgverlener te bespreken.",
      },
      {
        heading: "Belangrijk – de rol van uw arts",
        text:
          "VitectroMed vervangt geen medisch advies, geen lichamelijk onderzoek en geen specialistische follow‑up.\n\n" +
          "De houding die u moet aannemen, de duur en overige instructies zijn individueel en moeten worden bepaald door uw chirurg of medisch team.\n\n" +
          "Bij gebruik van VitectroMed – en bij ongewone pijn, duidelijk ongemak of twijfel over uw herstel – moet u altijd een arts raadplegen.",
      },
    ],
    faq: [
      {
        q: "Vervangt VitectroMed een medisch hulpmiddel dat door de chirurg is voorgeschreven?",
        a: "Nee. VitectroMed is een ondersteunend hulpmiddel. Het vervangt geen specifieke medische hulpmiddelen of persoonlijke aanbevelingen van uw arts. Beslissingen over behandeling en houding blijven altijd medisch.",
      },
      {
        q: "Kan ik VitectroMed gebruiken zonder overleg met mijn arts?",
        a: "Het is sterk aan te raden dit eerst met uw oogarts of behandelteam te bespreken, zodat kan worden beoordeeld of het hulpmiddel geschikt is voor uw situatie.",
      },
      {
        q: "Hoelang moet ik de voorgeschreven houding aanhouden?",
        a: "De duur hangt volledig af van uw persoonlijke situatie, de uitgevoerde ingreep en de beslissing van uw chirurg. Alleen uw arts kan hierover een betrouwbaar advies geven.",
      },
    ],
    seoTopics: [
      "herstel na vitrectomie",
      "buikligging na vitrectomie",
      "ondersteuning na netvliesoperatie",
      "medisch positioneringshulpmiddel",
    ],
  },
};

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = CONTENT[locale];

  if (!t) return notFound();

  const important = t.sections.find((s) =>
    s.heading.toLowerCase().includes("important")
  );
  const otherSections = t.sections.filter((s) => s !== important);

  return (
    <main className="about-page">
      <div className="about-header">
        <p className="about-eyebrow">VitectroMed · Vitrectomy support</p>
        <h1>{t.title}</h1>
        <p className="about-subtitle">{t.subtitle}</p>
      </div>

      <section className="about-lead">
        <p>{t.lead}</p>
      </section>

      <section className="about-highlights">
        {t.highlights.map((item, i) => (
          <div key={i} className="about-highlight">
            <span className="about-highlight-dot" />
            <p>{item}</p>
          </div>
        ))}
      </section>

      <div className="about-layout">
        <section className="about-main">
          {otherSections.map((section, index) => (
            <article key={index} className="about-section">
              <h2>{section.heading}</h2>
              {section.text.split("\n").map((p, i) =>
                p.trim() ? <p key={i}>{p.trim()}</p> : null
              )}
            </article>
          ))}
        </section>

        <aside className="about-aside">
          {important && (
            <div className="about-important">
              <h3>{important.heading}</h3>
              {important.text.split("\n").map((p, i) =>
                p.trim() ? <p key={i}>{p.trim()}</p> : null
              )}
            </div>
          )}

          <div className="about-facts">
            <h3>En résumé</h3>
            <ul>
              {t.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          {t.faq.length > 0 && (
            <div className="about-faq">
              <h3>Questions fréquentes</h3>
              <ul>
                {t.faq.map((item, i) => (
                  <li key={i}>
                    <strong>{item.q}</strong>
                    <p>{item.a}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {t.seoTopics && (
            <div className="about-tags">
              <h4>Mots‑clés médicaux</h4>
              <div className="about-tags-list">
                {t.seoTopics.map((topic) => (
                  <span key={topic} className="about-tag">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="about-bottom-note">
        <p>
          Les informations présentées sur cette page ont pour objectif d’expliquer
          le rôle de VitectroMed en tant que dispositif d’accompagnement après
          vitrectomie. Elles ne remplacent pas un avis médical personnalisé ni une
          consultation auprès d’un professionnel de santé.
        </p>
      </section>
    </main>
  );
}
