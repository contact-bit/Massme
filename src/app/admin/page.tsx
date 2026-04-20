"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

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
    orderNumber?: string;
    status: string;
    total: number;
    email: string;
    createdAt: string | null;
  }[];
  lowStock: { id: string; name: string; stock: number }[];
  alerts: { tone: "info" | "warn" | "danger"; title: string; desc: string }[];
};

function eur(n?: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n ?? 0);
}

function shortDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Erreur API");

      setData(json);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Dashboard</h1>
        <div className="dash-skeleton-grid">
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
        <h1 className="admin-page-title">Dashboard</h1>

        <div className="dash-error">
          <div className="dash-error-title">{err}</div>
          <button className="btn-secondary" onClick={refresh}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { kpis: k, alerts, lastOrders, lowStock, series } = data;

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="dash-head">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="dash-sub">
            {k.ordersCount} commandes • {eur(k.revenueLast7)}
          </p>
        </div>

        <div className="dash-actions">
          <button className="btn-secondary" onClick={refresh}>
            Actualiser
          </button>
          <a className="btn-primary" href="/admin/orders">
            Commandes
          </a>
        </div>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="dash-alerts">
          {alerts.map((a, i) => (
            <div key={i} className={`dash-alert tone-${a.tone}`}>
              <div className="dash-alert-title">{a.title}</div>
              <div className="dash-alert-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* KPI */}
      <div className="dash-kpis">
        <div className="dash-card">
          <div className="dash-label">Produits</div>
          <div className="dash-value">{k.productsCount}</div>
          <div className="dash-foot">{k.activeProducts} actifs</div>
        </div>

        <div className="dash-card">
          <div className="dash-label">Commandes</div>
          <div className="dash-value">{k.ordersCount}</div>
          <div className="dash-foot">{k.pendingCount} en attente</div>
        </div>

        <div className="dash-card highlight">
          <div className="dash-label">CA 7 jours</div>
          <div className="dash-value">{eur(k.revenueLast7)}</div>
          <div className="dash-foot">Panier moyen: {eur(k.aov)}</div>
        </div>

        <div className="dash-card">
          <div className="dash-label">Aujourd’hui</div>
          <div className="dash-value">{eur(k.revenueToday)}</div>
          <div className="dash-foot">Hier: {eur(k.revenueYesterday)}</div>
        </div>
      </div>

      {/* GRID */}
      <div className="dash-grid">

        {/* GRAPH */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Revenus</h2>
            <div className="dash-panel-meta">{eur(k.revenueLast7)}</div>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  tick={{ fill: "#888", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LAST ORDERS */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Dernières commandes</h2>
          </div>

          {lastOrders.slice(0, 5).map((o) => (
            <div key={o.id} className="dash-row">
              <div className="mono">
                {o.orderNumber || o.id.slice(0, 6)}
              </div>
              <div className="truncate">{o.email}</div>
              <div className="strong">{eur(o.total)}</div>
              <div className="muted">{shortDate(o.createdAt)}</div>
            </div>
          ))}
        </div>

      </div>

      {/* STOCK */}
      {lowStock.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Stocks faibles</h2>
          </div>

          <div className="dash-lowstock">
            {lowStock.slice(0, 8).map((p) => (
              <div key={p.id} className="dash-lowstock-item">
                <span className="truncate">{p.name}</span>
                <span className="dash-chip warn">{p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}