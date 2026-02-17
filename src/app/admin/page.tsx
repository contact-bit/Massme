"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

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

function eur(n: number | null | undefined): string {
  const v = typeof n === "number" && !isNaN(n) ? n : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
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
  const c = current || 0;
  const p = previous || 0;
  const r = pct || 0;

  if (p === 0 && c > 0) return { text: "Nouveau", tone: "pos" as const };
  if (r === 0) return { text: "0%", tone: "neu" as const };
  if (r > 0) return { text: `+${r.toFixed(1)}%`, tone: "pos" as const };
  return { text: `${r.toFixed(1)}%`, tone: "neg" as const };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    let alive = true;
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/admin/stats", { 
        cache: "no-store",
        headers: { "X-Refresh": Date.now().toString() }
      });
      const json = await res.json();

      console.log("📊 API Response:", { ok: res.ok, status: res.status, data: json });

      if (!res.ok) {
        throw new Error(json?.error ?? `Erreur HTTP ${res.status}`);
      }

      if (!json || typeof json !== "object") {
        throw new Error("Réponse invalide");
      }

      if (alive) setData(json as StatsResponse);
    } catch (e: any) {
      console.error("Dashboard error:", e);
      if (alive) setErr(e?.message ?? "Erreur inconnue");
    } finally {
      if (alive) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const maxRevenue = useMemo(() => {
    const series = Array.isArray(data?.series) ? data!.series : [];
    const values = series.map((s) => s.revenue || 0);
    const max = Math.max(...values, 1);
    return max;
  }, [data]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="dash-head">
          <h1 className="admin-title">📊 Dashboard</h1>
          <p className="dash-sub">Chargement des stats…</p>
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
          <p className="dash-sub">Erreur de chargement</p>
        </div>
        <div className="dash-error">
          <div className="dash-error-title">❌ {err ?? "Données indisponibles"}</div>
          <div className="dash-error-msg">
            Vérifiez les logs console et Firestore.
          </div>
          <div className="dash-error-actions">
            <button className="btn-secondary" onClick={refresh}>
              🔄 Réessayer
            </button>
            <button className="btn-primary" onClick={() => location.reload()}>
              Reload complet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const k = data.kpis || ({} as StatsResponse["kpis"]);
  const deltas = data.deltas || ({} as StatsResponse["deltas"]);
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];
  const lastOrders = Array.isArray(data.lastOrders) ? data.lastOrders : [];
  const lowStock = Array.isArray(data.lowStock) ? data.lowStock : [];

  const d7 = deltaLabel(k.revenueLast7 ?? 0, k.revenuePrev7 ?? 0, deltas.revenue7dPct ?? 0);
  const dd = deltaLabel(k.revenueToday ?? 0, k.revenueYesterday ?? 0, deltas.revenueDayPct ?? 0);

  return (
    <div className="admin-page">
      <div className="dash-head">
        <div>
          <h1 className="admin-title">📊 Dashboard</h1>
          <p className="dash-sub">
            {k.ordersCount ?? 0} commandes • {eur(k.revenueLast7)} (7j)
          </p>
        </div>
        <div className="dash-actions">
          <button className="btn-secondary" onClick={refresh}>
            🔄 Actualiser
          </button>
          <a className="btn-primary" href="/admin/orders">
            Commandes →
          </a>
        </div>
      </div>

      {/* Alerts */}
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

      {/* KPI Cards */}
      <div className="dash-kpis">
        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">Produits</span>
            <span className="dash-chip">
              {k.activeProducts}/{k.productsCount} actifs
            </span>
          </div>
          <div className="dash-value">{k.productsCount}</div>
          <div className="dash-foot">Total catalogue</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">Commandes</span>
            {k.pendingCount > 0 ? (
              <span className="dash-chip warn">{k.pendingCount} attente</span>
            ) : (
              <span className="dash-chip ok">✅ Tout OK</span>
            )}
          </div>
          <div className="dash-value">{k.ordersCount}</div>
          <div className="dash-foot">{k.paidOrdersCount} payée(s)</div>
        </div>

        <div className="dash-card highlight">
          <div className="dash-card-top">
            <span className="dash-label">CA 7 jours</span>
            <span className={`dash-badge ${d7.tone}`}>{d7.text}</span>
          </div>
          <div className="dash-value">{eur(k.revenueLast7)}</div>
          <div className="dash-foot">AOV: {eur(k.aov)}</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <span className="dash-label">CA aujourd'hui</span>
            <span className={`dash-badge ${dd.tone}`}>{dd.text}</span>
          </div>
          <div className="dash-value">{eur(k.revenueToday)}</div>
          <div className="dash-foot">Hier: {eur(k.revenueYesterday)}</div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="dash-grid">
        {/* Graphique revenus */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Revenus — 7 jours</h2>
            <div className="dash-panel-meta">{eur(k.revenueLast7)}</div>
          </div>
          <div className="dash-chart">
            {data.series.map((s) => {
              const h = Math.round(((s.revenue || 0) / maxRevenue) * 100);
              return (
                <div key={s.day} className="dash-bar">
                  <div className="dash-bar-col">
                    <div
                      className="dash-bar-fill"
                      style={{ height: `${h}%` }}
                      title={`${eur(s.revenue)}`}
                    />
                  </div>
                  <div className="dash-bar-day">{s.day.slice(5)}</div>
                  <div className="dash-bar-val">
                    {s.revenue > 0 ? eur(s.revenue) : "0€"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Dernières commandes</h2>
            <a className="dash-link" href="/admin/orders">Voir tout →</a>
          </div>
          <div className="dash-table">
            <div className="dash-row dash-row-head">
              <div>ID</div>
              <div>Client</div>
              <div>Statut</div>
              <div>Montant</div>
              <div>Date</div>
            </div>
            {lastOrders.length === 0 ? (
              <div className="dash-empty">Aucune commande récente</div>
            ) : (
              lastOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="dash-row">
                  <div className="mono">{o.id.slice(0, 6)}…</div>
                  <div className="truncate">{o.email || "—"}</div>
                  <div>
                    <span
                      className={`status-pill ${
                        o.status === "paid" ? "paid" : "pending"
                      }`}
                    >
                      {o.status === "paid" ? "✅ Payé" : "⏳ Attente"}
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

      {/* Stocks faibles */}
      {lowStock.length > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">⚠️ Stocks faibles</h2>
            <a className="dash-link" href="/admin/products">Gérer →</a>
          </div>
          <div className="dash-lowstock">
            {lowStock.slice(0, 8).map((p) => (
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
