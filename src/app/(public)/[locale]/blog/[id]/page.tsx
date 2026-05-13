import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import "./blog.css";


import {
  CONTENT,
  type Locale,
} from "../_content";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
}) {
  const {
    locale,
    id,
  } = await params;

  const t = CONTENT[locale];

  if (!t) {
    return notFound();
  }

  const post =
    t.posts.find(
      (p) => p.id === id
    );

  if (!post) {
    return notFound();
  }

  return (
    <main className="home">
      <section
        className="
          section
          blog-post-page
        "
      >
        <div
          className="
            container
            container-md
          "
        >
          {/* BACK */}

          <Link
            href={`/${locale}/blog`}
            className="
              blog-post-back
            "
          >
            ← Retour au blog
          </Link>

          {/* ARTICLE */}

          <article
            className="
              blog-post-article
            "
          >
            {/* HERO */}

            <header
              className="
                blog-post-header
              "
            >
              <div
                className="
                  blog-post-date
                "
              >
                {post.date}
              </div>

              <h1
                className="
                  blog-post-title
                "
              >
                {post.title}
              </h1>

              <p
                className="
                  blog-post-excerpt
                "
              >
                {post.excerpt}
              </p>
            </header>

            {/* IMAGE */}

            <div
              className="
                blog-post-image
              "
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority
                sizes="
                  (max-width: 768px)
                  100vw,
                  900px
                "
                style={{
                  objectFit:
                    "cover",
                }}
              />
            </div>

            {/* CONTENT */}

            <section
              className="
                blog-post-content
              "
              dangerouslySetInnerHTML={{
                __html:
                  post.content,
              }}
            />
          </article>
        </div>
      </section>
    </main>
  );
}