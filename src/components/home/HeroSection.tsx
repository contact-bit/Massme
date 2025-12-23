import "./HeroSection.css";
import Image from "next/image";

type HeroProps = {
  locale: "fr" | "en";
  title: string;
  subtitle: string;
  body?: string;
};

const LOGO_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/2db3d899-6352-4cf7-26bb-f27c541f4200/public";

const PRODUCT_URL =
  "https://imagedelivery.net/mEerI0ULsAvmhZskQQTV1g/63950d11-1ac7-4c4d-13a1-f7278cd7b600/public";

export default function HeroSection({ locale, title, subtitle, body }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-grid">
          <div className="hero-left">
            <Image
              src={LOGO_URL}
              alt="OculaRest"
              width={180}
              height={56}
              className="hero-logo"
              priority
            />

            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            {body ? <p className="hero-body">{body}</p> : null}

            <div className="hero-ctas">
              <a href={`/${locale}/convalescence`} className="btn btn-primary">
                Être accompagné
              </a>
              <a href={`/${locale}/fonctionnement`} className="btn btn-outline">
                Voir le fonctionnement
              </a>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <div className="hero-product">
                <Image
                  src={PRODUCT_URL}
                  alt="OculaRest"
                  fill
                  className="hero-product-img"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
