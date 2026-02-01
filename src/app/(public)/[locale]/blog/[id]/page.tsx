import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CONTENT, type Locale } from "../_content";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;

  const t = CONTENT[locale];
  if (!t) return notFound();

  const post = t.posts.find((p) => p.id === id);
  if (!post) return notFound();

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <Link
        href={`/${locale}/blog`}
        style={{ display: "inline-block", marginBottom: 16 }}
      >
        ← Retour au blog
      </Link>

      <article>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{post.title}</h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>{post.date}</p>
        </header>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "280px",
            marginBottom: "24px",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>

        <section
          style={{ color: "#111", lineHeight: 1.7, fontSize: "1rem" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
