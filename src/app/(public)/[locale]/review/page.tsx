// src/app/(public)/[locale]/review/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";

function getErrorMessage(error: string | null, locale: string) {
  const isFr = locale === "fr";

  switch (error) {
    case "order_id_missing":
      return isFr ? "Commande introuvable." : "Order not found.";
    case "token_missing":
      return isFr ? "Le lien est incomplet." : "The link is incomplete.";
    case "token_invalid":
      return isFr
        ? "Le lien d’avis est invalide ou expiré."
        : "The review link is invalid or expired.";
    case "email_invalid":
      return isFr ? "Adresse email invalide." : "Invalid email address.";
    case "order_email_missing":
      return isFr
        ? "Impossible de vérifier l’adresse email de la commande."
        : "Unable to verify the order email address.";
    case "email_mismatch":
      return isFr
        ? "Cette adresse email ne correspond pas à la commande."
        : "This email address does not match the order.";
    case "rating_invalid":
      return isFr ? "Merci de sélectionner une note valide." : "Please select a valid rating.";
    case "comment_invalid":
      return isFr
        ? "Merci d’écrire un commentaire un peu plus détaillé."
        : "Please write a slightly more detailed comment.";
    case "review_already_exists":
      return isFr
        ? "Un avis a déjà été envoyé pour cette commande."
        : "A review has already been submitted for this order.";
    case "network_error":
      return isFr
        ? "Erreur réseau. Réessaie dans un instant."
        : "Network error. Please try again in a moment.";
    case "server_error":
      return isFr
        ? "Une erreur serveur est survenue."
        : "A server error occurred.";
    default:
      return isFr
        ? "Une erreur est survenue."
        : "An error occurred.";
  }
}

export default function ReviewPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || "fr";

  const sp = useSearchParams();
  const router = useRouter();

  const orderId = (sp.get("order_id") || "").trim();
  const token = (sp.get("token") || "").trim();
  const email = (sp.get("email") || "").trim().toLowerCase();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      !!orderId &&
      !!token &&
      !!email &&
      rating >= 1 &&
      rating <= 5 &&
      comment.trim().length >= 3
    );
  }, [orderId, token, email, rating, comment]);

  async function onSubmit() {
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, token, email, rating, comment, locale }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "server_error");
        return;
      }

      setDone(true);
    } catch {
      setError("network_error");
    } finally {
      setLoading(false);
    }
  }

  if (!orderId || !token) {
    return (
      <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>{locale === "fr" ? "Lien invalide" : "Invalid link"}</h1>
        <p>
          {locale === "fr"
            ? "Le lien d’avis est incomplet ou expiré."
            : "The review link is incomplete or expired."}
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>{locale === "fr" ? "Merci 🙏" : "Thank you 🙏"}</h1>
        <p>
          {locale === "fr"
            ? "Ton avis a bien été envoyé. Il sera publié après validation."
            : "Your review has been submitted and will be published after moderation."}
        </p>
        <button
          onClick={() => router.push(`/${locale}`)}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {locale === "fr" ? "Retour à l’accueil" : "Back to home"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>{locale === "fr" ? "Laisser un avis" : "Leave a review"}</h1>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            style={{
              fontSize: 22,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: n <= rating ? "#111" : "transparent",
              color: n <= rating ? "#fff" : "#111",
              cursor: "pointer",
            }}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={locale === "fr" ? "Ton commentaire…" : "Your comment…"}
        rows={6}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ddd",
        }}
      />

      {!email && (
        <p style={{ color: "crimson", marginTop: 10 }}>
          {locale === "fr"
            ? "Le lien est incomplet : email manquant."
            : "The link is incomplete: missing email."}
        </p>
      )}

      {error && (
        <p style={{ color: "crimson", marginTop: 10 }}>
          {getErrorMessage(error, locale)}
        </p>
      )}

      <button
        disabled={!canSubmit || loading}
        onClick={onSubmit}
        style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #ddd",
          background: !canSubmit || loading ? "#f5f5f5" : "#111",
          color: !canSubmit || loading ? "#999" : "#fff",
          cursor: !canSubmit || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? locale === "fr"
            ? "Envoi…"
            : "Sending…"
          : locale === "fr"
          ? "Envoyer mon avis"
          : "Submit my review"}
      </button>

      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        {locale === "fr"
          ? "Les avis peuvent être modérés (spam, propos illégaux, etc.)."
          : "Reviews may be moderated (spam, illegal content, etc.)."}
      </p>
    </div>
  );
}