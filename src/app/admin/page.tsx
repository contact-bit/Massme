"use client";

import { useEffect, useMemo, useState } from "react";
import AdminKpiCard from "./components/AdminKpiCard";
import { AdminState } from "./components/AdminState";

type Payload = {
  kpis: {
    productsCount: number;
    activeProducts: number;
    ordersCount: number;
    paidOrdersCount: number;
    pendingCount: number;
    revenueLast7: number;
    revenuePrev7: number;
    revenueToday: number;
    revenueYesterday: number;
  };
  deltas: {
    revenue7dPct: number;
    revenueDayPct: number;
  };
  series: { day: string; revenue: number }[];
  lastOrders: { id: string; status: string; total: number; email: string; createdAt: string | null }[];
  lowStock: { id: string; name: string; stock: number }[];
  alerts: { tone: "info" | "warn" | "danger"; title: string; desc: string }[];
};

function fmtEUR(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function trendLabel(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

export default function DashboardPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json?.error ?? "Erreur stats");
      setData(json as Payload);
    } catch (e: any) {
      setErr(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const headline = useMemo(() => {
    if (!data) return null;
    const { revenueToday, revenueYesterday } = data.kpis;
    const delta = data.deltas.revenueDayPct;
    return {
      title: "Performance du jour",
      desc: `${fmtEUR(revenueToday)} aujourd’hui • ${trendLabel(delta)} vs hier (${fmtEUR(revenueYesterday)})`,
    };
  }, [data]);

  if (loading) {
    return (
      <AdminState
        title="Chargement du dashboard…"
        desc="Récupération Firestore et calculs des indicateurs."
      />
    );
  }

  if (err) {
    return (
      <AdminState
        title="Impossible de charger le dashboard"
        desc={err}
        action={
          <button className="admin-btn admin-btn-ghost" onClick={load} type="button">
            Réessayer
          </button>
        }
      />
    );
  }

  if (!data) {
    return <AdminState title="Aucune donnée" desc="Pas de statistiques disponibles." />;
  }

  return (
    <div className="dash">
      {/* Header small */}
      <div className="dash-head">
        <div>
          <div className="dash-eyebrow">Vue d’ensemble</div>
          <h2 className="dash-title">{headline?.title}</h2>
          <p className="dash-sub">{headline?.desc}</p>
        </div>

        <div className="dash-actions">
          <button className="admin-btn admin-btn-ghost" onClick={load} type="button">
            Actualiser
          </button>
          <a className="admin-btn admin-btn-ghost" href="/admin/orders">
            Voir les commandes
          </a>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts?.length ? (
        <div className="dash-alerts">
          {data.alerts.map((a, idx) => (
            <div key={idx} className={`dash-alert ${a.tone}`}>
              <div className="dash-alert-title">{a.title}</div>
              <div className="dash-alert-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* KPIs */}
      <div className="dashboard-kpis">
        <AdminKpiCard
          label="Produits"
          value={String(data.kpis.productsCount)}
          sub={`${data.kpis.activeProducts} actif(s)`}
          tone="primary"
        />
        <AdminKpiCard
          label="Commandes"
          value={String(data.kpis.ordersCount)}
          sub={`${data.kpis.pendingCount} à traiter`}
        />
        <AdminKpiCard
          label="Payées"
          value={String(data.kpis.paidOrdersCount)}
          sub={`7j: ${trendLabel(data.deltas.revenue7dPct)} CA`}
          tone="success"
        />
        <AdminKpiCard
          label="CA (7 jours)"
          value={fmtEUR(data.kpis.revenueLast7)}
          sub={`vs prev: ${fmtEUR(data.kpis.revenuePrev7)} (${trendLabel(data.deltas.revenue7dPct)})`}
          tone="primary"
        />
      </div>

      {/* Grid sections */}
      <div className="dash-grid">
        {/* Mini chart (simple bars) */}
        <section className="admin-card dash-panel">
          <div className="dash-panel-head">
            <h3 className="dash-panel-title">CA — 7 derniers jours</h3>
            <div className="dash-panel-meta">Objectif: suivre la tendance</div>
          </div>

          <div className="dash-bars" aria-label="Revenue chart">
            {data.series.map((p) => (
              <div key={p.day} className="dash-bar">
                <div className="dash-bar-top">{fmtEUR(p.revenue)}</div>
                <div
                  className="dash-bar-fill"
                  style={{ height: `${Math.min(100, (p.revenue / Math.max(...data.series.map(s => s.revenue), 1)) * 100)}%` }}
                />
                <div className="dash-bar-label">{p.day.slice(5)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Last orders */}
        <section className="admin-card dash-panel">
          <div className="dash-panel-head">
            <h3 className="dash-panel-title">Dernières commandes</h3>
            <a className="dash-link" href="/admin/orders">
              Ouvrir →
            </a>
          </div>

          {data.lastOrders.length === 0 ? (
            <div className="dash-empty">Aucune commande pour le moment.</div>
          ) : (
            <div className="dash-table">
              <div className="dash-row dash-row-head">
                <div>ID</div>
                <div>Client</div>
                <div>Statut</div>
                <div className="right">Total</div>
              </div>

              {data.lastOrders.map((o) => (
                <div key={o.id} className="dash-row">
                  <div className="mono">{o.id.slice(0, 8)}…</div>
                  <div className="truncate">{o.email || "—"}</div>
                  <div>
                    <span className={`badge ${o.status === "paid" ? "paid" : "pending"}`}>
                      {o.status === "paid" ? "Payée" : "En attente"}
                    </span>
                  </div>
                  <div className="right">{fmtEUR(o.total)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Low stock */}
        <section className="admin-card dash-panel">
          <div className="dash-panel-head">
            <h3 className="dash-panel-title">Stock faible</h3>
            <a className="dash-link" href="/admin/products">
              Gérer →
            </a>
          </div>

          {data.lowStock.length === 0 ? (
            <div className="dash-empty">Aucun produit en stock faible ✅</div>
          ) : (
            <div className="dash-list">
              {data.lowStock.map((p) => (
                <div key={p.id} className="dash-list-item">
                  <div className="truncate">{p.name}</div>
                  <div className={`stock ${p.stock <= 1 ? "danger" : "warn"}`}>
                    {p.stock}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="admin-card dash-panel">
          <div className="dash-panel-head">
            <h3 className="dash-panel-title">Actions rapides</h3>
            <div className="dash-panel-meta">Gagner du temps</div>
          </div>

          <div className="dash-quick">
            <a className="quick" href="/admin/products">➕ Ajouter un produit</a>
            <a className="quick" href="/admin/orders">📦 Traiter les commandes</a>
            <a className="quick" href="/admin/shipping">🚚 Configurer livraisons</a>
          </div>
        </section>
      </div>
    </div>
  );
}
