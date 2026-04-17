"use client";

import { useEffect, useMemo, useState } from "react";
import "./reviews.css";

type ReviewStatus = "pending" | "approved" | "rejected";

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
  items: Array<{ productId?: string; name?: string; qty?: number }>;
};

type ReviewEmailSettings = {
  enabled: boolean;
  mode: "immediate" | "delay";
  delayDays: number;
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new Error(data?.message || "Une erreur est survenue.");
  }

  return data as T;
}

function formatDate(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return "";
  }
}

function getStatusLabel(status: ReviewStatus) {
  if (status === "pending") return "En attente";
  if (status === "approved") return "Publiés";
  return "Refusés";
}

function useReviewSettings() {
  const [savedSettings, setSavedSettings] = useState<ReviewEmailSettings | null>(null);
  const [draftSettings, setDraftSettings] = useState<ReviewEmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await fetchJson<{ ok: true; settings: ReviewEmailSettings }>(
        "/api/admin/settings/review-email"
      );
      setSavedSettings(data.settings);
      setDraftSettings(data.settings);
    } catch (e: any) {
      setMessage(e?.message || "Impossible de charger les réglages.");
      setSavedSettings(null);
      setDraftSettings(null);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draftSettings) return;
    setSaving(true);
    setMessage(null);
    try {
      await fetchJson<{ ok: true }>("/api/admin/settings/review-email", {
        method: "POST",
        body: JSON.stringify(draftSettings),
      });
      setSavedSettings(draftSettings);
      setMessage("✅ Réglages enregistrés");
    } catch (e: any) {
      setMessage(e?.message || "Impossible d’enregistrer les réglages.");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(savedSettings) !== JSON.stringify(draftSettings);
  }, [savedSettings, draftSettings]);

  useEffect(() => {
    load();
  }, []);

  return {
    savedSettings,
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

function useReviews(status: ReviewStatus) {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ ok: true; rows: ReviewRow[] }>(
        `/api/admin/reviews?status=${status}&limit=50`
      );
      setRows(data.rows || []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }

  async function moderate(reviewId: string, action: "approve" | "reject") {
    setProcessingId(reviewId);
    setError(null);

    try {
      await fetchJson<{ ok: true }>("/api/admin/reviews/moderate", {
        method: "POST",
        body: JSON.stringify({
          reviewId,
          action,
          moderatedBy: "admin",
        }),
      });

      setRows((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e: any) {
      setError(e?.message || "Impossible de modifier cet avis.");
    } finally {
      setProcessingId(null);
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

export default function AdminReviewsPage() {
  const [status, setStatus] = useState<ReviewStatus>("pending");

  const {
    draftSettings,
    setDraftSettings,
    loading: settingsLoading,
    saving: settingsSaving,
    message: settingsMessage,
    isDirty,
    load: reloadSettings,
    save: saveSettings,
  } = useReviewSettings();

  const {
    rows,
    loading,
    error,
    processingId,
    load: reloadReviews,
    moderate,
  } = useReviews(status);

  const title = useMemo(() => {
    if (status === "pending") return "Avis en attente";
    if (status === "approved") return "Avis publiés";
    return "Avis refusés";
  }, [status]);

  const emailLabel = useMemo(() => {
    if (!draftSettings) return "";
    if (!draftSettings.enabled) return "Désactivé";
    if (draftSettings.mode === "immediate" || draftSettings.delayDays === 0) {
      return "Immédiat";
    }
    return `Après ${draftSettings.delayDays} jour(s)`;
  }, [draftSettings]);

  return (
    <div className="admin-page admin-page--narrow">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Modération — Avis clients</h1>
          <p className="admin-page-subtitle">
            Gérez les avis publiés et l’envoi automatique des emails d’invitation.
          </p>
        </div>
      </header>

      <section className="card cardPad reviews-settings">
        <div className="reviews-settings-head">
          <div>
            <h2 className="reviews-settings-title">Envoi du mail d’avis</h2>
            <p className="reviews-settings-subtitle">{emailLabel}</p>
          </div>

          <div className="reviews-settings-status">
            {settingsLoading
              ? "Chargement…"
              : settingsSaving
              ? "Enregistrement…"
              : ""}
          </div>
        </div>

        {settingsLoading ? (
          <p className="reviews-settings-hint">Récupération des réglages…</p>
        ) : !draftSettings ? (
          <p className="reviews-settings-error">
            Impossible de charger les réglages.
          </p>
        ) : (
          <>
            <div className="reviews-settings-switch">
              <label>
                <input
                  type="checkbox"
                  checked={draftSettings.enabled}
                  onChange={(e) =>
                    setDraftSettings({
                      ...draftSettings,
                      enabled: e.target.checked,
                    })
                  }
                />
                <span>Activer l’envoi automatique du mail d’avis</span>
              </label>
            </div>

            <div className="reviews-settings-presets">
              <button
                type="button"
                disabled={!draftSettings.enabled || settingsSaving}
                onClick={() =>
                  setDraftSettings({
                    ...draftSettings,
                    mode: "immediate",
                    delayDays: 0,
                  })
                }
                className={
                  draftSettings.mode === "immediate" && draftSettings.enabled
                    ? "btn btn--primary reviews-settings-chip"
                    : "btn btn--soft reviews-settings-chip"
                }
              >
                Immédiat
              </button>

              {[5, 20].map((d) => {
                const active =
                  draftSettings.mode === "delay" &&
                  draftSettings.delayDays === d &&
                  draftSettings.enabled;

                return (
                  <button
                    key={d}
                    type="button"
                    disabled={!draftSettings.enabled || settingsSaving}
                    onClick={() =>
                      setDraftSettings({
                        ...draftSettings,
                        mode: "delay",
                        delayDays: d,
                      })
                    }
                    className={
                      active
                        ? "btn btn--primary reviews-settings-chip"
                        : "btn btn--soft reviews-settings-chip"
                    }
                  >
                    {d} jours
                  </button>
                );
              })}

              <div className="reviews-settings-custom">
                <span>Personnalisé :</span>
                <input
                  disabled={!draftSettings.enabled || settingsSaving}
                  type="number"
                  min={0}
                  max={365}
                  value={
                    draftSettings.mode === "immediate" ? 0 : draftSettings.delayDays
                  }
                  onChange={(e) => {
                    const v = Math.max(
                      0,
                      Math.min(365, Math.floor(Number(e.target.value || 0)))
                    );

                    setDraftSettings({
                      ...draftSettings,
                      mode: v === 0 ? "immediate" : "delay",
                      delayDays: v,
                    });
                  }}
                  className="reviews-settings-input"
                />
                <span>jours</span>
              </div>
            </div>

            <div className="reviews-settings-actions">
              <button
                type="button"
                onClick={saveSettings}
                disabled={!isDirty || settingsSaving}
                className="btn btn--primary"
              >
                Enregistrer
              </button>

              <button
                type="button"
                onClick={reloadSettings}
                disabled={settingsSaving}
                className="btn btn--soft"
              >
                Recharger
              </button>
            </div>

            {settingsMessage && (
              <p
                className={
                  settingsMessage.startsWith("✅")
                    ? "reviews-settings-msg reviews-settings-msg--success"
                    : "reviews-settings-msg reviews-settings-msg--error"
                }
              >
                {settingsMessage}
              </p>
            )}

            <p className="reviews-settings-hint">
              Ce réglage sert à planifier l’envoi du mail d’avis après une commande.
            </p>
          </>
        )}
      </section>

      <section className="reviews-tabsBar">
        <div className="reviews-tabs" role="tablist" aria-label="Filtres avis">
          {(["pending", "approved", "rejected"] as ReviewStatus[]).map((value) => {
            const active = status === value;

            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? "reviews-tab reviews-tab--active" : "reviews-tab"}
                onClick={() => setStatus(value)}
              >
                {getStatusLabel(value)}
              </button>
            );
          })}
        </div>

        <div className="reviews-refresh">
          <button type="button" onClick={reloadReviews} className="btn btn--soft">
            Rafraîchir
          </button>
        </div>
      </section>

      <div className="reviews-listMeta">
        <b>{title}</b> — {loading ? "Chargement…" : `${rows.length} avis`}
      </div>

      {error && <div className="reviews-error">{error}</div>}

      <section className="reviews-list">
        {rows.map((r) => {
          const isProcessing = processingId === r.id;

          return (
            <article key={r.id} className="reviews-review">
              <div className="reviews-review-head">
                <div className="reviews-review-title">
                  {r.rating ?? "?"}★ — {r.email}
                </div>

                <div className="reviews-review-date">{formatDate(r.createdAt)}</div>
              </div>

              <div className="reviews-review-comment">
                {r.comment || "Aucun commentaire"}
              </div>

              <div className="reviews-review-meta">
                Commande : <b>{r.orderNumber || r.orderId}</b>
                {r.items?.length ? (
                  <>
                    {" "}
                    — items :{" "}
                    {r.items
                      .map(
                        (it) => `${it.name || it.productId || "?"} x${it.qty || 1}`
                      )
                      .join(", ")}
                  </>
                ) : null}
              </div>

              {status === "pending" && (
                <div className="reviews-review-actions">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => moderate(r.id, "approve")}
                    className="btn reviews-approveBtn"
                  >
                    {isProcessing ? "Traitement…" : "Approuver"}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => moderate(r.id, "reject")}
                    className="btn reviews-rejectBtn"
                  >
                    {isProcessing ? "Traitement…" : "Refuser"}
                  </button>
                </div>
              )}
            </article>
          );
        })}

        {!loading && rows.length === 0 && (
          <div className="reviews-review-empty">Aucun avis dans cet état.</div>
        )}
      </section>
    </div>
  );
}