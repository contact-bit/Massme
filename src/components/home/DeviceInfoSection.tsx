import "./DeviceInfoSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

type Copy = {
  h1: string;
  p1: string;
  p2: string;
  p3: string;
  made: string;
  h2a: string;
  brand: string;
  h2b: string;
  bulletsTitle: string;
  bullets: string[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    h1: "Un dispositif pensé pour votre confort et votre sécurité après vitrectomie",
    p1: "VitectroMed est équipé d'une mousse à mémoire de forme et d'une housse en textile de bambou Oeko‑Tex®, douce, respirante, antiallergique et antibactérienne, pour limiter les irritations pendant les longues heures en position bulle.",
    p2: "Son design ergonomique permet une bonne ventilation du visage, laisse passer l’air pour la bouche et le nez, accepte le port de lunettes et aide à garder un alignement naturel de la colonne vertébrale.",
    p3: "En pratique, cela signifie moins de points de pression sur le front et les pommettes, moins de tensions cervicales et une meilleure tolérance de la position face contre la table au fil des jours.",
    made: "Conçu et fabriqué en France 🇫🇷",
    h2a: "À qui s’adresse",
    brand: "VitectroMed",
    h2b: " ?",
    bulletsTitle: "VitectroMed est particulièrement adapté pour :",
    bullets: [
      "Les patients opérés d’un trou maculaire devant respecter une position bulle plusieurs jours.",
      "Les patients opérés d’un décollement de la rétine nécessitant une posture face contre la table.",
      "Les patients devant suivre une position face contre la table après vitrectomie avec bulle de gaz.",
      "Les personnes qui cherchent une solution confortable, durable et personnelle plutôt qu’une simple location de matériel.",
    ],
  },
  en: {
    h1: "A device designed for your comfort and safety during vitrectomy recovery",
    p1: "VitectroMed features memory foam and a bamboo Oeko‑Tex® cover that is soft, breathable, hypoallergenic and antibacterial, helping to protect sensitive skin during long face‑down sessions.",
    p2: "Its ergonomic design promotes good facial ventilation, keeps an open breathing area for nose and mouth, works with glasses and supports a more natural spinal alignment.",
    p3: "In practice, this means fewer pressure points on the forehead and cheeks, less neck strain and better tolerance of the face‑down position day after day.",
    made: "Designed & made in France 🇫🇷",
    h2a: "Who is",
    brand: "VitectroMed",
    h2b: " for?",
    bulletsTitle: "VitectroMed is especially suitable for:",
    bullets: [
      "Patients after macular hole surgery who must maintain a gas bubble position for several days.",
      "Patients after retinal detachment surgery who need a stable face‑down support at home.",
      "Patients who must follow a face‑down position after vitrectomy with a gas bubble in the eye.",
      "People looking for a comfortable, durable and personal solution instead of short‑term rental equipment.",
    ],
  },
  es: {
    h1: "Un dispositivo diseñado para tu comodidad y seguridad tras una vitrectomía",
    p1: "VitectroMed cuenta con espuma viscoelástica y una funda de bambú Oeko‑Tex® suave, transpirable, hipoalergénica y antibacteriana, pensada para la piel sensible durante la posición boca abajo.",
    p2: "Su diseño ergonómico garantiza una buena ventilación facial, deja espacio para respirar con la nariz y la boca, permite el uso con gafas y favorece una alineación natural de la columna vertebral.",
    p3: "En la práctica, esto se traduce en menos puntos de presión sobre la frente y las mejillas, menos molestias cervicales y una mejor tolerancia de la posición boca abajo con burbuja de gas.",
    made: "Diseñado y fabricado en Francia 🇫🇷",
    h2a: "¿Para quién es",
    brand: "VitectroMed",
    h2b: "?",
    bulletsTitle: "VitectroMed está especialmente indicado para:",
    bullets: [
      "Pacientes operados de agujero macular que deben mantener una posición con burbuja durante varios días.",
      "Pacientes operados de desprendimiento de retina que necesitan un apoyo estable en posición boca abajo.",
      "Pacientes que deben mantener una posición boca abajo después de una vitrectomía con burbuja de gas.",
      "Personas que buscan una solución cómoda y duradera en lugar de un simple alquiler de material.",
    ],
  },
  de: {
    h1: "Ein Gerät für Ihren Komfort und Ihre Sicherheit während der Vitrektomie‑Genesung",
    p1: "VitectroMed ist mit Memory‑Schaum und einem Bambus‑Oeko‑Tex®‑Bezug ausgestattet, der weich, atmungsaktiv, hypoallergen und antibakteriell ist – ideal für empfindliche Haut in der Bauchlage.",
    p2: "Das ergonomische Design sorgt für gute Gesichtsbelüftung, lässt ausreichend Raum zum Atmen, ermöglicht die Verwendung mit Brille und unterstützt eine natürliche Ausrichtung der Wirbelsäule.",
    p3: "In der Praxis bedeutet das weniger Druckstellen an Stirn und Wangen, weniger Nackenverspannungen und eine bessere Verträglichkeit der Bauchlage über mehrere Tage hinweg.",
    made: "Entwickelt und hergestellt in Frankreich 🇫🇷",
    h2a: "Für wen ist",
    brand: "VitectroMed",
    h2b: "?",
    bulletsTitle: "VitectroMed eignet sich besonders für:",
    bullets: [
      "Patienten nach Makulaloch‑Operation, die mehrere Tage eine Bubble‑Position einhalten müssen.",
      "Patienten nach Netzhautablösung mit der Auflage, zu Hause in Bauchlage zu bleiben.",
      "Patienten, die nach einer Vitrektomie mit Gasblase eine Gesicht‑nach‑unten‑Position einhalten müssen.",
      "Menschen, die eine komfortable, langlebige Alternative zur Miete von Hilfsmitteln suchen.",
    ],
  },
  it: {
    h1: "Un dispositivo pensato per il tuo comfort e la tua sicurezza nel post‑vitrectomia",
    p1: "VitectroMed è dotato di schiuma memory e di una fodera in bambù Oeko‑Tex® morbida, traspirante, ipoallergenica e antibatterica, ideale per le lunghe ore in posizione a faccia in giù.",
    p2: "Il suo design ergonomico garantisce una buona ventilazione del viso, lascia spazio per respirare, consente l’uso con gli occhiali e favorisce un allineamento naturale della colonna vertebrale.",
    p3: "In pratica significa meno punti di pressione su fronte e zigomi, meno tensioni cervicali e una maggiore tolleranza della posizione a faccia in giù giorno dopo giorno.",
    made: "Progettato e prodotto in Francia 🇫🇷",
    h2a: "Per chi è",
    brand: "VitectroMed",
    h2b: "?",
    bulletsTitle: "VitectroMed è particolarmente indicato per:",
    bullets: [
      "Pazienti operati di foro maculare che devono mantenere una posizione con bolla per diversi giorni.",
      "Pazienti operati di distacco di retina che necessitano di un supporto stabile in posizione prona.",
      "Pazienti che devono mantenere una posizione a faccia in giù dopo vitrectomia con bolla di gas.",
      "Chi cerca una soluzione confortevole e duratura, alternativa al solo noleggio di dispositivi.",
    ],
  },
  nl: {
    h1: "Een hulpmiddel ontworpen voor uw comfort en veiligheid na een vitrectomie",
    p1: "VitectroMed is uitgerust met geheugenschuim en een bamboe Oeko‑Tex® hoes die zacht, ademend, hypoallergeen en antibacterieel is, zodat de huid comfortabel blijft tijdens de gezicht‑naar‑beneden houding.",
    p2: "Het ergonomische ontwerp zorgt voor goede gezichtsventilatie, laat ruimte om te ademen, maakt gebruik met een bril mogelijk en ondersteunt een natuurlijke uitlijning van de wervelkolom.",
    p3: "In de praktijk betekent dit minder drukpunten op voorhoofd en jukbeenderen, minder nekklachten en een beter vol te houden buikligging gedurende meerdere dagen.",
    made: "Ontworpen en gemaakt in Frankrijk 🇫🇷",
    h2a: "Voor wie is",
    brand: "VitectroMed",
    h2b: "?",
    bulletsTitle: "VitectroMed is vooral geschikt voor:",
    bullets: [
      "Patiënten na maculagat‑operatie die enkele dagen een bubbelpositie moeten aanhouden.",
      "Patiënten na netvliesloslating die thuis een stabiele buikligging nodig hebben.",
      "Patiënten die na vitrectomie met gasbel een gezicht‑naar‑beneden houding moeten volgen.",
      "Mensen die een comfortabele, duurzame oplossing zoeken in plaats van enkel huurmateriaal.",
    ],
  },
};

export default function DeviceInfoSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="dev">
      <div className="dev-inner">
        <header className="dev-header">
          <h2 className="dev-title">{t.h1}</h2>
          <p className="dev-p">{t.p1}</p>
          <p className="dev-p">{t.p2}</p>
          <p className="dev-p dev-p-last">{t.p3}</p>
          <div className="dev-made">{t.made}</div>
        </header>

        <section className="dev-audience" aria-label={t.h2a + t.brand + t.h2b}>
          <h3 className="dev-title2">
            {t.h2a}{" "}
            <span className="dev-brand">
              {t.brand}
              <Image
                src={MINI_LOGO}
                alt="VitectroMed"
                width={18}
                height={18}
                className="dev-mini"
              />
            </span>
            {t.h2b}
          </h3>
          <p className="dev-bullets-title">{t.bulletsTitle}</p>
          <ul className="dev-list">
            {t.bullets.map((b, i) => (
              <li key={i} className="dev-li">
                {b}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
