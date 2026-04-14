"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Mode } from "./page";

type Props = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  day: string;
  setDay: Dispatch<SetStateAction<string>>;
  month: string;
  setMonth: Dispatch<SetStateAction<string>>;
  from: string;
  setFrom: Dispatch<SetStateAction<string>>;
  to: string;
  setTo: Dispatch<SetStateAction<string>>;
};

export default function ExportFilters({
  mode,
  setMode,
  day,
  setDay,
  month,
  setMonth,
  from,
  setFrom,
  to,
  setTo,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <ModeButton active={mode === "day"} onClick={() => setMode("day")} label="Jour" />
        <ModeButton active={mode === "month"} onClick={() => setMode("month")} label="Mois" />
        <ModeButton active={mode === "range"} onClick={() => setMode("range")} label="Plage" />
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
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        Choisis uniquement la période, puis clique directement sur le format voulu.
        CSV complet télécharge toutes les colonnes, PDF génère l’export détaillé, et
        Compta Excel télécharge un vrai fichier Excel modifiable. Les CSV peuvent aussi
        s’ouvrir dans Excel, mais ce ne sont pas de vrais classeurs `.xlsx`. [web:75][web:76][web:91]
      </div>
    </div>
  );
}

type ModeButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

function ModeButton({ active, onClick, label }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "btn-primary" : "btn-secondary"}
      style={{
        minWidth: 110,
        justifyContent: "center",
      }}
    >
      {label}
    </button>
  );
}