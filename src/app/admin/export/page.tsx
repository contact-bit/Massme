"use client";

import { useMemo, useState } from "react";
import ExportFilters from "./ExportFilters";
import ExportActions from "./ExportActions";
import ExportColumns from "./ExportColumns";

export type Format = "pdf" | "csv" | "accounting_xlsx";
export type Mode = "day" | "month" | "range";

function localDateISO(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function localMonthISO(date = new Date()) {
  return localDateISO(date).slice(0, 7);
}

function buildExportLabel(
  mode: Mode,
  day: string,
  month: string,
  from: string,
  to: string
) {
  if (mode === "day") return `Jour sélectionné : ${day}`;
  if (mode === "month") return `Mois sélectionné : ${month}`;
  return `Période : ${from} → ${to}`;
}

function getFormatLabel(format: Format) {
  if (format === "pdf") return "PDF";
  if (format === "csv") return "CSV complet";
  return "Compta Excel";
}

export default function AdminExportPage() {
  const [mode, setMode] = useState<Mode>("month");

  const [day, setDay] = useState(localDateISO());
  const [month, setMonth] = useState(localMonthISO());
  const [from, setFrom] = useState(localDateISO());
  const [to, setTo] = useState(localDateISO());

  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRangeInvalid =
    mode === "range" && (!!from && !!to ? from > to : false);

  function buildHref(format: Format) {
    const sp = new URLSearchParams();
    sp.set("format", format);

    if (mode === "day") {
      if (!day) throw new Error("Choisis un jour avant de lancer l’export.");
      sp.set("day", day);
    }

    if (mode === "month") {
      if (!month) throw new Error("Choisis un mois avant de lancer l’export.");
      sp.set("month", month);
    }

    if (mode === "range") {
      if (!from || !to) {
        throw new Error("Choisis une date de début et une date de fin.");
      }
      if (from > to) {
        throw new Error("La date de début ne peut pas être après la date de fin.");
      }
      sp.set("from", from);
      sp.set("to", to);
    }

    return `/api/admin/orders/export?${sp.toString()}`;
  }

  const previewHref = useMemo(() => {
    try {
      return buildHref("pdf");
    } catch {
      return "#";
    }
  }, [mode, day, month, from, to]);

  async function download(format: Format) {
    setError("");
    setSuccess("");

    try {
      const adminPassword = localStorage.getItem("admin_password");
      if (!adminPassword) {
        alert("Session admin expirée, reconnecte-toi.");
        window.location.href = "/admin/login";
        return;
      }

      const finalHref = buildHref(format);
      setIsDownloading(true);

      const res = await fetch(finalHref, {
        headers: { "x-admin-password": adminPassword },
        cache: "no-store",
      });

      if (!res.ok) {
        let message = "Échec de l’export.";
        try {
          const data = await res.json();
          message = data?.message || data?.error || message;
        } catch {
          try {
            message = await res.text();
          } catch {}
        }
        setError(`Erreur export : ${message}`);
        return;
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        setError("Le fichier généré est vide.");
        return;
      }

      const dispo = res.headers.get("content-disposition") || "";
      const match =
        dispo.match(/filename\*=UTF-8''([^;]+)/i) ||
        dispo.match(/filename="?([^"]+)"?/i);

      const filename =
        match?.[1]
          ? decodeURIComponent(match[1])
          : format === "pdf"
          ? "export.pdf"
          : format === "csv"
          ? "export.csv"
          : "accounting_export.xlsx";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSuccess(`Export téléchargé avec succès : ${filename}`);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message || "Une erreur inattendue est survenue pendant le téléchargement."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  const summary = buildExportLabel(mode, day, month, from, to);

  return (
    <main className="admin-page" style={{ paddingBottom: 40 }}>
      <div className="admin-card" style={{ display: "grid", gap: 18 }}>
        <div>
          <h1 className="admin-title" style={{ marginBottom: 6 }}>
            Export des commandes
          </h1>
          <p style={{ margin: 0, color: "rgba(11,18,32,.68)" }}>
            Choisis la période puis clique directement sur le format voulu.
          </p>
        </div>

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

        <ExportColumns format="pdf" summary={summary} href={previewHref} />

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

        <ExportActions
          mode={mode}
          day={day}
          month={month}
          from={from}
          to={to}
          isDownloading={isDownloading}
          isRangeInvalid={isRangeInvalid}
          onDownload={download}
          getFormatLabel={getFormatLabel}
        />
      </div>
    </main>
  );
}