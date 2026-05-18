"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./reviews.css";

/* =====================================================
   TYPES
===================================================== */

type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

type ReviewRow = {
  id: string;
  orderId: string;
  orderNumber?: string;
  email: string;
  rating: number | null;
  comment: string;
  locale: string;
  status: ReviewStatus;
  createdAt: string | null;
  items: Array<{
    productId?: string;
    name?: string;
    qty?: number;
  }>;
};

type ReviewEmailSettings = {
  enabled: boolean;
  mode:
    | "immediate"
    | "delay";
  delayDays: number;
};

type ReviewStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};

/* =====================================================
   API
===================================================== */

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {

  const res =
    await fetch(
      input,
      {
        ...init,

        headers: {
          "Content-Type":
            "application/json",

          ...(init?.headers ||
            {}),
        },

        cache:
          "no-store",
      }
    );

  const data =
    await res
      .json()
      .catch(
        () => null
      );

  if (
    !res.ok ||
    !data?.ok
  ) {
    throw new Error(
      data?.message ||
        "Une erreur est survenue."
    );
  }

  return data as T;
}

/* =====================================================
   HELPERS
===================================================== */

function formatDate(
  value:
    | string
    | null
) {

  if (!value)
    return "";

  try {

    return new Date(
      value
    ).toLocaleString(
      "fr-FR"
    );

  } catch {

    return "";

  }
}

function getStatusLabel(
  status: ReviewStatus
) {

  if (
    status ===
    "pending"
  ) {
    return "En attente";
  }

  if (
    status ===
    "approved"
  ) {
    return "Publiés";
  }

  return "Refusés";
}

/* =====================================================
   SETTINGS HOOK
===================================================== */

function useReviewSettings() {

  const [
    savedSettings,
    setSavedSettings,
  ] =
    useState<ReviewEmailSettings | null>(
      null
    );

  const [
    draftSettings,
    setDraftSettings,
  ] =
    useState<ReviewEmailSettings | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null
    );

  async function load() {

    setLoading(
      true
    );

    setMessage(
      null
    );

    try {

      const data =
        await fetchJson<{
          ok: true;
          settings: ReviewEmailSettings;
        }>(
          "/api/admin/settings/review-email"
        );

      setSavedSettings(
        data.settings
      );

      setDraftSettings(
        data.settings
      );

    } catch (e: any) {

      setMessage(
        e?.message ||
          "Impossible de charger les réglages."
      );

    } finally {

      setLoading(
        false
      );

    }
  }

  async function save() {

    if (
      !draftSettings
    ) {
      return;
    }

    setSaving(
      true
    );

    setMessage(
      null
    );

    try {

      await fetchJson<{
        ok: true;
      }>(
        "/api/admin/settings/review-email",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              draftSettings
            ),
        }
      );

      setSavedSettings(
        draftSettings
      );

      setMessage(
        "✅ Réglages enregistrés"
      );

    } catch (e: any) {

      setMessage(
        e?.message ||
          "Impossible d’enregistrer les réglages."
      );

    } finally {

      setSaving(
        false
      );

    }
  }

  const isDirty =
    useMemo(
      () => {

        return (
          JSON.stringify(
            savedSettings
          ) !==
          JSON.stringify(
            draftSettings
          )
        );

      },
      [
        savedSettings,
        draftSettings,
      ]
    );

  useEffect(() => {
    load();
  }, []);

  return {
    draftSettings,
    setDraftSettings,
    loading,
    saving,
    message,
    isDirty,
    load,
    save,
  };
}

/* =====================================================
   REVIEWS HOOK
===================================================== */

function useReviews(
  status: ReviewStatus
) {

  const [rows, setRows] =
    useState<
      ReviewRow[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  async function load() {

    setLoading(
      true
    );

    setError(
      null
    );

    try {

      const data =
        await fetchJson<{
          ok: true;
          rows: ReviewRow[];
        }>(
          `/api/admin/reviews?status=${status}&limit=50`
        );

      setRows(
        data.rows || []
      );

    } catch (e: any) {

      setError(
        e?.message ||
          "Impossible de charger les avis."
      );

    } finally {

      setLoading(
        false
      );

    }
  }

  async function moderate(
    reviewId: string,
    action:
      | "approve"
      | "reject"
  ) {

    setProcessingId(
      reviewId
    );

    try {

      await fetchJson<{
        ok: true;
      }>(
        "/api/admin/reviews/moderate",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              {
                reviewId,
                action,
                moderatedBy:
                  "admin",
              }
            ),
        }
      );

      setRows(
        (
          prev
        ) =>
          prev.filter(
            (
              r
            ) =>
              r.id !==
              reviewId
          )
      );

    } finally {

      setProcessingId(
        null
      );

    }
  }

  useEffect(() => {
    load();
  }, [status]);

  return {
    rows,
    loading,
    error,
    processingId,
    load,
    moderate,
  };
}

/* =====================================================
   PAGE
===================================================== */

