"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActionIconButton,
} from "../orders/components/ActionIconButton";

import {
  IconEye,
} from "../orders/components/icons";

import "./reviews.css";

/* =====================================================
   TYPES
===================================================== */

type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

type ReviewView =
  | ReviewStatus
  | "email_pending";

const reviewStatusOptions: Array<{
  value: ReviewView;
  label: string;
  description: string;
}> = [
  {
    value: "email_pending",
    label: "En attente d’envoi",
    description: "Emails programmés à envoyer",
  },
  {
    value: "pending",
    label: "À modérer",
    description: "Nouveaux avis à valider",
  },
  {
    value: "approved",
    label: "Publié",
    description: "Avis validés visibles sur la boutique",
  },
];

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

type ReviewEmailRow = {
  orderId: string;
  orderNumber: string;
  email: string;
  customer: string;
  itemsLabel: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  lastError: string | null;
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
    return "À modérer";
  }

  if (
    status ===
    "approved"
  ) {
    return "Publié";
  }

  return "Refusé";
}

function getStatusTitle(
  status: ReviewView
) {
  return (
    reviewStatusOptions.find(
      (option) => option.value === status
    ) || reviewStatusOptions[0]
  );
}

function getReviewEmailLabel(status: string) {
  if (status === "scheduled") return "Programmé";
  if (status === "sending") return "Envoi...";
  if (status === "sent") return "Envoyé";
  if (status === "error") return "Erreur";
  if (status === "disabled") return "Désactivé";
  if (status === "skipped") return "Ignoré";

  return "Non programmé";
}

function toIso(value: any): string | null {
  if (!value) return null;

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toISOString();
    }

    if (typeof value?._seconds === "number") {
      return new Date(value._seconds * 1000).toISOString();
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  } catch {
    return null;
  }
}

function getRemainingTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const diff = date.getTime() - Date.now();

  if (Number.isNaN(date.getTime())) return "";
  if (diff <= 0) return "Prêt à envoyer";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}j ${hours}h`;
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
   REVIEW EMAILS HOOK
===================================================== */

function useReviewEmails() {
  const [rows, setRows] =
    useState<ReviewEmailRow[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    sendingOrderId,
    setSendingOrderId,
  ] =
    useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const pass =
        localStorage.getItem("admin_password") || "";

      if (!pass) {
        window.location.href = "/admin/login";
        return;
      }

      const res = await fetch("/api/admin/orders", {
        headers: {
          "x-admin-password": pass,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (
        !res.ok ||
        !Array.isArray(data?.orders)
      ) {
        throw new Error(
          data?.error ||
            "Impossible de charger les emails d’avis."
        );
      }

      const nextRows: ReviewEmailRow[] =
        (data.orders || [])
          .map((order: any) => {
            const reviewEmail =
              order?.reviewEmail || {};

            const billing =
              order?.billingAddress || {};

            const shipping =
              order?.shippingAddress || {};

            const customer =
              billing.name ||
              shipping.name ||
              [
                billing.firstName || shipping.firstName,
                billing.lastName || shipping.lastName,
              ]
                .filter(Boolean)
                .join(" ") ||
              "Client";

            const email =
              reviewEmail.email ||
              order.email ||
              billing.email ||
              shipping.email ||
              "";

            const itemsLabel =
              Array.isArray(order.items)
                ? order.items
                    .map((item: any) => {
                      const name =
                        typeof item?.name === "string"
                          ? item.name
                          : item?.name?.fr ||
                            item?.name?.en ||
                            "Produit";

                      return `${name} x${item?.quantity || 1}`;
                    })
                    .join(" • ")
                : "";

            return {
              orderId: order.id,
              orderNumber:
                order.orderNumber || order.id,
              email,
              customer,
              itemsLabel,
              status:
                reviewEmail.status || "none",
              scheduledAt:
                toIso(reviewEmail.scheduledAt),
              sentAt:
                toIso(
                  reviewEmail.lastSentAt ||
                    reviewEmail.sentAt
                ),
              lastError:
                reviewEmail.lastError || null,
            };
          })
          .filter(
            (row: ReviewEmailRow) =>
              row.email && row.orderId
          )
          .sort((a: ReviewEmailRow, b: ReviewEmailRow) => {
            const rank: Record<string, number> = {
              error: 0,
              scheduled: 1,
              none: 2,
              sent: 3,
              disabled: 4,
              skipped: 5,
            };

            return (
              (rank[a.status] ?? 9) -
              (rank[b.status] ?? 9)
            );
          });

      setRows(nextRows);
    } catch (e: any) {
      setError(
        e?.message ||
          "Impossible de charger les emails d’avis."
      );
    } finally {
      setLoading(false);
    }
  }

  async function send(orderId: string) {
    setSendingOrderId(orderId);

    try {
      const res = await fetch("/api/admin/reviews/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "Impossible d’envoyer l’email d’avis."
        );
      }

      await load();
    } catch (e: any) {
      setError(
        e?.message ||
          "Impossible d’envoyer l’email d’avis."
      );
    } finally {
      setSendingOrderId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    rows,
    loading,
    error,
    sendingOrderId,
    load,
    send,
  };
}

/* =====================================================
   PAGE
===================================================== */

export default function AdminReviewsPage() {

  const [status, setStatus] =
    useState<ReviewView>(
      "pending"
    );

  const [openId, setOpenId] =
    useState<string | null>(null);

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);

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
      status === "email_pending"
        ? "pending"
        : status
    );

  const {
    rows:
      reviewEmailRows,
    loading:
      reviewEmailsLoading,
    error:
      reviewEmailsError,
    sendingOrderId,
    load:
      reloadReviewEmails,
    send:
      sendReviewEmail,
  } =
    useReviewEmails();

  /* =====================================================
     COMPUTED
  ===================================================== */

  const title =
    useMemo(
      () => getStatusTitle(status).label,
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

  const reviewEmailByOrderId =
    useMemo(() => {
      const map =
        new Map<string, ReviewEmailRow>();

      for (const row of reviewEmailRows) {
        map.set(row.orderId, row);
      }

      return map;
    }, [reviewEmailRows]);

  const unifiedRows =
    useMemo(() => {
      if (status === "email_pending") {
        return reviewEmailRows
          .filter(
            (emailRow) =>
              ![
                "sent",
                "disabled",
                "skipped",
              ].includes(emailRow.status)
          )
          .map((emailRow) => ({
            emailRow,
            review:
              null as ReviewRow | null,
          }));
      }

      return rows.map((review) => {
        const emailRow =
          reviewEmailByOrderId.get(
            review.orderId
          ) || {
            orderId:
              review.orderId,
            orderNumber:
              review.orderNumber || review.orderId,
            email:
              review.email,
            customer:
              review.email,
            itemsLabel:
              review.items
                .map(
                  (item) =>
                    `${item.name || "Produit"} x${item.qty || 1}`
                )
                .join(" • "),
            status:
              "none",
            scheduledAt:
              null,
            sentAt:
              null,
            lastError:
              null,
          };

        return {
          emailRow,
          review,
        };
      });
    }, [
      status,
      rows,
      reviewEmailRows,
      reviewEmailByOrderId,
    ]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="admin-page reviews-page">

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

          <div className="reviews-card-actions">

            <div className="reviews-live">

              {settingsLoading
                ? "Chargement..."
                : settingsSaving
                ? "Sauvegarde..."
                : "Connecté"}

            </div>

            <button
              type="button"
              className={`reviews-create-toggle ${
                showSettings
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setShowSettings(
                  !showSettings
                )
              }
            >
              {showSettings
                ? "Fermer"
                : "Réglages"}
            </button>

          </div>

        </div>

        {showSettings && draftSettings && (
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

      {/* UNIFIED TABLE */}
      <section className="reviews-email-section">

        <div className="reviews-email-head">

          <div>
            <div className="reviews-section-kicker">
              Avis
            </div>

            <h2 className="reviews-card-title">
              Modération
            </h2>
          </div>

          <div className="reviews-card-actions">
            <div className="reviews-view-control">
              <span>Statut</span>

              <div
                className="reviews-status-buttons"
                role="group"
                aria-label="Filtrer les avis par statut"
              >
                {reviewStatusOptions.map(
                  (option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`reviews-status-button status-${option.value} ${
                        status === option.value
                          ? "active"
                          : ""
                      }`}
                      aria-pressed={
                        status === option.value
                      }
                      onClick={() =>
                        setStatus(option.value)
                      }
                    >
                      {option.label}
                    </button>
                  )
                )}
              </div>

              <small>
                {getStatusTitle(status).description}
              </small>
            </div>

            <button
              type="button"
              className="reviews-btn reviews-btn-ghost"
              onClick={async () => {
                await Promise.all([
                  reloadReviewEmails(),
                  reloadReviews(),
                ]);
              }}
            >
              {reviewEmailsLoading || loading
                ? "Chargement..."
                : "Rafraîchir"}
            </button>
          </div>

        </div>

        {(reviewEmailsError || error) && (
          <div className="reviews-error">
            {reviewEmailsError || error}
          </div>
        )}

        <div className="reviews-meta reviews-meta-inline">
          <strong>{title}</strong>
          <span>
            {reviewEmailsLoading || loading
              ? "Chargement..."
              : status === "email_pending"
              ? `${unifiedRows.length} emails`
              : `${unifiedRows.length} avis`}
          </span>
        </div>

        <div className="reviews-email-table orders-table-wrap">

          <table className="orders-table-v2 reviews-unified-table">

            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Email avis</th>
                <th>Avis</th>
                <th>Envoi</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {unifiedRows.map(({ emailRow: row, review }) => {
                const isOpen =
                  openId === row.orderId;

                const sending =
                  sendingOrderId === row.orderId;

                const processing =
                  review
                    ? processingId === review.id
                    : false;

                const dateLabel =
                  row.status === "scheduled"
                    ? row.scheduledAt
                      ? `${formatDate(row.scheduledAt)} • ${getRemainingTime(row.scheduledAt)}`
                      : "Programmé"
                    : row.sentAt
                    ? formatDate(row.sentAt)
                    : row.lastError || "—";

                return (
                  <Fragment key={row.orderId}>
                    <tr
                      key={row.orderId}
                      className={`row ${
                        isOpen ? "open" : ""
                      }`}
                      onClick={() =>
                        setOpenId(
                          isOpen
                            ? null
                            : row.orderId
                        )
                      }
                    >
                      <td>
                        <div className="cell-command">
                          <div className="cell-main">
                            {row.orderNumber}
                          </div>

                          <span
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <ActionIconButton
                              title="Voir"
                              onClick={() =>
                                setOpenId(
                                  isOpen
                                    ? null
                                    : row.orderId
                                )
                              }
                              icon={<IconEye />}
                              variant="primary"
                            />
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="cell-main">
                          {row.customer}
                        </div>
                        <div className="cell-sub">
                          {row.email}
                        </div>
                      </td>

                      <td>
                        <span className={`reviews-email-status status-${row.status}`}>
                          {getReviewEmailLabel(row.status)}
                        </span>
                      </td>

                      <td>
                        <div className="reviews-email-review">
                          {review ? (
                            <>
                              <strong>
                                {review.rating ?? "?"} ★
                              </strong>
                              <span>
                                {getStatusLabel(review.status)}
                              </span>
                            </>
                          ) : (
                            <span>
                              {status === "email_pending"
                                ? "En attente client"
                                : "Aucun avis"}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="cell-sub">
                          {dateLabel}
                        </div>
                      </td>

                      <td
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <div className="reviews-email-actions">
                          {status === "pending" && review ? (
                            <>
                              <button
                                type="button"
                                disabled={processing}
                                className="reviews-btn reviews-btn-success"
                                onClick={async () => {
                                  await moderate(
                                    review.id,
                                    "approve"
                                  );
                                  await reloadReviewEmails();
                                }}
                              >
                                Approuver
                              </button>

                              <button
                                type="button"
                                disabled={processing}
                                className="reviews-btn reviews-btn-danger"
                                onClick={async () => {
                                  await moderate(
                                    review.id,
                                    "reject"
                                  );
                                  await reloadReviewEmails();
                                }}
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className={
                                row.status === "sent"
                                  ? "reviews-btn reviews-btn-ghost"
                                  : "reviews-btn reviews-btn-primary"
                              }
                              disabled={sending}
                              onClick={() =>
                                sendReviewEmail(row.orderId)
                              }
                            >
                              {sending
                                ? "Envoi..."
                                : row.status === "sent"
                                ? "Renvoyer"
                                : "Envoyer"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="row-expanded reviews-row-expanded">
                        <td colSpan={6}>
                          <div className="reviews-expanded reviews-expanded-minimal">
                            <div className="reviews-expanded-card">
                              <h3>Commentaire</h3>
                              <div className="reviews-expanded-comment">
                                {review?.comment ||
                                  "Aucun commentaire pour cette commande."}
                              </div>
                            </div>

                            <div className="reviews-expanded-card">
                              <h3>Produits concernés</h3>
                              <div className="reviews-expanded-products">
                                {row.itemsLabel || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

            </tbody>

          </table>

          {!reviewEmailsLoading &&
            unifiedRows.length === 0 && (
            <div className="reviews-empty">
              {status === "pending"
                ? "Aucun avis à modérer."
                : status === "email_pending"
                ? "Aucun email en attente d’envoi."
                : "Aucun avis publié."}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}
