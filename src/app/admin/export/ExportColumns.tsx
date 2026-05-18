"use client";

import "./ExportColumns.css";


type Props = {
  summary: string;
};

export default function ExportColumns({ summary }: Props) {
  return (
    <section className="exportPreview">
      <div className="exportPreview-head">
        <h2 className="exportPreview-title">Aperçu de l’export</h2>

        <p className="exportPreview-summary">{summary}</p>

        <p className="exportPreview-format">
          Choisis un format : CSV (données complètes), Excel (compta) ou PDF (lecture).
        </p>
      </div>

      <div className="exportPreview-grid">
        <ColumnCard
          title="Commandes"
          text="Les commandes sont filtrées selon la période choisie."
        />
        <ColumnCard title="Période" text={summary} />
        <ColumnCard
          title="Contenu"
          text="Toutes les données (client, montants, TVA, paiement) seront incluses."
        />
      </div>
    </section>
  );
}

/* ================= CARD ================= */

type ColumnCardProps = {
  title: string;
  text: string;
};

function ColumnCard({ title, text }: ColumnCardProps) {
  return (
    <div className="exportPreview-card">
      <div className="exportPreview-cardTitle">{title}</div>
      <div className="exportPreview-cardText">{text}</div>
    </div>
  );
}