"use client";

import "./exportFilters.css";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Mode,
} from "./page";

import {
  FiCalendar,
  FiClock,
  FiLayers,
  FiInfo,
} from "react-icons/fi";

type Props = {
  mode: Mode;

  setMode:
    Dispatch<
      SetStateAction<Mode>
    >;

  day: string;

  setDay:
    Dispatch<
      SetStateAction<string>
    >;

  month: string;

  setMonth:
    Dispatch<
      SetStateAction<string>
    >;

  from: string;

  setFrom:
    Dispatch<
      SetStateAction<string>
    >;

  to: string;

  setTo:
    Dispatch<
      SetStateAction<string>
    >;
};

/* =====================================================
   COMPONENT
===================================================== */

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

  const isRangeInvalid =
    mode ===
      "range" &&
    from &&
    to &&
    from > to;

  /* =====================================================
     CHANGE MODE
  ===================================================== */

  function changeMode(
    next: Mode
  ) {

    setMode(
      next
    );

    if (
      next ===
      "day"
    ) {

      setMonth("");

    }

    if (
      next ===
      "month"
    ) {

      setDay("");

    }

    if (
      next !==
      "range"
    ) {

      setFrom("");
      setTo("");

    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="export-filters">

      {/* HEADER */}

      <div className="export-filters-head">

        <div>

          <h3 className="export-filters-title">
            Période d’export
          </h3>

          <p className="export-filters-subtitle">
            Sélectionnez une
            période précise
            pour générer votre
            export.
          </p>

        </div>

      </div>

      {/* MODES */}

      <div className="export-modes">

        <ModeButton
          active={
            mode ===
            "day"
          }
          onClick={() =>
            changeMode(
              "day"
            )
          }
          label="Jour"
          icon={
            <FiCalendar />
          }
        />

        <ModeButton
          active={
            mode ===
            "month"
          }
          onClick={() =>
            changeMode(
              "month"
            )
          }
          label="Mois"
          icon={
            <FiClock />
          }
        />

        <ModeButton
          active={
            mode ===
            "range"
          }
          onClick={() =>
            changeMode(
              "range"
            )
          }
          label="Plage"
          icon={
            <FiLayers />
          }
        />

      </div>

      {/* PANEL */}

      <div className="export-panel">

        {mode ===
          "day" && (
          <div className="export-field">

            <label className="export-label">
              Choisir un jour
            </label>

            <input
              className="export-input"
              type="date"
              value={day}
              onChange={(
                e
              ) =>
                setDay(
                  e.target
                    .value
                )
              }
            />

          </div>
        )}

        {mode ===
          "month" && (
          <div className="export-field">

            <label className="export-label">
              Choisir un mois
            </label>

            <input
              className="export-input"
              type="month"
              value={month}
              onChange={(
                e
              ) =>
                setMonth(
                  e.target
                    .value
                )
              }
            />

          </div>
        )}

        {mode ===
          "range" && (
          <div className="export-range">

            <div className="export-field">

              <label className="export-label">
                Date de début
              </label>

              <input
                className="export-input"
                type="date"
                value={from}
                onChange={(
                  e
                ) =>
                  setFrom(
                    e.target
                      .value
                  )
                }
              />

            </div>

            <div className="export-field">

              <label className="export-label">
                Date de fin
              </label>

              <input
                className={
                  isRangeInvalid
                    ? "export-input export-input-error"
                    : "export-input"
                }
                type="date"
                value={to}
                onChange={(
                  e
                ) =>
                  setTo(
                    e.target
                      .value
                  )
                }
              />

            </div>

          </div>
        )}

      </div>

      {/* ERROR */}

      {isRangeInvalid && (
        <div className="export-alert export-alert-error">
          ⚠️ La date de début
          ne peut pas être
          après la date de fin.
        </div>
      )}

      {/* HELP */}

      <div className="export-help">

        <div className="export-help-icon">
          <FiInfo />
        </div>

        <p>
          CSV = données
          brutes,
          XLSX = comptabilité,
          PDF = aperçu lisible
          prêt à imprimer.
        </p>

      </div>

    </section>
  );
}

/* =====================================================
   MODE BUTTON
===================================================== */

type ModeButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
};

function ModeButton({
  active,
  onClick,
  label,
  icon,
}: ModeButtonProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "export-mode-btn active"
          : "export-mode-btn"
      }
    >

      <span className="export-mode-btn-icon">
        {icon}
      </span>

      <span>
        {label}
      </span>

    </button>
  );
}