"use client";

import { useEffect, useState, useCallback } from "react";

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

    toPrepareCount: number;
    shippedCount: number;

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

  series: {
    day: string;
    revenue: number;
  }[];

  lastOrders: {
    id: string;
    orderNumber?: string;
    status: string;
    total: number;
    email: string;
    createdAt: string | null;
  }[];

  lowStock: {
    id: string;
    name: string;
    stock: number;
  }[];

  alerts: {
    tone: "info" | "warn" | "danger";
    title: string;
    desc: string;
  }[];
};

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<StatsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [err, setErr] =
    useState<string | null>(null);

  /* ================= FETCH ================= */

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(
        "/api/admin/stats",
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error || "Erreur API"
        );
      }

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-page">

        <div className="dash-head">
          <div>
            <h1 className="admin-page-title">
              Dashboard
            </h1>

            <p className="dash-sub">
              Chargement des statistiques...
            </p>
          </div>
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

  /* =========================================================
     ERROR
  ========================================================= */

  if (err || !data) {
    return (
      <div className="admin-page">

        <div className="dash-head">
          <div>
            <h1 className="admin-page-title">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="dash-error">

          <div className="dash-error-title">
            {err}
          </div>

          <button
            className="btn-secondary"
            onClick={refresh}
          >
            Réessayer
          </button>

        </div>

      </div>
    );
  }

  const {
    kpis: k,
    alerts,
    lastOrders,
    lowStock,
    series,
  } = data;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dash-head">

        <div>

          <h1 className="admin-page-title">
            Dashboard
          </h1>

          <p className="dash-sub">
            Vue globale de l’activité
          </p>

        </div>

        <div className="dash-actions">

          <button
            className="btn-secondary"
            onClick={refresh}
          >
            Actualiser
          </button>

          <a
            className="btn-primary"
            href="/admin/orders"
          >
            Commandes
          </a>

        </div>

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {alerts.length > 0 && (
        <div className="dash-alerts">

          {alerts.map((a, i) => (
            <div
              key={i}
              className={`dash-alert tone-${a.tone}`}
            >
              <div className="dash-alert-title">
                {a.title}
              </div>

              <div className="dash-alert-desc">
                {a.desc}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* =====================================================
          KPI
      ===================================================== */}

      <div className="dash-kpis">

        {/* COMMANDES */}
        <div className="dash-card primary">

          <div className="dash-card-top">

            <div className="dash-label">
              Commandes
            </div>

            <a
              href="/admin/orders"
              className="dash-mini-link"
            >
              Voir
            </a>

          </div>

          <div className="dash-value">
            {k.ordersCount}
          </div>

          <div className="dash-foot">
            Total des commandes
          </div>

        </div>

        {/* PAYÉES */}
        <div className="dash-card success">

          <div className="dash-label">
            Payées
          </div>

          <div className="dash-value">
            {k.paidOrdersCount}
          </div>

          <div className="dash-foot">
            Commandes validées
          </div>

        </div>

        {/* EN ATTENTE */}
        <div className="dash-card warning">

          <div className="dash-label">
            En attente
          </div>

          <div className="dash-value">
            {k.pendingCount}
          </div>

          <div className="dash-foot">
            Paiement non validé
          </div>

        </div>

        {/* À PRÉPARER */}
        <div className="dash-card warning">

          <div className="dash-label">
            À préparer
          </div>

          <div className="dash-value">
            {k.toPrepareCount}
          </div>

          <div className="dash-foot">
            Commandes à expédier
          </div>

        </div>

        {/* EXPÉDIÉES */}
        <div className="dash-card success">

          <div className="dash-label">
            Expédiées
          </div>

          <div className="dash-value">
            {k.shippedCount}
          </div>

          <div className="dash-foot">
            Déjà envoyées
          </div>

        </div>

        {/* CA 7J */}
        <div className="dash-card highlight">

          <div className="dash-label">
            CA 7 jours
          </div>

          <div className="dash-value">
            {eur(k.revenueLast7)}
          </div>

          <div className="dash-foot">
            7 derniers jours
          </div>

        </div>

        {/* AUJOURD'HUI */}
        <div className="dash-card">

          <div className="dash-label">
            Aujourd’hui
          </div>

          <div className="dash-value">
            {eur(k.revenueToday)}
          </div>

          <div className="dash-foot">
            Revenus du jour
          </div>

        </div>

        {/* HIER */}
        <div className="dash-card">

          <div className="dash-label">
            Hier
          </div>

          <div className="dash-value">
            {eur(k.revenueYesterday)}
          </div>

          <div className="dash-foot">
            Revenus de la veille
          </div>

        </div>

        {/* PANIER MOYEN */}
        <div className="dash-card">

          <div className="dash-label">
            Panier moyen
          </div>

          <div className="dash-value">
            {eur(k.aov)}
          </div>

          <div className="dash-foot">
            Moyenne par commande
          </div>

        </div>

        {/* PRODUITS */}
        <div className="dash-card">

          <div className="dash-label">
            Produits
          </div>

          <div className="dash-value">
            {k.productsCount}
          </div>

          <div className="dash-foot">
            {k.activeProducts} actifs
          </div>

        </div>

      </div>

      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="dash-grid">

        {/* GRAPH */}
        <div className="dash-panel">

          <div className="dash-panel-head">

            <h2 className="dash-panel-title">
              Revenus
            </h2>

            <div className="dash-panel-meta">
              {eur(k.revenueLast7)}
            </div>

          </div>

          <div
            style={{
              width: "100%",
              height: 280,
            }}
          >

            <ResponsiveContainer>

              <AreaChart data={series}>

                <defs>
                  <linearGradient
                    id="rev"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#6366f1"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  tick={{
                    fill: "#888",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* LAST ORDERS */}
        <div className="dash-panel">

          <div className="dash-panel-head">

            <h2 className="dash-panel-title">
              Dernières commandes
            </h2>

            <a
              href="/admin/orders"
              className="dash-mini-link"
            >
              Tout voir
            </a>

          </div>

          <div className="dash-orders">

            {lastOrders
              .slice(0, 5)
              .map((o) => (
                <div
                  key={o.id}
                  className="dash-row"
                >

                  <div className="mono">
                    {o.orderNumber ||
                      o.id.slice(0, 6)}
                  </div>

                  <div className="truncate">
                    {o.email}
                  </div>

                  <div className="strong">
                    {eur(o.total)}
                  </div>

                  <div className="muted">
                    {shortDate(
                      o.createdAt
                    )}
                  </div>

                </div>
              ))}

          </div>

        </div>

      </div>

      {/* =====================================================
          LOW STOCK
      ===================================================== */}

      {lowStock.length > 0 && (
        <div className="dash-panel">

          <div className="dash-panel-head">

            <h2 className="dash-panel-title">
              Stocks faibles
            </h2>

          </div>

          <div className="dash-lowstock">

            {lowStock
              .slice(0, 8)
              .map((p) => (
                <div
                  key={p.id}
                  className="dash-lowstock-item"
                >

                  <span className="truncate">
                    {p.name}
                  </span>

                  <span className="dash-chip warn">
                    {p.stock}
                  </span>

                </div>
              ))}

          </div>

        </div>
      )}

    </div>
  );
}