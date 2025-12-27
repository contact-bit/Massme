"use client";

import { useEffect, useMemo, useState } from "react";

type StatsResponse = {
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
    aov: number;
  };
  deltas: {
    revenue7dPct: number;
    revenueDayPct: number;
  };
  series: { day: string; revenue: number }[];
  lastOrders: {
    id: string;
    status: string;
    total: number;
    email: string;
    createdAt: string | null;
  }[];
  lowStock: { id: string; name: string; stock: number }[];
  alerts: { tone: "info" | "warn" | "danger"; title: string; desc: string }[];
};

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function shortDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function deltaLabel(current: number, previous: number, pct: number) {
  if (previous === 0 && current > 0) return { text: "Nouveau", tone: "pos" as const };
  if (pct === 0) return { text: "0%", tone: "neu" as const };
  if (pct > 0) return { text: `+${pct.toFixed(1)}%`, tone: "pos" as const };
  return { text: `${pct.toFixed(1)}%`, tone: "neg" as const };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error ?? "Erreur stats");
        }

        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Erreur inconnue");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const maxRevenue = useMemo(() => {
    const max = Math.max(...(data?.series?.map((s) => s.revenue) ?? [0]));
    return max <= 0 ? 1 : max;
  }, [data]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="dash-head">
          <h1 className="admin-title">📊 Dashboard</h1>
          <p className="dash-sub">Chargement…</p>
        </div>
        <div className="dash-skeleton-grid">
          <div className="dash-skel" />
          <div className="dash-skel" />
          <div className="dash-skel" />
          <div className="dash-skel" />
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="admin-page">
        <div className="dash-head">
          <h1 className="admin-title">📊 Dashboard</h1>
          <p className="dash-sub">Impossible de charger les stats.</p>
        </div>

        <div className="dash-error">
          <div className="dash-error-title">Erreur</div>
          <div className="dash-error-msg">{err ?? "—"}</div>
          <button className="btn-primary" onClick={() => location.reload()}>
            Recharger
          </button>
        </div>
      </div>
    );
  }

  const d7 = deltaLabel(data.kpis.revenueLast7, data.kpis.revenuePrev7, data.deltas.revenue7dPct);
  const dd = deltaLabel(data.kpis.revenueToday, data.kpis.revenueYesterday, data.deltas.revenueDayPct);

  return (
    <div className="admin-page">
      <div className="dash-head">
        <div>
          <h1 className="admin-title">📊 Dashboard</h1>
          <p className="dash-sub">Vue rapide sur ton activité (Europe/Paris).</p>
        </div>

        <div className="dash-actions">
          <button className="btn-secondary" onClick={() => location.reload()}>
            Actualiser
          </button>
          <a className="btn-primary" href="/admin/orders">
            Voir commandes
          </a>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts?.length > 0 && (
        <div className="dash-alerts">
          {data.alerts.map((a, i) => (
            <div key={i} className={`dash-alert tone-${a.tone}`}>
              <div className="dash-alert-title">{a.title}</div>
              <div className="dash-alert-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="dash-kpis">
        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">Produits</span>
            <span className="dash-chip">{data.kpis.activeProducts}/{data.kpis.productsCount} actifs</span>
          </div>
          <div className="dash-value">{data.kpis.productsCount}</div>
          <div className="dash-foot">Catalogue total</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">Commandes</span>
            {data.kpis.pendingCount > 0 ? (
              <span className="dash-chip warn">{data.kpis.pendingCount} en attente</span>
            ) : (
              <span className="dash-chip ok">Tout OK</span>
            )}
          </div>
          <div className="dash-value">{data.kpis.ordersCount}</div>
          <div className="dash-foot">{data.kpis.paidOrdersCount} payée(s)</div>
        </div>

        <div className="dash-card highlight">
          <div className="dash-card-top">
            <span className="dash-label">CA (7 jours)</span>
            <span className={`dash-badge ${d7.tone}`}>{d7.text}</span>
          </div>
          <div className="dash-value">{eur(data.kpis.revenueLast7)}</div>
          <div className="dash-foot">AOV: {eur(data.kpis.aov)}</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">CA (aujourd’hui)</span>
            <span className={`dash-badge ${dd.tone}`}>{dd.text}</span>
          </div>
          <div className="dash-value">{eur(data.kpis.revenueToday)}</div>
          <div className="dash-foot">Hier: {eur(data.kpis.revenueYesterday)}</div>
        </div>
      </div>

      {/* Grid main */}
      <div className="dash-grid">
        {/* Chart */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Revenu — 7 derniers jours</h2>
            <div className="dash-panel-meta">{eur(data.kpis.revenueLast7)}</div>
          </div>

          <div className="dash-chart">
            {data.series.map((s) => {
              const h = Math.round((s.revenue / maxRevenue) * 100);
              return (
                <div key={s.day} className="dash-bar">
                  <div className="dash-bar-col">
                    <div className="dash-bar-fill" style={{ height: `${h}%` }} />
                  </div>
                  <div className="dash-bar-day">{s.day.slice(5)}</div>
                  <div className="dash-bar-val">{s.revenue > 0 ? eur(s.revenue) : ""}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last orders */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Dernières commandes</h2>
            <a className="dash-link" href="/admin/orders">
              Ouvrir →
            </a>
          </div>

          <div className="dash-table">
            <div className="dash-row dash-row-head">
              <div>ID</div>
              <div>Client</div>
              <div>Statut</div>
              <div>Montant</div>
              <div>Date</div>
            </div>

            {data.lastOrders.length === 0 ? (
              <div className="dash-empty">Aucune commande.</div>
            ) : (
              data.lastOrders.map((o) => (
                <div key={o.id} className="dash-row">
                  <div className="mono">{o.id.slice(0, 6)}…</div>
                  <div className="truncate">{o.email || "—"}</div>
                  <div>
                    <span className={`status-pill ${o.status === "paid" ? "paid" : "pending"}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="strong">{eur(o.total)}</div>
                  <div className="muted">{shortDate(o.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low stock */}
      {data.lowStock?.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Stock faible</h2>
            <a className="dash-link" href="/admin/products">
              Gérer →
            </a>
          </div>

          <div className="dash-lowstock">
            {data.lowStock.map((p) => (
              <div key={p.id} className="dash-lowstock-item">
                <div className="truncate">{p.name}</div>
                <div className="dash-chip warn">stock {p.stock}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
