"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Quote,
  Star,
} from "lucide-react";

import "./ReviewsSection.css";

type Review = {
  id: string;

  rating: number;

  comment: string;

  createdAt: string | null;
};

interface ReviewsSectionProps {
  locale: string;
}

export default function ReviewsSection({
  locale,
}: ReviewsSectionProps) {

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     LOAD REVIEWS
  ===================================================== */

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch(
          "/api/reviews?status=approved&limit=6",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (data?.ok) {
          setReviews(data.rows || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

/* =====================================================
   TRANSLATIONS
===================================================== */

const translations = {
  fr: {
    badge:
      "Avis patients",

    title:
      "Des patients satisfaits",

    subtitle:
      "Découvrez les retours de patients ayant utilisé notre coussin pendant leur convalescence après vitrectomie.",

    verified:
      "Patient vérifié",

    loading:
      "Chargement des avis...",
  },

  en: {
    badge:
      "Patient reviews",

    title:
      "Satisfied patients",

    subtitle:
      "Discover feedback from patients who used our pillow during their recovery after vitrectomy surgery.",

    verified:
      "Verified patient",

    loading:
      "Loading reviews...",
  },

  es: {
    badge:
      "Opiniones de pacientes",

    title:
      "Pacientes satisfechos",

    subtitle:
      "Descubra las opiniones de pacientes que utilizaron nuestro cojín durante su recuperación después de una vitrectomía.",

    verified:
      "Paciente verificado",

    loading:
      "Cargando opiniones...",
  },

  de: {
    badge:
      "Patientenbewertungen",

    title:
      "Zufriedene Patienten",

    subtitle:
      "Entdecken Sie Erfahrungsberichte von Patienten, die unser Kissen während ihrer Erholung nach einer Vitrektomie verwendet haben.",

    verified:
      "Verifizierter Patient",

    loading:
      "Bewertungen werden geladen...",
  },

  it: {
    badge:
      "Recensioni pazienti",

    title:
      "Pazienti soddisfatti",

    subtitle:
      "Scopri le recensioni di pazienti che hanno utilizzato il nostro cuscino durante il recupero dopo una vitrectomia.",

    verified:
      "Paziente verificato",

    loading:
      "Caricamento recensioni...",
  },

  nl: {
    badge:
      "Patiëntbeoordelingen",

    title:
      "Tevreden patiënten",

    subtitle:
      "Ontdek ervaringen van patiënten die ons kussen gebruikten tijdens hun herstel na een vitrectomie.",

    verified:
      "Geverifieerde patiënt",

    loading:
      "Beoordelingen laden...",
  },
};

  const t =
    translations[
      locale as keyof typeof translations
    ] || translations.en;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section className="vm-reviews">
        <div className="vm-reviews__loading">
          {t.loading}
        </div>
      </section>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!reviews.length) {
    return null;
  }

  return (
    <section className="vm-reviews">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="vm-reviews__header">

        <div className="vm-reviews__badge">
          {t.badge}
        </div>

        <h2 className="vm-reviews__title">
          {t.title}
        </h2>

        <p className="vm-reviews__subtitle">
          {t.subtitle}
        </p>

      </div>

      {/* =========================================
          GRID
      ========================================= */}

      <div className="vm-reviews__grid">

        {reviews.map((review) => (
          <article
            key={review.id}
            className="vm-review-card"
          >

            {/* GLOW */}

            <div className="vm-review-card__glow" />

            {/* QUOTE */}

            <div className="vm-review-card__quote">

              <Quote size={18} />

            </div>

            {/* STARS */}

            <div className="vm-review-card__stars">

              {Array.from({
                length:
                  review.rating,
              }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill="currentColor"
                />
              ))}

            </div>

            {/* COMMENT */}

            <p className="vm-review-card__comment">
              “{review.comment}”
            </p>

            {/* FOOTER */}

            <div className="vm-review-card__footer">

              <div className="vm-review-card__verified">
                {t.verified}
              </div>

              {review.createdAt && (
                <div className="vm-review-card__date">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString(
                    locale
                  )}
                </div>
              )}

            </div>

          </article>
        ))}

      </div>

    </section>
  );
}