"use client";

import { useEffect, useMemo, useState } from "react";
import { CountryCode, ShippingLocale } from "@/lib/shipping-i18n";
import { COUNTRIES, COUNTRY_TO_LOCALE } from "@/lib/countries";
import AddPaymentMethodForm from "./components/AddPaymentMethodForm";
import EditPaymentMethodModal from "./components/EditPaymentMethodModal";
import type { PaymentMethod } from "./types";

/* ================= HELPERS ================= */
function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && value in COUNTRY_TO_LOCALE;
}

function normalizeCountryCode(value: unknown, fallback: CountryCode = "FR") {
  return isCountryCode(value) ? value : fallback;
}

/* ================= PAGE ================= */
export default function PaymentsAdminPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [activeCountry, setActiveCountry] = useState<CountryCode>("FR");

  const reload = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/payment-methods", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        setMethods([]);
        return;
      }

      const normalized: PaymentMethod[] = (json.methods ?? []).map((m: any) => {
        const country = normalizeCountryCode(m?.country, "FR");

        return {
          id: String(m?.id),
          country,
          name: m?.name ?? {},
          description: m?.description ?? {},
          provider: m?.provider ?? "stripe",
          config: m?.config ?? {},
          isActive: m?.isActive ?? true,
          sortOrder: m?.sortOrder == null ? null : Number(m.sortOrder),
        };
      });

      setMethods(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette méthode de paiement ?")) return;
    await fetch(`/api/admin/payment-methods/${id}`, {
      method: "DELETE",
    });
    reload();
  }

  const filtered = useMemo(() => {
    return methods
      .filter((m) => m.country === activeCountry)
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [methods, activeCountry]);

  return (
    <main className="page">

      {/* HEADER */}
      <div className="header">
        <h1>Paiements</h1>
        <p>Gestion des méthodes de paiement</p>
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
            className={`tab ${activeCountry === c.code ? "active" : ""}`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* CREATE */}
      <section className="section card">

        <AddPaymentMethodForm
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
                        {m.provider.toUpperCase()}
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
                      <EditPaymentMethodModal
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

          background:
            radial-gradient(circle at top, rgba(37,99,235,0.15), transparent 40%),
            #020617;

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
          background: rgba(15,23,42,0.8);
        }

        .muted {
          color: #64748b;
        }

      `}</style>
    </main>
  );
}