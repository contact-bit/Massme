"use client";

import {
  useMemo,
  useState,
} from "react";

import ExportFilters from "./ExportFilters";
import ExportActions from "./ExportActions";
import ExportColumns from "./ExportColumns";

import "./export.css";

export type Format =
  | "pdf"
  | "csv"
  | "xlsx";

export type Mode =
  | "day"
  | "month"
  | "range";

/* =====================================================
   HELPERS
===================================================== */

function localDateISO(
  date = new Date()
) {

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset * 60_000
    );

  return local
    .toISOString()
    .slice(0, 10);
}

function localMonthISO(
  date = new Date()
) {

  return localDateISO(
    date
  ).slice(0, 7);
}

function buildExportLabel(
  mode: Mode,
  day: string,
  month: string,
  from: string,
  to: string
) {

  if (
    mode === "day"
  ) {
    return `Jour sélectionné : ${day}`;
  }

  if (
    mode === "month"
  ) {
    return `Mois sélectionné : ${month}`;
  }

  return `Période : ${from} → ${to}`;
}

/* =====================================================
   PAGE
===================================================== */

export default function AdminExportPage() {

  const [mode, setMode] =
    useState<Mode>(
      "month"
    );

  const [day, setDay] =
    useState(
      localDateISO()
    );

  const [
    month,
    setMonth,
  ] =
    useState(
      localMonthISO()
    );

  const [from, setFrom] =
    useState(
      localDateISO()
    );

  const [to, setTo] =
    useState(
      localDateISO()
    );

  const [
    isDownloading,
    setIsDownloading,
  ] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  /* =====================================================
     RANGE VALIDATION
  ===================================================== */

  const isRangeInvalid =
    mode ===
      "range" &&
    (!!from &&
    !!to
      ? from > to
      : false);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary =
    useMemo(
      () =>
        buildExportLabel(
          mode,
          day,
          month,
          from,
          to
        ),
      [
        mode,
        day,
        month,
        from,
        to,
      ]
    );

  /* =====================================================
     STATS
  ===================================================== */

  const stats =
    useMemo(
      () => {

        if (
          mode ===
          "day"
        ) {
          return {
            title:
              "Export journalier",
            value:
              day,
          };
        }

        if (
          mode ===
          "month"
        ) {
          return {
            title:
              "Export mensuel",
            value:
              month,
          };
        }

        return {
          title:
            "Export personnalisé",
          value: `${from} → ${to}`,
        };

      },
      [
        mode,
        day,
        month,
        from,
        to,
      ]
    );

  /* =====================================================
     BUILD URL
  ===================================================== */

  function buildHref(
    format: Format
  ) {

    const sp =
      new URLSearchParams();

    sp.set(
      "format",
      format
    );

    if (
      mode === "day"
    ) {

      if (!day) {

        throw new Error(
          "Choisis un jour avant de lancer l’export."
        );

      }

      sp.set(
        "day",
        day
      );
    }

    if (
      mode === "month"
    ) {

      if (!month) {

        throw new Error(
          "Choisis un mois avant de lancer l’export."
        );

      }

      sp.set(
        "month",
        month
      );
    }

    if (
      mode === "range"
    ) {

      if (
        !from ||
        !to
      ) {

        throw new Error(
          "Choisis une date de début et une date de fin."
        );

      }

      if (
        from > to
      ) {

        throw new Error(
          "La date de début ne peut pas être après la date de fin."
        );

      }

      sp.set(
        "from",
        from
      );

      sp.set(
        "to",
        to
      );
    }

    return `/api/admin/orders/export?${sp.toString()}`;
  }

  /* =====================================================
     DOWNLOAD
  ===================================================== */

  async function download(
    format: Format
  ) {

    setError("");
    setSuccess("");

    try {

      const finalHref =
        buildHref(
          format
        );

      setIsDownloading(
        true
      );

      const res =
        await fetch(
          finalHref,
          {
            cache:
              "no-store",
          }
        );

      if (!res.ok) {

        let message =
          "Échec de l’export.";

        try {

          const data =
            await res.json();

          message =
            data?.message ||
            data?.error ||
            message;

        } catch {

          try {

            message =
              await res.text();

          } catch {}

        }

        setError(
          `Erreur export : ${message}`
        );

        return;
      }

      const blob =
        await res.blob();

      if (
        !blob ||
        blob.size === 0
      ) {

        setError(
          "Le fichier généré est vide."
        );

        return;
      }

      const dispo =
        res.headers.get(
          "content-disposition"
        ) || "";

      const match =
        dispo.match(
          /filename\*=UTF-8''([^;]+)/i
        ) ||
        dispo.match(
          /filename="?([^"]+)"?/i
        );

      const filename =
        match?.[1]
          ? decodeURIComponent(
              match[1]
            )
          : format ===
            "pdf"
          ? "export.pdf"
          : format ===
            "csv"
          ? "export.csv"
          : "export.xlsx";

      const url =
        URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;

      a.download =
        filename;

      document.body.appendChild(
        a
      );

      a.click();

      a.remove();

      setTimeout(
        () =>
          URL.revokeObjectURL(
            url
          ),
        1000
      );

      setSuccess(
        `Export téléchargé : ${filename}`
      );

      setTimeout(
        () =>
          setSuccess(
            ""
          ),
        4000
      );

    } catch (e: any) {

      console.error(
        e
      );

      setError(
        e?.message ||
          "Une erreur inattendue est survenue pendant le téléchargement."
      );

    } finally {

      setIsDownloading(
        false
      );

    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="export-page">

      
      {/* MAIN CARD */}
      <section className="export-card">


        {/* FILTERS */}
        <div className="export-block">

          <ExportFilters
            mode={mode}
            setMode={setMode}
            day={day}
            setDay={setDay}
            month={month}
            setMonth={setMonth}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
          />

        </div>

        {/* SUMMARY */}
        <div className="export-summary">

          <div className="export-summary-icon">
            ⏺
          </div>

          <div className="export-summary-content">

            <strong>
              {
                stats.title
              }
            </strong>

            <span>
              {summary}
            </span>

          </div>

        </div>

        {/* COLUMNS */}
        <div className="export-columns-wrap">

          <ExportColumns
            summary={
              summary
            }
          />

        </div>

        {/* ALERTS */}
        {error && (
          <div className="export-alert export-alert-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="export-alert export-alert-success">
            ✅ {success}
          </div>
        )}

        {/* ACTIONS */}
        <div className="export-actions-wrap">

          <ExportActions
            mode={mode}
            day={day}
            month={month}
            from={from}
            to={to}
            isDownloading={
              isDownloading
            }
            isRangeInvalid={
              isRangeInvalid
            }
            onDownload={
              download
            }
          />

        </div>

      </section>

    </main>
  );
}
