"use client";

import { useEffect, useMemo, useState } from "react";

type Settings = {
  enabled: boolean;
  mode: "immediate" | "delay";
  delayDays: number;
};

export default function ReviewEmailSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const delay = settings?.mode === "immediate" ? 0 : (settings?.delayDays ?? 5);

  const label = useMemo(() => {
    if (!settings) return "";
    if (!settings.enabled) return "Désactivé";
    if (settings.mode === "immediate" || delay === 0) return "Envoi immédiat";
    return `Envoi après ${delay} jour(s)`;
  }, [settings, delay]);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/review-email", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || "load_failed");
      setSettings(data.settings);
    } catch (e: any) {
      setMsg(e?.message || "load_failed");
    } finally {
      setLoading(false);
    }
  }

  async function save(next: Settings) {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/review-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || "save_failed");
      setSettings(next);
      setMsg("✅ Enregistré");
    } catch (e: any) {
      setMsg(e?.message || "save_failed");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "white" }}>
        Chargement des réglages email d’avis…
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "white" }}>
        <div style={{ fontWeight: 900 }}>Email d’avis</div>
        <div style={{ marginTop: 8, color: "crimson" }}>Erreur: {msg || "Impossible de charger"}</div>
        <button
          onClick={load}
          style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Email d’avis</div>
        <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {saving ? "Enregistrement…" : ""}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => save({ ...settings, enabled: e.target.checked })}
          />
          Activer l’envoi
        </label>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          disabled={!settings.enabled}
          onClick={() => save({ ...settings, mode: "immediate", delayDays: 0 })}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: settings.mode === "immediate" ? "#111" : "white",
            color: settings.mode === "immediate" ? "white" : "#111",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Immédiat
        </button>

        {[5, 20].map((d) => (
          <button
            key={d}
            disabled={!settings.enabled}
            onClick={() => save({ ...settings, mode: "delay", delayDays: d })}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: settings.mode === "delay" && settings.delayDays === d ? "#111" : "white",
              color: settings.mode === "delay" && settings.delayDays === d ? "white" : "#111",
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
            disabled={!settings.enabled}
            type="number"
            min={0}
            max={365}
            value={delay}
            onChange={(e) => {
              const v = Math.max(0, Math.min(365, Math.floor(Number(e.target.value || 0))));
              if (v === 0) save({ ...settings, mode: "immediate", delayDays: 0 });
              else save({ ...settings, mode: "delay", delayDays: v });
            }}
            style={{ width: 90, padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
          />
          <span style={{ fontSize: 12, color: "#666" }}>jours</span>
        </div>
      </div>

      {msg && <div style={{ marginTop: 10, fontSize: 12, color: msg.startsWith("✅") ? "#135200" : "crimson" }}>{msg}</div>}
    </div>
  );
}