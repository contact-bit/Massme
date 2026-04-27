// src/app/(public)/[locale]/review/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";

function getErrorMessage(error: string | null, locale: string) {
  const isFr = locale === "fr";

  switch (error) {
    case "token_missing":
      return isFr ? "Le lien est incomplet." : "The link is incomplete.";
    case "token_invalid":
      return isFr
        ? "Le lien d’avis est invalide ou expiré."
        : "The review link is invalid or expired.";
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

  const token = (sp.get("token") || "").trim();

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFr = locale === "fr";

  /* ================= TOKEN DECODE ================= */

  useEffect(() => {
    if (!token) {
      setError("token_missing");
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const decoded = JSON.parse(atob(payloadBase64));

      if (!decoded?.orderId || !decoded?.email) {
        setError("token_invalid");
        return;
      }

      setOrderId(decoded.orderId);
      setEmail(decoded.email);

      if (decoded?.rating && isValidRating(decoded.rating)) {
        setRating(decoded.rating);
      }
    } catch (e) {
      console.error("TOKEN ERROR", e);
      setError("token_invalid");
    }
  }, [token]);

  /* ================= TEXT ================= */

  const title = isFr ? "Laisser un avis" : "Leave a review";
  const subtitle = isFr
    ? "Merci pour votre commande. Votre retour nous aide vraiment."
    : "Thank you for your order. Your feedback really helps us.";

  const successTitle = isFr ? "Merci 🙏" : "Thank you 🙏";
  const successText = isFr
    ? "Ton avis a bien été envoyé. Il sera publié après validation."
    : "Your review has been submitted and will be published after moderation.";

  const successHint = isFr
    ? "Merci d’avoir pris quelques secondes pour partager ton expérience."
    : "Thank you for taking a few seconds to share your experience.";

  const commentPlaceholder = isFr
    ? "Ajoute un commentaire…"
    : "Add a comment…";

  const submitLabel = isFr ? "Envoyer mon avis" : "Submit my review";
  const sendingLabel = isFr ? "Envoi…" : "Sending…";
  const backHomeLabel = isFr ? "Retour à l’accueil" : "Back to home";

  const moderationText = isFr
    ? "Les avis peuvent être modérés."
    : "Reviews may be moderated.";

  /* ================= VALIDATION ================= */

  const canSubmit = useMemo(() => {
    return (
      !!orderId &&
      !!token &&
      isValidRating(rating) &&
      comment.trim().length >= 3
    );
  }, [orderId, token, rating, comment]);

  /* ================= SUBMIT ================= */

  async function onSubmit() {
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          token,
          email,
          rating,
          comment,
          locale,
        }),
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

  /* ================= SUCCESS ================= */

  if (done) {
    return (
      <div style={container}>
        <div style={card}>
          <h1>{successTitle}</h1>
          <p>{successText}</p>
          <p style={{ color: "#666" }}>{successHint}</p>

          <button onClick={() => router.push(`/${locale}`)} style={btnPrimary}>
            {backHomeLabel}
          </button>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error === "token_missing" || error === "token_invalid") {
    return (
      <div style={container}>
        <div style={card}>
          <h1>{isFr ? "Lien invalide" : "Invalid link"}</h1>
          <p>{getErrorMessage(error, locale)}</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={container}>
      <div style={card}>
        <h1>{title}</h1>
        <p style={{ color: "#666" }}>{subtitle}</p>

        <div style={{ marginTop: 20 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                fontSize: 24,
                marginRight: 8,
                background: n <= rating ? "#111" : "#fff",
                color: n <= rating ? "#fff" : "#111",
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 10,
                cursor: "pointer",
              }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={commentPlaceholder}
          rows={5}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        {error && (
          <p style={{ color: "crimson" }}>
            {getErrorMessage(error, locale)}
          </p>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={onSubmit}
          style={btnPrimary}
        >
          {loading ? sendingLabel : submitLabel}
        </button>

        <p style={{ fontSize: 12, color: "#777", marginTop: 10 }}>
          {moderationText}
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "#f7f7f7",
};

const card = {
  width: "100%",
  maxWidth: 720,
  background: "#fff",
  border: "1px solid #eaeaea",
  borderRadius: 20,
  padding: 24,
};

const btnPrimary = {
  marginTop: 20,
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};