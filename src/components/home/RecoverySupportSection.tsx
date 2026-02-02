// RecoverySupportSection.tsx
import "./RecoverySupportSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const TOP_MONTAGE_IMG =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/e509bc79-1a70-43f9-163e-daa46dc41d00/public";

type Copy = {
  eyebrow: string;
  title1: string;
  title2: string;
  title3: string;
  lead: string;
  blockTitle: string;
  blockIntro: string;
  listTitle: string;
  list: string[];
  noteTitle: string;
  noteText: string;
};

const COPY: Record<Locale, Copy> = {
  fr: {
    eyebrow: "Soutien post-opératoire",
    title1: "VitectroMed",
    title2: "vous accompagne",
    title3: "pendant toute votre convalescence",
    lead:
      "Après une vitrectomie, la récupération ne se joue pas uniquement au bloc opératoire. La façon dont vous vivez les jours qui suivent – posture, confort, capacité à tenir les consignes – a un impact direct sur la cicatrisation de la rétine et sur la qualité de votre vision à long terme.",
    blockTitle: "Un dispositif pensé pour la vraie vie des patients",
    blockIntro:
      "Rester de longues heures face contre la table n’est ni naturel ni simple. VitectroMed a été conçu en partant de cette réalité : douleurs cervicales, tension dans les épaules, difficulté à trouver une position pour dormir, lire, regarder un écran ou simplement discuter avec vos proches.",
    listTitle: "Concrètement, VitectroMed vous aide à :",
    list: [
      "Maintenir plus facilement la position prescrite par votre chirurgien sans écraser la nuque.",
      "Répartir les appuis entre la tête, le thorax et les bras pour limiter les douleurs musculaires et la fatigue.",
      "Installer rapidement un espace confortable sur une table, un bureau ou un lit, pour le jour comme pour la nuit.",
      "Rendre les consignes post-opératoires plus supportables, afin de mieux les respecter dans la durée.",
      "Continuer certaines activités du quotidien (lecture, téléphone, tablette) tout en restant dans la bonne position.",
    ],
    noteTitle: "Important",
    noteText:
      "VitectroMed complète le suivi médical sans jamais le remplacer. En cas de douleurs inhabituelles, gêne visuelle, malaise ou doute sur la position à adopter après votre vitrectomie, contactez immédiatement l’équipe qui vous a opéré ou le service d’urgences ophtalmologiques.",
  },
  en: {
    eyebrow: "Post‑operative support",
    title1: "VitectroMed",
    title2: "supports you",
    title3: "throughout your recovery",
    lead:
      "After vitrectomy, recovery does not stop in the operating room. The way you manage the following days – posture, comfort and ability to follow your ophthalmologist’s instructions – has a direct impact on how your retina heals and how well your vision recovers over time.",
    blockTitle: "Designed for real‑life patient needs",
    blockIntro:
      "Spending long hours in a face‑down position is neither natural nor easy. VitectroMed was designed with this reality in mind: neck strain, shoulder tension, back discomfort and the difficulty of finding a position to sleep, read, use a phone or simply talk to family.",
    listTitle: "In practice, VitectroMed helps you to:",
    list: [
      "Hold the prescribed face‑down position more easily without overloading your neck and shoulders.",
      "Distribute pressure between head, chest and arms to reduce muscle pain and fatigue during recovery.",
      "Quickly set up a comfortable area on a table, desk or bed for both daytime and night‑time use.",
      "Make post‑operative instructions more tolerable, so you can follow them consistently over several days or weeks.",
      "Keep a certain level of daily routine (reading, using a tablet or phone) while staying in the recommended position.",
    ],
    noteTitle: "Important",
    noteText:
      "VitectroMed complements medical follow‑up but never replaces it. If you notice unusual pain, visual changes, discomfort or if you are unsure about your positioning after surgery, contact your retinal surgeon or ophthalmology team immediately.",
  },
  es: {
    eyebrow: "Apoyo después de la operación",
    title1: "VitectroMed",
    title2: "le acompaña",
    title3: "durante toda la convalecencia",
    lead:
      "Después de una vitrectomía, la recuperación no termina en el quirófano. La manera en que vive los días siguientes – postura, comodidad y capacidad para seguir las recomendaciones – influye directamente en la cicatrización de la retina y en el resultado visual final.",
    blockTitle: "Un dispositivo pensado para la vida real del paciente",
    blockIntro:
      "Permanecer muchas horas boca abajo no es algo natural ni sencillo. VitectroMed se ha diseñado teniendo en cuenta esta realidad: dolor cervical, tensión en los hombros, molestia en la espalda y dificultad para encontrar una posición cómoda para dormir, leer o utilizar el teléfono.",
    listTitle: "En la práctica, VitectroMed le ayuda a:",
    list: [
      "Mantener con más facilidad la posición prescrita por su cirujano sin sobrecargar el cuello.",
      "Repartir los puntos de apoyo entre la cabeza, el tórax y los brazos para reducir el dolor muscular.",
      "Crear rápidamente un espacio cómodo sobre una mesa, escritorio o cama, tanto de día como de noche.",
      "Hacer más llevaderas las indicaciones postoperatorias, para poder seguirlas mejor durante varios días.",
      "Seguir realizando algunas actividades cotidianas (leer, usar el móvil o la tableta) respetando la posición recomendada.",
    ],
    noteTitle: "Importante",
    noteText:
      "VitectroMed complementa el seguimiento médico, pero nunca lo sustituye. Ante dolor inusual, cambios en la visión, malestar o dudas sobre la postura a adoptar tras la vitrectomía, contacte de inmediato con el equipo que le operó o con un servicio de urgencias oftalmológicas.",
  },
  de: {
    eyebrow: "Unterstützung nach der Operation",
    title1: "VitectroMed",
    title2: "begleitet Sie",
    title3: "während der gesamten Genesungszeit",
    lead:
      "Nach einer Vitrektomie findet die eigentliche Genesung zu Hause statt. Wie Sie die folgenden Tage gestalten – Haltung, Komfort und Fähigkeit, die ärztlichen Vorgaben einzuhalten – beeinflusst direkt die Heilung der Netzhaut und Ihr langfristiges Sehvermögen.",
    blockTitle: "Für den Alltag von Patientinnen und Patienten entwickelt",
    blockIntro:
      "Stundenlang in Bauchlage zu bleiben, ist weder natürlich noch einfach. VitectroMed wurde genau für diese Situation entwickelt: Nackenverspannungen, Schmerzen in Schultern und Rücken sowie die Schwierigkeit, eine Position zum Schlafen, Lesen oder für die Nutzung von Bildschirmgeräten zu finden.",
    listTitle: "Konkret hilft Ihnen VitectroMed dabei:",
    list: [
      "Die vom Operateur empfohlene Position leichter einzuhalten, ohne den Nacken zu überlasten.",
      "Die Druckbelastung zwischen Kopf, Brustkorb und Armen zu verteilen, um Muskel- und Gelenkschmerzen zu verringern.",
      "Schnell eine komfortable Liege- oder Stützfläche auf Tisch, Schreibtisch oder Bett einzurichten – tagsüber und nachts.",
      "Die postoperativen Anweisungen besser zu tolerieren und dadurch über mehrere Tage konsequenter einzuhalten.",
      "Alltägliche Aktivitäten wie Lesen oder die Nutzung von Tablet und Smartphone weiterzuführen, während Sie die richtige Haltung beibehalten.",
    ],
    noteTitle: "Wichtig",
    noteText:
      "VitectroMed ersetzt niemals die ärztliche Betreuung. Bei ungewöhnlichen Schmerzen, neuen Sehstörungen, Unwohlsein oder Unsicherheit bezüglich der empfohlenen Haltung wenden Sie sich umgehend an Ihre behandelnde Augenarztpraxis oder die augenärztliche Notaufnahme.",
  },
  it: {
    eyebrow: "Supporto post-operatorio",
    title1: "VitectroMed",
    title2: "la accompagna",
    title3: "durante tutta la fase di recupero",
    lead:
      "Dopo una vitrectomia, il successo dell’intervento dipende anche da come trascorre i giorni successivi. La postura, il comfort e la capacità di seguire le indicazioni del chirurgo influenzano direttamente la guarigione della retina e il risultato visivo finale.",
    blockTitle: "Un dispositivo pensato per la vita reale dei pazienti",
    blockIntro:
      "Restare molte ore a faccia in giù non è naturale né comodo. VitectroMed è stato progettato partendo da questa realtà: dolori al collo, tensioni alle spalle, affaticamento della schiena e difficoltà a trovare una posizione per dormire, leggere o usare il telefono.",
    listTitle: "In pratica, VitectroMed la aiuta a:",
    list: [
      "Mantenere più facilmente la posizione prescritta dallo specialista senza sovraccaricare la cervicale.",
      "Distribuire i punti di appoggio tra testa, torace e braccia per ridurre dolori muscolari e rigidità.",
      "Allestire in pochi istanti uno spazio confortevole su tavolo, scrivania o letto, di giorno e di notte.",
      "Rendere più sopportabili le indicazioni post-operatorie, così da seguirle meglio per tutta la durata raccomandata.",
      "Continuare alcune attività quotidiane (lettura, smartphone, tablet) restando nella posizione corretta.",
    ],
    noteTitle: "Importante",
    noteText:
      "VitectroMed integra il follow-up medico ma non lo sostituisce. In caso di dolori insoliti, disturbi visivi, malessere o dubbi sulla posizione da adottare dopo la vitrectomia, contatti subito il team che l’ha operata o un pronto soccorso oculistico.",
  },
  nl: {
    eyebrow: "Ondersteuning na de operatie",
    title1: "VitectroMed",
    title2: "helpt u",
    title3: "tijdens het hele herstel",
    lead:
      "Na een vitrectomie vindt een groot deel van het herstel thuis plaats. De manier waarop u de dagen erna doorbrengt – houding, comfort en het kunnen volgen van de adviezen – heeft een directe invloed op de genezing van het netvlies en op uw uiteindelijke zicht.",
    blockTitle: "Ontwikkeld voor de échte leefwereld van patiënten",
    blockIntro:
      "Urenlang in buikligging blijven is noch natuurlijk noch eenvoudig. VitectroMed is ontwikkeld met deze realiteit in gedachten: nekklachten, spanning in schouders en rug en de moeite om een houding te vinden om te slapen, lezen of op een scherm te kijken.",
    listTitle: "Concreet helpt VitectroMed u om:",
    list: [
      "De voorgeschreven houding makkelijker vol te houden zonder de nek te overbelasten.",
      "De druk te verdelen tussen hoofd, borst en armen om spierpijn en stijfheid te beperken.",
      "Snel een comfortabele plek in te richten op tafel, bureau of bed, zowel overdag als ’s nachts.",
      "De postoperatieve richtlijnen beter draaglijk te maken, zodat u ze consequenter kunt volgen.",
      "Toch enkele dagelijkse activiteiten (lezen, gsm, tablet) te blijven doen terwijl u in de juiste positie blijft.",
    ],
    noteTitle: "Belangrijk",
    noteText:
      "VitectroMed is een aanvulling op de medische opvolging en vervangt die nooit. Bij onverwachte pijn, veranderingen in het zicht, een onwel gevoel of twijfel over de juiste houding na de vitrectomie, neem meteen contact op met uw behandelend oogarts of de oogheelkundige spoed.",
  },
} as const;

