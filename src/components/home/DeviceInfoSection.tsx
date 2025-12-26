import "./DeviceInfoSection.css";
import Image from "next/image";

type Props = {
  locale: "fr" | "en";
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY = {
  fr: {
    h1: "Un dispositif pensé pour votre confort et votre sécurité",
    p1: "OculaRest est équipé d’une mousse à mémoire de forme et d’une housse en textile de bambou Oeko-Tex®, douce, respirante, antiallergique et antibactérienne.",
    p2: "Son design ergonomique permet une bonne ventilation du visage, l’utilisation avec des lunettes et un alignement optimal de la colonne vertébrale.",
    made: "Conçu et fabriqué en France 🇫🇷",
    h2a: "À qui s’adresse",
    brand: "OculaRest",
    h2b: " ?",
    bullets: [
      "Patients opérés d’un trou maculaire",
      "Patients opérés d’un décollement de la rétine",
      "Patients devant respecter une position bulle après vitrectomie",
      "Patients recherchant une solution confortable et durable",
    ],
  },
  en: {
    h1: "A device designed for your comfort and safety",
    p1: "OculaRest features memory foam and a bamboo Oeko-Tex® cover that is soft, breathable, hypoallergenic and antibacterial.",
    p2: "Its ergonomic design ensures good facial ventilation, allows use with glasses, and supports optimal spinal alignment.",
    made: "Designed & made in France 🇫🇷",
    h2a: "Who is",
    brand: "OculaRest",
    h2b: " for?",
    bullets: [
      "Patients after macular hole surgery",
      "Patients after retinal detachment surgery",
      "Patients who must follow a face-down position after vitrectomy",
      "Patients looking for a comfortable, durable solution",
    ],
  },
} as const;

export default function DeviceInfoSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="dev">
      <div className="dev-inner">
        <h3 className="dev-title">{t.h1}</h3>
        <p className="dev-p">{t.p1}</p>
        <p className="dev-p">{t.p2}</p>
        <div className="dev-made">{t.made}</div>

        <h3 className="dev-title2">
          {t.h2a}{" "}
          <span className="dev-brand">
            {t.brand}
            <Image
              src={MINI_LOGO}
              alt="OculaRest"
              width={18}
              height={18}
              className="dev-mini"
            />
          </span>
          {t.h2b}
        </h3>

        <ul className="dev-list">
          {t.bullets.map((b, i) => (
            <li key={i} className="dev-li">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
