import "./FinalCtaSection.css";
import Image from "next/image";

type Props = {
  locale: "fr" | "en";
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY = {
  fr: {
    title: "Prêt à être accompagné pendant votre convalescence ?",
    pBefore: "OculaRest",
    pAfter:
      "vous aide à traverser cette période post-opératoire dans les meilleures conditions possibles, en alliant maintien postural, confort et sérénité.",
    primary: "Commander OculaRest",
    secondary: "Nous contacter pour être conseillé",
    orderHref: "/fr/products",
    contactHref: "/fr/contact",
  },
  en: {
    title: "Ready to be supported throughout your recovery?",
    pBefore: "OculaRest",
    pAfter:
      "helps you through this post-operative period in the best possible conditions—combining posture support, comfort, and peace of mind.",
    primary: "Order OculaRest",
    secondary: "Contact us for advice",
    orderHref: "/en/products",
    contactHref: "/en/contact",
  },
} as const;

export default function FinalCtaSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="fcta">
      <div className="fcta-inner">
        <h3 className="fcta-title">{t.title}</h3>

        <p className="fcta-text">
          <span className="fcta-brand">
            {t.pBefore}
            <Image
              src={MINI_LOGO}
              alt="OculaRest"
              width={18}
              height={18}
              className="fcta-mini"
            />
          </span>{" "}
          {t.pAfter}
        </p>

        <div className="fcta-actions">
          <a className="fcta-btn fcta-btn-outline" href={t.orderHref}>
            <span>{t.primary}</span>
            <Image
              src={MINI_LOGO}
              alt=""
              width={18}
              height={18}
              className="fcta-mini"
            />
          </a>

          <a className="fcta-btn fcta-btn-solid" href={t.contactHref}>
            {t.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
