"use client";

import { useEffect } from "react";
import { useOrders } from "../orders/hooks/useOrders";
import { useToast } from "../orders/hooks/useToast";
import { Toast } from "../orders/components/Toast";
import LogisticsList from "./LogisticsList"; // ✅ FIX

export default function LogisticsPage() {
  const { toast, toastIt } = useToast();
  const { orders, loading, error, initOnce } = useOrders(toastIt);

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  return (
    <>
      <Toast message={toast} />

      <div style={{ padding: 20, background: "#F6F7F9", minHeight: "100vh" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>
          📦 Préparation commandes
        </h1>

        <LogisticsList
          orders={orders}
          loading={loading}
          error={error}
          toastIt={toastIt}
        />
      </div>
    </>
  );
}