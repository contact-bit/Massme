"use client";

import type { Format } from "./page";

type Props = {
  format: Format;
  summary: string;
  href: string;
};

export default function ExportColumns({ format, summary, href }: Props) {
  return (
    <section
      style={{
        display: "grid",
        gap: 14,
        padding: 16,
        borderRadius: 18,
        background: "rgba(255,255,255,.86)",
        border: "1px solid rgba(148,163,184,.18)",
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Aperçu de l’export
        </h2>

        <div
          style={{
            fontSize: 14,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          {summary}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {format === "pdf" && "Export lisible pour consultation ou archivage."}
          {format === "csv" &&
            "Export complet avec toutes les colonnes, ouvrable dans Excel."}
          {format === "accounting_xlsx" &&
            "Export comptable simplifié en vrai fichier Excel modifiable."}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <ColumnCard
          title="Commandes"
          text="Les commandes sont filtrées selon la période choisie."
        />
        <ColumnCard title="Période" text={summary} />
        <ColumnCard
          title="Prévisualisation"
          text={
            href === "#"
              ? "Renseigne une période valide."
              : "Route d’export prête."
          }
        />
      </div>
    </section>
  );
}

type ColumnCardProps = {
  title: string;
  text: string;
};

function ColumnCard({ title, text }: ColumnCardProps) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: "rgba(248,250,252,.85)",
        border: "1px solid rgba(148,163,184,.14)",
        display: "grid",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.45,
        }}
      >
        {text}
      </div>
    </div>
  );
}