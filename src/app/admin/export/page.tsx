"use client";

import { useMemo, useState } from "react";

type Format = "pdf" | "csv" | "accounting_csv";
type Mode = "day" | "month" | "range";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthISO() {
  return new Date().toISOString().slice(0, 7);
}

function buildExportLabel(mode: Mode, day: string, month: string, from: string, to: string) {
  if (mode === "day") return `Jour sélectionné : ${day}`;
  if (mode === "month") return `Mois sélectionné : ${month}`;
  return `Période : ${from} → ${to}`;
}

function getFormatLabel(format: Format) {
  if (format === "pdf") return "PDF";
  if (format === "csv") return "CSV";
  return "COMPTA EXCEL";
}

export default function AdminExportPage() {
  const [mode, setMode] = useState<Mode>("month");
  const [format, setFormat] = useState<Format>("pdf");

  const [day, setDay] = useState(todayISO());
  const [month, setMonth] = useState(monthISO());
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());

  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const isRangeInvalid = mode === "range" && from > to;

  const href = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("format", format);

    if (mode === "day") sp.set("day", day);
    if (mode === "month") sp.set("month", month);
    if (mode === "range") {
      sp.set("from", from);
      sp.set("to", to);
    }

    return `/api/admin/orders/export?${sp.toString()}`;
  }, [mode, format, day, month, from, to]);

  const buildHref = (forcedFormat?: Format) => {
    const sp = new URLSearchParams();
    sp.set("format", forcedFormat || format);

    if (mode === "day") sp.set("day", day);
    if (mode === "month") sp.set("month", month);
    if (mode === "range") {
      sp.set("from", from);
      sp.set("to", to);
    }

    return `/api/admin/orders/export?${sp.toString()}`;
  };

  const download = async (forcedFormat?: Format) => {
    setError("");
    setSuccess("");

    if (isRangeInvalid) {
      setError("La date de début ne peut pas être après la date de fin.");
      return;
    }

    const adminPassword = localStorage.getItem("admin_password");
    if (!adminPassword) {
      alert("Session admin expirée, reconnecte-toi.");
      window.location.href = "/admin/login";
      return;
    }

    const finalFormat = forcedFormat || format;
    const finalHref = buildHref(finalFormat);

    try {
      setIsDownloading(true);

      const res = await fetch(finalHref, {
        headers: { "x-admin-password": adminPassword },
        cache: "no-store",
      });

      if (!res.ok) {
        const message = await res.text();
        setError(`Erreur export : ${message}`);
        return;
      }

      const blob = await res.blob();
      const dispo = res.headers.get("content-disposition") || "";
      const match = dispo.match(/filename="([^"]+)"/);

      const filename =
        match?.[1] ||
        (finalFormat === "pdf"
          ? "export.pdf"
          : finalFormat === "csv"
          ? "export.csv"
          : "accounting_export.csv");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setSuccess(`Export téléchargé avec succès : ${filename}`);
    } catch (e) {
      console.error(e);
      setError("Une erreur inattendue est survenue pendant le téléchargement.");
    } finally {
      setIsDownloading(false);
    }
  };

  const summary = buildExportLabel(mode, day, month, from, to);

  return (
    <main className="admin-page" style={{ paddingBottom: 40 }}>
      <div
        className="admin-card"
        style={{
          marginBottom: 18,
          background:
            "linear-gradient(135deg, rgba(59,130,246,.10), rgba(16,185,129,.10))",
          border: "1px solid rgba(59,130,246,.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              background: "rgba(255,255,255,.8)",
              boxShadow: "0 8px 24px rgba(15,23,42,.08)",
            }}
          >
            📤
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 className="admin-title" style={{ margin: 0 }}>
              Export des commandes
            </h1>
            <p style={{ margin: "6px 0 0", color: "rgba(11,18,32,.68)" }}>
              Exporte tes commandes en PDF, CSV complet ou format compta Excel.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <ModeButton
            active={mode === "day"}
            onClick={() => setMode("day")}
            icon="📅"
            label="Jour"
          />
          <ModeButton
            active={mode === "month"}
            onClick={() => setMode("month")}
            icon="🗓️"
            label="Mois"
          />
          <ModeButton
            active={mode === "range"}
            onClick={() => setMode("range")}
            icon="⏳"
            label="Plage"
          />

          <div style={{ flex: 1 }} />

          <div style={{ minWidth: 220 }}>
            <label className="admin-label" style={{ marginBottom: 6, display: "block" }}>
              Format
            </label>
            <select
              className="admin-select"
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="accounting_csv">Compta Excel</option>
            </select>
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "rgba(248,250,252,.9)",
            border: "1px solid rgba(148,163,184,.18)",
          }}
        >
          {mode === "day" && (
            <div className="admin-field">
              <label className="admin-label">Choisir un jour</label>
              <input
                className="admin-input"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
          )}

          {mode === "month" && (
            <div className="admin-field">
              <label className="admin-label">Choisir un mois</label>
              <input
                className="admin-input"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          )}

          {mode === "range" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div className="admin-field">
                <label className="admin-label">Du</label>
                <input
                  className="admin-input"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Au</label>
                <input
                  className="admin-input"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "rgba(15,23,42,.03)",
            border: "1px dashed rgba(15,23,42,.12)",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 700, color: "#0f172a" }}>Résumé de l’export</div>
          <div style={{ color: "rgba(11,18,32,.72)" }}>{summary}</div>
          <div style={{ color: "rgba(11,18,32,.72)" }}>Format : {getFormatLabel(format)}</div>
          <code
            style={{
              display: "block",
              padding: 10,
              borderRadius: 10,
              background: "white",
              color: "#334155",
              fontSize: 12,
              overflowX: "auto",
            }}
          >
            {href}
          </code>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <QuickExportCard
            title="PDF admin"
            description="Export détaillé lisible"
            icon="📄"
            onClick={() => download("pdf")}
            disabled={isDownloading || isRangeInvalid}
          />

          <QuickExportCard
            title="CSV complet"
            description="Toutes les colonnes"
            icon="📑"
            onClick={() => download("csv")}
            disabled={isDownloading || isRangeInvalid}
          />

          <QuickExportCard
            title="Compta Excel"
            description="Format Dazz comptabilité"
            icon="📊"
            onClick={() => download("accounting_csv")}
            disabled={isDownloading || isRangeInvalid}
            featured
          />
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(239,68,68,.08)",
              color: "#b91c1c",
              border: "1px solid rgba(239,68,68,.18)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(16,185,129,.08)",
              color: "#047857",
              border: "1px solid rgba(16,185,129,.18)",
            }}
          >
            ✅ {success}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={() => download()}
            disabled={isDownloading || isRangeInvalid}
            style={{
              minWidth: 220,
              opacity: isDownloading || isRangeInvalid ? 0.7 : 1,
              cursor: isDownloading || isRangeInvalid ? "not-allowed" : "pointer",
            }}
          >
            {isDownloading ? "Téléchargement en cours..." : "Télécharger le format sélectionné"}
          </button>

          <button
            type="button"
            onClick={() => download("accounting_csv")}
            disabled={isDownloading || isRangeInvalid}
            style={{
              minWidth: 220,
              borderRadius: 12,
              border: "1px solid rgba(16,185,129,.25)",
              background: "rgba(16,185,129,.10)",
              color: "#047857",
              fontWeight: 700,
              padding: "12px 16px",
              cursor: isDownloading || isRangeInvalid ? "not-allowed" : "pointer",
              opacity: isDownloading || isRangeInvalid ? 0.7 : 1,
            }}
          >
            📊 Exporter compta Excel
          </button>

          <span style={{ color: "rgba(11,18,32,.6)", fontSize: 13 }}>
            {getFormatLabel(format)} • {mode === "day" ? day : mode === "month" ? month : `${from} → ${to}`}
          </span>
        </div>
      </div>
    </main>
  );
}

type ModeButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
};

function ModeButton({ active, onClick, icon, label }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "btn-primary" : "btn-secondary"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 110,
        justifyContent: "center",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

type QuickExportCardProps = {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  featured?: boolean;
};

function QuickExportCard({
  title,
  description,
  icon,
  onClick,
  disabled,
  featured = false,
}: QuickExportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 18,
        border: featured
          ? "1px solid rgba(16,185,129,.28)"
          : "1px solid rgba(148,163,184,.18)",
        background: featured ? "rgba(16,185,129,.06)" : "white",
        boxShadow: "0 8px 24px rgba(15,23,42,.05)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: "rgba(11,18,32,.65)" }}>{description}</div>
    </button>
  );
}