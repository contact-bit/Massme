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

const EYE_IMG =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/09b2eaac-25e1-4b88-52b6-7f209695d300/public";

const COPY: Record<Locale, {
  title1: string;
  title2: string;
  title3: string;
  p1: string;
  p2: string;
  eyeAlt: string;
}> = {
  fr: {
    title1: "OculaRest",
    title2: "vous accompagne",
    title3: "pendant toute votre convalescence",
    p1: "OculaRest a été conçu pour répondre précisément aux contraintes de la convalescence après vitrectomie.",
    p2: "Il permet de maintenir la position prescrite par votre chirurgien tout en améliorant votre confort, de jour comme de nuit.",
    eyeAlt: "Illustration œil",
  },
  en: {
    title1: "OculaRest",
    title2: "supports you",
    title3: "throughout your recovery",
    p1: "OculaRest was designed to meet the specific constraints of recovery after vitrectomy.",
    p2: "It helps maintain the position prescribed by your surgeon while improving comfort, day and night.",
    eyeAlt: "Eye illustration",
  },
  es: {
    title1: "OculaRest",
    title2: "te acompaña",
    title3: "durante toda tu convalecencia",
    p1: "OculaRest fue diseñado para cumplir con las restricciones específicas de la recuperación después de vitrectomía.",
    p2: "Ayuda a mantener la posición prescrita por su cirujano mientras mejora la comodidad, día y noche.",
    eyeAlt: "Ilustración de ojo",
  },
  de: {
    title1: "OculaRest",
    title2: "begleitet Sie",
    title3: "während Ihrer gesamten Genesung",
    p1: "OculaRest wurde entwickelt, um den spezifischen Anforderungen der Genesung nach einer Vitrektomie gerecht zu werden.",
    p2: "Es hilft, die von Ihrem Chirurgen vorgeschriebene Position beizubehalten und gleichzeitig den Komfort Tag und Nacht zu verbessern.",
    eyeAlt: "Augenillustration",
  },
  it: {
    title1: "OculaRest",
    title2: "ti accompagna",
    title3: "durante tutta la tua convalescenza",
    p1: "OculaRest è stato progettato per soddisfare i vincoli specifici della convalescenza dopo vitrectomia.",
    p2: "Aiuta a mantenere la posizione prescritta dal chirurgo migliorando al contempo il comfort, giorno e notte.",
    eyeAlt: "Illustrazione dell'occhio",
  },
  nl: {
    title1: "OculaRest",
    title2: "ondersteunt u",
    title3: "tijdens uw gehele herstel",
    p1: "OculaRest is ontworpen om te voldoen aan de specifieke beperkingen van herstel na vitrectomie.",
    p2: "Het helpt de door uw chirurg voorgeschreven positie te behouden en verbetert tegelijkertijd het comfort, dag en nacht.",
    eyeAlt: "Oogillustratie",
  },
};

export default function RecoverySupportSection({ locale }: Props) {
  const t = COPY[locale];

  return (
    <section className="rs">
      <div className="rs-inner">
        {/* Image montage du dessus */}
        <Image
          src={TOP_MONTAGE_IMG}
          alt=""
          width={1200}
          height={260}
          className="rs-top-img"
          priority
        />

        {/* Titre (au-dessus) */}
        <h2 className="rs-title">
          <span className="rs-brand">
            {t.title1}
            <Image
              src={MINI_LOGO}
              alt="OculaRest"
              width={20}
              height={20}
              className="rs-mini"
            />
          </span>{" "}
          {t.title2}
          <br />
          <span className="rs-accent">{t.title3}</span>
        </h2>

        {/* IMAGE + PARAGRAPHES PAR-DESSUS */}
        <div className="rs-eye">
          <Image src={EYE_IMG} alt={t.eyeAlt} fill className="rs-eye-img" />

          <div className="rs-eye-text">
            <p className="rs-pill">{t.p1}</p>
            <p className="rs-pill">{t.p2}</p>
          </div>
        </div>
      </div>
    </section>
  );
}