// src/app/(public)/[locale]/review/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
      return isFr
        ? "Merci de sélectionner une note valide."
        : "Please select a valid rating.";
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
      return isFr ? "Une erreur est survenue." : "An error occurred.";
  }
}

function isValidRating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export default function ReviewPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || "fr";

  const sp = useSearchParams();
  const router = useRouter();

  const orderId = (sp.get("order_id") || "").trim();
  const token = (sp.get("token") || "").trim();
  const email = (sp.get("email") || "").trim().toLowerCase();

  const ratingFromUrlRaw = (sp.get("rating") || "").trim();
  const ratingFromUrl = Number.parseInt(ratingFromUrlRaw, 10);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isValidRating(ratingFromUrl)) {
      setRating(ratingFromUrl);
    }
  }, [ratingFromUrl]);

  const isFr = locale === "fr";

  const title = isFr ? "Laisser un avis" : "Leave a review";
  const subtitle = isFr
    ? "Merci pour votre commande. Votre retour nous aide vraiment."
    : "Thank you for your order. Your feedback really helps us.";
  const invalidTitle = isFr ? "Lien invalide" : "Invalid link";
  const invalidText = isFr
    ? "Le lien d’avis est incomplet ou expiré."
    : "The review link is incomplete or expired.";
  const missingEmailText = isFr
    ? "Le lien est incomplet : email manquant."
    : "The link is incomplete: missing email.";
  const successTitle = isFr ? "Merci 🙏" : "Thank you 🙏";
  const successText = isFr
    ? "Ton avis a bien été envoyé. Il sera publié après validation."
    : "Your review has been submitted and will be published after moderation.";
  const successHint = isFr
    ? "Merci d’avoir pris quelques secondes pour partager ton expérience."
    : "Thank you for taking a few seconds to share your experience.";
  const commentPlaceholder = isFr
    ? "Ajoute un commentaire (optionnel dans l’idéal, mais recommandé)…"
    : "Add a comment (recommended)…";
  const submitLabel = isFr ? "Envoyer mon avis" : "Submit my review";
  const sendingLabel = isFr ? "Envoi…" : "Sending…";
  const backHomeLabel = isFr ? "Retour à l’accueil" : "Back to home";
  const moderationText = isFr
    ? "Les avis peuvent être modérés (spam, propos illégaux, etc.)."
    : "Reviews may be moderated (spam, illegal content, etc.).";

  const canSubmit = useMemo(() => {
    return (
      !!orderId &&
      !!token &&
      !!email &&
      isValidRating(rating) &&
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

  function getStarLabel(n: number) {
    if (isFr) {
      return `${n} étoile${n > 1 ? "s" : ""}`;
    }
    return `${n} star${n > 1 ? "s" : ""}`;
  }

  if (!orderId || !token) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: "#f7f7f7",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "#fff",
            border: "1px solid #eaeaea",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: 28 }}>{invalidTitle}</h1>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>{invalidText}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: "#f7f7f7",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "#fff",
            border: "1px solid #eaeaea",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: 28 }}>{successTitle}</h1>
          <p style={{ margin: "0 0 10px", color: "#222", lineHeight: 1.6 }}>
            {successText}
          </p>
          <p style={{ margin: "0 0 18px", color: "#666", lineHeight: 1.6 }}>
            {successHint}
          </p>

          <button
            onClick={() => router.push(`/${locale}`)}
            style={{
              marginTop: 4,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {backHomeLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#f7f7f7",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#fff",
          border: "1px solid #eaeaea",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", fontSize: 30, lineHeight: 1.2 }}>{title}</h1>
        <p style={{ margin: "0 0 24px", color: "#666", lineHeight: 1.6 }}>{subtitle}</p>

        <div style={{ marginBottom: 10, fontSize: 14, color: "#444", fontWeight: 600 }}>
          {isFr ? "Votre note" : "Your rating"}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            margin: "0 0 20px",
          }}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= rating;

            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                style={{
                  fontSize: 24,
                  minWidth: 48,
                  height: 48,
                  borderRadius: 12,
                  border: active ? "1px solid #111" : "1px solid #ddd",
                  background: active ? "#111" : "#fff",
                  color: active ? "#fff" : "#111",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                aria-label={getStarLabel(n)}
                title={getStarLabel(n)}
              >
                ★
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 10, fontSize: 14, color: "#444", fontWeight: 600 }}>
          {isFr ? "Votre commentaire" : "Your comment"}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={commentPlaceholder}
          rows={6}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "1px solid #ddd",
            outline: "none",
            resize: "vertical",
            fontSize: 15,
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: comment.trim().length >= 3 ? "#666" : "#999",
          }}
        >
          {isFr
            ? "Minimum 3 caractères."
            : "Minimum 3 characters."}
        </div>

        {!email && (
          <p style={{ color: "crimson", marginTop: 12 }}>{missingEmailText}</p>
        )}

        {error && (
          <p style={{ color: "crimson", marginTop: 12 }}>
            {getErrorMessage(error, locale)}
          </p>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={onSubmit}
          style={{
            marginTop: 18,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #111",
            background: !canSubmit || loading ? "#f3f3f3" : "#111",
            color: !canSubmit || loading ? "#999" : "#fff",
            cursor: !canSubmit || loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loading ? sendingLabel : submitLabel}
        </button>

        <p style={{ marginTop: 14, fontSize: 12, color: "#777", lineHeight: 1.6 }}>
          {moderationText}
        </p>
      </div>
    </div>
  );
}