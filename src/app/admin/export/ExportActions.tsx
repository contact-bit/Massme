"use client";

import type { Format, Mode } from "./page";

type Props = {
  mode: Mode;
  day: string;
  month: string;
  from: string;
  to: string;
  isDownloading: boolean;
  isRangeInvalid: boolean;
  onDownload: (format: Format) => void;
  getFormatLabel: (format: Format) => string;
};

export default function ExportActions({
  mode,
  day,
  month,
  from,
  to,
  isDownloading,
  isRangeInvalid,
  onDownload,
}: Props) {
  const periodLabel =
    mode === "day"
      ? day || "Jour non défini"
      : mode === "month"
      ? month || "Mois non défini"
      : `${from || "?"} → ${to || "?"}`;

  const disabledBecauseMissingDate =
    (mode === "day" && !day) ||
    (mode === "month" && !month) ||
    (mode === "range" && (!from || !to));

  const disabled = isDownloading || isRangeInvalid || disabledBecauseMissingDate;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Lancer un export
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Période sélectionnée : {periodLabel}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <QuickExportCard
          title="PDF"
          description="Export détaillé"
          onClick={() => onDownload("pdf")}
          disabled={disabled}
        />

        <QuickExportCard
          title="CSV complet"
          description="Toutes les colonnes"
          onClick={() => onDownload("csv")}
          disabled={disabled}
        />

        <QuickExportCard
          title="Compta Excel"
          description="Format comptable"
          onClick={() => onDownload("accounting_xlsx")}
          disabled={disabled}
          featured
        />
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(248,250,252,.95)",
          border: "1px solid rgba(148,163,184,.18)",
          color: "#475569",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        <div>
          <strong>PDF</strong> : export lisible et détaillé.
        </div>
        <div>
          <strong>CSV complet</strong> : toutes les colonnes, ouvrable dans Excel.
        </div>
        <div>
          <strong>Compta Excel</strong> : vrai fichier Excel `.xlsx`, modifiable
          directement.
        </div>
      </div>
    </section>
  );
}

type QuickExportCardProps = {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  featured?: boolean;
};

function QuickExportCard({
  title,
  description,
  onClick,
  disabled = false,
  featured = false,
}: QuickExportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: "left",
        padding: 18,
        borderRadius: 18,
        border: featured
          ? "1px solid rgba(15,23,42,.18)"
          : "1px solid rgba(148,163,184,.22)",
        background: featured
          ? "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)"
          : "#fff",
        boxShadow: featured
          ? "0 10px 30px rgba(15,23,42,.08)"
          : "0 4px 16px rgba(15,23,42,.04)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "grid",
        gap: 8,
        minHeight: 120,
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          lineHeight: 1.45,
        }}
      >
        {description}
      </div>

      <div
        style={{
          marginTop: "auto",
          fontSize: 13,
          fontWeight: 600,
          color: featured ? "#0f172a" : "#334155",
        }}
      >
        {disabled ? "Indisponible" : "Télécharger"}
      </div>
    </button>
  );
}