export default function AdminReviewsPage() {

  const [status, setStatus] =
    useState<ReviewStatus>(
      "pending"
    );

  const [stats, setStats] =
    useState<ReviewStats>({
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });

  const {
    draftSettings,
    setDraftSettings,
    loading:
      settingsLoading,
    saving:
      settingsSaving,
    message:
      settingsMessage,
    isDirty,
    load:
      reloadSettings,
    save:
      saveSettings,
  } =
    useReviewSettings();

  const {
    rows,
    loading,
    error,
    processingId,
    load:
      reloadReviews,
    moderate,
  } =
    useReviews(
      status
    );

  /* =====================================================
     STATS
  ===================================================== */

  async function loadStats() {

    try {

      const [
        pendingRes,
        approvedRes,
        rejectedRes,
      ] = await Promise.all([
        fetch(
          "/api/admin/reviews?status=pending&limit=999"
        ),
        fetch(
          "/api/admin/reviews?status=approved&limit=999"
        ),
        fetch(
          "/api/admin/reviews?status=rejected&limit=999"
        ),
      ]);

      const [
        pendingJson,
        approvedJson,
        rejectedJson,
      ] = await Promise.all([
        pendingRes.json(),
        approvedRes.json(),
        rejectedRes.json(),
      ]);

      const pending =
        pendingJson?.rows?.length || 0;

      const approved =
        approvedJson?.rows?.length || 0;

      const rejected =
        rejectedJson?.rows?.length || 0;

      setStats({
        total:
          pending +
          approved +
          rejected,

        pending,
        approved,
        rejected,
      });

    } catch (e) {

      console.error(
        "Stats error:",
        e
      );

    }
  }

  useEffect(() => {

    loadStats();

  }, []);

  /* =====================================================
     COMPUTED
  ===================================================== */

  const title =
    useMemo(
      () => {

        if (
          status ===
          "pending"
        ) {
          return "Avis en attente";
        }

        if (
          status ===
          "approved"
        ) {
          return "Avis publiés";
        }

        return "Avis refusés";

      },
      [status]
    );

  const emailLabel =
    useMemo(
      () => {

        if (
          !draftSettings
        ) {
          return "";
        }

        if (
          !draftSettings.enabled
        ) {
          return "Désactivé";
        }

        if (
          draftSettings.mode ===
            "immediate" ||
          draftSettings.delayDays ===
            0
        ) {
          return "Immédiat";
        }

        return `Après ${draftSettings.delayDays} jour(s)`;

      },
      [draftSettings]
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="reviews-page">

      {/* HERO */}
      <section className="reviews-hero">

        <div className="reviews-kicker">
          REVIEWS CENTER
        </div>

        <h1 className="reviews-title">
          Avis clients
        </h1>

        <p className="reviews-subtitle">
          Modérez les avis,
          contrôlez les
          publications et
          automatisez les
          emails d’invitation
          après commande.
        </p>

        <div className="reviews-stats">

          <div className="reviews-stat">

            <div className="reviews-stat-value">
              {
                stats.total
              }
            </div>

            <div className="reviews-stat-label">
              Avis
            </div>

          </div>

          <div className="reviews-stat">

            <div className="reviews-stat-value">
              {
                stats.approved
              }
            </div>

            <div className="reviews-stat-label">
              Publiés
            </div>

          </div>

          <div className="reviews-stat">

            <div className="reviews-stat-value">
              {
                stats.pending
              }
            </div>

            <div className="reviews-stat-label">
              En attente
            </div>

          </div>

        </div>

      </section>

      {/* SETTINGS */}
      <section className="reviews-card">

        <div className="reviews-card-head">

          <div>

            <div className="reviews-section-kicker">
              SETTINGS
            </div>

            <h2 className="reviews-card-title">
              Envoi du mail d’avis
            </h2>

            <p className="reviews-card-subtitle">
              {
                emailLabel
              }
            </p>

          </div>

          <div className="reviews-live">

            {settingsLoading
              ? "Chargement..."
              : settingsSaving
              ? "Sauvegarde..."
              : "Connecté"}

          </div>

        </div>

        {draftSettings && (
          <>

            <label className="reviews-switch">

              <input
                type="checkbox"
                checked={
                  draftSettings.enabled
                }
                onChange={(
                  e
                ) =>
                  setDraftSettings(
                    {
                      ...draftSettings,
                      enabled:
                        e.target.checked,
                    }
                  )
                }
              />

              <span className="reviews-switch-ui" />

              <div className="reviews-switch-content">

                <strong>
                  Activer les emails automatiques
                </strong>

                <span>
                  Envoi automatique après commande
                </span>

              </div>

            </label>

            <div className="reviews-presets">

              <button
                type="button"
                className={
                  draftSettings.mode ===
                    "immediate"
                    ? "reviews-chip active"
                    : "reviews-chip"
                }
                onClick={() =>
                  setDraftSettings(
                    {
                      ...draftSettings,
                      mode:
                        "immediate",
                      delayDays:
                        0,
                    }
                  )
                }
              >
                Immédiat
              </button>

              {[5, 20].map(
                (
                  d
                ) => {

                  const active =
                    draftSettings.mode ===
                      "delay" &&
                    draftSettings.delayDays ===
                      d;

                  return (
                    <button
                      key={
                        d
                      }
                      type="button"
                      className={
                        active
                          ? "reviews-chip active"
                          : "reviews-chip"
                      }
                      onClick={() =>
                        setDraftSettings(
                          {
                            ...draftSettings,
                            mode:
                              "delay",
                            delayDays:
                              d,
                          }
                        )
                      }
                    >
                      {d} jours
                    </button>
                  );
                }
              )}

              <div className="reviews-custom">

                <span>
                  Personnalisé
                </span>

                <input
                  type="number"
                  min={0}
                  max={365}
                  value={
                    draftSettings.mode ===
                    "immediate"
                      ? 0
                      : draftSettings.delayDays
                  }
                  onChange={(
                    e
                  ) => {

                    const v =
                      Math.max(
                        0,
                        Math.min(
                          365,
                          Math.floor(
                            Number(
                              e.target.value ||
                                0
                            )
                          )
                        )
                      );

                    setDraftSettings(
                      {
                        ...draftSettings,
                        mode:
                          v ===
                          0
                            ? "immediate"
                            : "delay",
                        delayDays:
                          v,
                      }
                    );
                  }}
                />

                <span>
                  jours
                </span>

              </div>

            </div>

            <div className="reviews-actions">

              <button
                type="button"
                className="reviews-btn reviews-btn-primary"
                disabled={
                  !isDirty ||
                  settingsSaving
                }
                onClick={
                  saveSettings
                }
              >
                Enregistrer
              </button>

              <button
                type="button"
                className="reviews-btn reviews-btn-ghost"
                onClick={
                  reloadSettings
                }
              >
                Recharger
              </button>

            </div>

            {settingsMessage && (
              <div className="reviews-message">
                {
                  settingsMessage
                }
              </div>
            )}

          </>
        )}

      </section>

      {/* FILTERS */}
      <section className="reviews-toolbar">

        <div className="reviews-tabs">

          {(
            [
              "pending",
              "approved",
              "rejected",
            ] as ReviewStatus[]
          ).map(
            (
              value
            ) => {

              const active =
                status ===
                value;

              return (
                <button
                  key={
                    value
                  }
                  type="button"
                  className={
                    active
                      ? "reviews-tab active"
                      : "reviews-tab"
                  }
                  onClick={() =>
                    setStatus(
                      value
                    )
                  }
                >

                  {getStatusLabel(
                    value
                  )}

                </button>
              );
            }
          )}

        </div>

        <button
          type="button"
          onClick={async () => {

            await reloadReviews();

            loadStats();

          }}
          className="reviews-btn reviews-btn-ghost"
        >
          Rafraîchir
        </button>

      </section>

      {/* META */}
      <div className="reviews-meta">

        <strong>
          {title}
        </strong>

        <span>

          {loading
            ? "Chargement..."
            : `${rows.length} avis`}

        </span>

      </div>

      {/* ERROR */}
      {error && (
        <div className="reviews-error">
          {error}
        </div>
      )}

      {/* LIST */}
      <section className="reviews-list">

        {rows.map(
          (
            r
          ) => {

            const processing =
              processingId ===
              r.id;

            return (
              <article
                key={
                  r.id
                }
                className="reviews-review"
              >

                <div className="reviews-review-head">

                  <div>

                    <div className="reviews-review-rating">

                      {r.rating ??
                        "?"}
                      ★

                    </div>

                    <div className="reviews-review-email">
                      {r.email}
                    </div>

                  </div>

                  <div className="reviews-review-date">

                    {formatDate(
                      r.createdAt
                    )}

                  </div>

                </div>

                <div className="reviews-review-comment">

                  {r.comment ||
                    "Aucun commentaire"}

                </div>

                <div className="reviews-review-meta">

                  <strong>
                    {
                      r.orderNumber ||
                      r.orderId
                    }
                  </strong>

                  {r.items?.length
                    ? ` • ${r.items
                        .map(
                          (
                            it
                          ) =>
                            `${it.name || it.productId || "?"} x${it.qty || 1}`
                        )
                        .join(
                          ", "
                        )}`
                    : ""}

                </div>

                {status ===
                  "pending" && (
                  <div className="reviews-review-actions">

                    <button
                      type="button"
                      disabled={
                        processing
                      }
                      className="reviews-btn reviews-btn-success"
                      onClick={async () => {

                        await moderate(
                          r.id,
                          "approve"
                        );

                        loadStats();

                      }}
                    >

                      {processing
                        ? "Traitement..."
                        : "Approuver"}

                    </button>

                    <button
                      type="button"
                      disabled={
                        processing
                      }
                      className="reviews-btn reviews-btn-danger"
                      onClick={async () => {

                        await moderate(
                          r.id,
                          "reject"
                        );

                        loadStats();

                      }}
                    >

                      {processing
                        ? "Traitement..."
                        : "Refuser"}

                    </button>

                  </div>
                )}

              </article>
            );
          }
        )}

        {!loading &&
          rows.length ===
            0 && (
            <div className="reviews-empty">
              Aucun avis trouvé.
            </div>
          )}

      </section>

    </main>
  );
}