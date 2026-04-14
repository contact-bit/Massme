"use client";

import { useMemo, useState } from "react";
import type { Order } from "../orders/domain/types";
import { getLogisticStatus } from "../orders/domain/logistics";
import LogisticsItem from "./LogisticsItem";

type Props = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  toastIt: (msg: string) => void;
};

export default function LogisticsList({
  orders,
  loading,
  error,
  toastIt,
}: Props) {
  const [q, setQ] = useState("");

  // 🔎 SEARCH SAFE + PUISSANT
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return orders;

    return orders.filter((o) => {
      const id =
        (o as any)?.orderNumber ||
        (o as any)?.number ||
        o.id ||
        "";

      const email = o.email || "";
      const city = o.shippingAddress?.city || "";
      const name = o.shippingAddress?.name || "";

      return (
        id.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
  }, [orders, q]);

  // 📦 GROUPES
  const toPrepare = filtered.filter(
    (o) => getLogisticStatus(o) === "to_prepare"
  );

  const shipped = filtered.filter(
    (o) => getLogisticStatus(o) === "shipped"
  );

  // ⏳ LOADING / ERROR
  if (loading) {
    return <div style={{ padding: 20 }}>Chargement…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* 🔎 SEARCH */}
      <input
        placeholder="Rechercher commande / email / ville / client"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          marginBottom: 20,
        }}
      />

      {/* 📦 À PRÉPARER */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>
          📦 À préparer ({toPrepare.length})
        </h2>

        {toPrepare.length === 0 ? (
          <div style={{ color: "#666", marginTop: 10 }}>
            Aucune commande 🎉
          </div>
        ) : (
          toPrepare.map((order) => (
            <LogisticsItem
              key={order.id}
              order={order}
              toastIt={toastIt}
            />
          ))
        )}
      </div>

      {/* 🚚 EXPÉDIÉES */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>
          🚚 Expédiées ({shipped.length})
        </h2>

        {shipped.length === 0 ? (
          <div style={{ color: "#666", marginTop: 10 }}>
            Aucune commande expédiée
          </div>
        ) : (
          shipped.map((order) => (
            <LogisticsItem
              key={order.id}
              order={order}
              toastIt={toastIt}
            />
          ))
        )}
      </div>
    </div>
  );
}