"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  useEffect(() => {
    async function loadStats() {
      try {
        // -----------------------------------------
        // 🔵 PRODUITS
        // -----------------------------------------
        const productsSnap = await getDocs(collection(db, "products"));
        const productsCount = productsSnap.size;

        // -----------------------------------------
        // 🟡 COMMANDES (toutes)
        // -----------------------------------------
        const ordersSnap = await getDocs(collection(db, "pending_orders"));
        const ordersCount = ordersSnap.size;

        // -----------------------------------------
        // 🟢 COMMANDES PAYÉES
        // -----------------------------------------
        const paidQuery = query(
          collection(db, "pending_orders"),
          where("status", "==", "paid")
        );
        const paidSnap = await getDocs(paidQuery);
        const paidCount = paidSnap.size;

        // -----------------------------------------
        // 💶 REVENUS
        // -----------------------------------------
        let revenue = 0;

        paidSnap.forEach((docSnap) => {
          const order = docSnap.data();

          // Cas 1 : total enregistré dans la commande
          if (typeof order.total === "number") {
            revenue += order.total;
            return;
          }

          // Cas 2 : Stripe amount_total
          if (typeof order.amount_total === "number") {
            revenue += order.amount_total / 100;
            return;
          }

          // Cas 3 : Recalcul manuel
          const subtotal =
            order.items?.reduce(
              (sum: number, item: any) =>
                sum +
                ((typeof item.price === "number"
                  ? item.price
                  : item.price?.eur ?? 0) *
                  (item.quantity ?? 1)),
              0
            ) ?? 0;

          const shipping =
            typeof order.shippingMethod?.price === "number"
              ? order.shippingMethod.price
              : Number(order.shippingMethod?.price?.eur ?? 0);

          revenue += subtotal + shipping;
        });

        setStats({
          products: productsCount,
          orders: ordersCount,
          paidOrders: paidCount,
          revenue,
        });

      } catch (error) {
        console.error("Erreur Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">📊 Tableau de bord</h1>
        <p>Chargement…</p>
      </div>
    );
  }

  // -----------------------------------------
  // 🔥 UI DASHBOARD
  // -----------------------------------------
  return (
    <div className="admin-page">
      <h1 className="admin-page-title">📊 Tableau de bord</h1>

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
          <p className="dashboard-number">{stats.revenue.toFixed(2)}</p>
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