export default function RecoverySupportSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="rs">
      <div className="rs-inner">
        <Image
          src={TOP_MONTAGE_IMG}
          alt=""
          width={1200}
          height={260}
          className="rs-top-img"
          priority
        />

        <header className="rs-header">
          <p className="rs-eyebrow">{t.eyebrow}</p>
          <h2 className="rs-title">
            <span className="rs-brand">
              {t.title1}
              <Image
                src={MINI_LOGO}
                alt="VitectroMed"
                width={20}
                height={20}
                className="rs-mini"
              />
            </span>{" "}
            {t.title2}
            <br />
            <span className="rs-accent">{t.title3}</span>
          </h2>
          <p className="rs-lead">{t.lead}</p>
        </header>

        <article className="rs-article">
          <h3 className="rs-block-title">{t.blockTitle}</h3>
          <p className="rs-block-intro">{t.blockIntro}</p>

          <h4 className="rs-list-title">{t.listTitle}</h4>
          <ul className="rs-list">
            {t.list.map((item, i) => (
              <li key={i} className="rs-list-item">
                {item}
              </li>
            ))}
          </ul>

          <aside className="rs-note">
            <p className="rs-note-title">{t.noteTitle}</p>
            <p className="rs-note-text">{t.noteText}</p>
          </aside>
        </article>
      </div>
    </section>
  );
}
