"use client";

import "./review.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

/* =====================================================
   HELPERS
===================================================== */

function getErrorMessage(
  error: string | null,
  locale: string
) {
  const isFr =
    locale === "fr";

  switch (error) {
    case "token_missing":
      return isFr
        ? "Le lien est incomplet."
        : "The link is incomplete.";

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
        ? "Merci d’écrire un commentaire plus détaillé."
        : "Please write a more detailed comment.";

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

function isValidRating(
  value: number
) {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

/* =====================================================
   TOKEN DECODER
===================================================== */

function decodeToken(
  token: string
) {
  try {
    // TOKEN FORMAT:
    // payload.signature

    const base64Url =
      token.split(".")[0];

    if (!base64Url) {
      return null;
    }

    const base64 =
      base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
      base64.padEnd(
        base64.length +
          ((4 -
            (base64.length %
              4)) %
            4),
        "="
      );

    return JSON.parse(
      atob(padded)
    );
  } catch {
    return null;
  }
}

/* =====================================================
   PAGE
===================================================== */

export default function ReviewPage() {
  const params =
    useParams<{
      locale: string;
    }>();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const locale =
    params.locale || "fr";

  const isFr =
    locale === "fr";

  const token = (
    searchParams.get(
      "token"
    ) || ""
  ).trim();

  const ratingFromUrl =
    Number.parseInt(
      searchParams.get(
        "rating"
      ) || "",
      10
    );

  /* =====================================================
     STATES
  ===================================================== */

  const [
    orderId,
    setOrderId,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    done,
    setDone,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /* =====================================================
     TEXTS
  ===================================================== */

  const texts =
    useMemo(
      () => ({
        eyebrow: "VitrectoMed",

        title: isFr
          ? "Laisser un avis"
          : "Leave a review",

        subtitle: isFr
          ? "Merci pour votre commande. Votre retour aide les futurs patients et améliore continuellement l’expérience VitrectoMed."
          : "Thank you for your order. Your feedback helps future patients and continuously improves the VitrectoMed experience.",

        placeholder: isFr
          ? "Décris ton expérience avec le produit, le confort, la livraison ou la récupération…"
          : "Describe your experience with the product, comfort, shipping or recovery…",

        submit: isFr
          ? "Envoyer mon avis"
          : "Submit my review",

        sending: isFr
          ? "Envoi en cours…"
          : "Sending…",

        moderation: isFr
          ? "Les avis peuvent être modérés avant publication."
          : "Reviews may be moderated before publication.",

        successTitle: isFr
          ? "Merci 🙏"
          : "Thank you 🙏",

        successText: isFr
          ? "Ton avis a bien été envoyé."
          : "Your review has been submitted.",

        successHint: isFr
          ? "Merci d’avoir partagé ton expérience."
          : "Thank you for sharing your experience.",

        invalidTitle: isFr
          ? "Lien invalide"
          : "Invalid link",

        backHome: isFr
          ? "Retour à l’accueil"
          : "Back to home",
      }),
      [isFr]
    );

  /* =====================================================
     TOKEN VALIDATION
  ===================================================== */

  useEffect(() => {
    if (!token) {
      setError(
        "token_missing"
      );

      return;
    }

    const decoded =
      decodeToken(token);

    if (
      !decoded?.orderId ||
      !decoded?.email
    ) {
      setError(
        "token_invalid"
      );

      return;
    }

    if (
      decoded?.exp &&
      Date.now() >
        decoded.exp * 1000
    ) {
      setError(
        "token_invalid"
      );

      return;
    }

    setOrderId(
      decoded.orderId
    );

    setEmail(
      decoded.email
    );

    if (
      isValidRating(
        ratingFromUrl
      )
    ) {
      setRating(
        ratingFromUrl
      );
    }
  }, [
    token,
    ratingFromUrl,
  ]);

  /* =====================================================
     VALIDATION
  ===================================================== */

  const canSubmit =
    useMemo(() => {
      return (
        !!orderId &&
        !!email &&
        !!token &&
        isValidRating(
          rating
        ) &&
        comment.trim()
          .length >= 3
      );
    }, [
      orderId,
      email,
      token,
      rating,
      comment,
    ]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function onSubmit() {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/reviews",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                orderId,
                token,
                email,
                rating,
                comment,
                locale,
              }
            ),
          }
        );

      const json =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !json?.ok
      ) {
        setError(
          json?.error ||
            "server_error"
        );

        return;
      }

      setDone(true);
    } catch {
      setError(
        "network_error"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  if (done) {
    return (
      <main className="review-page">

        <section className="review-card review-success-card">

          <div className="review-success">

            <div className="review-eyebrow">
              VitrectoMed
            </div>

            <h1 className="review-title">
              {
                texts.successTitle
              }
            </h1>

            <p className="review-subtitle">
              {
                texts.successText
              }
            </p>

            <p className="review-footnote">
              {
                texts.successHint
              }
            </p>

            <div className="review-actions">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/${locale}`
                  )
                }
                className="review-btn-primary"
              >
                {
                  texts.backHome
                }
              </button>

            </div>

          </div>

        </section>

      </main>
    );
  }

  /* =====================================================
     INVALID TOKEN
  ===================================================== */

  if (
    error ===
      "token_missing" ||
    error ===
      "token_invalid"
  ) {
    return (
      <main className="review-page">

        <section className="review-card">

          <div className="review-content">

            <div className="review-eyebrow">
              VitrectoMed
            </div>

            <h1 className="review-title">
              {
                texts.invalidTitle
              }
            </h1>

            <p className="review-subtitle">
              {getErrorMessage(
                error,
                locale
              )}
            </p>

          </div>

        </section>

      </main>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="review-page">

      <section className="review-card">

        <div className="review-content">

          <div className="review-eyebrow">
            {
              texts.eyebrow
            }
          </div>

          <h1 className="review-title">
            {texts.title}
          </h1>

          <p className="review-subtitle">
            {
              texts.subtitle
            }
          </p>

          {/* =====================================================
              STARS
          ===================================================== */}

          <div className="review-stars">

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setRating(
                      star
                    )
                  }
                  className={`review-star ${
                    star <=
                    rating
                      ? "active"
                      : ""
                  }`}
                  aria-label={`Rate ${star}`}
                >
                  ★
                </button>
              )
            )}

          </div>

          {/* =====================================================
              COMMENT
          ===================================================== */}

          <textarea
            value={comment}
            onChange={(
              e
            ) =>
              setComment(
                e.target.value
              )
            }
            placeholder={
              texts.placeholder
            }
            className="review-textarea"
          />

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <p className="review-error">
              {getErrorMessage(
                error,
                locale
              )}
            </p>
          )}

          {/* =====================================================
              ACTIONS
          ===================================================== */}

          <div className="review-actions">

            <button
              type="button"
              disabled={
                !canSubmit ||
                loading
              }
              onClick={
                onSubmit
              }
              className="review-btn-primary"
            >
              {loading
                ? texts.sending
                : texts.submit}
            </button>

          </div>

          {/* =====================================================
              FOOTNOTE
          ===================================================== */}

          <p className="review-footnote">
            {
              texts.moderation
            }
          </p>

        </div>

      </section>

    </main>
  );
}