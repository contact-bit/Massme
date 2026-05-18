"use client";

import type { Format, Mode } from "./page";


import "./ExportActions.css";

type Props = {
  mode: Mode;
  day: string;
  month: string;
  from: string;
  to: string;
  isDownloading: boolean;
  isRangeInvalid: boolean;
  onDownload: (format: Format) => void;
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
    <section className="exportActions">
      <div className="exportActions-head">
        <h2 className="exportActions-title">Lancer un export</h2>
        <p className="exportActions-subtitle">
          Période sélectionnée : {periodLabel}
        </p>
      </div>

      <div className="exportActions-grid">
        <QuickExportCard
          title="PDF"
          description="Export détaillé"
          onClick={() => onDownload("pdf")}
          disabled={disabled}
          isLoading={isDownloading}
        />

        <QuickExportCard
          title="CSV complet"
          description="Toutes les colonnes"
          onClick={() => onDownload("csv")}
          disabled={disabled}
          isLoading={isDownloading}
        />

        <QuickExportCard
          title="Compta Excel"
          description="Format comptable"
          onClick={() => onDownload("xlsx")} // ✅ FIX ICI
          disabled={disabled}
          featured
          isLoading={isDownloading}
        />
      </div>

      <div className="exportActions-legend">
        <div>
          <strong>PDF</strong> : export lisible et détaillé.
        </div>
        <div>
          <strong>CSV complet</strong> : toutes les colonnes, ouvrable dans Excel.
        </div>
        <div>
          <strong>Compta Excel</strong> : fichier Excel <code>.xlsx</code>,
          modifiable directement.
        </div>
      </div>
    </section>
  );
}

/* ================= CARD ================= */

type QuickExportCardProps = {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  featured?: boolean;
  isLoading?: boolean;
};

function QuickExportCard({
  title,
  description,
  onClick,
  disabled = false,
  featured = false,
  isLoading = false,
}: QuickExportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        featured
          ? "exportQuickCard exportQuickCard--featured"
          : "exportQuickCard"
      }
    >
      <div className="exportQuickCard-title">{title}</div>
      <div className="exportQuickCard-desc">{description}</div>
      <div className="exportQuickCard-cta">
        {isLoading ? "Téléchargement..." : disabled ? "Sélection requise" : "Télécharger"}
      </div>
    </button>
  );
}