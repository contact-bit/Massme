import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Locales Europe (tu peux en retirer/ajouter facilement)
 */
type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "sv"
  | "da"
  | "no"
  | "fi"
  | "cs"
  | "hu"
  | "ro"
  | "bg"
  | "el"
  | "sk"
  | "sl"
  | "hr"
  | "et"
  | "lv"
  | "lt"
  | "mt"
  | "ga";

type Section = { heading: string; text: string };
type Content = { title: string; subtitle: string; sections: Section[] };

/**
 * ✅ Contenu multi-langue
 * - Traductions naturelles (pas du mot à mot)
 * - Ton médical/prudent (pas de promesse)
 */
const CONTENT: Record<Locale, Content> = {
  fr: {
    title: "À propos d’OculaRest",
    subtitle:
      "Le dispositif conçu pour accompagner la convalescence après vitrectomie avec injection de gaz",
    sections: [
      {
        heading: "Pourquoi OculaRest a été créé ?",
        text: `
OculaRest est né d’un constat simple : après une vitrectomie avec injection de gaz, le respect strict de la position post-opératoire est essentiel.

Pour de nombreux patients, maintenir cette position pendant plusieurs jours (parfois davantage) est difficile. L’inconfort, les tensions cervicales et la fatigue rendent la convalescence plus éprouvante.

OculaRest a été conçu pour faciliter le maintien de la position prescrite tout en améliorant le confort au quotidien.
        `,
      },
      {
        heading: "À quoi sert OculaRest pendant la convalescence ?",
        text: `
OculaRest aide à maintenir plus facilement la posture recommandée par le chirurgien afin d’optimiser les conditions de récupération.

En réduisant les contraintes liées à la position, il permet au patient de mieux tenir la durée nécessaire, avec moins de douleurs et moins de compensations musculaires.

L’objectif est simple : aider le patient à rester correctement positionné, plus longtemps, et dans de meilleures conditions.
        `,
      },
      {
        heading: "Confort et stabilité",
        text: `
OculaRest a été pensé pour offrir un bon maintien, de jour comme de nuit, tout en favorisant une posture plus stable.

Il contribue à diminuer les tensions au niveau du cou et des épaules, souvent liées au maintien prolongé de la position.

Chaque élément a été conçu pour être simple à utiliser et rassurant pendant la période post-opératoire.
        `,
      },
      {
        heading: "Pour qui est conçu OculaRest ?",
        text: `
OculaRest s’adresse aux patients opérés d’une vitrectomie avec injection de gaz, lorsque le chirurgien prescrit une position post-opératoire.

Il est également utile pour les personnes qui souhaitent une solution plus confortable afin de respecter au mieux les recommandations médicales pendant la convalescence.
        `,
      },
      {
        heading: "Important",
        text: `
OculaRest ne remplace pas un avis médical.

La position à respecter, la durée et les consignes dépendent de votre situation et doivent être validées par votre chirurgien ou votre équipe médicale.
        `,
      },
    ],
  },

  en: {
    title: "About OculaRest",
    subtitle: "The device designed to support recovery after vitrectomy with gas injection",
    sections: [
      {
        heading: "Why was OculaRest created?",
        text: `
OculaRest was created from a simple observation: after a vitrectomy with gas injection, strictly maintaining the post-operative position is essential.

For many patients, holding this position for several days (sometimes longer) can be difficult. Discomfort, neck strain and fatigue can make recovery more challenging.

OculaRest was designed to make it easier to maintain the prescribed position while improving everyday comfort.
        `,
      },
      {
        heading: "What is OculaRest used for during recovery?",
        text: `
OculaRest helps patients maintain the position recommended by their surgeon in order to support optimal recovery conditions.

By reducing the physical constraints associated with prolonged positioning, it can help patients keep the required posture longer, with less discomfort and fewer compensations.

The goal is simple: help patients stay correctly positioned for longer, in better conditions.
        `,
      },
      {
        heading: "Comfort and stability",
        text: `
OculaRest is designed to provide stable support, day and night, while promoting a more consistent posture.

It can help reduce strain in the neck and shoulders, which often occurs when maintaining the recovery position.

Every detail is designed to be easy to use and reassuring throughout the post-operative period.
        `,
      },
      {
        heading: "Who is OculaRest designed for?",
        text: `
OculaRest is intended for patients who have undergone a vitrectomy with gas injection when a specific post-operative position is prescribed by the surgeon.

It is also helpful for anyone looking for a more comfortable solution to follow medical positioning instructions during recovery.
        `,
      },
      {
        heading: "Important",
        text: `
OculaRest does not replace medical advice.

The position to follow, the duration and instructions depend on your individual case and must be confirmed by your surgeon or medical team.
        `,
      },
    ],
  },

  es: {
    title: "Acerca de OculaRest",
    subtitle:
      "El dispositivo diseñado para apoyar la recuperación tras una vitrectomía con inyección de gas",
    sections: [
      {
        heading: "¿Por qué se creó OculaRest?",
        text: `
OculaRest nació de una observación sencilla: después de una vitrectomía con inyección de gas, mantener estrictamente la postura posoperatoria es esencial.

Para muchos pacientes, sostener esa posición durante varios días (a veces más) puede ser difícil. La incomodidad, la tensión cervical y el cansancio hacen que la recuperación sea más exigente.

OculaRest se diseñó para facilitar el mantenimiento de la posición indicada y mejorar el confort diario.
        `,
      },
      {
        heading: "¿Para qué sirve OculaRest durante la recuperación?",
        text: `
OculaRest ayuda a mantener más fácilmente la postura recomendada por el cirujano para favorecer buenas condiciones de recuperación.

Al reducir las limitaciones asociadas a la postura, puede ayudar a sostenerla durante más tiempo con menos molestias.

El objetivo es sencillo: ayudar a permanecer bien posicionado, por más tiempo, en mejores condiciones.
        `,
      },
      {
        heading: "Comodidad y estabilidad",
        text: `
OculaRest está pensado para aportar un apoyo estable, de día y de noche, y favorecer una postura más constante.

Puede ayudar a reducir la tensión en cuello y hombros, frecuente cuando se mantiene una posición durante mucho tiempo.

Cada detalle está diseñado para ser fácil de usar y tranquilizador durante el postoperatorio.
        `,
      },
      {
        heading: "¿Para quién está diseñado OculaRest?",
        text: `
OculaRest está destinado a pacientes operados de vitrectomía con inyección de gas cuando el cirujano prescribe una postura posoperatoria.

También es útil para quienes buscan una solución más cómoda para seguir las indicaciones médicas durante la recuperación.
        `,
      },
      {
        heading: "Importante",
        text: `
OculaRest no sustituye el consejo médico.

La postura, la duración y las indicaciones dependen de cada caso y deben confirmarse con el cirujano o el equipo médico.
        `,
      },
    ],
  },

  de: {
    title: "Über OculaRest",
    subtitle: "Das Gerät zur Unterstützung der Erholung nach einer Vitrektomie mit Gasinjektion",
    sections: [
      {
        heading: "Warum wurde OculaRest entwickelt?",
        text: `
OculaRest entstand aus einer einfachen Beobachtung: Nach einer Vitrektomie mit Gasinjektion ist es wichtig, die postoperative Lagerung konsequent einzuhalten.

Für viele Patientinnen und Patienten ist es schwierig, diese Position über mehrere Tage (manchmal länger) beizubehalten. Unbehagen, Nackenverspannungen und Müdigkeit können die Erholung erschweren.

OculaRest wurde entwickelt, um die verordnete Position leichter einzuhalten und den Alltag komfortabler zu machen.
        `,
      },
      {
        heading: "Wozu dient OculaRest während der Erholung?",
        text: `
OculaRest hilft, die vom Operateur empfohlene Position leichter einzuhalten, um gute Erholungsbedingungen zu unterstützen.

Durch die Reduktion der Belastung kann es helfen, die erforderliche Haltung länger und mit weniger Beschwerden beizubehalten.

Das Ziel ist einfach: besser positioniert bleiben, länger, unter besseren Bedingungen.
        `,
      },
      {
        heading: "Komfort und Stabilität",
        text: `
OculaRest ist auf stabilen Halt ausgelegt, tagsüber und nachts, und fördert eine gleichmäßigere Haltung.

Es kann helfen, Verspannungen in Nacken und Schultern zu reduzieren, die bei längerem Halten der Position häufig auftreten.

Alle Elemente sind so gestaltet, dass sie einfach zu nutzen und in der postoperativen Phase beruhigend sind.
        `,
      },
      {
        heading: "Für wen ist OculaRest gedacht?",
        text: `
OculaRest richtet sich an Patientinnen und Patienten nach einer Vitrektomie mit Gasinjektion, wenn eine spezielle postoperative Position verordnet wurde.

Es kann auch für Personen hilfreich sein, die eine komfortablere Lösung suchen, um medizinische Lagerungshinweise bestmöglich einzuhalten.
        `,
      },
      {
        heading: "Wichtig",
        text: `
OculaRest ersetzt keine medizinische Beratung.

Position, Dauer und Anweisungen sind individuell und müssen mit dem Operateur oder dem medizinischen Team abgestimmt werden.
        `,
      },
    ],
  },

  it: {
    title: "Chi è OculaRest",
    subtitle:
      "Il dispositivo progettato per supportare la convalescenza dopo vitrectomia con iniezione di gas",
    sections: [
      {
        heading: "Perché è stato creato OculaRest?",
        text: `
OculaRest nasce da un’osservazione semplice: dopo una vitrectomia con iniezione di gas, rispettare rigorosamente la posizione post-operatoria è fondamentale.

Per molti pazienti, mantenere questa posizione per diversi giorni (a volte più a lungo) è difficile. Disagio, tensioni cervicali e stanchezza possono rendere la convalescenza più impegnativa.

OculaRest è stato progettato per facilitare il mantenimento della posizione prescritta e migliorare il comfort quotidiano.
        `,
      },
      {
        heading: "A cosa serve OculaRest durante la convalescenza?",
        text: `
OculaRest aiuta a mantenere più facilmente la postura consigliata dal chirurgo per favorire buone condizioni di recupero.

Riducendo i vincoli legati alla posizione, può aiutare a mantenerla più a lungo con meno fastidi.

L’obiettivo è semplice: aiutare il paziente a restare ben posizionato più a lungo, in condizioni migliori.
        `,
      },
      {
        heading: "Comfort e stabilità",
        text: `
OculaRest è pensato per offrire supporto stabile, di giorno e di notte, favorendo una postura più costante.

Può contribuire a ridurre le tensioni su collo e spalle, spesso legate al mantenimento prolungato della posizione.

Ogni dettaglio è progettato per essere semplice da usare e rassicurante nel periodo post-operatorio.
        `,
      },
      {
        heading: "Per chi è progettato OculaRest?",
        text: `
OculaRest è destinato ai pazienti sottoposti a vitrectomia con iniezione di gas quando il chirurgo prescrive una specifica posizione post-operatoria.

È utile anche per chi desidera una soluzione più confortevole per seguire al meglio le indicazioni mediche durante la convalescenza.
        `,
      },
      {
        heading: "Importante",
        text: `
OculaRest non sostituisce il parere medico.

Posizione, durata e indicazioni dipendono dal caso individuale e devono essere confermati dal chirurgo o dal team medico.
        `,
      },
    ],
  },

  pt: {
    title: "Sobre o OculaRest",
    subtitle:
      "O dispositivo concebido para apoiar a recuperação após vitrectomia com injeção de gás",
    sections: [
      {
        heading: "Por que o OculaRest foi criado?",
        text: `
O OculaRest nasceu de uma observação simples: após uma vitrectomia com injeção de gás, manter rigorosamente a posição pós-operatória é essencial.

Para muitos pacientes, manter essa posição durante vários dias (por vezes mais) pode ser difícil. O desconforto, a tensão no pescoço e a fadiga podem tornar a recuperação mais exigente.

O OculaRest foi concebido para facilitar a manutenção da posição prescrita e melhorar o conforto no dia a dia.
        `,
      },
      {
        heading: "Para que serve o OculaRest durante a recuperação?",
        text: `
O OculaRest ajuda a manter mais facilmente a postura recomendada pelo cirurgião, favorecendo boas condições de recuperação.

Ao reduzir as limitações associadas à postura, pode ajudar a mantê-la por mais tempo com menos desconforto.

O objetivo é simples: ajudar a permanecer corretamente posicionado por mais tempo, em melhores condições.
        `,
      },
      {
        heading: "Conforto e estabilidade",
        text: `
O OculaRest foi pensado para oferecer apoio estável, de dia e de noite, promovendo uma postura mais consistente.

Pode ajudar a reduzir a tensão no pescoço e nos ombros, comum quando se mantém uma posição por muito tempo.

Cada detalhe foi desenhado para ser fácil de usar e tranquilizador durante o período pós-operatório.
        `,
      },
      {
        heading: "Para quem o OculaRest é indicado?",
        text: `
O OculaRest é destinado a pacientes submetidos a vitrectomia com injeção de gás quando o cirurgião prescreve uma posição pós-operatória.

Também é útil para quem procura uma solução mais confortável para seguir as orientações médicas durante a recuperação.
        `,
      },
      {
        heading: "Importante",
        text: `
O OculaRest não substitui aconselhamento médico.

A posição, a duração e as instruções dependem do seu caso e devem ser confirmadas pelo cirurgião ou equipa médica.
        `,
      },
    ],
  },

  nl: {
    title: "Over OculaRest",
    subtitle:
      "Het hulpmiddel dat herstel ondersteunt na een vitrectomie met gasinjectie",
    sections: [
      {
        heading: "Waarom is OculaRest ontwikkeld?",
        text: `
OculaRest is ontstaan vanuit een eenvoudige vaststelling: na een vitrectomie met gasinjectie is het strikt aanhouden van de postoperatieve houding essentieel.

Voor veel patiënten is het lastig om deze houding meerdere dagen (soms langer) vol te houden. Ongemak, nekspanning en vermoeidheid kunnen het herstel zwaarder maken.

OculaRest is ontworpen om het makkelijker te maken de voorgeschreven houding aan te houden en het dagelijkse comfort te verbeteren.
        `,
      },
      {
        heading: "Waarvoor dient OculaRest tijdens het herstel?",
        text: `
OculaRest helpt om de door de chirurg aanbevolen houding eenvoudiger aan te houden en zo goede herstelomstandigheden te ondersteunen.

Door de fysieke belasting van langdurig positioneren te verminderen, kan het helpen de houding langer vol te houden met minder ongemak.

Het doel is eenvoudig: helpen om correct gepositioneerd te blijven, langer en in betere omstandigheden.
        `,
      },
      {
        heading: "Comfort en stabiliteit",
        text: `
OculaRest is ontworpen voor stabiele ondersteuning, zowel overdag als ’s nachts, en bevordert een constantere houding.

Het kan helpen spanning in nek en schouders te verminderen, wat vaak voorkomt bij langdurig dezelfde houding.

Elk detail is ontworpen om eenvoudig te gebruiken en geruststellend te zijn in de postoperatieve periode.
        `,
      },
      {
        heading: "Voor wie is OculaRest bedoeld?",
        text: `
OculaRest is bedoeld voor patiënten die een vitrectomie met gasinjectie hebben ondergaan wanneer een specifieke postoperatieve houding is voorgeschreven.

Het is ook geschikt voor wie een comfortabelere oplossing zoekt om medische houdingsinstructies zo goed mogelijk op te volgen tijdens het herstel.
        `,
      },
      {
        heading: "Belangrijk",
        text: `
OculaRest vervangt geen medisch advies.

De houding, duur en instructies zijn individueel en moeten worden bevestigd door de chirurg of het medisch team.
        `,
      },
    ],
  },

  pl: {
    title: "O OculaRest",
    subtitle:
      "Urządzenie zaprojektowane, aby wspierać rekonwalescencję po witrektomii z podaniem gazu",
    sections: [
      {
        heading: "Dlaczego powstał OculaRest?",
        text: `
OculaRest powstał z prostej obserwacji: po witrektomii z podaniem gazu ścisłe utrzymywanie pozycji pooperacyjnej jest kluczowe.

Dla wielu pacjentów utrzymanie tej pozycji przez kilka dni (czasem dłużej) bywa trudne. Dyskomfort, napięcie karku i zmęczenie mogą utrudniać rekonwalescencję.

OculaRest zaprojektowano, aby ułatwić utrzymanie zaleconej pozycji i poprawić codzienny komfort.
        `,
      },
      {
        heading: "Do czego służy OculaRest w trakcie rekonwalescencji?",
        text: `
OculaRest pomaga łatwiej utrzymać pozycję zalecaną przez chirurga, wspierając dobre warunki powrotu do zdrowia.

Zmniejszając obciążenia związane z pozycjonowaniem, może pomóc dłużej utrzymać wymaganą postawę przy mniejszym dyskomforcie.

Cel jest prosty: pomóc pozostać prawidłowo ułożonym dłużej i w lepszych warunkach.
        `,
      },
      {
        heading: "Komfort i stabilność",
        text: `
OculaRest zaprojektowano tak, aby zapewniał stabilne podparcie w dzień i w nocy oraz sprzyjał bardziej stałej postawie.

Może pomóc zmniejszyć napięcie szyi i barków, często związane z długotrwałym utrzymywaniem pozycji.

Każdy element jest prosty w użyciu i ma dawać poczucie bezpieczeństwa w okresie pooperacyjnym.
        `,
      },
      {
        heading: "Dla kogo jest OculaRest?",
        text: `
OculaRest jest przeznaczony dla pacjentów po witrektomii z podaniem gazu, gdy chirurg zaleca określoną pozycję pooperacyjną.

Jest też pomocny dla osób, które szukają wygodniejszego rozwiązania, aby jak najlepiej przestrzegać zaleceń medycznych podczas rekonwalescencji.
        `,
      },
      {
        heading: "Ważne",
        text: `
OculaRest nie zastępuje porady lekarskiej.

Pozycja, czas trwania i zalecenia zależą od indywidualnej sytuacji i muszą zostać potwierdzone przez chirurga lub zespół medyczny.
        `,
      },
    ],
  },

  // --- Nordics / others (courts mais complets) ---
  sv: {
    title: "Om OculaRest",
    subtitle: "Enheten som stödjer återhämtning efter vitrektomi med gasinjektion",
    sections: [
      { heading: "Varför skapades OculaRest?", text: `
OculaRest skapades utifrån en enkel insikt: efter vitrektomi med gasinjektion är det avgörande att följa den postoperativa positionen.

För många patienter är det svårt att hålla positionen i flera dagar. Obehag, nackspänningar och trötthet kan göra återhämtningen tuffare.

OculaRest är utformat för att underlätta den ordinerade positionen och förbättra komforten i vardagen.
      `},
      { heading: "Vad används OculaRest till under återhämtning?", text: `
OculaRest hjälper till att enklare hålla den position som kirurgen rekommenderar för att stödja goda återhämtningsförhållanden.

Genom att minska belastningen kan det hjälpa att hålla positionen längre med mindre obehag.

Målet är enkelt: hjälpa dig att vara korrekt positionerad längre och under bättre förutsättningar.
      `},
      { heading: "Komfort och stabilitet", text: `
OculaRest är utformat för stabilt stöd både dag och natt och för en mer konsekvent hållning.

Det kan hjälpa till att minska spänningar i nacke och axlar som ofta uppstår vid långvarig positionering.

Varje detalj är designad för att vara enkel att använda och trygg under den postoperativa perioden.
      `},
      { heading: "Vem är OculaRest för?", text: `
OculaRest är avsett för patienter som genomgått vitrektomi med gasinjektion när en specifik postoperativ position har ordinerats.

Det kan också vara användbart för den som vill ha en mer bekväm lösning för att följa medicinska instruktioner under återhämtning.
      `},
      { heading: "Viktigt", text: `
OculaRest ersätter inte medicinsk rådgivning.

Position, varaktighet och instruktioner är individuella och ska bekräftas av kirurg eller vårdteam.
      `},
    ],
  },

  da: {
    title: "Om OculaRest",
    subtitle: "Enheden der støtter restitution efter vitrektomi med gasinjektion",
    sections: [
      { heading: "Hvorfor blev OculaRest skabt?", text: `
OculaRest blev skabt ud fra en enkel observation: efter vitrektomi med gasinjektion er det vigtigt at overholde den postoperative stilling.

For mange patienter er det svært at holde stillingen i flere dage. Ubehag, nakkespændinger og træthed kan gøre forløbet mere krævende.

OculaRest er designet til at gøre det nemmere at holde den ordinerede position og forbedre komforten i hverdagen.
      `},
      { heading: "Hvad bruges OculaRest til under restitution?", text: `
OculaRest hjælper med lettere at holde den position, som kirurgen anbefaler, for at støtte gode restitutionsbetingelser.

Ved at reducere belastningen kan det hjælpe med at holde stillingen længere med mindre ubehag.

Målet er enkelt: hjælpe med at forblive korrekt positioneret længere og under bedre forhold.
      `},
      { heading: "Komfort og stabilitet", text: `
OculaRest er udformet til stabil støtte dag og nat og til en mere ensartet holdning.

Det kan hjælpe med at reducere spændinger i nakke og skuldre, som ofte opstår ved længere tids positionering.

Hver detalje er designet til at være enkel at bruge og tryg i den postoperative periode.
      `},
      { heading: "Hvem er OculaRest til?", text: `
OculaRest er til patienter efter vitrektomi med gasinjektion, når kirurgen har ordineret en bestemt postoperativ position.

Det kan også være nyttigt for dem, der ønsker en mere komfortabel løsning til at følge medicinske instruktioner under restitution.
      `},
      { heading: "Vigtigt", text: `
OculaRest erstatter ikke lægelig rådgivning.

Position, varighed og instruktioner er individuelle og skal bekræftes af kirurg eller sundhedsteam.
      `},
    ],
  },

  no: {
    title: "Om OculaRest",
    subtitle: "Enheten som støtter restitusjon etter vitrektomi med gassinjeksjon",
    sections: [
      { heading: "Hvorfor ble OculaRest laget?", text: `
OculaRest ble laget ut fra en enkel observasjon: etter vitrektomi med gassinjeksjon er det avgjørende å følge den postoperative posisjonen.

For mange pasienter er det vanskelig å holde posisjonen i flere dager. Ubehag, nakkespenninger og tretthet kan gjøre restitusjonen mer krevende.

OculaRest er utviklet for å gjøre det enklere å holde foreskrevet posisjon og bedre komforten i hverdagen.
      `},
      { heading: "Hva brukes OculaRest til under restitusjon?", text: `
OculaRest hjelper med å holde posisjonen kirurgen anbefaler, for å støtte gode forhold for bedring.

Ved å redusere belastningen kan det hjelpe å holde posisjonen lenger med mindre ubehag.

Målet er enkelt: hjelpe deg å være korrekt posisjonert lenger og under bedre forhold.
      `},
      { heading: "Komfort og stabilitet", text: `
OculaRest er utformet for stabil støtte, dag og natt, og en mer konsekvent holdning.

Det kan bidra til å redusere spenninger i nakke og skuldre som ofte oppstår ved langvarig posisjonering.

Hver detalj er laget for å være enkel å bruke og trygg i den postoperative perioden.
      `},
      { heading: "Hvem er OculaRest for?", text: `
OculaRest er for pasienter etter vitrektomi med gassinjeksjon når en spesifikk postoperativ posisjon er foreskrevet.

Det kan også være nyttig for de som ønsker en mer komfortabel løsning for å følge medisinske instrukser under restitusjon.
      `},
      { heading: "Viktig", text: `
OculaRest erstatter ikke medisinsk rådgivning.

Posisjon, varighet og instrukser er individuelle og må bekreftes av kirurg eller behandlingsteam.
      `},
    ],
  },

  fi: {
    title: "Tietoa OculaRestista",
    subtitle: "Laite, joka tukee toipumista vitrektomian ja kaasuinjektion jälkeen",
    sections: [
      { heading: "Miksi OculaRest kehitettiin?", text: `
OculaRest kehitettiin yksinkertaisesta havainnosta: vitrektomian ja kaasuinjektion jälkeen leikkauksen jälkeisen asennon noudattaminen on tärkeää.

Monille potilaille asennon ylläpito useiden päivien ajan on vaikeaa. Epämukavuus, niskajännitys ja väsymys voivat tehdä toipumisesta raskaampaa.

OculaRest on suunniteltu helpottamaan määrätyn asennon ylläpitoa ja parantamaan arjen mukavuutta.
      `},
      { heading: "Mihin OculaRestia käytetään toipumisen aikana?", text: `
OculaRest auttaa ylläpitämään kirurgin suosittelemaa asentoa ja tukee hyviä toipumisolosuhteita.

Kuormitusta vähentämällä se voi auttaa pitämään asennon pidempään pienemmällä epämukavuudella.

Tavoite on yksinkertainen: auttaa pysymään oikein asennossa pidempään ja paremmissa olosuhteissa.
      `},
      { heading: "Mukavuus ja vakaus", text: `
OculaRest tarjoaa vakaata tukea päivällä ja yöllä ja edistää tasaisempaa asentoa.

Se voi auttaa vähentämään niskan ja hartioiden rasitusta, joka on yleistä pitkäkestoisessa asennossa.

Jokainen yksityiskohta on suunniteltu helppokäyttöiseksi ja rauhoittavaksi leikkauksen jälkeisenä aikana.
      `},
      { heading: "Kenelle OculaRest on tarkoitettu?", text: `
OculaRest on tarkoitettu potilaille vitrektomian ja kaasuinjektion jälkeen, kun kirurgi määrää tietyn leikkauksen jälkeisen asennon.

Se voi olla hyödyllinen myös niille, jotka haluavat mukavamman ratkaisun lääketieteellisten ohjeiden noudattamiseen toipumisen aikana.
      `},
      { heading: "Tärkeää", text: `
OculaRest ei korvaa lääketieteellistä neuvontaa.

Asento, kesto ja ohjeet ovat yksilöllisiä ja ne tulee varmistaa kirurgilta tai hoitotiimiltä.
      `},
    ],
  },

  // --- Central/East Europe (versions complètes mais compactes) ---
  cs: {
    title: "O OculaRest",
    subtitle: "Zařízení navržené pro podporu rekonvalescence po vitrektomii s aplikací plynu",
    sections: [
      { heading: "Proč byl OculaRest vytvořen?", text: `
OculaRest vznikl z jednoduchého zjištění: po vitrektomii s aplikací plynu je zásadní důsledně dodržovat pooperační polohu.

Pro mnoho pacientů je obtížné tuto polohu udržet několik dní. Nepohodlí, napětí v šíji a únava mohou rekonvalescenci ztížit.

OculaRest je navržen tak, aby usnadnil udržení předepsané polohy a zlepšil každodenní komfort.
      `},
      { heading: "K čemu OculaRest slouží během rekonvalescence?", text: `
OculaRest pomáhá snáze udržet polohu doporučenou chirurgem a podpořit tak vhodné podmínky pro zotavení.

Snížením zátěže spojené s dlouhodobým polohováním může pomoci vydržet déle s menším nepohodlím.

Cíl je jednoduchý: pomoci zůstat správně polohovaný déle a v lepších podmínkách.
      `},
      { heading: "Komfort a stabilita", text: `
OculaRest je navržen pro stabilní oporu ve dne i v noci a pro konzistentnější držení těla.

Může pomoci snížit napětí v oblasti krku a ramen, které se často objevuje při dlouhodobém udržování polohy.

Každý detail je navržen tak, aby byl snadno použitelný a uklidňující v pooperačním období.
      `},
      { heading: "Pro koho je OculaRest určen?", text: `
OculaRest je určen pro pacienty po vitrektomii s aplikací plynu, pokud chirurg předepsal specifickou pooperační polohu.

Je užitečný i pro ty, kteří hledají pohodlnější řešení pro dodržení lékařských pokynů během rekonvalescence.
      `},
      { heading: "Důležité", text: `
OculaRest nenahrazuje lékařské doporučení.

Poloha, délka trvání a pokyny jsou individuální a musí je potvrdit chirurg nebo zdravotnický tým.
      `},
    ],
  },

  hu: {
    title: "Az OculaRestsről",
    subtitle: "Eszköz a gázinjekcióval végzett vitrektómia utáni felépülés támogatására",
    sections: [
      { heading: "Miért készült az OculaRest?", text: `
Az OculaRest egy egyszerű megfigyelésből született: gázinjekcióval végzett vitrektómia után kulcsfontosságú a posztoperatív testhelyzet szigorú betartása.

Sok beteg számára nehéz több napon át megtartani ezt a pozíciót. A kellemetlenség, nyaki feszülés és fáradtság megnehezítheti a felépülést.

Az OculaRest célja, hogy megkönnyítse az előírt testhelyzet fenntartását és javítsa a mindennapi komfortot.
      `},
      { heading: "Mire szolgál az OculaRest a felépülés alatt?", text: `
Az OculaRest segít könnyebben megtartani a sebész által javasolt testhelyzetet, támogatva a megfelelő gyógyulási feltételeket.

A terhelés csökkentésével segíthet hosszabb ideig megtartani a szükséges pozíciót kevesebb kellemetlenséggel.

A cél egyszerű: helyesen pozicionált állapot fenntartása hosszabb ideig, jobb körülmények között.
      `},
      { heading: "Kényelem és stabilitás", text: `
Az OculaRest stabil támaszt nyújt nappal és éjjel, és következetesebb testtartást támogat.

Segíthet csökkenteni a nyak és váll feszülését, ami gyakori a hosszan tartó pozíció esetén.

Minden részlet könnyű használatra és a posztoperatív időszak megnyugtató támogatására készült.
      `},
      { heading: "Kinek készült az OculaRest?", text: `
Az OculaRest azoknak a betegeknek készült, akik gázinjekcióval végzett vitrektómián estek át, és a sebész speciális posztoperatív testhelyzetet írt elő.

Hasznos lehet mindenkinek, aki kényelmesebb megoldást keres az orvosi utasítások betartásához a felépülés alatt.
      `},
      { heading: "Fontos", text: `
Az OculaRest nem helyettesíti az orvosi tanácsot.

A testhelyzet, az időtartam és az utasítások egyéniek, és a sebésznek vagy az egészségügyi csapatnak kell megerősítenie.
      `},
    ],
  },

  ro: {
    title: "Despre OculaRest",
    subtitle: "Dispozitivul conceput pentru a sprijini recuperarea după vitrectomie cu injecție de gaz",
    sections: [
      { heading: "De ce a fost creat OculaRest?", text: `
OculaRest a pornit de la o observație simplă: după vitrectomie cu injecție de gaz, menținerea strictă a poziției postoperatorii este esențială.

Pentru mulți pacienți, menținerea acestei poziții timp de mai multe zile poate fi dificilă. Disconfortul, tensiunea cervicală și oboseala pot îngreuna recuperarea.

OculaRest a fost conceput pentru a facilita menținerea poziției prescrise și pentru a îmbunătăți confortul zilnic.
      `},
      { heading: "La ce folosește OculaRest în timpul recuperării?", text: `
OculaRest ajută la menținerea mai ușoară a poziției recomandate de chirurg, sprijinind condiții bune de recuperare.

Prin reducerea constrângerilor, poate ajuta la menținerea posturii necesare mai mult timp, cu mai puțin disconfort.

Scopul este simplu: să te ajute să rămâi corect poziționat mai mult timp, în condiții mai bune.
      `},
      { heading: "Confort și stabilitate", text: `
OculaRest este proiectat pentru sprijin stabil zi și noapte, favorizând o postură mai constantă.

Poate ajuta la reducerea tensiunii din zona gâtului și a umerilor, frecventă în poziționarea prelungită.

Fiecare detaliu este conceput pentru utilizare ușoară și pentru a oferi siguranță în perioada postoperatorie.
      `},
      { heading: "Pentru cine este OculaRest?", text: `
OculaRest este destinat pacienților operați de vitrectomie cu injecție de gaz atunci când chirurgul recomandă o poziție postoperatorie.

Este util și pentru cei care doresc o soluție mai confortabilă pentru a respecta recomandările medicale în timpul recuperării.
      `},
      { heading: "Important", text: `
OculaRest nu înlocuiește sfatul medical.

Poziția, durata și instrucțiunile depind de situația ta și trebuie confirmate de chirurg sau echipa medicală.
      `},
    ],
  },

  bg: {
    title: "За OculaRest",
    subtitle: "Устройство, създадено да подпомага възстановяването след витректомия с газова инжекция",
    sections: [
      { heading: "Защо е създаден OculaRest?", text: `
OculaRest е създаден на базата на проста идея: след витректомия с газова инжекция е важно стриктно да се спазва следоперативната позиция.

За много пациенти е трудно да задържат тази позиция няколко дни. Дискомфортът, напрежението във врата и умората могат да направят възстановяването по-тежко.

OculaRest е проектиран да улесни поддържането на предписаната позиция и да подобри ежедневния комфорт.
      `},
      { heading: "За какво служи OculaRest по време на възстановяване?", text: `
OculaRest помага по-лесно да се поддържа препоръчаната от хирурга позиция и да се подпомогнат условията за възстановяване.

Като намалява натоварването, може да помогне позицията да се задържи по-дълго с по-малко дискомфорт.

Целта е проста: да помогне да останете правилно позиционирани по-дълго и при по-добри условия.
      `},
      { heading: "Комфорт и стабилност", text: `
OculaRest е създаден за стабилна опора денем и нощем и за по-постоянна стойка.

Може да помогне за намаляване на напрежението във врата и раменете при продължително задържане на позиция.

Всеки детайл е проектиран да е лесен за употреба и успокояващ през следоперативния период.
      `},
      { heading: "За кого е предназначен OculaRest?", text: `
OculaRest е предназначен за пациенти след витректомия с газова инжекция, когато хирургът е предписал следоперативна позиция.

Полезен е и за хора, които търсят по-удобно решение, за да следват медицинските указания по време на възстановяване.
      `},
      { heading: "Важно", text: `
OculaRest не замества медицински съвет.

Позицията, продължителността и указанията са индивидуални и трябва да бъдат потвърдени от хирурга или медицинския екип.
      `},
    ],
  },

  el: {
    title: "Σχετικά με το OculaRest",
    subtitle: "Η συσκευή που υποστηρίζει την ανάρρωση μετά από υαλοειδεκτομή με έγχυση αερίου",
    sections: [
      { heading: "Γιατί δημιουργήθηκε το OculaRest;", text: `
Το OculaRest δημιουργήθηκε από μια απλή παρατήρηση: μετά από υαλοειδεκτομή με έγχυση αερίου, η αυστηρή τήρηση της μετεγχειρητικής θέσης είναι απαραίτητη.

Για πολλούς ασθενείς, η διατήρηση αυτής της θέσης για αρκετές ημέρες είναι δύσκολη. Η δυσφορία, η καταπόνηση του αυχένα και η κόπωση μπορεί να κάνουν την ανάρρωση πιο απαιτητική.

Το OculaRest σχεδιάστηκε για να διευκολύνει τη διατήρηση της συνιστώμενης θέσης και να βελτιώσει την καθημερινή άνεση.
      `},
      { heading: "Σε τι χρησιμεύει το OculaRest κατά την ανάρρωση;", text: `
Το OculaRest βοηθά στην ευκολότερη διατήρηση της θέσης που συστήνει ο χειρουργός, υποστηρίζοντας καλύτερες συνθήκες ανάρρωσης.

Μειώνοντας την καταπόνηση, μπορεί να βοηθήσει να διατηρείται η απαιτούμενη στάση για περισσότερο χρόνο με λιγότερη δυσφορία.

Στόχος είναι απλός: να βοηθήσει να παραμείνετε σωστά τοποθετημένοι για περισσότερο, σε καλύτερες συνθήκες.
      `},
      { heading: "Άνεση και σταθερότητα", text: `
Το OculaRest έχει σχεδιαστεί για σταθερή υποστήριξη μέρα και νύχτα και για πιο σταθερή στάση.

Μπορεί να βοηθήσει στη μείωση της καταπόνησης σε αυχένα και ώμους που συχνά εμφανίζεται με παρατεταμένη θέση.

Κάθε λεπτομέρεια είναι σχεδιασμένη για εύκολη χρήση και αίσθημα ασφάλειας στη μετεγχειρητική περίοδο.
      `},
      { heading: "Για ποιον είναι το OculaRest;", text: `
Το OculaRest απευθύνεται σε ασθενείς που υποβλήθηκαν σε υαλοειδεκτομή με έγχυση αερίου όταν έχει δοθεί συγκεκριμένη μετεγχειρητική οδηγία θέσης.

Είναι επίσης χρήσιμο για όσους θέλουν μια πιο άνετη λύση ώστε να ακολουθούν τις ιατρικές οδηγίες κατά την ανάρρωση.
      `},
      { heading: "Σημαντικό", text: `
Το OculaRest δεν αντικαθιστά ιατρική συμβουλή.

Η θέση, η διάρκεια και οι οδηγίες εξαρτώνται από την περίπτωσή σας και πρέπει να επιβεβαιωθούν από τον χειρουργό ή την ιατρική ομάδα.
      `},
    ],
  },

  // --- plus petits pays / versions courtes mais pro ---
  sk: {
    title: "O OculaRest",
    subtitle: "Zariadenie navrhnuté na podporu rekonvalescencie po vitrektómii s aplikáciou plynu",
    sections: [
      { heading: "Prečo vznikol OculaRest?", text: `
OculaRest vznikol z jednoduchého poznatku: po vitrektómii s aplikáciou plynu je dôležité dôsledne dodržiavať pooperačnú polohu.

Pre mnohých pacientov je náročné udržať túto polohu niekoľko dní. Nepohodlie, napätie šije a únava môžu zotavenie sťažiť.

OculaRest je navrhnutý tak, aby uľahčil udržiavanie predpísanej polohy a zlepšil každodenný komfort.
      `},
      { heading: "Na čo slúži OculaRest počas rekonvalescencie?", text: `
OculaRest pomáha ľahšie udržať polohu odporúčanú chirurgom a podporiť tak vhodné podmienky na zotavenie.

Znížením záťaže môže pomôcť udržať potrebnú polohu dlhšie s menším nepohodlím.

Cieľ je jednoduchý: pomôcť zostať správne polohovaný dlhšie a v lepších podmienkach.
      `},
      { heading: "Pohodlie a stabilita", text: `
OculaRest poskytuje stabilnú oporu vo dne aj v noci a podporuje konzistentnejšie držanie tela.

Môže pomôcť znížiť napätie v oblasti krku a ramien pri dlhodobom udržiavaní polohy.

Detaily sú navrhnuté tak, aby boli jednoduché na použitie a upokojujúce v pooperačnom období.
      `},
      { heading: "Pre koho je OculaRest určený?", text: `
OculaRest je určený pre pacientov po vitrektómii s aplikáciou plynu, ak chirurg predpísal špecifickú pooperačnú polohu.

Je užitočný aj pre tých, ktorí chcú pohodlnejšie riešenie na dodržiavanie lekárskych pokynov počas rekonvalescencie.
      `},
      { heading: "Dôležité", text: `
OculaRest nenahrádza lekárske odporúčanie.

Poloha, trvanie a pokyny sú individuálne a musia byť potvrdené chirurgom alebo zdravotníckym tímom.
      `},
    ],
  },

  sl: {
    title: "O OculaRest",
    subtitle: "Naprava za podporo okrevanja po vitrektomiji z injekcijo plina",
    sections: [
      { heading: "Zakaj je bil OculaRest ustvarjen?", text: `
OculaRest je nastal iz preprostega spoznanja: po vitrektomiji z injekcijo plina je ključnega pomena dosledno upoštevati pooperativni položaj.

Za mnoge paciente je težko ohranjati ta položaj več dni. Neudobje, napetost v vratu in utrujenost lahko otežijo okrevanje.

OculaRest je zasnovan, da olajša vzdrževanje predpisanega položaja in izboljša vsakodnevno udobje.
      `},
      { heading: "Za kaj se OculaRest uporablja med okrevanjem?", text: `
OculaRest pomaga lažje ohranjati položaj, ki ga priporoči kirurg, in tako podpira dobre pogoje za okrevanje.

Z zmanjšanjem obremenitev lahko pomaga ohranjati zahtevano držo dlje časa z manj neugodja.

Cilj je preprost: pomagati ostati pravilno nameščen dlje časa in v boljših pogojih.
      `},
      { heading: "Udobje in stabilnost", text: `
OculaRest je zasnovan za stabilno oporo podnevi in ponoči ter bolj dosledno držo.

Lahko pomaga zmanjšati napetost v vratu in ramenih, ki se pogosto pojavi pri dolgotrajnem položaju.

Vsaka podrobnost je zasnovana za enostavno uporabo in občutek varnosti v pooperativnem obdobju.
      `},
      { heading: "Komu je OculaRest namenjen?", text: `
OculaRest je namenjen pacientom po vitrektomiji z injekcijo plina, ko je predpisan specifičen pooperativni položaj.

Uporaben je tudi za tiste, ki želijo udobnejšo rešitev za upoštevanje medicinskih navodil med okrevanjem.
      `},
      { heading: "Pomembno", text: `
OculaRest ne nadomešča zdravniškega nasveta.

Položaj, trajanje in navodila so individualni in jih mora potrditi kirurg ali zdravstvena ekipa.
      `},
    ],
  },

  hr: {
    title: "O OculaRestu",
    subtitle: "Uređaj osmišljen za potporu oporavku nakon vitrektomije s injekcijom plina",
    sections: [
      { heading: "Zašto je OculaRest napravljen?", text: `
OculaRest je nastao iz jednostavne spoznaje: nakon vitrektomije s injekcijom plina važno je strogo poštivati postoperativni položaj.

Mnogim pacijentima je teško zadržati taj položaj nekoliko dana. Nelagoda, napetost u vratu i umor mogu otežati oporavak.

OculaRest je dizajniran kako bi olakšao održavanje propisanog položaja i poboljšao svakodnevnu udobnost.
      `},
      { heading: "Čemu služi OculaRest tijekom oporavka?", text: `
OculaRest pomaže lakše održavati položaj koji preporuči kirurg, podržavajući povoljne uvjete oporavka.

Smanjenjem opterećenja može pomoći zadržati potrebnu posturu dulje uz manje nelagode.

Cilj je jednostavan: pomoći ostati pravilno pozicioniran dulje i u boljim uvjetima.
      `},
      { heading: "Udobnost i stabilnost", text: `
OculaRest je osmišljen za stabilnu potporu danju i noću te za dosljedniji položaj.

Može pomoći smanjiti napetost u vratu i ramenima kod dugotrajnog položaja.

Svaki detalj je dizajniran za jednostavno korištenje i osjećaj sigurnosti u postoperativnom razdoblju.
      `},
      { heading: "Kome je OculaRest namijenjen?", text: `
OculaRest je namijenjen pacijentima nakon vitrektomije s injekcijom plina kada je propisan specifičan postoperativni položaj.

Koristan je i za one koji žele udobnije rješenje kako bi se što bolje pridržavali medicinskih uputa tijekom oporavka.
      `},
      { heading: "Važno", text: `
OculaRest ne zamjenjuje liječnički savjet.

Položaj, trajanje i upute ovise o individualnom slučaju i moraju se potvrditi s kirurgom ili medicinskim timom.
      `},
    ],
  },

  et: {
    title: "OculaRestist",
    subtitle: "Seade, mis toetab taastumist pärast vitrektoomiat koos gaasi süstimisega",
    sections: [
      { heading: "Miks OculaRest loodi?", text: `
OculaRest loodi lihtsast tähelepanekust: pärast vitrektoomiat koos gaasi süstimisega on oluline järgida rangelt operatsioonijärgset asendit.

Paljudel patsientidel on raske seda asendit hoida mitu päeva. Ebamugavus, kaelapinged ja väsimus võivad taastumist raskendada.

OculaRest on loodud selleks, et aidata hoida ettenähtud asendit lihtsamalt ja parandada igapäevast mugavust.
      `},
      { heading: "Milleks OculaResti kasutatakse taastumise ajal?", text: `
OculaRest aitab kergemini hoida kirurgi soovitatud asendit, toetades häid taastumistingimusi.

Koormuse vähendamisega võib see aidata hoida vajalikku asendit kauem väiksema ebamugavusega.

Eesmärk on lihtne: aidata püsida õigesti positsioneerituna kauem ja paremates tingimustes.
      `},
      { heading: "Mugavus ja stabiilsus", text: `
OculaRest on loodud stabiilseks toeks päeval ja öösel ning ühtlasema kehahoiaku soodustamiseks.

See võib aidata vähendada kaela ja õlgade pinget, mis tekib sageli pikaajalise asendi hoidmisel.

Iga detail on mõeldud lihtsaks kasutamiseks ja rahustavaks toeks operatsioonijärgsel perioodil.
      `},
      { heading: "Kellele OculaRest on mõeldud?", text: `
OculaRest on mõeldud patsientidele pärast vitrektoomiat koos gaasi süstimisega, kui kirurg määrab kindla operatsioonijärgse asendi.

See võib olla kasulik ka neile, kes soovivad mugavamat lahendust meditsiiniliste juhiste järgimiseks taastumise ajal.
      `},
      { heading: "Oluline", text: `
OculaRest ei asenda meditsiinilist nõu.

Asend, kestus ja juhised on individuaalsed ning need peab kinnitama kirurg või ravimeeskond.
      `},
    ],
  },

  lv: {
    title: "Par OculaRest",
    subtitle: "Ierīce, kas palīdz atveseļoties pēc vitrektomijas ar gāzes injekciju",
    sections: [
      { heading: "Kāpēc tika izveidots OculaRest?", text: `
OculaRest radās no vienkārša novērojuma: pēc vitrektomijas ar gāzes injekciju ir svarīgi stingri ievērot pēcoperācijas pozīciju.

Daudziem pacientiem ir grūti šo pozīciju noturēt vairākas dienas. Diskomforts, kakla sasprindzinājums un nogurums var apgrūtināt atveseļošanos.

OculaRest ir izstrādāts, lai atvieglotu noteiktās pozīcijas uzturēšanu un uzlabotu ikdienas komfortu.
      `},
      { heading: "Kam OculaRest tiek izmantots atveseļošanās laikā?", text: `
OculaRest palīdz vieglāk noturēt ķirurga ieteikto pozīciju, atbalstot labus atveseļošanās apstākļus.

Samazinot slodzi, tas var palīdzēt ilgāk noturēt nepieciešamo pozīciju ar mazāku diskomfortu.

Mērķis ir vienkāršs: palīdzēt palikt pareizi pozicionētam ilgāk un labākos apstākļos.
      `},
      { heading: "Komforts un stabilitāte", text: `
OculaRest ir paredzēts stabilam atbalstam dienā un naktī un konsekventākai stājai.

Tas var palīdzēt mazināt kakla un plecu sasprindzinājumu, kas bieži rodas ilgstošas pozīcijas dēļ.

Katrs elements ir izstrādāts vieglai lietošanai un drošības sajūtai pēcoperācijas periodā.
      `},
      { heading: "Kam ir paredzēts OculaRest?", text: `
OculaRest ir paredzēts pacientiem pēc vitrektomijas ar gāzes injekciju, ja ķirurgs ir noteicis specifisku pēcoperācijas pozīciju.

Tas var noderēt arī tiem, kas vēlas ērtāku risinājumu medicīnisko norādījumu ievērošanai atveseļošanās laikā.
      `},
      { heading: "Svarīgi", text: `
OculaRest neaizstāj medicīnisku konsultāciju.

Pozīcija, ilgums un norādījumi ir individuāli un jāapstiprina ķirurgam vai medicīnas komandai.
      `},
    ],
  },

  lt: {
    title: "Apie OculaRest",
    subtitle: "Prietaisas, skirtas padėti atsigauti po vitrektomijos su dujų injekcija",
    sections: [
      { heading: "Kodėl buvo sukurtas OculaRest?", text: `
OculaRest sukurtas remiantis paprastu pastebėjimu: po vitrektomijos su dujų injekcija svarbu griežtai laikytis pooperacinės padėties.

Daugeliui pacientų sunku išlaikyti šią padėtį kelias dienas. Diskomfortas, kaklo įtampa ir nuovargis gali apsunkinti atsigavimą.

OculaRest sukurtas tam, kad būtų lengviau išlaikyti paskirtą padėtį ir pagerinti kasdienį komfortą.
      `},
      { heading: "Kam naudojamas OculaRest atsigavimo metu?", text: `
OculaRest padeda lengviau išlaikyti chirurgo rekomenduojamą padėtį ir sudaryti geresnes atsigavimo sąlygas.

Mažindamas apkrovą, jis gali padėti ilgiau išlaikyti reikalingą padėtį su mažesniu diskomfortu.

Tikslas paprastas: padėti išlikti teisingoje padėtyje ilgiau ir geresnėmis sąlygomis.
      `},
      { heading: "Komfortas ir stabilumas", text: `
OculaRest sukurtas stabiliai atramai dieną ir naktį bei nuoseklesnei laikysenai.

Jis gali padėti sumažinti kaklo ir pečių įtampą, kuri dažnai atsiranda ilgai išlaikant padėtį.

Kiekviena detalė sukurta patogiam naudojimui ir saugumo jausmui pooperaciniu laikotarpiu.
      `},
      { heading: "Kam skirtas OculaRest?", text: `
OculaRest skirtas pacientams po vitrektomijos su dujų injekcija, kai chirurgas paskiria konkrečią pooperacinę padėtį.

Jis taip pat gali būti naudingas tiems, kurie nori patogesnio sprendimo laikytis medicininių nurodymų atsigavimo metu.
      `},
      { heading: "Svarbu", text: `
OculaRest nepakeičia gydytojo konsultacijos.

Padėtis, trukmė ir nurodymai yra individualūs ir turi būti patvirtinti chirurgo ar medicinos komandos.
      `},
    ],
  },

  mt: {
    title: "Dwar OculaRest",
    subtitle: "Apparat iddisinjat biex jappoġġja r-rkupru wara vitrektomija b’injezzjoni ta’ gass",
    sections: [
      { heading: "Għaliex inħoloq OculaRest?", text: `
OculaRest inħoloq minn osservazzjoni sempliċi: wara vitrektomija b’injezzjoni ta’ gass, huwa essenzjali li tinżamm il-pożizzjoni ta’ wara l-operazzjoni.

Għal ħafna pazjenti, li żżomm din il-pożizzjoni għal diversi jiem jista’ jkun diffiċli. Skumdità, tensjoni fl-għonq u għeja jistgħu jagħmlu r-rkupru aktar impenjattiv.

OculaRest huwa ddisinjat biex jagħmilha aktar faċli li tinżamm il-pożizzjoni preskritta u biex itejjeb il-kumdità ta’ kuljum.
      `},
      { heading: "Għalxiex jintuża OculaRest waqt ir-rkupru?", text: `
OculaRest jgħin biex tinżamm aktar faċilment il-pożizzjoni rakkomandata mill-kirurgu u biex jappoġġja kundizzjonijiet tajbin ta’ rkupru.

Billi jnaqqas il-piż, jista’ jgħin biex tinżamm il-pożizzjoni meħtieġa għal iktar żmien b’inqas skumdità.

L-għan hu sempliċi: jgħin biex tibqa’ f’pożizzjoni korretta għal iktar żmien u f’kundizzjonijiet aħjar.
      `},
      { heading: "Kumdità u stabbiltà", text: `
OculaRest huwa maħsub għal appoġġ stabbli matul il-jum u l-lejl u għal pożizzjoni aktar konsistenti.

Jista’ jgħin inaqqas it-tensjoni fl-għonq u fl-ispallejn li spiss iseħħ meta tinżamm pożizzjoni għal żmien twil.

Kull dettall huwa ddisinjat biex ikun faċli biex jintuża u rassiguranti matul il-perjodu ta’ wara l-operazzjoni.
      `},
      { heading: "Għal min hu ddisinjat OculaRest?", text: `
OculaRest huwa ddisinjat għal pazjenti wara vitrektomija b’injezzjoni ta’ gass meta l-kirurgu jippreskrivi pożizzjoni partikolari.

Jista’ jkun utli wkoll għal min irid soluzzjoni aktar komda biex isegwi l-istruzzjonijiet mediċi waqt ir-rkupru.
      `},
      { heading: "Importanti", text: `
OculaRest ma jissostitwixxix parir mediku.

Il-pożizzjoni, it-tul u l-istruzzjonijiet jiddependu mill-każ tiegħek u għandhom jiġu kkonfermati mill-kirurgu jew mit-tim mediku.
      `},
    ],
  },

  ga: {
    title: "Maidir le OculaRest",
    subtitle:
      "An gléas a dearadh chun tacú le téarnamh tar éis vitrectomy le hinstealladh gáis",
    sections: [
      { heading: "Cén fáth ar cruthaíodh OculaRest?", text: `
Cruthaíodh OculaRest ó bhreathnóireacht shimplí: tar éis vitrectomy le hinstealladh gáis, tá sé ríthábhachtach an suíomh iar-oibríochta a choinneáil go docht.

Bíonn sé deacair do go leor othar an suíomh seo a choinneáil ar feadh roinnt laethanta. Is féidir míchompord, teannas muiníl agus tuirse an téarnamh a dhéanamh níos dúshlánaí.

Dearadh OculaRest chun cabhrú leis an suíomh forordaithe a choinneáil níos éasca agus chun compord laethúil a fheabhsú.
      `},
      { heading: "Cad chuige a úsáidtear OculaRest le linn an téarnaimh?", text: `
Cabhraíonn OculaRest leis an suíomh a mholann an máinlia a choinneáil níos éasca, ag tacú le coinníollacha maithe téarnaimh.

Trí ualach fisiciúil a laghdú, is féidir leis cabhrú an suíomh riachtanach a choinneáil níos faide le níos lú míchompord.

Is é an sprioc simplí: cabhrú leat fanacht i suíomh ceart ar feadh níos faide agus i gcoinníollacha níos fearr.
      `},
      { heading: "Compord agus cobhsaíocht", text: `
Tá OculaRest deartha le haghaidh tacaíochta cobhsaí, lá agus oíche, agus chun seasamh níos comhsheasmhaí a chur chun cinn.

Is féidir leis cabhrú le teannas sa mhuineál agus sna guaillí a laghdú a tharlaíonn go minic le suíomh leanúnach.

Tá gach mionsonra deartha le bheith éasca le húsáid agus suaimhneach le linn na tréimhse iar-oibríochta.
      `},
      { heading: "Cé dó a dearadh OculaRest?", text: `
Tá OculaRest beartaithe do dhaoine a ndearnadh vitrectomy le hinstealladh gáis orthu nuair a ordaíonn an máinlia suíomh iar-oibríochta ar leith.

Tá sé úsáideach freisin dóibh siúd atá ag lorg réiteach níos compordaí chun treoracha leighis a leanúint le linn téarnaimh.
      `},
      { heading: "Tábhachtach", text: `
Ní chuireann OculaRest comhairle leighis in ionad.

Braitheann an suíomh, an fad agus na treoracha ar do chás féin agus ní mór iad a dheimhniú leis an máinlia nó leis an bhfoireann leighis.
      `},
    ],
  },
};

/**
 * --- PAGE ABOUT ---
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = CONTENT[locale as Locale];
  if (!t) return notFound();

  return (
    <main className="about-page">
      <div className="about-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="about-content">
        {t.sections.map((section, index) => (
          <section key={index} className="about-section">
            <h2>{section.heading}</h2>
            {section.text
              .split("\n")
              .map((p, i) => (p.trim() ? <p key={i}>{p.trim()}</p> : null))}
          </section>
        ))}
      </div>
    </main>
  );
}
