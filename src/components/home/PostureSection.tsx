import "./PostureSection.css";
import Image from "next/image";

const POSTURE_IMAGE_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/95bc0f65-b90c-40c2-1167-b0d2f1857000/public";

export default function PostureSection() {
  return (
    <section className="posture">
      <div className="posture-inner">
        <Image
          src={POSTURE_IMAGE_URL}
          alt="Position post-opératoire recommandée après vitrectomie"
          width={1600}      // ratio seulement (peu importe la valeur exacte)
          height={900}
          className="posture-img"
          priority
        />

        <p className="posture-caption">
          Position post-opératoire recommandée après vitrectomie avec injection de gaz
        </p>
      </div>
    </section>
  );
}
