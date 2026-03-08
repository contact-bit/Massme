"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewStatus = "pending" | "approved" | "rejected";

type ReviewRow = {
  id: string;
  orderId: string;
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

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 14,
        background: "#fff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

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
    if (draftSettings.mode === "immediate" || draftSettings.delayDays === 0) return "Immédiat";
    return `Après ${draftSettings.delayDays} jour(s)`;
  }, [draftSettings]);

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
        Modération — Avis clients
      </h1>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Envoi du mail d’avis</div>
          <div style={{ fontSize: 12, color: "#666" }}>{emailLabel}</div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
            {settingsLoading ? "Chargement…" : settingsSaving ? "Enregistrement…" : ""}
          </div>
        </div>

        {settingsLoading ? (
          <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
            Récupération des réglages…
          </div>
        ) : !draftSettings ? (
          <div style={{ marginTop: 10, color: "crimson", fontWeight: 800 }}>
            Impossible de charger les réglages.
          </div>
        ) : (
          <>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
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
                Activer l’envoi automatique du mail d’avis
              </label>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                disabled={!draftSettings.enabled || settingsSaving}
                onClick={() =>
                  setDraftSettings({
                    ...draftSettings,
                    mode: "immediate",
                    delayDays: 0,
                  })
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: draftSettings.mode === "immediate" ? "#111" : "white",
                  color: draftSettings.mode === "immediate" ? "white" : "#111",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Immédiat
              </button>

              {[5, 20].map((d) => (
                <button
                  key={d}
                  disabled={!draftSettings.enabled || settingsSaving}
                  onClick={() =>
                    setDraftSettings({
                      ...draftSettings,
                      mode: "delay",
                      delayDays: d,
                    })
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background:
                      draftSettings.mode === "delay" && draftSettings.delayDays === d
                        ? "#111"
                        : "white",
                    color:
                      draftSettings.mode === "delay" && draftSettings.delayDays === d
                        ? "white"
                        : "#111",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {d} jours
                </button>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Personnalisé :</span>
                <input
                  disabled={!draftSettings.enabled || settingsSaving}
                  type="number"
                  min={0}
                  max={365}
                  value={draftSettings.mode === "immediate" ? 0 : draftSettings.delayDays}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(365, Math.floor(Number(e.target.value || 0))));
                    setDraftSettings({
                      ...draftSettings,
                      mode: v === 0 ? "immediate" : "delay",
                      delayDays: v,
                    });
                  }}
                  style={{
                    width: 90,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                  }}
                />
                <span style={{ fontSize: 12, color: "#666" }}>jours</span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={saveSettings}
                disabled={!isDirty || settingsSaving}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                  opacity: !isDirty || settingsSaving ? 0.6 : 1,
                }}
              >
                Enregistrer
              </button>

              <button
                onClick={reloadSettings}
                disabled={settingsSaving}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Recharger
              </button>
            </div>

            {settingsMessage && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: settingsMessage.startsWith("✅") ? "#135200" : "crimson",
                }}
              >
                {settingsMessage}
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              Ce réglage sert à planifier l’envoi du mail d’avis après une commande.
            </div>
          </>
        )}
      </Card>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        {(["pending", "approved", "rejected"] as ReviewStatus[]).map((value) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: status === value ? "#111" : "white",
              color: status === value ? "white" : "#111",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {value === "pending"
              ? "En attente"
              : value === "approved"
              ? "Publiés"
              : "Refusés"}
          </button>
        ))}

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={reloadReviews}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Rafraîchir
          </button>
        </div>
      </div>

      <div style={{ fontSize: 14, color: "#666", marginBottom: 10 }}>
        <b>{title}</b> — {loading ? "Chargement…" : `${rows.length} avis`}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ffccc7",
            background: "#fff2f0",
            color: "#a8071a",
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => {
          const isProcessing = processingId === r.id;

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 14,
                background: "white",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {r.rating ?? "?"}★ — {r.email}
                </div>
                <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
                  {formatDate(r.createdAt)}
                </div>
              </div>

              <div style={{ marginTop: 6, color: "#222", whiteSpace: "pre-wrap" }}>
                {r.comment || "Aucun commentaire"}
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Order: <b>{r.orderId}</b> — locale: {r.locale}
                {r.items?.length ? (
                  <>
                    {" "}
                    — items:{" "}
                    {r.items
                      .map((it) => `${it.name || it.productId || "?"} x${it.qty || 1}`)
                      .join(", ")}
                  </>
                ) : null}
              </div>

              {status === "pending" && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    disabled={isProcessing}
                    onClick={() => moderate(r.id, "approve")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #b7eb8f",
                      background: "#f6ffed",
                      color: "#135200",
                      fontWeight: 900,
                      cursor: "pointer",
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? "Traitement…" : "Approuver"}
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => moderate(r.id, "reject")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #ffccc7",
                      background: "#fff2f0",
                      color: "#a8071a",
                      fontWeight: 900,
                      cursor: "pointer",
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? "Traitement…" : "Refuser"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!loading && rows.length === 0 && (
          <div style={{ padding: 14, border: "1px dashed #ddd", borderRadius: 14, color: "#666" }}>
            Aucun avis dans cet état.
          </div>
        )}
      </div>
    </div>
  );
}