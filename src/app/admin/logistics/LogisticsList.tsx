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

      const items = Array.isArray((o as any)?.items) ? (o as any).items : [];
      const itemText = items
        .map((item: any) =>
          [
            item?.name,
            item?.title,
            item?.productName,
            item?.product?.name,
            item?.sku,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
        .toLowerCase();

      const shippingMethodText = [
        (o as any)?.shippingMethod?.name,
        (o as any)?.shippingMethod?.label,
        (o as any)?.shippingMethod?.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        id.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term) ||
        itemText.includes(term) ||
        shippingMethodText.includes(term)
      );
    });
  }, [orders, q]);

  const logisticsEligible = useMemo(() => {
    return filtered.filter((o) => {
      const orderStatus = String((o as any)?.status || "").toLowerCase();

      const paymentStatus = String(
        (o as any)?.paymentStatus ||
          (o as any)?.payment?.status ||
          ""
      ).toLowerCase();

      const provider = String(
        (o as any)?.paymentProvider ||
          (o as any)?.provider ||
          (o as any)?.payment?.provider ||
          ""
      ).toLowerCase();

      const isBankTransfer = provider === "bank_transfer";
      const isAwaitingBankTransfer = orderStatus === "awaiting_bank_transfer";

      // ❌ On exclut les virements non validés de la logistique
      if (isBankTransfer && (isAwaitingBankTransfer || paymentStatus !== "paid")) {
        return false;
      }

      // ❌ Plus largement, on exclut les commandes non payées
      if (paymentStatus && paymentStatus !== "paid") {
        return false;
      }

      // ✅ Si pas de paymentStatus exploitable, on se rabat sur le statut global
      if (
        !paymentStatus &&
        orderStatus &&
        orderStatus !== "paid" &&
        orderStatus !== "sent"
      ) {
        return false;
      }

      return true;
    });
  }, [filtered]);

  const toPrepare = useMemo(
    () => logisticsEligible.filter((o) => getLogisticStatus(o) === "to_prepare"),
    [logisticsEligible]
  );

  const shipped = useMemo(
    () => logisticsEligible.filter((o) => getLogisticStatus(o) === "shipped"),
    [logisticsEligible]
  );

  const totalItems = useMemo(() => {
    return logisticsEligible.reduce((sum, order) => {
      const items = Array.isArray((order as any)?.items)
        ? (order as any).items
        : [];

      const qty = items.reduce((acc: number, item: any) => {
        return acc + (item?.quantity ?? item?.qty ?? item?.count ?? 1);
      }, 0);

      return sum + qty;
    }, 0);
  }, [logisticsEligible]);

  if (loading) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: 20,
          color: "#374151",
        }}
      >
        Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 14,
          padding: 20,
          color: "#B91C1C",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, display: "grid", gap: 20 }}>
      {/* SEARCH + RESUME */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: 16,
          display: "grid",
          gap: 14,
        }}
      >
        <input
          placeholder="Rechercher commande / email / ville / client / produit / livraison"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #D1D5DB",
            outline: "none",
            fontSize: 14,
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
            }}
          >
            <strong>{logisticsEligible.length}</strong> commandes prêtes pour la logistique
          </div>

          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
            }}
          >
            <strong>{totalItems}</strong> articles à traiter
          </div>
        </div>
      </div>

      {/* A PREPARER */}
      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          📦 À préparer ({toPrepare.length})
        </h2>

        {toPrepare.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 18,
              color: "#6B7280",
            }}
          >
            {q.trim()
              ? "Aucune commande à préparer pour cette recherche."
              : "Aucune commande à préparer 🎉"}
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

      {/* EXPEDIEES */}
      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          🚚 Expédiées ({shipped.length})
        </h2>

        {shipped.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 18,
              color: "#6B7280",
            }}
          >
            {q.trim()
              ? "Aucune commande expédiée pour cette recherche."
              : "Aucune commande expédiée."}
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