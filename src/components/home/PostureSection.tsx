import "./PostureSection.css";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const POSTURE_IMAGE_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/25934eca-f978-4cbf-dfe1-5ddf77c36100/public";

type Content = {
  alt: string;
  heading: string;
  eyebrow: string;
  intro: string;
  bulletsTitle: string;
  bullets: string[];
  caption: string;
};

const DATA: Record<Locale, Content> = {
  fr: {
    alt: "Position post-opératoire recommandée après vitrectomie",
    eyebrow: "Après l’intervention",
    heading: "Une posture clé pour protéger votre rétine",
    intro:
      "Après une vitrectomie avec injection de gaz, la position de votre tête n’est pas un détail : elle permet au gaz de rester en contact avec la zone traitée et favorise une bonne cicatrisation de la rétine.",
    bulletsTitle: "Concrètement, cette position aide à :",
    bullets: [
      "Maintenir la bulle de gaz exactement là où le chirurgien en a besoin.",
      "Réduire le risque de déplacement de la rétine ou de nouvelle intervention.",
      "Rendre les longues heures face contre la table un peu plus supportables avec un bon soutien."
    ],
    caption:
      "Position post-opératoire recommandée après vitrectomie avec injection de gaz.",
  },
  en: {
    alt: "Recommended post-operative position after vitrectomy",
    eyebrow: "After surgery",
    heading: "A key posture to protect your retina",
    intro:
      "After a vitrectomy with gas, how you position your head is critical: it helps the gas bubble stay in contact with the treated area and supports proper retinal healing.",
    bulletsTitle: "This position helps to:",
    bullets: [
      "Keep the gas bubble exactly where your surgeon needs it.",
      "Lower the risk of retinal displacement or repeat surgery.",
      "Make long face‑down hours more tolerable with proper support."
    ],
    caption:
      "Recommended post-operative position after vitrectomy with gas injection.",
  },
  es: {
    alt: "Posición postoperatoria recomendada después de vitrectomía",
    eyebrow: "Después de la intervención",
    heading: "Una postura clave para proteger la retina",
    intro:
      "Tras una vitrectomía con gas, la forma de colocar la cabeza es esencial para que la burbuja se mantenga sobre la zona tratada y la retina cicatrice correctamente.",
    bulletsTitle: "Esta posición ayuda a:",
    bullets: [
      "Mantener el gas justo donde el cirujano lo ha previsto.",
      "Reducir el riesgo de desplazamiento de la retina o nueva cirugía.",
      "Hacer más llevaderas las horas boca abajo con un apoyo adecuado."
    ],
    caption:
      "Posición postoperatoria recomendada después de vitrectomía con inyección de gas.",
  },
  de: {
    alt: "Empfohlene postoperative Position nach Vitrektomie",
    eyebrow: "Nach dem Eingriff",
    heading: "Eine entscheidende Haltung zum Schutz der Netzhaut",
    intro:
      "Nach einer Vitrektomie mit Gas ist die Kopfhaltung entscheidend: Sie sorgt dafür, dass die Gasblase die behandelte Stelle der Netzhaut optimal stützt.",
    bulletsTitle: "Diese Position hilft dabei:",
    bullets: [
      "Die Gasblase genau an der gewünschten Stelle zu halten.",
      "Das Risiko einer Netzhautverschiebung oder eines Zweiteingriffs zu verringern.",
      "Die langen Stunden in Bauch‑ oder Gesichtslage mit gutem Support erträglicher zu machen."
    ],
    caption:
      "Empfohlene postoperative Position nach Vitrektomie mit Gasinjektion.",
  },
  it: {
    alt: "Posizione post-operatoria raccomandata dopo vitrectomia",
    eyebrow: "Dopo l’intervento",
    heading: "Una postura chiave per proteggere la retina",
    intro:
      "Dopo una vitrectomia con gas, la posizione della testa è fondamentale per mantenere la bolla a contatto con l’area trattata e favorire una buona guarigione.",
    bulletsTitle: "Questa posizione aiuta a:",
    bullets: [
      "Mantenere il gas esattamente dove il chirurgo lo ha previsto.",
      "Ridurre il rischio di spostamento della retina o di un nuovo intervento.",
      "Rendere più sopportabili le ore a faccia in giù con un supporto adeguato."
    ],
    caption:
      "Posizione post-operatoria raccomandata dopo vitrectomia con iniezione di gas.",
  },
  nl: {
    alt: "Aanbevolen postoperatieve positie na vitrectomie",
    eyebrow: "Na de ingreep",
    heading: "Een belangrijke houding om het netvlies te beschermen",
    intro:
      "Na een vitrectomie met gas is uw houding cruciaal: zo blijft de gasbel tegen het behandelde gebied en krijgt het netvlies de kans om goed te herstellen.",
    bulletsTitle: "Deze houding helpt om:",
    bullets: [
      "De gasbel precies op de gewenste plaats te houden.",
      "Het risico op verschuiving van het netvlies of een tweede ingreep te verkleinen.",
      "De lange uren in buik- of gezichtshouding draaglijker te maken met goede steun."
    ],
    caption:
      "Aanbevolen postoperatieve positie na vitrectomie met gasinjectie.",
  },
};

export default function PostureSection({ locale }: Props) {
  const t = DATA[locale];

  return (
    <section className="posture">
      <div className="posture-inner">
        <div className="posture-text">
          <p className="posture-eyebrow">{t.eyebrow}</p>
          <h2 className="posture-title">{t.heading}</h2>
          <p className="posture-intro">{t.intro}</p>

          <h3 className="posture-subtitle">{t.bulletsTitle}</h3>
          <ul className="posture-list">
            {t.bullets.map((item, index) => (
              <li key={index} className="posture-list-item">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="posture-media">
          <Image
            src={POSTURE_IMAGE_URL}
            alt={t.alt}
            width={1600}
            height={900}
            className="posture-img"
            priority
          />
          <p className="posture-caption">{t.caption}</p>
        </div>
      </div>
    </section>
  );
}
