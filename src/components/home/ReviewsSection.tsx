"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews?status=approved&limit=4", {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "Impossible de charger les avis.");
        }

        setReviews(data.rows || data.reviews || []);
      })
      .catch((e: any) => {
        setError(e?.message || "Impossible de charger les avis.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: "center", marginBottom: 28 }}>
        Avis clients
      </h2>

      {loading && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          Chargement des avis…
        </p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "crimson" }}>
          {error}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          Aucun avis publié pour le moment.
        </p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {reviews.map((review) => (
            <article
              key={review.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 18,
                padding: 20,
                background: "#fff",
                color: "#111",
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 10 }}>
                {"★".repeat(Math.max(0, Math.min(5, review.rating || 0)))}
                {"☆".repeat(5 - Math.max(0, Math.min(5, review.rating || 0)))}
              </div>

              <p style={{ lineHeight: 1.6, marginBottom: 14 }}>
                {review.comment || "Aucun commentaire"}
              </p>

              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {formatDate(review.createdAt)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}