import "./WhyDifferentSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const TOP_MONTAGE_IMG =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/b4966255-a6dc-4fb9-4d9e-4934e8aaa400/public";

type Copy = {
  titleA: string;
  brand: string;
  titleB: string;
  intro: string;
  bullets: string[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    titleA: "Pourquoi",
    brand: "VitectroMed",
    titleB: "est différent des autres solutions",
    intro:
      "VitectroMed n’est pas un simple coussin de confort : c’est un dispositif dédié à la récupération après vitrectomie, pensé pour la position bulle et le maintien de la tête face contre la table.",
    bullets: [
      "Maintien fiable de la position post-opératoire recommandée par l’ophtalmologue.",
      "Soulagement des douleurs cervicales, des épaules et des tensions musculaires liées à la position face contre la table.",
      "Confort amélioré pour dormir, lire, manger ou utiliser un téléphone pendant toute la convalescence.",
      "Favorise une récupération dans de bonnes conditions, en aidant à mieux respecter la durée de la position bulle.",
      "Alternative durable à la location de matériel, réutilisable en cas de seconde intervention ou pour la détente.",
    ],
  },
  en: {
    titleA: "Why",
    brand: "VitectroMed",
    titleB: "is different from standard equipment",
    intro:
      "VitectroMed is more than a comfort pillow: it is a dedicated vitrectomy recovery device, designed for face‑down positioning and long hours of post‑operative support.",
    bullets: [
      "Reliable support for the prescribed post‑operative face‑down position after vitrectomy.",
      "Helps reduce neck, shoulder and muscular discomfort during retinal surgery recovery.",
      "Improved comfort while sleeping, reading, eating or using a phone throughout the recovery period.",
      "Supports recovery in better conditions by making it easier to follow the face‑down positioning instructions for longer.",
      "A durable alternative to short‑term rental equipment, that can be reused for a second eye or later for relaxation.",
    ],
  },
  es: {
    titleA: "Por qué",
    brand: "VitectroMed",
    titleB: "es diferente de otras soluciones",
    intro:
      "VitectroMed no es solo un cojín cómodo: es un dispositivo específico para la recuperación tras vitrectomía, diseñado para la posición boca abajo y el apoyo prolongado de la cabeza.",
    bullets: [
      "Soporte fiable para la posición postoperatoria prescrita después de una vitrectomía.",
      "Ayuda a reducir las molestias cervicales, de hombros y musculares durante la recuperación.",
      "Mayor comodidad para dormir, leer, comer o usar el móvil durante todo el período de convalecencia.",
      "Apoya la recuperación en mejores condiciones, facilitando el cumplimiento de la posición boca abajo durante más horas.",
      "Una alternativa duradera al alquiler de equipos, reutilizable en caso de segunda intervención o para momentos de relax.",
    ],
  },
  de: {
    titleA: "Warum",
    brand: "VitectroMed",
    titleB: "anders ist als herkömmliche Hilfsmittel",
    intro:
      "VitectroMed ist nicht nur ein bequemes Kissen, sondern ein spezielles Hilfsmittel für die Vitrektomie‑Nachsorge, entwickelt für die Bauchlage und die sogenannte Bubble‑Position.",
    bullets: [
      "Zuverlässige Unterstützung der vom Augenarzt vorgeschriebenen postoperativen Position nach einer Vitrektomie.",
      "Hilft, Nacken-, Schulter- und Muskelbeschwerden während der Genesungsphase zu reduzieren.",
      "Verbesserter Komfort beim Schlafen, Lesen, Essen oder bei der Nutzung von Smartphone und Tablet.",
      "Unterstützt die Genesung unter besseren Bedingungen, indem es erleichtert, die Bauchlage über längere Zeit einzuhalten.",
      "Eine dauerhafte Alternative zur Miete von Hilfsmitteln, die bei einer Zweitoperation oder zur Entspannung erneut genutzt werden kann.",
    ],
  },
  it: {
    titleA: "Perché",
    brand: "VitectroMed",
    titleB: "è diverso dagli altri supporti",
    intro:
      "VitectroMed non è un semplice cuscino morbido: è un dispositivo pensato per il post‑vitrectomia, progettato per la posizione a faccia in giù e per molte ore di utilizzo.",
    bullets: [
      "Supporto affidabile per la posizione post‑operatoria prescritta dopo una vitrectomia.",
      "Aiuta a ridurre i fastidi a collo, spalle e muscoli durante la fase di recupero.",
      "Maggiore comfort per dormire, leggere, mangiare o usare lo smartphone per tutta la durata della convalescenza.",
      "Supporta il recupero in condizioni migliori, rendendo più semplice rispettare la posizione a faccia in giù per il tempo necessario.",
      "Un’alternativa durevole al noleggio di attrezzature, riutilizzabile in caso di intervento sul secondo occhio o per momenti di relax.",
    ],
  },
  nl: {
    titleA: "Waarom",
    brand: "VitectroMed",
    titleB: "anders is dan standaard hulpmiddelen",
    intro:
      "VitectroMed is niet zomaar een kussen: het is een specifiek hulpmiddel voor herstel na vitrectomie, ontworpen voor de gezicht‑naar‑beneden houding en langdurige ondersteuning.",
    bullets: [
      "Betrouwbare ondersteuning voor de voorgeschreven postoperatieve houding na een vitrectomie.",
      "Helpt nek‑, schouder‑ en spierklachten te verminderen tijdens de herstelperiode.",
      "Verbeterd comfort bij slapen, lezen, eten of het gebruik van gsm en tablet tijdens de hele convalescentie.",
      "Ondersteunt herstel onder betere omstandigheden doordat de gezicht‑naar‑beneden houding langer vol te houden is.",
      "Een duurzaam alternatief voor huurmateriaal, opnieuw te gebruiken bij een tweede ingreep of als ontspanningskussen.",
    ],
  },
};

export default function WhyDifferentSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="why">
      <div className="why-inner">
        <Image
          src={TOP_MONTAGE_IMG}
          alt=""
          width={1200}
          height={260}
          className="why-top-img"
          priority
        />

        <header className="why-header">
          <h3 className="why-title">
            {t.titleA}{" "}
            <span className="why-brand">
              {t.brand}
              <Image
                src={MINI_LOGO}
                alt="VitectroMed"
                width={18}
                height={18}
                className="why-mini"
              />
            </span>{" "}
            {t.titleB}
          </h3>
          <p className="why-intro">{t.intro}</p>
        </header>

        <ul className="why-list">
          {t.bullets.map((b, i) => (
            <li key={i} className="why-item">
              <span className="why-icon" aria-hidden="true">
                ✓
              </span>
              <span className="why-text">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
