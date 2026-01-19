import "./FinalCtaSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY: Record<Locale, {
  title: string;
  pBefore: string;
  pAfter: string;
  primary: string;
  secondary: string;
  orderHref: string;
  contactHref: string;
}> = {
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
  es: {
    title: "¿Listo para recibir apoyo durante tu convalecencia?",
    pBefore: "OculaRest",
    pAfter:
      "te ayuda a atravesar este período postoperatorio en las mejores condiciones posibles, combinando soporte postural, comodidad y tranquilidad.",
    primary: "Pedir OculaRest",
    secondary: "Contáctanos para recibir asesoramiento",
    orderHref: "/es/products",
    contactHref: "/es/contact",
  },
  de: {
    title: "Bereit, während Ihrer Genesung unterstützt zu werden?",
    pBefore: "OculaRest",
    pAfter:
      "hilft Ihnen, diese postoperative Phase unter den bestmöglichen Bedingungen zu durchlaufen und kombiniert Haltungsunterstützung, Komfort und Seelenfrieden.",
    primary: "OculaRest bestellen",
    secondary: "Kontaktieren Sie uns für Beratung",
    orderHref: "/de/products",
    contactHref: "/de/contact",
  },
  it: {
    title: "Pronto a essere supportato durante la tua convalescenza?",
    pBefore: "OculaRest",
    pAfter:
      "ti aiuta ad attraversare questo periodo post-operatorio nelle migliori condizioni possibili, combinando supporto posturale, comfort e serenità.",
    primary: "Ordina OculaRest",
    secondary: "Contattaci per ricevere consigli",
    orderHref: "/it/products",
    contactHref: "/it/contact",
  },
  nl: {
    title: "Klaar om ondersteund te worden tijdens je herstel?",
    pBefore: "OculaRest",
    pAfter:
      "helpt je door deze postoperatieve periode onder de best mogelijke omstandigheden—met houdingsondersteuning, comfort en gemoedsrust.",
    primary: "Bestel OculaRest",
    secondary: "Neem contact met ons op voor advies",
    orderHref: "/nl/products",
    contactHref: "/nl/contact",
  },
};

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