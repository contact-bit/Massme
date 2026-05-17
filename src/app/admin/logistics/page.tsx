"use client";

import {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useOrders } from "../orders/hooks/useOrders";
import { useToast } from "../orders/hooks/useToast";

import { Toast } from "../orders/components/Toast";

import "./logistics.css";

import { getLogisticStatus } from "../orders/domain/logistics";

import LogisticsList from "./LogisticsList";

import type { Order } from "../orders/domain/types";

export default function LogisticsPage() {
  const { toast, toastIt } =
    useToast();

  const {
    orders,
    loading,
    error,
    initOnce,
    updateShippingStatus,
  } = useOrders(toastIt);

  /* ================= INIT ================= */

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* ================= ACTION ================= */

  const handleShip =
    useCallback(
      async (order: Order) => {
        try {
          await updateShippingStatus(
            order,
            "shipped"
          );

          /* refresh global */
          await initOnce();

          toastIt(
            "Commande expédiée ✅"
          );
        } catch {
          toastIt(
            "Erreur lors de l’expédition ❌"
          );
        }
      },
      [
        updateShippingStatus,
        initOnce,
        toastIt,
      ]
    );

  /* ================= KPI ================= */

  const toPrepareCount =
    useMemo(() => {
      return orders.filter(
        (o) =>
          getLogisticStatus(o) ===
          "to_prepare"
      ).length;
    }, [orders]);

  const shippedCount = useMemo(() => {
    return orders.filter(
      (o) =>
        getLogisticStatus(o) ===
        "shipped"
    ).length;
  }, [orders]);

  /* ================= UI ================= */

  return (
    <>
      <Toast message={toast} />

      <div className="admin-page logistics-page">
       

        {/* TABLE */}
        <div className="logistics-table-card">
          <LogisticsList
            orders={orders}
            loading={loading}
            error={error}
            toastIt={toastIt}
            onShip={handleShip}
          />
        </div>
      </div>
    </>
  );
}