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
    title: "À propos d’VitectroMed",
    subtitle:
      "Le dispositif conçu pour accompagner la convalescence après vitrectomie avec injection de gaz",
    sections: [
      {
        heading: "Pourquoi VitectroMed a été créé ?",
        text: `
VitectroMed est né d’un constat simple : après une vitrectomie avec injection de gaz, le respect strict de la position post-opératoire est essentiel.

Pour de nombreux patients, maintenir cette position pendant plusieurs jours (parfois davantage) est difficile. L’inconfort, les tensions cervicales et la fatigue rendent la convalescence plus éprouvante.

VitectroMed a été conçu pour faciliter le maintien de la position prescrite tout en améliorant le confort au quotidien.
        `,
      },
      {
        heading: "À quoi sert VitectroMed pendant la convalescence ?",
        text: `
VitectroMed aide à maintenir plus facilement la posture recommandée par le chirurgien afin d’optimiser les conditions de récupération.

En réduisant les contraintes liées à la position, il permet au patient de mieux tenir la durée nécessaire, avec moins de douleurs et moins de compensations musculaires.

L’objectif est simple : aider le patient à rester correctement positionné, plus longtemps, et dans de meilleures conditions.
        `,
      },
      {
        heading: "Confort et stabilité",
        text: `
VitectroMed a été pensé pour offrir un bon maintien, de jour comme de nuit, tout en favorisant une posture plus stable.

Il contribue à diminuer les tensions au niveau du cou et des épaules, souvent liées au maintien prolongé de la position.

Chaque élément a été conçu pour être simple à utiliser et rassurant pendant la période post-opératoire.
        `,
      },
      {
        heading: "Pour qui est conçu VitectroMed ?",
        text: `
VitectroMed s’adresse aux patients opérés d’une vitrectomie avec injection de gaz, lorsque le chirurgien prescrit une position post-opératoire.

Il est également utile pour les personnes qui souhaitent une solution plus confortable afin de respecter au mieux les recommandations médicales pendant la convalescence.
        `,
      },
      {
        heading: "Important",
        text: `
VitectroMed ne remplace pas un avis médical.

La position à respecter, la durée et les consignes dépendent de votre situation et doivent être validées par votre chirurgien ou votre équipe médicale.
        `,
      },
    ],
  },

  en: {
    title: "About VitectroMed",
    subtitle: "The device designed to support recovery after vitrectomy with gas injection",
    sections: [
      {
        heading: "Why was VitectroMed created?",
        text: `
VitectroMed was created from a simple observation: after a vitrectomy with gas injection, strictly maintaining the post-operative position is essential.

For many patients, holding this position for several days (sometimes longer) can be difficult. Discomfort, neck strain and fatigue can make recovery more challenging.

VitectroMed was designed to make it easier to maintain the prescribed position while improving everyday comfort.
        `,
      },
      {
        heading: "What is VitectroMed used for during recovery?",
        text: `
VitectroMed helps patients maintain the position recommended by their surgeon in order to support optimal recovery conditions.

By reducing the physical constraints associated with prolonged positioning, it can help patients keep the required posture longer, with less discomfort and fewer compensations.

The goal is simple: help patients stay correctly positioned for longer, in better conditions.
        `,
      },
      {
        heading: "Comfort and stability",
        text: `
VitectroMed is designed to provide stable support, day and night, while promoting a more consistent posture.

It can help reduce strain in the neck and shoulders, which often occurs when maintaining the recovery position.

Every detail is designed to be easy to use and reassuring throughout the post-operative period.
        `,
      },
      {
        heading: "Who is VitectroMed designed for?",
        text: `
VitectroMed is intended for patients who have undergone a vitrectomy with gas injection when a specific post-operative position is prescribed by the surgeon.

It is also helpful for anyone looking for a more comfortable solution to follow medical positioning instructions during recovery.
        `,
      },
      {
        heading: "Important",
        text: `
VitectroMed does not replace medical advice.

The position to follow, the duration and instructions depend on your individual case and must be confirmed by your surgeon or medical team.
        `,
      },
    ],
  },

  es: {
    title: "Acerca de VitectroMed",
    subtitle:
      "El dispositivo diseñado para apoyar la recuperación tras una vitrectomía con inyección de gas",
    sections: [
      {
        heading: "¿Por qué se creó VitectroMed?",
        text: `
VitectroMed nació de una observación sencilla: después de una vitrectomía con inyección de gas, mantener estrictamente la postura posoperatoria es esencial.

Para muchos pacientes, sostener esa posición durante varios días (a veces más) puede ser difícil. La incomodidad, la tensión cervical y el cansancio hacen que la recuperación sea más exigente.

VitectroMed se diseñó para facilitar el mantenimiento de la posición indicada y mejorar el confort diario.
        `,
      },
      {
        heading: "¿Para qué sirve VitectroMed durante la recuperación?",
        text: `
VitectroMed ayuda a mantener más fácilmente la postura recomendada por el cirujano para favorecer buenas condiciones de recuperación.

Al reducir las limitaciones asociadas a la postura, puede ayudar a sostenerla durante más tiempo con menos molestias.

El objetivo es sencillo: ayudar a permanecer bien posicionado, por más tiempo, en mejores condiciones.
        `,
      },
      {
        heading: "Comodidad y estabilidad",
        text: `
VitectroMed está pensado para aportar un apoyo estable, de día y de noche, y favorecer una postura más constante.

Puede ayudar a reducir la tensión en cuello y hombros, frecuente cuando se mantiene una posición durante mucho tiempo.

Cada detalle está diseñado para ser fácil de usar y tranquilizador durante el postoperatorio.
        `,
      },
      {
        heading: "¿Para quién está diseñado VitectroMed?",
        text: `
VitectroMed está destinado a pacientes operados de vitrectomía con inyección de gas cuando el cirujano prescribe una postura posoperatoria.

También es útil para quienes buscan una solución más cómoda para seguir las indicaciones médicas durante la recuperación.
        `,
      },
      {
        heading: "Importante",
        text: `
VitectroMed no sustituye el consejo médico.

La postura, la duración y las indicaciones dependen de cada caso y deben confirmarse con el cirujano o el equipo médico.
        `,
      },
    ],
  },

  de: {
    title: "Über VitectroMed",
    subtitle: "Das Gerät zur Unterstützung der Erholung nach einer Vitrektomie mit Gasinjektion",
    sections: [
      {
        heading: "Warum wurde VitectroMed entwickelt?",
        text: `
VitectroMed entstand aus einer einfachen Beobachtung: Nach einer Vitrektomie mit Gasinjektion ist es wichtig, die postoperative Lagerung konsequent einzuhalten.

Für viele Patientinnen und Patienten ist es schwierig, diese Position über mehrere Tage (manchmal länger) beizubehalten. Unbehagen, Nackenverspannungen und Müdigkeit können die Erholung erschweren.

VitectroMed wurde entwickelt, um die verordnete Position leichter einzuhalten und den Alltag komfortabler zu machen.
        `,
      },
      {
        heading: "Wozu dient VitectroMed während der Erholung?",
        text: `
VitectroMed hilft, die vom Operateur empfohlene Position leichter einzuhalten, um gute Erholungsbedingungen zu unterstützen.

Durch die Reduktion der Belastung kann es helfen, die erforderliche Haltung länger und mit weniger Beschwerden beizubehalten.

Das Ziel ist einfach: besser positioniert bleiben, länger, unter besseren Bedingungen.
        `,
      },
      {
        heading: "Komfort und Stabilität",
        text: `
VitectroMed ist auf stabilen Halt ausgelegt, tagsüber und nachts, und fördert eine gleichmäßigere Haltung.

Es kann helfen, Verspannungen in Nacken und Schultern zu reduzieren, die bei längerem Halten der Position häufig auftreten.

Alle Elemente sind so gestaltet, dass sie einfach zu nutzen und in der postoperativen Phase beruhigend sind.
        `,
      },
      {
        heading: "Für wen ist VitectroMed gedacht?",
        text: `
VitectroMed richtet sich an Patientinnen und Patienten nach einer Vitrektomie mit Gasinjektion, wenn eine spezielle postoperative Position verordnet wurde.

Es kann auch für Personen hilfreich sein, die eine komfortablere Lösung suchen, um medizinische Lagerungshinweise bestmöglich einzuhalten.
        `,
      },
      {
        heading: "Wichtig",
        text: `
VitectroMed ersetzt keine medizinische Beratung.

Position, Dauer und Anweisungen sind individuell und müssen mit dem Operateur oder dem medizinischen Team abgestimmt werden.
        `,
      },
    ],
  },

  it: {
    title: "Chi è VitectroMed",
    subtitle:
      "Il dispositivo progettato per supportare la convalescenza dopo vitrectomia con iniezione di gas",
    sections: [
      {
        heading: "Perché è stato creato VitectroMed?",
        text: `
VitectroMed nasce da un’osservazione semplice: dopo una vitrectomia con iniezione di gas, rispettare rigorosamente la posizione post-operatoria è fondamentale.

Per molti pazienti, mantenere questa posizione per diversi giorni (a volte più a lungo) è difficile. Disagio, tensioni cervicali e stanchezza possono rendere la convalescenza più impegnativa.

VitectroMed è stato progettato per facilitare il mantenimento della posizione prescritta e migliorare il comfort quotidiano.
        `,
      },
      {
        heading: "A cosa serve VitectroMed durante la convalescenza?",
        text: `
VitectroMed aiuta a mantenere più facilmente la postura consigliata dal chirurgo per favorire buone condizioni di recupero.

Riducendo i vincoli legati alla posizione, può aiutare a mantenerla più a lungo con meno fastidi.

L’obiettivo è semplice: aiutare il paziente a restare ben posizionato più a lungo, in condizioni migliori.
        `,
      },
      {
        heading: "Comfort e stabilità",
        text: `
VitectroMed è pensato per offrire supporto stabile, di giorno e di notte, favorendo una postura più costante.

Può contribuire a ridurre le tensioni su collo e spalle, spesso legate al mantenimento prolungato della posizione.

Ogni dettaglio è progettato per essere semplice da usare e rassicurante nel periodo post-operatorio.
        `,
      },
      {
        heading: "Per chi è progettato VitectroMed?",
        text: `
VitectroMed è destinato ai pazienti sottoposti a vitrectomia con iniezione di gas quando il chirurgo prescrive una specifica posizione post-operatoria.

È utile anche per chi desidera una soluzione più confortevole per seguire al meglio le indicazioni mediche durante la convalescenza.
        `,
      },
      {
        heading: "Importante",
        text: `
VitectroMed non sostituisce il parere medico.

Posizione, durata e indicazioni dipendono dal caso individuale e devono essere confermati dal chirurgo o dal team medico.
        `,
      },
    ],
  },

  pt: {
    title: "Sobre o VitectroMed",
    subtitle:
      "O dispositivo concebido para apoiar a recuperação após vitrectomia com injeção de gás",
    sections: [
      {
        heading: "Por que o VitectroMed foi criado?",
        text: `
O VitectroMed nasceu de uma observação simples: após uma vitrectomia com injeção de gás, manter rigorosamente a posição pós-operatória é essencial.

Para muitos pacientes, manter essa posição durante vários dias (por vezes mais) pode ser difícil. O desconforto, a tensão no pescoço e a fadiga podem tornar a recuperação mais exigente.

O VitectroMed foi concebido para facilitar a manutenção da posição prescrita e melhorar o conforto no dia a dia.
        `,
      },
      {
        heading: "Para que serve o VitectroMed durante a recuperação?",
        text: `
O VitectroMed ajuda a manter mais facilmente a postura recomendada pelo cirurgião, favorecendo boas condições de recuperação.

Ao reduzir as limitações associadas à postura, pode ajudar a mantê-la por mais tempo com menos desconforto.

O objetivo é simples: ajudar a permanecer corretamente posicionado por mais tempo, em melhores condições.
        `,
      },
      {
        heading: "Conforto e estabilidade",
        text: `
O VitectroMed foi pensado para oferecer apoio estável, de dia e de noite, promovendo uma postura mais consistente.

Pode ajudar a reduzir a tensão no pescoço e nos ombros, comum quando se mantém uma posição por muito tempo.

Cada detalhe foi desenhado para ser fácil de usar e tranquilizador durante o período pós-operatório.
        `,
      },
      {
        heading: "Para quem o VitectroMed é indicado?",
        text: `
O VitectroMed é destinado a pacientes submetidos a vitrectomia com injeção de gás quando o cirurgião prescreve uma posição pós-operatória.

Também é útil para quem procura uma solução mais confortável para seguir as orientações médicas durante a recuperação.
        `,
      },
      {
        heading: "Importante",
        text: `
O VitectroMed não substitui aconselhamento médico.

A posição, a duração e as instruções dependem do seu caso e devem ser confirmadas pelo cirurgião ou equipa médica.
        `,
      },
    ],
  },

  nl: {
    title: "Over VitectroMed",
    subtitle:
      "Het hulpmiddel dat herstel ondersteunt na een vitrectomie met gasinjectie",
    sections: [
      {
        heading: "Waarom is VitectroMed ontwikkeld?",
        text: `
VitectroMed is ontstaan vanuit een eenvoudige vaststelling: na een vitrectomie met gasinjectie is het strikt aanhouden van de postoperatieve houding essentieel.

Voor veel patiënten is het lastig om deze houding meerdere dagen (soms langer) vol te houden. Ongemak, nekspanning en vermoeidheid kunnen het herstel zwaarder maken.

VitectroMed is ontworpen om het makkelijker te maken de voorgeschreven houding aan te houden en het dagelijkse comfort te verbeteren.
        `,
      },
      {
        heading: "Waarvoor dient VitectroMed tijdens het herstel?",
        text: `
VitectroMed helpt om de door de chirurg aanbevolen houding eenvoudiger aan te houden en zo goede herstelomstandigheden te ondersteunen.

Door de fysieke belasting van langdurig positioneren te verminderen, kan het helpen de houding langer vol te houden met minder ongemak.

Het doel is eenvoudig: helpen om correct gepositioneerd te blijven, langer en in betere omstandigheden.
        `,
      },
      {
        heading: "Comfort en stabiliteit",
        text: `
VitectroMed is ontworpen voor stabiele ondersteuning, zowel overdag als ’s nachts, en bevordert een constantere houding.

Het kan helpen spanning in nek en schouders te verminderen, wat vaak voorkomt bij langdurig dezelfde houding.

Elk detail is ontworpen om eenvoudig te gebruiken en geruststellend te zijn in de postoperatieve periode.
        `,
      },
      {
        heading: "Voor wie is VitectroMed bedoeld?",
        text: `
VitectroMed is bedoeld voor patiënten die een vitrectomie met gasinjectie hebben ondergaan wanneer een specifieke postoperatieve houding is voorgeschreven.

Het is ook geschikt voor wie een comfortabelere oplossing zoekt om medische houdingsinstructies zo goed mogelijk op te volgen tijdens het herstel.
        `,
      },
      {
        heading: "Belangrijk",
        text: `
VitectroMed vervangt geen medisch advies.

De houding, duur en instructies zijn individueel en moeten worden bevestigd door de chirurg of het medisch team.
        `,
      },
    ],
  },

  pl: {
    title: "O VitectroMed",
    subtitle:
      "Urządzenie zaprojektowane, aby wspierać rekonwalescencję po witrektomii z podaniem gazu",
    sections: [
      {
        heading: "Dlaczego powstał VitectroMed?",
        text: `
VitectroMed powstał z prostej obserwacji: po witrektomii z podaniem gazu ścisłe utrzymywanie pozycji pooperacyjnej jest kluczowe.

Dla wielu pacjentów utrzymanie tej pozycji przez kilka dni (czasem dłużej) bywa trudne. Dyskomfort, napięcie karku i zmęczenie mogą utrudniać rekonwalescencję.

VitectroMed zaprojektowano, aby ułatwić utrzymanie zaleconej pozycji i poprawić codzienny komfort.
        `,
      },
      {
        heading: "Do czego służy VitectroMed w trakcie rekonwalescencji?",
        text: `
VitectroMed pomaga łatwiej utrzymać pozycję zalecaną przez chirurga, wspierając dobre warunki powrotu do zdrowia.

Zmniejszając obciążenia związane z pozycjonowaniem, może pomóc dłużej utrzymać wymaganą postawę przy mniejszym dyskomforcie.

Cel jest prosty: pomóc pozostać prawidłowo ułożonym dłużej i w lepszych warunkach.
        `,
      },
      {
        heading: "Komfort i stabilność",
        text: `
VitectroMed zaprojektowano tak, aby zapewniał stabilne podparcie w dzień i w nocy oraz sprzyjał bardziej stałej postawie.

Może pomóc zmniejszyć napięcie szyi i barków, często związane z długotrwałym utrzymywaniem pozycji.

Każdy element jest prosty w użyciu i ma dawać poczucie bezpieczeństwa w okresie pooperacyjnym.
        `,
      },
      {
        heading: "Dla kogo jest VitectroMed?",
        text: `
VitectroMed jest przeznaczony dla pacjentów po witrektomii z podaniem gazu, gdy chirurg zaleca określoną pozycję pooperacyjną.

Jest też pomocny dla osób, które szukają wygodniejszego rozwiązania, aby jak najlepiej przestrzegać zaleceń medycznych podczas rekonwalescencji.
        `,
      },
      {
        heading: "Ważne",
        text: `
VitectroMed nie zastępuje porady lekarskiej.

Pozycja, czas trwania i zalecenia zależą od indywidualnej sytuacji i muszą zostać potwierdzone przez chirurga lub zespół medyczny.
        `,
      },
    ],
  },

  // --- Nordics / others (courts mais complets) ---
  sv: {
    title: "Om VitectroMed",
    subtitle: "Enheten som stödjer återhämtning efter vitrektomi med gasinjektion",
    sections: [
      { heading: "Varför skapades VitectroMed?", text: `
VitectroMed skapades utifrån en enkel insikt: efter vitrektomi med gasinjektion är det avgörande att följa den postoperativa positionen.

För många patienter är det svårt att hålla positionen i flera dagar. Obehag, nackspänningar och trötthet kan göra återhämtningen tuffare.

VitectroMed är utformat för att underlätta den ordinerade positionen och förbättra komforten i vardagen.
      `},
      { heading: "Vad används VitectroMed till under återhämtning?", text: `
VitectroMed hjälper till att enklare hålla den position som kirurgen rekommenderar för att stödja goda återhämtningsförhållanden.

Genom att minska belastningen kan det hjälpa att hålla positionen längre med mindre obehag.

Målet är enkelt: hjälpa dig att vara korrekt positionerad längre och under bättre förutsättningar.
      `},
      { heading: "Komfort och stabilitet", text: `
VitectroMed är utformat för stabilt stöd både dag och natt och för en mer konsekvent hållning.

Det kan hjälpa till att minska spänningar i nacke och axlar som ofta uppstår vid långvarig positionering.

Varje detalj är designad för att vara enkel att använda och trygg under den postoperativa perioden.
      `},
      { heading: "Vem är VitectroMed för?", text: `
VitectroMed är avsett för patienter som genomgått vitrektomi med gasinjektion när en specifik postoperativ position har ordinerats.

Det kan också vara användbart för den som vill ha en mer bekväm lösning för att följa medicinska instruktioner under återhämtning.
      `},
      { heading: "Viktigt", text: `
VitectroMed ersätter inte medicinsk rådgivning.

Position, varaktighet och instruktioner är individuella och ska bekräftas av kirurg eller vårdteam.
      `},
    ],
  },

  da: {
    title: "Om VitectroMed",
    subtitle: "Enheden der støtter restitution efter vitrektomi med gasinjektion",
    sections: [
      { heading: "Hvorfor blev VitectroMed skabt?", text: `
VitectroMed blev skabt ud fra en enkel observation: efter vitrektomi med gasinjektion er det vigtigt at overholde den postoperative stilling.

For mange patienter er det svært at holde stillingen i flere dage. Ubehag, nakkespændinger og træthed kan gøre forløbet mere krævende.

VitectroMed er designet til at gøre det nemmere at holde den ordinerede position og forbedre komforten i hverdagen.
      `},
      { heading: "Hvad bruges VitectroMed til under restitution?", text: `
VitectroMed hjælper med lettere at holde den position, som kirurgen anbefaler, for at støtte gode restitutionsbetingelser.

Ved at reducere belastningen kan det hjælpe med at holde stillingen længere med mindre ubehag.

Målet er enkelt: hjælpe med at forblive korrekt positioneret længere og under bedre forhold.
      `},
      { heading: "Komfort og stabilitet", text: `
VitectroMed er udformet til stabil støtte dag og nat og til en mere ensartet holdning.

Det kan hjælpe med at reducere spændinger i nakke og skuldre, som ofte opstår ved længere tids positionering.

Hver detalje er designet til at være enkel at bruge og tryg i den postoperative periode.
      `},
      { heading: "Hvem er VitectroMed til?", text: `
VitectroMed er til patienter efter vitrektomi med gasinjektion, når kirurgen har ordineret en bestemt postoperativ position.

Det kan også være nyttigt for dem, der ønsker en mere komfortabel løsning til at følge medicinske instruktioner under restitution.
      `},
      { heading: "Vigtigt", text: `
VitectroMed erstatter ikke lægelig rådgivning.

Position, varighed og instruktioner er individuelle og skal bekræftes af kirurg eller sundhedsteam.
      `},
    ],
  },

  no: {
    title: "Om VitectroMed",
    subtitle: "Enheten som støtter restitusjon etter vitrektomi med gassinjeksjon",
    sections: [
      { heading: "Hvorfor ble VitectroMed laget?", text: `
VitectroMed ble laget ut fra en enkel observasjon: etter vitrektomi med gassinjeksjon er det avgjørende å følge den postoperative posisjonen.

For mange pasienter er det vanskelig å holde posisjonen i flere dager. Ubehag, nakkespenninger og tretthet kan gjøre restitusjonen mer krevende.

VitectroMed er utviklet for å gjøre det enklere å holde foreskrevet posisjon og bedre komforten i hverdagen.
      `},
      { heading: "Hva brukes VitectroMed til under restitusjon?", text: `
VitectroMed hjelper med å holde posisjonen kirurgen anbefaler, for å støtte gode forhold for bedring.

Ved å redusere belastningen kan det hjelpe å holde posisjonen lenger med mindre ubehag.

Målet er enkelt: hjelpe deg å være korrekt posisjonert lenger og under bedre forhold.
      `},
      { heading: "Komfort og stabilitet", text: `
VitectroMed er utformet for stabil støtte, dag og natt, og en mer konsekvent holdning.

Det kan bidra til å redusere spenninger i nakke og skuldre som ofte oppstår ved langvarig posisjonering.

Hver detalj er laget for å være enkel å bruke og trygg i den postoperative perioden.
      `},
      { heading: "Hvem er VitectroMed for?", text: `
VitectroMed er for pasienter etter vitrektomi med gassinjeksjon når en spesifikk postoperativ posisjon er foreskrevet.

Det kan også være nyttig for de som ønsker en mer komfortabel løsning for å følge medisinske instrukser under restitusjon.
      `},
      { heading: "Viktig", text: `
VitectroMed erstatter ikke medisinsk rådgivning.

Posisjon, varighet og instrukser er individuelle og må bekreftes av kirurg eller behandlingsteam.
      `},
    ],
  },

  fi: {
    title: "Tietoa VitectroMedista",
    subtitle: "Laite, joka tukee toipumista vitrektomian ja kaasuinjektion jälkeen",
    sections: [
      { heading: "Miksi VitectroMed kehitettiin?", text: `
VitectroMed kehitettiin yksinkertaisesta havainnosta: vitrektomian ja kaasuinjektion jälkeen leikkauksen jälkeisen asennon noudattaminen on tärkeää.

Monille potilaille asennon ylläpito useiden päivien ajan on vaikeaa. Epämukavuus, niskajännitys ja väsymys voivat tehdä toipumisesta raskaampaa.

VitectroMed on suunniteltu helpottamaan määrätyn asennon ylläpitoa ja parantamaan arjen mukavuutta.
      `},
      { heading: "Mihin VitectroMedia käytetään toipumisen aikana?", text: `
VitectroMed auttaa ylläpitämään kirurgin suosittelemaa asentoa ja tukee hyviä toipumisolosuhteita.

Kuormitusta vähentämällä se voi auttaa pitämään asennon pidempään pienemmällä epämukavuudella.

Tavoite on yksinkertainen: auttaa pysymään oikein asennossa pidempään ja paremmissa olosuhteissa.
      `},
      { heading: "Mukavuus ja vakaus", text: `
VitectroMed tarjoaa vakaata tukea päivällä ja yöllä ja edistää tasaisempaa asentoa.

Se voi auttaa vähentämään niskan ja hartioiden rasitusta, joka on yleistä pitkäkestoisessa asennossa.

Jokainen yksityiskohta on suunniteltu helppokäyttöiseksi ja rauhoittavaksi leikkauksen jälkeisenä aikana.
      `},
      { heading: "Kenelle VitectroMed on tarkoitettu?", text: `
VitectroMed on tarkoitettu potilaille vitrektomian ja kaasuinjektion jälkeen, kun kirurgi määrää tietyn leikkauksen jälkeisen asennon.

Se voi olla hyödyllinen myös niille, jotka haluavat mukavamman ratkaisun lääketieteellisten ohjeiden noudattamiseen toipumisen aikana.
      `},
      { heading: "Tärkeää", text: `
VitectroMed ei korvaa lääketieteellistä neuvontaa.

Asento, kesto ja ohjeet ovat yksilöllisiä ja ne tulee varmistaa kirurgilta tai hoitotiimiltä.
      `},
    ],
  },

  // --- Central/East Europe (versions complètes mais compactes) ---
  cs: {
    title: "O VitectroMed",
    subtitle: "Zařízení navržené pro podporu rekonvalescence po vitrektomii s aplikací plynu",
    sections: [
      { heading: "Proč byl VitectroMed vytvořen?", text: `
VitectroMed vznikl z jednoduchého zjištění: po vitrektomii s aplikací plynu je zásadní důsledně dodržovat pooperační polohu.

Pro mnoho pacientů je obtížné tuto polohu udržet několik dní. Nepohodlí, napětí v šíji a únava mohou rekonvalescenci ztížit.

VitectroMed je navržen tak, aby usnadnil udržení předepsané polohy a zlepšil každodenní komfort.
      `},
      { heading: "K čemu VitectroMed slouží během rekonvalescence?", text: `
VitectroMed pomáhá snáze udržet polohu doporučenou chirurgem a podpořit tak vhodné podmínky pro zotavení.

Snížením zátěže spojené s dlouhodobým polohováním může pomoci vydržet déle s menším nepohodlím.

Cíl je jednoduchý: pomoci zůstat správně polohovaný déle a v lepších podmínkách.
      `},
      { heading: "Komfort a stabilita", text: `
VitectroMed je navržen pro stabilní oporu ve dne i v noci a pro konzistentnější držení těla.

Může pomoci snížit napětí v oblasti krku a ramen, které se často objevuje při dlouhodobém udržování polohy.

Každý detail je navržen tak, aby byl snadno použitelný a uklidňující v pooperačním období.
      `},
      { heading: "Pro koho je VitectroMed určen?", text: `
VitectroMed je určen pro pacienty po vitrektomii s aplikací plynu, pokud chirurg předepsal specifickou pooperační polohu.

Je užitečný i pro ty, kteří hledají pohodlnější řešení pro dodržení lékařských pokynů během rekonvalescence.
      `},
      { heading: "Důležité", text: `
VitectroMed nenahrazuje lékařské doporučení.

Poloha, délka trvání a pokyny jsou individuální a musí je potvrdit chirurg nebo zdravotnický tým.
      `},
    ],
  },

  hu: {
    title: "Az VitectroMedsről",
    subtitle: "Eszköz a gázinjekcióval végzett vitrektómia utáni felépülés támogatására",
    sections: [
      { heading: "Miért készült az VitectroMed?", text: `
Az VitectroMed egy egyszerű megfigyelésből született: gázinjekcióval végzett vitrektómia után kulcsfontosságú a posztoperatív testhelyzet szigorú betartása.

Sok beteg számára nehéz több napon át megtartani ezt a pozíciót. A kellemetlenség, nyaki feszülés és fáradtság megnehezítheti a felépülést.

Az VitectroMed célja, hogy megkönnyítse az előírt testhelyzet fenntartását és javítsa a mindennapi komfortot.
      `},
      { heading: "Mire szolgál az VitectroMed a felépülés alatt?", text: `
Az VitectroMed segít könnyebben megtartani a sebész által javasolt testhelyzetet, támogatva a megfelelő gyógyulási feltételeket.

A terhelés csökkentésével segíthet hosszabb ideig megtartani a szükséges pozíciót kevesebb kellemetlenséggel.

A cél egyszerű: helyesen pozicionált állapot fenntartása hosszabb ideig, jobb körülmények között.
      `},
      { heading: "Kényelem és stabilitás", text: `
Az VitectroMed stabil támaszt nyújt nappal és éjjel, és következetesebb testtartást támogat.

Segíthet csökkenteni a nyak és váll feszülését, ami gyakori a hosszan tartó pozíció esetén.

Minden részlet könnyű használatra és a posztoperatív időszak megnyugtató támogatására készült.
      `},
      { heading: "Kinek készült az VitectroMed?", text: `
Az VitectroMed azoknak a betegeknek készült, akik gázinjekcióval végzett vitrektómián estek át, és a sebész speciális posztoperatív testhelyzetet írt elő.

Hasznos lehet mindenkinek, aki kényelmesebb megoldást keres az orvosi utasítások betartásához a felépülés alatt.
      `},
      { heading: "Fontos", text: `
Az VitectroMed nem helyettesíti az orvosi tanácsot.

A testhelyzet, az időtartam és az utasítások egyéniek, és a sebésznek vagy az egészségügyi csapatnak kell megerősítenie.
      `},
    ],
  },

  ro: {
    title: "Despre VitectroMed",
    subtitle: "Dispozitivul conceput pentru a sprijini recuperarea după vitrectomie cu injecție de gaz",
    sections: [
      { heading: "De ce a fost creat VitectroMed?", text: `
VitectroMed a pornit de la o observație simplă: după vitrectomie cu injecție de gaz, menținerea strictă a poziției postoperatorii este esențială.

Pentru mulți pacienți, menținerea acestei poziții timp de mai multe zile poate fi dificilă. Disconfortul, tensiunea cervicală și oboseala pot îngreuna recuperarea.

VitectroMed a fost conceput pentru a facilita menținerea poziției prescrise și pentru a îmbunătăți confortul zilnic.
      `},
      { heading: "La ce folosește VitectroMed în timpul recuperării?", text: `
VitectroMed ajută la menținerea mai ușoară a poziției recomandate de chirurg, sprijinind condiții bune de recuperare.

Prin reducerea constrângerilor, poate ajuta la menținerea posturii necesare mai mult timp, cu mai puțin disconfort.

Scopul este simplu: să te ajute să rămâi corect poziționat mai mult timp, în condiții mai bune.
      `},
      { heading: "Confort și stabilitate", text: `
VitectroMed este proiectat pentru sprijin stabil zi și noapte, favorizând o postură mai constantă.

Poate ajuta la reducerea tensiunii din zona gâtului și a umerilor, frecventă în poziționarea prelungită.

Fiecare detaliu este conceput pentru utilizare ușoară și pentru a oferi siguranță în perioada postoperatorie.
      `},
      { heading: "Pentru cine este VitectroMed?", text: `
VitectroMed este destinat pacienților operați de vitrectomie cu injecție de gaz atunci când chirurgul recomandă o poziție postoperatorie.

Este util și pentru cei care doresc o soluție mai confortabilă pentru a respecta recomandările medicale în timpul recuperării.
      `},
      { heading: "Important", text: `
VitectroMed nu înlocuiește sfatul medical.

Poziția, durata și instrucțiunile depind de situația ta și trebuie confirmate de chirurg sau echipa medicală.
      `},
    ],
  },

  bg: {
    title: "За VitectroMed",
    subtitle: "Устройство, създадено да подпомага възстановяването след витректомия с газова инжекция",
    sections: [
      { heading: "Защо е създаден VitectroMed?", text: `
VitectroMed е създаден на базата на проста идея: след витректомия с газова инжекция е важно стриктно да се спазва следоперативната позиция.

За много пациенти е трудно да задържат тази позиция няколко дни. Дискомфортът, напрежението във врата и умората могат да направят възстановяването по-тежко.

VitectroMed е проектиран да улесни поддържането на предписаната позиция и да подобри ежедневния комфорт.
      `},
      { heading: "За какво служи VitectroMed по време на възстановяване?", text: `
VitectroMed помага по-лесно да се поддържа препоръчаната от хирурга позиция и да се подпомогнат условията за възстановяване.

Като намалява натоварването, може да помогне позицията да се задържи по-дълго с по-малко дискомфорт.

Целта е проста: да помогне да останете правилно позиционирани по-дълго и при по-добри условия.
      `},
      { heading: "Комфорт и стабилност", text: `
VitectroMed е създаден за стабилна опора денем и нощем и за по-постоянна стойка.

Може да помогне за намаляване на напрежението във врата и раменете при продължително задържане на позиция.

Всеки детайл е проектиран да е лесен за употреба и успокояващ през следоперативния период.
      `},
      { heading: "За кого е предназначен VitectroMed?", text: `
VitectroMed е предназначен за пациенти след витректомия с газова инжекция, когато хирургът е предписал следоперативна позиция.

Полезен е и за хора, които търсят по-удобно решение, за да следват медицинските указания по време на възстановяване.
      `},
      { heading: "Важно", text: `
VitectroMed не замества медицински съвет.

Позицията, продължителността и указанията са индивидуални и трябва да бъдат потвърдени от хирурга или медицинския екип.
      `},
    ],
  },

  el: {
    title: "Σχετικά με το VitectroMed",
    subtitle: "Η συσκευή που υποστηρίζει την ανάρρωση μετά από υαλοειδεκτομή με έγχυση αερίου",
    sections: [
      { heading: "Γιατί δημιουργήθηκε το VitectroMed;", text: `
Το VitectroMed δημιουργήθηκε από μια απλή παρατήρηση: μετά από υαλοειδεκτομή με έγχυση αερίου, η αυστηρή τήρηση της μετεγχειρητικής θέσης είναι απαραίτητη.

Για πολλούς ασθενείς, η διατήρηση αυτής της θέσης για αρκετές ημέρες είναι δύσκολη. Η δυσφορία, η καταπόνηση του αυχένα και η κόπωση μπορεί να κάνουν την ανάρρωση πιο απαιτητική.

Το VitectroMed σχεδιάστηκε για να διευκολύνει τη διατήρηση της συνιστώμενης θέσης και να βελτιώσει την καθημερινή άνεση.
      `},
      { heading: "Σε τι χρησιμεύει το VitectroMed κατά την ανάρρωση;", text: `
Το VitectroMed βοηθά στην ευκολότερη διατήρηση της θέσης που συστήνει ο χειρουργός, υποστηρίζοντας καλύτερες συνθήκες ανάρρωσης.

Μειώνοντας την καταπόνηση, μπορεί να βοηθήσει να διατηρείται η απαιτούμενη στάση για περισσότερο χρόνο με λιγότερη δυσφορία.

Στόχος είναι απλός: να βοηθήσει να παραμείνετε σωστά τοποθετημένοι για περισσότερο, σε καλύτερες συνθήκες.
      `},
      { heading: "Άνεση και σταθερότητα", text: `
Το VitectroMed έχει σχεδιαστεί για σταθερή υποστήριξη μέρα και νύχτα και για πιο σταθερή στάση.

Μπορεί να βοηθήσει στη μείωση της καταπόνησης σε αυχένα και ώμους που συχνά εμφανίζεται με παρατεταμένη θέση.

Κάθε λεπτομέρεια είναι σχεδιασμένη για εύκολη χρήση και αίσθημα ασφάλειας στη μετεγχειρητική περίοδο.
      `},
      { heading: "Για ποιον είναι το VitectroMed;", text: `
Το VitectroMed απευθύνεται σε ασθενείς που υποβλήθηκαν σε υαλοειδεκτομή με έγχυση αερίου όταν έχει δοθεί συγκεκριμένη μετεγχειρητική οδηγία θέσης.

Είναι επίσης χρήσιμο για όσους θέλουν μια πιο άνετη λύση ώστε να ακολουθούν τις ιατρικές οδηγίες κατά την ανάρρωση.
      `},
      { heading: "Σημαντικό", text: `
Το VitectroMed δεν αντικαθιστά ιατρική συμβουλή.

Η θέση, η διάρκεια και οι οδηγίες εξαρτώνται από την περίπτωσή σας και πρέπει να επιβεβαιωθούν από τον χειρουργό ή την ιατρική ομάδα.
      `},
    ],
  },

  // --- plus petits pays / versions courtes mais pro ---
  sk: {
    title: "O VitectroMed",
    subtitle: "Zariadenie navrhnuté na podporu rekonvalescencie po vitrektómii s aplikáciou plynu",
    sections: [
      { heading: "Prečo vznikol VitectroMed?", text: `
VitectroMed vznikol z jednoduchého poznatku: po vitrektómii s aplikáciou plynu je dôležité dôsledne dodržiavať pooperačnú polohu.

Pre mnohých pacientov je náročné udržať túto polohu niekoľko dní. Nepohodlie, napätie šije a únava môžu zotavenie sťažiť.

VitectroMed je navrhnutý tak, aby uľahčil udržiavanie predpísanej polohy a zlepšil každodenný komfort.
      `},
      { heading: "Na čo slúži VitectroMed počas rekonvalescencie?", text: `
VitectroMed pomáha ľahšie udržať polohu odporúčanú chirurgom a podporiť tak vhodné podmienky na zotavenie.

Znížením záťaže môže pomôcť udržať potrebnú polohu dlhšie s menším nepohodlím.

Cieľ je jednoduchý: pomôcť zostať správne polohovaný dlhšie a v lepších podmienkach.
      `},
      { heading: "Pohodlie a stabilita", text: `
VitectroMed poskytuje stabilnú oporu vo dne aj v noci a podporuje konzistentnejšie držanie tela.

Môže pomôcť znížiť napätie v oblasti krku a ramien pri dlhodobom udržiavaní polohy.

Detaily sú navrhnuté tak, aby boli jednoduché na použitie a upokojujúce v pooperačnom období.
      `},
      { heading: "Pre koho je VitectroMed určený?", text: `
VitectroMed je určený pre pacientov po vitrektómii s aplikáciou plynu, ak chirurg predpísal špecifickú pooperačnú polohu.

Je užitočný aj pre tých, ktorí chcú pohodlnejšie riešenie na dodržiavanie lekárskych pokynov počas rekonvalescencie.
      `},
      { heading: "Dôležité", text: `
VitectroMed nenahrádza lekárske odporúčanie.

Poloha, trvanie a pokyny sú individuálne a musia byť potvrdené chirurgom alebo zdravotníckym tímom.
      `},
    ],
  },

  sl: {
    title: "O VitectroMed",
    subtitle: "Naprava za podporo okrevanja po vitrektomiji z injekcijo plina",
    sections: [
      { heading: "Zakaj je bil VitectroMed ustvarjen?", text: `
VitectroMed je nastal iz preprostega spoznanja: po vitrektomiji z injekcijo plina je ključnega pomena dosledno upoštevati pooperativni položaj.

Za mnoge paciente je težko ohranjati ta položaj več dni. Neudobje, napetost v vratu in utrujenost lahko otežijo okrevanje.

VitectroMed je zasnovan, da olajša vzdrževanje predpisanega položaja in izboljša vsakodnevno udobje.
      `},
      { heading: "Za kaj se VitectroMed uporablja med okrevanjem?", text: `
VitectroMed pomaga lažje ohranjati položaj, ki ga priporoči kirurg, in tako podpira dobre pogoje za okrevanje.

Z zmanjšanjem obremenitev lahko pomaga ohranjati zahtevano držo dlje časa z manj neugodja.

Cilj je preprost: pomagati ostati pravilno nameščen dlje časa in v boljših pogojih.
      `},
      { heading: "Udobje in stabilnost", text: `
VitectroMed je zasnovan za stabilno oporo podnevi in ponoči ter bolj dosledno držo.

Lahko pomaga zmanjšati napetost v vratu in ramenih, ki se pogosto pojavi pri dolgotrajnem položaju.

Vsaka podrobnost je zasnovana za enostavno uporabo in občutek varnosti v pooperativnem obdobju.
      `},
      { heading: "Komu je VitectroMed namenjen?", text: `
VitectroMed je namenjen pacientom po vitrektomiji z injekcijo plina, ko je predpisan specifičen pooperativni položaj.

Uporaben je tudi za tiste, ki želijo udobnejšo rešitev za upoštevanje medicinskih navodil med okrevanjem.
      `},
      { heading: "Pomembno", text: `
VitectroMed ne nadomešča zdravniškega nasveta.

Položaj, trajanje in navodila so individualni in jih mora potrditi kirurg ali zdravstvena ekipa.
      `},
    ],
  },

  hr: {
    title: "O VitectroMedu",
    subtitle: "Uređaj osmišljen za potporu oporavku nakon vitrektomije s injekcijom plina",
    sections: [
      { heading: "Zašto je VitectroMed napravljen?", text: `
VitectroMed je nastao iz jednostavne spoznaje: nakon vitrektomije s injekcijom plina važno je strogo poštivati postoperativni položaj.

Mnogim pacijentima je teško zadržati taj položaj nekoliko dana. Nelagoda, napetost u vratu i umor mogu otežati oporavak.

VitectroMed je dizajniran kako bi olakšao održavanje propisanog položaja i poboljšao svakodnevnu udobnost.
      `},
      { heading: "Čemu služi VitectroMed tijekom oporavka?", text: `
VitectroMed pomaže lakše održavati položaj koji preporuči kirurg, podržavajući povoljne uvjete oporavka.

Smanjenjem opterećenja može pomoći zadržati potrebnu posturu dulje uz manje nelagode.

Cilj je jednostavan: pomoći ostati pravilno pozicioniran dulje i u boljim uvjetima.
      `},
      { heading: "Udobnost i stabilnost", text: `
VitectroMed je osmišljen za stabilnu potporu danju i noću te za dosljedniji položaj.

Može pomoći smanjiti napetost u vratu i ramenima kod dugotrajnog položaja.

Svaki detalj je dizajniran za jednostavno korištenje i osjećaj sigurnosti u postoperativnom razdoblju.
      `},
      { heading: "Kome je VitectroMed namijenjen?", text: `
VitectroMed je namijenjen pacijentima nakon vitrektomije s injekcijom plina kada je propisan specifičan postoperativni položaj.

Koristan je i za one koji žele udobnije rješenje kako bi se što bolje pridržavali medicinskih uputa tijekom oporavka.
      `},
      { heading: "Važno", text: `
VitectroMed ne zamjenjuje liječnički savjet.

Položaj, trajanje i upute ovise o individualnom slučaju i moraju se potvrditi s kirurgom ili medicinskim timom.
      `},
    ],
  },

  et: {
    title: "VitectroMedist",
    subtitle: "Seade, mis toetab taastumist pärast vitrektoomiat koos gaasi süstimisega",
    sections: [
      { heading: "Miks VitectroMed loodi?", text: `
VitectroMed loodi lihtsast tähelepanekust: pärast vitrektoomiat koos gaasi süstimisega on oluline järgida rangelt operatsioonijärgset asendit.

Paljudel patsientidel on raske seda asendit hoida mitu päeva. Ebamugavus, kaelapinged ja väsimus võivad taastumist raskendada.

VitectroMed on loodud selleks, et aidata hoida ettenähtud asendit lihtsamalt ja parandada igapäevast mugavust.
      `},
      { heading: "Milleks VitectroMedi kasutatakse taastumise ajal?", text: `
VitectroMed aitab kergemini hoida kirurgi soovitatud asendit, toetades häid taastumistingimusi.

Koormuse vähendamisega võib see aidata hoida vajalikku asendit kauem väiksema ebamugavusega.

Eesmärk on lihtne: aidata püsida õigesti positsioneerituna kauem ja paremates tingimustes.
      `},
      { heading: "Mugavus ja stabiilsus", text: `
VitectroMed on loodud stabiilseks toeks päeval ja öösel ning ühtlasema kehahoiaku soodustamiseks.

See võib aidata vähendada kaela ja õlgade pinget, mis tekib sageli pikaajalise asendi hoidmisel.

Iga detail on mõeldud lihtsaks kasutamiseks ja rahustavaks toeks operatsioonijärgsel perioodil.
      `},
      { heading: "Kellele VitectroMed on mõeldud?", text: `
VitectroMed on mõeldud patsientidele pärast vitrektoomiat koos gaasi süstimisega, kui kirurg määrab kindla operatsioonijärgse asendi.

See võib olla kasulik ka neile, kes soovivad mugavamat lahendust meditsiiniliste juhiste järgimiseks taastumise ajal.
      `},
      { heading: "Oluline", text: `
VitectroMed ei asenda meditsiinilist nõu.

Asend, kestus ja juhised on individuaalsed ning need peab kinnitama kirurg või ravimeeskond.
      `},
    ],
  },

  lv: {
    title: "Par VitectroMed",
    subtitle: "Ierīce, kas palīdz atveseļoties pēc vitrektomijas ar gāzes injekciju",
    sections: [
      { heading: "Kāpēc tika izveidots VitectroMed?", text: `
VitectroMed radās no vienkārša novērojuma: pēc vitrektomijas ar gāzes injekciju ir svarīgi stingri ievērot pēcoperācijas pozīciju.

Daudziem pacientiem ir grūti šo pozīciju noturēt vairākas dienas. Diskomforts, kakla sasprindzinājums un nogurums var apgrūtināt atveseļošanos.

VitectroMed ir izstrādāts, lai atvieglotu noteiktās pozīcijas uzturēšanu un uzlabotu ikdienas komfortu.
      `},
      { heading: "Kam VitectroMed tiek izmantots atveseļošanās laikā?", text: `
VitectroMed palīdz vieglāk noturēt ķirurga ieteikto pozīciju, atbalstot labus atveseļošanās apstākļus.

Samazinot slodzi, tas var palīdzēt ilgāk noturēt nepieciešamo pozīciju ar mazāku diskomfortu.

Mērķis ir vienkāršs: palīdzēt palikt pareizi pozicionētam ilgāk un labākos apstākļos.
      `},
      { heading: "Komforts un stabilitāte", text: `
VitectroMed ir paredzēts stabilam atbalstam dienā un naktī un konsekventākai stājai.

Tas var palīdzēt mazināt kakla un plecu sasprindzinājumu, kas bieži rodas ilgstošas pozīcijas dēļ.

Katrs elements ir izstrādāts vieglai lietošanai un drošības sajūtai pēcoperācijas periodā.
      `},
      { heading: "Kam ir paredzēts VitectroMed?", text: `
VitectroMed ir paredzēts pacientiem pēc vitrektomijas ar gāzes injekciju, ja ķirurgs ir noteicis specifisku pēcoperācijas pozīciju.

Tas var noderēt arī tiem, kas vēlas ērtāku risinājumu medicīnisko norādījumu ievērošanai atveseļošanās laikā.
      `},
      { heading: "Svarīgi", text: `
VitectroMed neaizstāj medicīnisku konsultāciju.

Pozīcija, ilgums un norādījumi ir individuāli un jāapstiprina ķirurgam vai medicīnas komandai.
      `},
    ],
  },

  lt: {
    title: "Apie VitectroMed",
    subtitle: "Prietaisas, skirtas padėti atsigauti po vitrektomijos su dujų injekcija",
    sections: [
      { heading: "Kodėl buvo sukurtas VitectroMed?", text: `
VitectroMed sukurtas remiantis paprastu pastebėjimu: po vitrektomijos su dujų injekcija svarbu griežtai laikytis pooperacinės padėties.

Daugeliui pacientų sunku išlaikyti šią padėtį kelias dienas. Diskomfortas, kaklo įtampa ir nuovargis gali apsunkinti atsigavimą.

VitectroMed sukurtas tam, kad būtų lengviau išlaikyti paskirtą padėtį ir pagerinti kasdienį komfortą.
      `},
      { heading: "Kam naudojamas VitectroMed atsigavimo metu?", text: `
VitectroMed padeda lengviau išlaikyti chirurgo rekomenduojamą padėtį ir sudaryti geresnes atsigavimo sąlygas.

Mažindamas apkrovą, jis gali padėti ilgiau išlaikyti reikalingą padėtį su mažesniu diskomfortu.

Tikslas paprastas: padėti išlikti teisingoje padėtyje ilgiau ir geresnėmis sąlygomis.
      `},
      { heading: "Komfortas ir stabilumas", text: `
VitectroMed sukurtas stabiliai atramai dieną ir naktį bei nuoseklesnei laikysenai.

Jis gali padėti sumažinti kaklo ir pečių įtampą, kuri dažnai atsiranda ilgai išlaikant padėtį.

Kiekviena detalė sukurta patogiam naudojimui ir saugumo jausmui pooperaciniu laikotarpiu.
      `},
      { heading: "Kam skirtas VitectroMed?", text: `
VitectroMed skirtas pacientams po vitrektomijos su dujų injekcija, kai chirurgas paskiria konkrečią pooperacinę padėtį.

Jis taip pat gali būti naudingas tiems, kurie nori patogesnio sprendimo laikytis medicininių nurodymų atsigavimo metu.
      `},
      { heading: "Svarbu", text: `
VitectroMed nepakeičia gydytojo konsultacijos.

Padėtis, trukmė ir nurodymai yra individualūs ir turi būti patvirtinti chirurgo ar medicinos komandos.
      `},
    ],
  },

  mt: {
    title: "Dwar VitectroMed",
    subtitle: "Apparat iddisinjat biex jappoġġja r-rkupru wara vitrektomija b’injezzjoni ta’ gass",
    sections: [
      { heading: "Għaliex inħoloq VitectroMed?", text: `
VitectroMed inħoloq minn osservazzjoni sempliċi: wara vitrektomija b’injezzjoni ta’ gass, huwa essenzjali li tinżamm il-pożizzjoni ta’ wara l-operazzjoni.

Għal ħafna pazjenti, li żżomm din il-pożizzjoni għal diversi jiem jista’ jkun diffiċli. Skumdità, tensjoni fl-għonq u għeja jistgħu jagħmlu r-rkupru aktar impenjattiv.

VitectroMed huwa ddisinjat biex jagħmilha aktar faċli li tinżamm il-pożizzjoni preskritta u biex itejjeb il-kumdità ta’ kuljum.
      `},
      { heading: "Għalxiex jintuża VitectroMed waqt ir-rkupru?", text: `
VitectroMed jgħin biex tinżamm aktar faċilment il-pożizzjoni rakkomandata mill-kirurgu u biex jappoġġja kundizzjonijiet tajbin ta’ rkupru.

Billi jnaqqas il-piż, jista’ jgħin biex tinżamm il-pożizzjoni meħtieġa għal iktar żmien b’inqas skumdità.

L-għan hu sempliċi: jgħin biex tibqa’ f’pożizzjoni korretta għal iktar żmien u f’kundizzjonijiet aħjar.
      `},
      { heading: "Kumdità u stabbiltà", text: `
VitectroMed huwa maħsub għal appoġġ stabbli matul il-jum u l-lejl u għal pożizzjoni aktar konsistenti.

Jista’ jgħin inaqqas it-tensjoni fl-għonq u fl-ispallejn li spiss iseħħ meta tinżamm pożizzjoni għal żmien twil.

Kull dettall huwa ddisinjat biex ikun faċli biex jintuża u rassiguranti matul il-perjodu ta’ wara l-operazzjoni.
      `},
      { heading: "Għal min hu ddisinjat VitectroMed?", text: `
VitectroMed huwa ddisinjat għal pazjenti wara vitrektomija b’injezzjoni ta’ gass meta l-kirurgu jippreskrivi pożizzjoni partikolari.

Jista’ jkun utli wkoll għal min irid soluzzjoni aktar komda biex isegwi l-istruzzjonijiet mediċi waqt ir-rkupru.
      `},
      { heading: "Importanti", text: `
VitectroMed ma jissostitwixxix parir mediku.

Il-pożizzjoni, it-tul u l-istruzzjonijiet jiddependu mill-każ tiegħek u għandhom jiġu kkonfermati mill-kirurgu jew mit-tim mediku.
      `},
    ],
  },

  ga: {
    title: "Maidir le VitectroMed",
    subtitle:
      "An gléas a dearadh chun tacú le téarnamh tar éis vitrectomy le hinstealladh gáis",
    sections: [
      { heading: "Cén fáth ar cruthaíodh VitectroMed?", text: `
Cruthaíodh VitectroMed ó bhreathnóireacht shimplí: tar éis vitrectomy le hinstealladh gáis, tá sé ríthábhachtach an suíomh iar-oibríochta a choinneáil go docht.

Bíonn sé deacair do go leor othar an suíomh seo a choinneáil ar feadh roinnt laethanta. Is féidir míchompord, teannas muiníl agus tuirse an téarnamh a dhéanamh níos dúshlánaí.

Dearadh VitectroMed chun cabhrú leis an suíomh forordaithe a choinneáil níos éasca agus chun compord laethúil a fheabhsú.
      `},
      { heading: "Cad chuige a úsáidtear VitectroMed le linn an téarnaimh?", text: `
Cabhraíonn VitectroMed leis an suíomh a mholann an máinlia a choinneáil níos éasca, ag tacú le coinníollacha maithe téarnaimh.

Trí ualach fisiciúil a laghdú, is féidir leis cabhrú an suíomh riachtanach a choinneáil níos faide le níos lú míchompord.

Is é an sprioc simplí: cabhrú leat fanacht i suíomh ceart ar feadh níos faide agus i gcoinníollacha níos fearr.
      `},
      { heading: "Compord agus cobhsaíocht", text: `
Tá VitectroMed deartha le haghaidh tacaíochta cobhsaí, lá agus oíche, agus chun seasamh níos comhsheasmhaí a chur chun cinn.

Is féidir leis cabhrú le teannas sa mhuineál agus sna guaillí a laghdú a tharlaíonn go minic le suíomh leanúnach.

Tá gach mionsonra deartha le bheith éasca le húsáid agus suaimhneach le linn na tréimhse iar-oibríochta.
      `},
      { heading: "Cé dó a dearadh VitectroMed?", text: `
Tá VitectroMed beartaithe do dhaoine a ndearnadh vitrectomy le hinstealladh gáis orthu nuair a ordaíonn an máinlia suíomh iar-oibríochta ar leith.

Tá sé úsáideach freisin dóibh siúd atá ag lorg réiteach níos compordaí chun treoracha leighis a leanúint le linn téarnaimh.
      `},
      { heading: "Tábhachtach", text: `
Ní chuireann VitectroMed comhairle leighis in ionad.

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
