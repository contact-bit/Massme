import { notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

const CONTENT = {
  fr: {
    title: "Blog",
    subtitle: "Explorez nos articles, conseils et actualités.",
    posts: [
      {
        id: "1",
        title: "Bien dormir après une opération",
        date: "12 Janvier 2024",
        excerpt:
          "Découvrez nos conseils pour mieux dormir et accélérer votre récupération.",
        image: "/placeholder.jpg",
      },
      {
        id: "2",
        title: "Soulager les douleurs cervicales efficacement",
        date: "28 Décembre 2023",
        excerpt:
          "Les meilleures postures et accessoires pour réduire les tensions du cou.",
        image: "/placeholder.jpg",
      },
    ],
    readMore: "Lire la suite",
  },

  en: {
    title: "Blog",
    subtitle: "Explore our articles, tips and latest updates.",
    posts: [
      {
        id: "1",
        title: "Sleeping well after surgery",
        date: "January 12, 2024",
        excerpt:
          "Discover our tips to sleep better and speed up your recovery.",
        image: "/placeholder.jpg",
      },
      {
        id: "2",
        title: "How to relieve cervical pain efficiently",
        date: "December 28, 2023",
        excerpt:
          "The best positions and tools to reduce neck tension.",
        image: "/placeholder.jpg",
      },
    ],
    readMore: "Read more",
  },
} as const;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = CONTENT[locale as "fr" | "en"];
  if (!t) return notFound();

  return (
    <main className="blog-page">
      {/* HEADER */}
      <header className="blog-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {/* LISTE DES ARTICLES */}
      <section className="blog-grid">
        {t.posts.map((post) => (
          <article key={post.id} className="blog-card">
            <div className="blog-card-img">
              <Image
                src={post.image}
                alt={post.title}
                fill
              />
            </div>

            <div className="blog-card-body">
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-date">{post.date}</p>
              <p className="blog-card-excerpt">{post.excerpt}</p>

              <a href="#" className="blog-card-link">
                {t.readMore}
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
