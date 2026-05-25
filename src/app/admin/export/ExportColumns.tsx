"use client";

import "./ExportColumns.css";


type Props = {
  summary: string;
};

export default function ExportColumns({ summary }: Props) {
  return (
    <section>



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