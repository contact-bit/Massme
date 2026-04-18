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
  const isRangeInvalid = mode === "range" && from && to && from > to;

  function changeMode(next: Mode) {
    setMode(next);

    // reset intelligent (UX propre)
    if (next === "day") {
      setMonth("");
    }

    if (next === "month") {
      setDay("");
    }

    if (next !== "range") {
      setFrom("");
      setTo("");
    }
  }

  return (
    <section className="exportFilters">
      {/* MODES */}
      <div className="exportFilters-modes">
        <ModeButton active={mode === "day"} onClick={() => changeMode("day")} label="Jour" />
        <ModeButton active={mode === "month"} onClick={() => changeMode("month")} label="Mois" />
        <ModeButton active={mode === "range"} onClick={() => changeMode("range")} label="Plage" />
      </div>

      {/* PANEL */}
      <div className="exportFilters-panel">
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
          <div className="exportFilters-range">
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
                className={`admin-input ${
                  isRangeInvalid ? "admin-input--error" : ""
                }`}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ERROR RANGE */}
      {isRangeInvalid && (
        <div className="exportAlert exportAlert--error">
          ⚠️ La date de début ne peut pas être après la date de fin.
        </div>
      )}

      {/* HELP */}
      <p className="exportFilters-help">
        Choisis uniquement la période, puis clique sur le format voulu.
        CSV = données brutes, Excel = fichier comptable, PDF = aperçu lisible.
      </p>
    </section>
  );
}

/* ================= BUTTON ================= */

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
      className={active ? "exportModeBtn exportModeBtn--active" : "exportModeBtn"}
    >
      {label}
    </button>
  );
}