import "./WhyDifferentSection.css";
import Image from "next/image";

type Props = {
  locale: "fr" | "en";
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const TOP_MONTAGE_IMG =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/b4966255-a6dc-4fb9-4d9e-4934e8aaa400/public";

const COPY = {
  fr: {
    titleA: "Pourquoi",
    brand: "OculaRest",
    titleB: "est différent",
    bullets: [
      "Maintien fiable de la position post-opératoire",
      "Soulagement des douleurs cervicales et musculaires",
      "Meilleur confort pendant toute la durée de la convalescence",
      "Favorise une récupération dans de bonnes conditions",
      "Alternative durable à la location de matériel",
    ],
  },
  en: {
    titleA: "Why",
    brand: "OculaRest",
    titleB: "is different",
    bullets: [
      "Reliable support for the prescribed post-op position",
      "Helps reduce neck and muscular discomfort",
      "Improved comfort throughout the recovery period",
      "Supports recovery in better conditions",
      "A durable alternative to renting equipment",
    ],
  },
} as const;

export default function WhyDifferentSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="why">
      <div className="why-inner">
        {/* Montage top */}
        <Image
          src={TOP_MONTAGE_IMG}
          alt=""
          width={1200}
          height={260}
          className="why-top-img"
        />

        {/* Title */}
        <h3 className="why-title">
          {t.titleA}{" "}
          <span className="why-brand">
            {t.brand}
            <Image
              src={MINI_LOGO}
              alt="OculaRest"
              width={18}
              height={18}
              className="why-mini"
            />
          </span>{" "}
          {t.titleB}
        </h3>

        {/* Bullets */}
        <ul className="why-list">
          {t.bullets.map((b, i) => (
            <li key={i} className="why-item">
              <span className="why-check" aria-hidden="true">
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
