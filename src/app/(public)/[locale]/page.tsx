import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    hero: {
      title: "Votre confort commence ici.",
      subtitle:
        "Découvrez MassMe, la têtière ergonomique conçue pour soulager, reposer et améliorer votre bien-être.",
      cta: "Découvrir MassMe",
      image: "/hero-massme.jpg", // remplace par ton image
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
      list: [
        {
          name: "Sophie L.",
          text: "Convalescence après vitrectomie. MassMe m’a vraiment aidée à tenir la position sans souffrir.",
        },
        {
          name: "Alexandre P.",
          text: "Je télétravaille toute la journée. MassMe réduit clairement mes tensions dans le cou.",
        },
      ],
    },
    blog: {
      title: "Nos derniers articles",
    },
  },

  en: {
    hero: {
      title: "Your comfort starts now.",
      subtitle:
        "Discover MassMe, the ergonomic headrest designed to support, relieve and improve your well-being.",
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
      list: [
        {
          name: "Sophia L.",
          text: "Recovering from vitrectomy. MassMe really helped me maintain position without pain.",
        },
        {
          name: "Alex P.",
          text: "I work from home all day. MassMe clearly reduces neck tension.",
        },
      ],
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
    <main>

      {/* ================= HERO ================= */}
      <section className="section bg-gray-50">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="title-xl">{t.hero.title}</h1>
            <p className="subtitle max-w-xl">{t.hero.subtitle}</p>

            <a
              href={`/${locale}/products`}
              className="btn-primary inline-block mt-6"
            >
              {t.hero.cta}
            </a>
          </div>

          <div className="relative w-full h-72 md:h-96">
            <Image
              src={t.hero.image}
              alt="MassMe"
              fill
              className="object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ============== Vos besoins =============== */}
      <section className="section">
        <div className="container">
          <h2 className="title-lg mb-10">{t.needs.title}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {t.needs.items.map((item) => (
              <a
                key={item.slug}
                href={`/${locale}/besoins/${item.slug}`}
                className="card hover:shadow-xl transition"
              >
                <h3 className="text-xl font-medium">{item.title}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============== Features Section =============== */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="title-lg mb-10">{t.features.title}</h2>

          <ul className="grid md:grid-cols-2 gap-6">
            {t.features.list.map((f, i) => (
              <li key={i} className="card">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============== Products section =============== */}
      <section className="section">
        <div className="container">
          <h2 className="title-lg mb-10">{t.products.title}</h2>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="card">MassMe - Têtière</div>
            <div className="card">MassMe Plus - Têtière Pro</div>
          </div>
        </div>
      </section>

      {/* ============== Testimonials =============== */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="title-lg mb-10">{t.testimonials.title}</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {t.testimonials.list.map((item, i) => (
              <div key={i} className="card">
                <p className="italic mb-2">“{item.text}”</p>
                <p className="font-medium">— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== Blog preview =============== */}
      <section className="section">
        <div className="container">
          <h2 className="title-lg mb-10">{t.blog.title}</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">Article 1</div>
            <div className="card">Article 2</div>
          </div>
        </div>
      </section>
    </main>
  );
}
