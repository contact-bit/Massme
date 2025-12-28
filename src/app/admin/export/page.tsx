"use client";

import { useMemo, useState } from "react";

type Format = "pdf" | "csv";
type Mode = "day" | "month" | "range";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthISO() {
  return new Date().toISOString().slice(0, 7);
}

export default function AdminExportPage() {
  const [mode, setMode] = useState<Mode>("month");
  const [format, setFormat] = useState<Format>("pdf");

  const [day, setDay] = useState(todayISO());
  const [month, setMonth] = useState(monthISO());
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());

  const href = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("format", format);

    if (mode === "day") sp.set("day", day);
    if (mode === "month") sp.set("month", month);
    if (mode === "range") {
      sp.set("from", from);
      sp.set("to", to);
    }

    return `/api/admin/orders/export?${sp.toString()}`;
  }, [mode, format, day, month, from, to]);

  const download = async () => {
    const adminPassword = localStorage.getItem("admin_password");
    if (!adminPassword) {
      alert("Session admin expirée, reconnecte-toi.");
      window.location.href = "/admin/login";
      return;
    }

    const res = await fetch(href, {
      headers: { "x-admin-password": adminPassword },
      cache: "no-store",
    });

    if (!res.ok) {
      alert("Erreur export: " + (await res.text()));
      return;
    }

    const blob = await res.blob();
    const dispo = res.headers.get("content-disposition") || "";
    const match = dispo.match(/filename="([^"]+)"/);
    const filename = match?.[1] || `export.${format}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-page">
      <h1 className="admin-title">📤 Export des commandes</h1>

      <div className="admin-card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <button
            className={`btn-secondary ${mode === "day" ? "btn-primary" : ""}`}
            onClick={() => setMode("day")}
          >
            Jour
          </button>
          <button
            className={`btn-secondary ${mode === "month" ? "btn-primary" : ""}`}
            onClick={() => setMode("month")}
          >
            Mois
          </button>
          <button
            className={`btn-secondary ${mode === "range" ? "btn-primary" : ""}`}
            onClick={() => setMode("range")}
          >
            Plage
          </button>

          <div style={{ flex: 1 }} />

          <select
            className="admin-select"
            style={{ maxWidth: 160 }}
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        {mode === "day" && (
          <div className="admin-field">
            <label className="admin-label">Choisir un jour</label>
            <input className="admin-input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
        )}

        {mode === "month" && (
          <div className="admin-field">
            <label className="admin-label">Choisir un mois</label>
            <input className="admin-input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        )}

        {mode === "range" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="admin-field">
              <label className="admin-label">Du</label>
              <input className="admin-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Au</label>
              <input className="admin-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
          <button className="btn-primary" onClick={download}>
            Télécharger l’export
          </button>
          <span style={{ color: "rgba(11,18,32,.6)", fontSize: 13 }}>
            {format.toUpperCase()} • {mode === "day" ? day : mode === "month" ? month : `${from} → ${to}`}
          </span>
        </div>
      </div>
    </main>
  );
}
