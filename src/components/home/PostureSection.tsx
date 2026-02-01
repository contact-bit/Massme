import "./PostureSection.css";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const POSTURE_IMAGE_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/25934eca-f978-4cbf-dfe1-5ddf77c36100/public";

const DATA: Record<Locale, { alt: string; caption: string }> = {
  fr: {
    alt: "Position post-opératoire recommandée après vitrectomie",
    caption: "Position post-opératoire recommandée après vitrectomie avec injection de gaz",
  },
  en: {
    alt: "Recommended post-operative position after vitrectomy",
    caption: "Recommended post-operative position after vitrectomy with gas injection",
  },
  es: {
    alt: "Posición postoperatoria recomendada después de vitrectomía",
    caption: "Posición postoperatoria recomendada después de vitrectomía con inyección de gas",
  },
  de: {
    alt: "Empfohlene postoperative Position nach Vitrektomie",
    caption: "Empfohlene postoperative Position nach Vitrektomie mit Gasinjektion",
  },
  it: {
    alt: "Posizione post-operatoria raccomandata dopo vitrectomia",
    caption: "Posizione post-operatoria raccomandata dopo vitrectomia con iniezione di gas",
  },
  nl: {
    alt: "Aanbevolen postoperatieve positie na vitrectomie",
    caption: "Aanbevolen postoperatieve positie na vitrectomie met gasinjectie",
  },
};

export default function PostureSection({ locale }: Props) {
  const t = DATA[locale];

  return (
    <section className="posture">
      <div className="posture-inner">
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
    </section>
  );
}