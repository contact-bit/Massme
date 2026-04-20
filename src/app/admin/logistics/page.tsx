"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useOrders } from "../orders/hooks/useOrders";
import { useToast } from "../orders/hooks/useToast";
import { Toast } from "../orders/components/Toast";
import { getLogisticStatus } from "../orders/domain/logistics";
import LogisticsList from "./LogisticsList";
import type { Order } from "../orders/domain/types";

export default function LogisticsPage() {
  const { toast, toastIt } = useToast();

  const {
    orders,
    loading,
    error,
    initOnce,
    updateShippingStatus, // 💥 IMPORTANT
  } = useOrders(toastIt);

  /* ================= INIT ================= */

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* ================= ACTION CENTRALISÉE ================= */

  const handleShip = useCallback(
    async (order: Order) => {
      try {
        await updateShippingStatus(order, "shipped");

        // 🔥 refresh GLOBAL (corrige ton bug)
        await initOnce();

        toastIt("Commande expédiée ✅");
      } catch (e) {
        toastIt("Erreur lors de l’expédition ❌");
      }
    },
    [updateShippingStatus, initOnce, toastIt]
  );

  /* ================= KPI ================= */

  const toPrepareCount = useMemo(
    () =>
      orders.filter((o) => getLogisticStatus(o) === "to_prepare").length,
    [orders]
  );

  const shippedCount = useMemo(
    () =>
      orders.filter((o) => getLogisticStatus(o) === "shipped").length,
    [orders]
  );

  /* ================= UI ================= */

  return (
    <>
      <Toast message={toast} />

      <div className="admin-page">
        {/* HEADER */}
        <div className="admin-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0 }}>Logistique</h1>
            <p className="admin-muted">
              Suivi des commandes à préparer et expédiées
            </p>
          </div>

          {/* KPI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div className="kpi-card warning">
              <div className="kpi-label">À préparer</div>
              <div className="kpi-value">{toPrepareCount}</div>
              <div className="kpi-sub">Commandes en attente</div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-label">Expédiées</div>
              <div className="kpi-value">{shippedCount}</div>
              <div className="kpi-sub">Déjà envoyées</div>
            </div>

            <div className="kpi-card highlight">
              <div className="kpi-label">Total</div>
              <div className="kpi-value">{orders.length}</div>
              <div className="kpi-sub">Toutes commandes</div>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="admin-card">
          <LogisticsList
            orders={orders}
            loading={loading}
            error={error}
            toastIt={toastIt}
            onShip={handleShip} // 💥 FIX FINAL
          />
        </div>
      </div>
    </>
  );
}