"use client";

import { useState } from "react";
import type { Order } from "../orders/domain/types";
import { useOrders } from "../orders/hooks/useOrders";
import { getLogisticStatus } from "../orders/domain/logistics";

type Props = {
  order: Order;
  toastIt: (msg: string) => void;
};

export default function LogisticsItem({ order, toastIt }: Props) {
  const { updateShippingStatus } = useOrders(toastIt);
  const [loading, setLoading] = useState(false);

  const displayId =
    (order as any)?.orderNumber ||
    (order as any)?.number ||
    order.id.slice(-6);

  const email = (order as any)?.__email || order.email || "—";

  const logisticStatus = getLogisticStatus(order);

  const relay = (order as any)?.relayPoint ?? null;
  const shippingMethod = order.shippingMethod as any;
  const billing = (order as any)?.billingAddress ?? null;

  const isPickup =
    shippingMethod?.type === "pickup" ||
    shippingMethod?.name?.toLowerCase()?.includes("retrait");

  const address = order.shippingAddress;

  async function handleShip() {
    const ok = window.confirm("Confirmer l’expédition ?");
    if (!ok) return;

    try {
      setLoading(true);
      await updateShippingStatus(order, "shipped");
      toastIt("Commande expédiée ✅");
    } catch (e) {
      console.error(e);
      toastIt("Erreur expédition ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        border: "1px solid #eee",
        display: "grid",
        gap: 12,
      }}
    >
      {/* HEADER */}
      <div style={{ fontWeight: 800, fontSize: 15 }}>
        Commande #{displayId}
      </div>

      <div style={{ fontSize: 13, color: "#444" }}>{email}</div>

      {/* 📦 + 🧾 GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {/* LIVRAISON */}
        <div
          style={{
            background: "#F9FAFB",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            📦 Livraison
          </div>

          {relay ? (
            <>
              <div>{relay.name}</div>
              <div>{relay.address}</div>
              <div>
                {relay.postalCode} {relay.city}
              </div>
            </>
          ) : isPickup ? (
            <div>🏪 Retrait en magasin</div>
          ) : (
            <>
              <div>{address?.name}</div>
              <div>{address?.address}</div>
              <div>
                {address?.postalCode} {address?.city}
              </div>
              <div>{address?.country}</div>
            </>
          )}
        </div>

        {/* FACTURATION */}
        <div
          style={{
            background: "#F9FAFB",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            🧾 Facturation
          </div>

          {billing ? (
            <>
              <div>{billing.name}</div>
              <div>{billing.address}</div>
              <div>
                {billing.postalCode} {billing.city}
              </div>
              <div>{billing.country}</div>
              {billing.phone && <div>{billing.phone}</div>}
            </>
          ) : (
            <div>—</div>
          )}
        </div>
      </div>

      {/* ACTION */}
      {logisticStatus === "to_prepare" && (
        <button
          disabled={loading}
          onClick={handleShip}
          style={{
            marginTop: 8,
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "none",
            background: loading ? "#6B7280" : "#111",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Expédition..." : "🚚 Expédier"}
        </button>
      )}
    </div>
  );
}