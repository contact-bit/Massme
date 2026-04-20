"use client";

import { useEffect, useState } from "react";
import AddMethodForm from "./components/AddMethodForm";
import EditMethodPanel from "./components/EditMethodModal";
import {
  CountryCode,
  ShippingLocale,
} from "@/lib/shipping-i18n";

/* ================= TYPES ================= */
export type ShippingMethod = {
  id: string;
  country: CountryCode;
  name: Partial<Record<ShippingLocale, string>>;
  delay: Partial<Record<ShippingLocale, string>>;
  type: "home" | "relay" | "local_pickup";
  relayProvider?: string | null;
  priceHT: number;
  vatRate: number;
  isActive: boolean;
  sortOrder?: number | null;
};

/* ================= CONST ================= */
const COUNTRIES = [
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "GB", label: "UK", flag: "🇬🇧" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "NL", label: "Pays-Bas", flag: "🇳🇱" },
] as const;

const COUNTRY_TO_LOCALE: Record<CountryCode, ShippingLocale> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  ES: "es",
  IT: "it",
  NL: "nl",
  CH: "fr",
};

export default function ShippingAdminPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [activeCountry, setActiveCountry] =
    useState<CountryCode>("FR");

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/shipping-methods", {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setMethods([]);
        return;
      }

      setMethods(
        json.methods.map((m: any) => ({
          id: m.id,
          country: m.country,
          name: m.name ?? {},
          delay: m.delay ?? {},
          type: m.type || "home",
          relayProvider: m.relayProvider ?? null,
          priceHT: Number(m.priceHT ?? 0),
          vatRate: Number(m.vatRate ?? 0),
          isActive: m.isActive ?? true,
          sortOrder:
            m.sortOrder == null ? null : Number(m.sortOrder),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette méthode ?")) return;
    await fetch(`/api/admin/shipping-methods/${id}`, {
      method: "DELETE",
    });
    reload();
  }

  const filtered = methods
    .filter((m) => m.country === activeCountry)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  return (
    <main className="page">

      {/* HEADER */}
      <div className="header">
        <h1>Livraison</h1>
        <p>Gestion avancée des méthodes</p>
      </div>

      {/* TABS */}
      <div className="tabs">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => {
              setActiveCountry(c.code);
              setEditing(null);
            }}
            className={`tab ${
              activeCountry === c.code ? "active" : ""
            }`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* CREATE */}
      <section className="section card">
        <AddMethodForm
          country={activeCountry}
          onCreated={reload}
        />
      </section>

      {/* LIST */}
      <section className="section">
        <h2>Méthodes</h2>

        {loading ? (
          <p className="muted">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="muted">Aucune méthode</p>
        ) : (
          <div className="list">

            {filtered.map((m) => {
              const locale = COUNTRY_TO_LOCALE[m.country];
              const isOpen = editing?.id === m.id;

              return (
                <div key={m.id} className="wrap">

                  {/* ROW */}
                  <div className={`row ${isOpen ? "active" : ""}`}>

                    <div
                      className="left"
                      onClick={() =>
                        setEditing(isOpen ? null : m)
                      }
                    >
                      <div className="top">
                        <span className="name">
                          {m.name?.[locale] || "—"}
                        </span>

                        {!m.isActive && (
                          <span className="badge">OFF</span>
                        )}
                      </div>

                      <div className="bottom">
                        {m.priceHT.toFixed(2)}€ HT • TVA {m.vatRate}%
                        {m.sortOrder != null && (
                          <span> • #{m.sortOrder}</span>
                        )}
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        onClick={() =>
                          setEditing(isOpen ? null : m)
                        }
                        className="btn ghost"
                      >
                        {isOpen ? "Fermer" : "Modifier"}
                      </button>

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="btn danger"
                      >
                        Supprimer
                      </button>
                    </div>

                  </div>

                  {/* INLINE EDIT */}
                  {isOpen && (
                    <div className="edit">
                      <EditMethodPanel
                        data={m}
                        onClose={() => setEditing(null)}
                        onSaved={reload}
                      />
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* STYLE */}
      <style jsx>{`

        .page {
          padding: 40px;
          max-width: 1000px;
          margin: auto;
          color: white;



          min-height: 100vh;
        }

        h1 {
          font-size: 32px;
        }

        h2 {
          font-size: 18px;
          margin-bottom: 12px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        .tab {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
        }

        .tab.active {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
        }

        .section {
          margin-top: 30px;
        }

        .card {
          padding: 20px;
          border-radius: 16px;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .row.active {
          border-color: #3b82f6;
        }

        .name {
          font-weight: 600;
        }

        .bottom {
          font-size: 12px;
          color: #94a3b8;
        }

        .badge {
          margin-left: 8px;
          font-size: 11px;
          color: #f87171;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 6px 10px;
          border-radius: 8px;
        }

        .ghost {
          background: rgba(255,255,255,0.05);
        }

        .danger {
          background: rgba(239,68,68,0.2);
          color: #f87171;
        }

        .edit {
          padding: 16px;
          border-radius: 14px;
        }

        .muted {
          color: #64748b;
        }

      `}</style>
    </main>
  );
}