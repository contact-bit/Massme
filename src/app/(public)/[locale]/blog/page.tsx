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
    <main className="max-w-6xl mx-auto px-4 py-16 space-y-12">
      {/* HEADER */}
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-semibold">{t.title}</h1>
        <p className="text-lg opacity-80">{t.subtitle}</p>
      </header>

      {/* LISTE DES ARTICLES */}
      <section className="grid md:grid-cols-2 gap-10">
        {t.posts.map((post) => (
          <article
            key={post.id}
            className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="relative w-full h-52">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm opacity-60">{post.date}</p>
              <p className="opacity-80">{post.excerpt}</p>

              <a
                href="#"
                className="inline-block mt-2 text-black font-medium underline hover:no-underline"
              >
                {t.readMore}
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
