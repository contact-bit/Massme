import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CONTENT, type Locale } from "./_content";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  const t = CONTENT[locale];
  if (!t) return notFound();

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{t.title}</h1>
        <p style={{ color: "#555" }}>{t.subtitle}</p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {t.posts.map((post) => (
          <article
            key={post.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "180px",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: 4 }}>
                {post.title}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: 8 }}>
                {post.date}
              </p>
              <p style={{ fontSize: "0.95rem", marginBottom: 12 }}>
                {post.excerpt}
              </p>

              <Link
                href={`/${locale}/blog/${post.id}`}
                style={{ fontSize: "0.9rem", color: "#2563eb" }}
              >
                {t.readMore}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
