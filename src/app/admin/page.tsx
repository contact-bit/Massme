"use client";

import { useEffect, useState } from "react";

type Stats = {
  products: number;
  orders: number;
  paidOrders: number;
  revenue: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    orders: 0,
    paidOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error ?? "Erreur stats");
      setStats(json);
    } catch (e: any) {
      console.error("Erreur Dashboard:", e);
      setError(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();

    // ✅ auto refresh (tu peux enlever si tu veux)
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-page">
      <div className="dashboard-header">
        <h1 className="admin-page-title">📊 Tableau de bord</h1>
        <button className="dashboard-refresh" onClick={loadStats} type="button">
          ↻ Rafraîchir
        </button>
      </div>

      {loading ? <p>Chargement…</p> : null}
      {error ? <p style={{ color: "crimson" }}>❌ {error}</p> : null}

      <div className="dashboard-grid">
        <div className="dashboard-card primary">
          <h3>Produits</h3>
          <p className="dashboard-number">{stats.products}</p>
        </div>

        <div className="dashboard-card">
          <h3>Commandes</h3>
          <p className="dashboard-number">{stats.orders}</p>
        </div>

        <div className="dashboard-card success">
          <h3>Commandes payées</h3>
          <p className="dashboard-number">{stats.paidOrders}</p>
        </div>

        <div className="dashboard-card">
          <h3>Revenu total (€)</h3>
          <p className="dashboard-number">
            {Number(stats.revenue).toFixed(2)}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-quick-actions">
        <h2 className="admin-section-title">Actions rapides</h2>

        <div className="dashboard-actions-grid">
          <a href="/admin/products" className="dashboard-action-btn">
            ➕ Ajouter un produit
          </a>

          <a href="/admin/orders" className="dashboard-action-btn">
            📦 Voir les commandes
          </a>

          <a href="/admin/shipping" className="dashboard-action-btn">
            🚚 Configurer livraisons
          </a>
        </div>
      </div>
    </div>
  );
}
