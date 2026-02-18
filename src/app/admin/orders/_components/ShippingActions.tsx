"use client";
import React, { useEffect, useState } from "react";
import type { Order, ShippingStatus } from "../_domain/types";

export function ShippingActions({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (order: Order, next: ShippingStatus) => void;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [pulse]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        background: "rgba(148,163,184,0.08)",
      }}
    >
      <span style={{ fontSize: 11, color: "rgba(15,23,42,0.7)" }}>Livraison:</span>

      <button
        type="button"
        className="btn btn--soft btn--chip"
        style={{
          height: 30,
          padding: "0 10px",
          fontSize: 11,
          background:
            order.shippingStatus === "pending" || !order.shippingStatus
              ? "rgba(248,250,252,1)"
              : "transparent",
        }}
        onClick={() => onUpdate(order, "pending")}
      >
        ⏳ En attente
      </button>

      <button
        type="button"
        className={"btn btn--soft btn--chip" + (pulse ? " btn--pulse" : "")}
        style={{
          height: 30,
          padding: "0 10px",
          fontSize: 11,
          background:
            order.shippingStatus === "preparing"
              ? "rgba(248,250,252,1)"
              : "transparent",
        }}
        onClick={() => {
          onUpdate(order, "preparing");
          setPulse(true);
        }}
      >
        🧺 Prépa
      </button>

      <button
        type="button"
        className="btn btn--soft btn--chip"
        style={{
          height: 30,
          padding: "0 10px",
          fontSize: 11,
          background:
            order.shippingStatus === "shipped" ? "rgba(220,252,231,1)" : "transparent",
        }}
        onClick={() => onUpdate(order, "shipped")}
      >
        📦 Expédié
      </button>

      <button
        type="button"
        className="btn btn--soft btn--chip"
        style={{
          height: 30,
          padding: "0 10px",
          fontSize: 11,
          background:
            order.shippingStatus === "delivered" ? "rgba(204,251,241,1)" : "transparent",
        }}
        onClick={() => onUpdate(order, "delivered")}
      >
        ✅ Livré
      </button>
    </div>
  );
}
