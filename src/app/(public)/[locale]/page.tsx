import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    hero: {
      title: "Votre confort commence ici.",
      subtitle:
        "MassMe est la têtière ergonomique conçue pour soulager, reposer et améliorer votre bien-être.",
      cta: "Découvrir MassMe",
      image: "/hero-massme.jpg",
    },
    needs: {
      title: "Vos besoins",
      items: [
        { title: "Vitrectomie", slug: "vitrectomie" },
        { title: "Douleurs cervicales", slug: "cervicales" },
        { title: "Bien-être à domicile", slug: "domicile" },
      ],
    },
    features: {
      title: "Pourquoi choisir MassMe ?",
      list: [
        "Soulage les douleurs cervicales",
        "Améliore la posture",
        "Aide à la convalescence post-opératoire",
        "Fabrication Française 🇫🇷",
      ],
    },
    products: {
      title: "Nos produits",
    },
    testimonials: {
      title: "Ils adorent MassMe",
    },
    blog: {
      title: "Nos derniers articles",
    },
  },

  en: {
    hero: {
      title: "Your comfort starts here.",
      subtitle:
        "MassMe is the ergonomic headrest designed to support, relieve and enhance your well-being.",
      cta: "Discover MassMe",
      image: "/hero-massme.jpg",
    },
    needs: {
      title: "Your needs",
      items: [
        { title: "Vitrectomy recovery", slug: "vitrectomie" },
        { title: "Neck pain relief", slug: "cervicales" },
        { title: "Home wellness", slug: "domicile" },
      ],
    },
    features: {
      title: "Why choose MassMe?",
      list: [
        "Relieves cervical pain",
        "Improves posture",
        "Helps during post-operative recovery",
        "Made in France 🇫🇷",
      ],
    },
    products: {
      title: "Our products",
    },
    testimonials: {
      title: "They love MassMe",
    },
    blog: {
      title: "Latest articles",
    },
  },
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="home">

      {/* ================= HERO ================= */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>{t.hero.title}</h1>
          <p>{t.hero.subtitle}</p>

          <a href={`/${locale}/products`} className="btn btn-primary home-hero-cta">
            {t.hero.cta}
          </a>
        </div>

        <div className="home-hero-img">
          <Image
            src={t.hero.image}
            alt="MassMe"
            fill
            className="img-cover"
          />
        </div>
      </section>

      {/* ================= NEEDS ================= */}
      <section className="home-section">
        <h2 className="home-section-title">{t.needs.title}</h2>

        <div className="home-needs-grid">
          {t.needs.items.map((item) => (
            <a
              key={item.slug}
              href={`/${locale}/besoins/${item.slug}`}
              className="home-card"
            >
              <h3>{item.title}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="home-section home-section-alt">
        <h2 className="home-section-title">{t.features.title}</h2>

        <ul className="home-features-grid">
          {t.features.list.map((f, i) => (
            <li key={i} className="home-feature-item">
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="home-section">
        <h2 className="home-section-title">{t.products.title}</h2>

        <div className="home-products-grid">
          <div className="home-card">MassMe – Têtière</div>
          <div className="home-card">MassMe Plus – Têtière PRO</div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="home-section home-section-alt">
        <h2 className="home-section-title">{t.testimonials.title}</h2>

        <div className="home-testimonials-grid">
          <div className="home-card">
            “MassMe m’a aidé à tenir la position après opération.”
          </div>
          <div className="home-card">
            “Un confort incroyable pour soulager le cou.”
          </div>
        </div>
      </section>

      {/* ================= BLOG ================= */}
      <section className="home-section">
        <h2 className="home-section-title">{t.blog.title}</h2>

        <div className="home-blog-grid">
          <div className="home-card">Article 1</div>
          <div className="home-card">Article 2</div>
        </div>
      </section>
    </main>
  );
}
