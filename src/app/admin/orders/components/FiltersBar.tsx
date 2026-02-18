"use client";
import React from "react";
import type { LangCode, SortKey, StatusFilter } from "../domain/types";

export function FiltersBar({
  filters,
  onReset,
  onAnyChange,
}: {
  filters: {
    q: string;
    setQ: (v: string) => void;
    qDebounced: string;
    status: StatusFilter;
    setStatus: (v: StatusFilter) => void;
    lang: LangCode | "all";
    setLang: (v: LangCode | "all") => void;
    from: string;
    setFrom: (v: string) => void;
    to: string;
    setTo: (v: string) => void;
    sort: SortKey;
    setSort: (v: SortKey) => void;
  };
  onReset: () => void;
  onAnyChange: () => void;
}) {
  const { q, setQ, qDebounced, status, setStatus, lang, setLang, from, setFrom, to, setTo, sort, setSort } = filters;

  return (
    <div className="card cardPad" style={{ marginTop: 14 }}>
      <div className="filters">
        <div className="field">
          <label>Recherche</label>
          <input
            className="input"
            placeholder="ID, email, produit, ville…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onAnyChange();
            }}
          />
          <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            {q ? `Filtre: “${qDebounced}”` : "Astuce: colle un ID Firestore / Stripe"}
          </div>
        </div>

        <div className="field">
          <label>Statut</label>
          <select
            className="select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              onAnyChange();
            }}
          >
            <option value="all">Tous</option>
            <option value="paid">paid</option>
            <option value="pending_payment">pending_payment</option>
            <option value="refunded">refunded</option>
            <option value="canceled">canceled</option>
            <option value="other">autres</option>
          </select>
        </div>

        <div className="field">
          <label>Langue</label>
          <select
            className="select"
            value={lang}
            onChange={(e) => {
              setLang(e.target.value as LangCode | "all");
              onAnyChange();
            }}
          >
            <option value="all">Toutes</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
            <option value="it">IT</option>
            <option value="nl">NL</option>
          </select>
        </div>

        <div className="field">
          <label>Du</label>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              onAnyChange();
            }}
          />
        </div>

        <div className="field">
          <label>Au</label>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              onAnyChange();
            }}
          />
        </div>

        <div className="field">
          <label>Tri</label>
          <select
            className="select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              onAnyChange();
            }}
          >
            <option value="date_desc">Date (récent → ancien)</option>
            <option value="date_asc">Date (ancien → récent)</option>
            <option value="total_desc">Total (haut → bas)</option>
            <option value="total_asc">Total (bas → haut)</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn--ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
