import "./FinalCtaSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const MINI_LOGO =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2c995c35-dbef-45d8-a0b2-70075a919800/public";

const COPY: Record<
  Locale,
  {
    title: string;
    pBefore: string;
    pAfter: string;
    primary: string;
    secondary: string;
    orderHref: string;
    contactHref: string;
  }
> = {
  fr: {
    title: "Prêt à organiser votre récupération après vitrectomie ?",
    pBefore: "VitectroMed",
    pAfter:
      "vous aide à traverser cette période post‑opératoire dans les meilleures conditions possibles, en combinant maintien postural, confort et sérénité à domicile.",
    primary: "Commander VitectroMed",
    secondary: "Parler à un conseiller",
    orderHref: "/fr/products",
    contactHref: "/fr/contact",
  },
  en: {
    title: "Ready to plan your vitrectomy recovery at home?",
    pBefore: "VitectroMed",
    pAfter:
      "helps you go through this post‑operative period in the best possible conditions—combining posture support, comfort and peace of mind during face‑down recovery.",
    primary: "Order VitectroMed",
    secondary: "Talk to a specialist",
    orderHref: "/en/products",
    contactHref: "/en/contact",
  },
  es: {
    title: "¿Listo para organizar tu recuperación tras vitrectomía?",
    pBefore: "VitectroMed",
    pAfter:
      "te ayuda a vivir este periodo postoperatorio en las mejores condiciones posibles, combinando soporte postural, comodidad y tranquilidad en casa.",
    primary: "Pedir VitectroMed",
    secondary: "Hablar con un especialista",
    orderHref: "/es/products",
    contactHref: "/es/contact",
  },
  de: {
    title: "Bereit, Ihre Vitrektomie‑Genesung zu Hause zu planen?",
    pBefore: "VitectroMed",
    pAfter:
      "unterstützt Sie in der postoperativen Phase, indem es Haltungsstabilität, Komfort und mehr Gelassenheit während der Bauchlage vereint.",
    primary: "VitectroMed bestellen",
    secondary: "Beratung anfordern",
    orderHref: "/de/products",
    contactHref: "/de/contact",
  },
  it: {
    title: "Pronto a organizzare il recupero dopo vitrectomia?",
    pBefore: "VitectroMed",
    pAfter:
      "ti aiuta ad affrontare questo periodo post‑operatorio nelle migliori condizioni possibili, unendo supporto posturale, comfort e serenità a casa.",
    primary: "Ordina VitectroMed",
    secondary: "Parla con un esperto",
    orderHref: "/it/products",
    contactHref: "/it/contact",
  },
  nl: {
    title: "Klaar om uw vitrectomie‑herstel thuis te organiseren?",
    pBefore: "VitectroMed",
    pAfter:
      "helpt u deze postoperatieve periode zo goed mogelijk door te komen, met houdingsondersteuning, comfort en extra gemoedsrust tijdens de buikligging.",
    primary: "Bestel VitectroMed",
    secondary: "Advies vragen",
    orderHref: "/nl/products",
    contactHref: "/nl/contact",
  },
};

export default function FinalCtaSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="fcta">
      <div className="fcta-inner">
        <h2 className="fcta-title">{t.title}</h2>

        <p className="fcta-text">
          <span className="fcta-brand">
            {t.pBefore}
            <Image
              src={MINI_LOGO}
              alt="VitectroMed"
              width={18}
              height={18}
              className="fcta-mini"
            />
          </span>{" "}
          {t.pAfter}
        </p>

        <div className="fcta-actions">
          <a className="fcta-btn fcta-btn-primary" href={t.orderHref}>
            <span>{t.primary}</span>
            <Image
              src={MINI_LOGO}
              alt=""
              width={18}
              height={18}
              className="fcta-mini"
            />
          </a>

          <a className="fcta-btn fcta-btn-secondary" href={t.contactHref}>
            {t.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
