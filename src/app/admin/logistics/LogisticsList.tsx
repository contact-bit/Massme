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
  onShip: (order: Order) => Promise<void>; // 💥 NEW
};

export default function LogisticsList({
  orders,
  loading,
  error,
  toastIt,
  onShip,
}: Props) {
  const [q, setQ] = useState("");

  /* ================= FILTER ================= */

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

      const shippingText = [
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
        shippingText.includes(term)
      );
    });
  }, [orders, q]);

  /* ================= LOGIC ================= */

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
      const isAwaiting = orderStatus === "awaiting_bank_transfer";

      if (isBankTransfer && (isAwaiting || paymentStatus !== "paid")) return false;
      if (paymentStatus && paymentStatus !== "paid") return false;

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

      return (
        sum +
        items.reduce(
          (acc: number, item: any) =>
            acc + (item?.quantity ?? item?.qty ?? item?.count ?? 1),
          0
        )
      );
    }, 0);
  }, [logisticsEligible]);

  /* ================= STATES ================= */

  if (loading) return <div className="log-state">Chargement…</div>;
  if (error) return <div className="log-error">{error}</div>;

  /* ================= UI ================= */

  return (
    <div className="log-list">

      {/* SEARCH + STATS */}
      <div className="log-toolbar">
        <input
          className="log-search"
          placeholder="Rechercher commande, email, ville, produit…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="log-stats">
          <div className="log-chip">{logisticsEligible.length} commandes</div>
          <div className="log-chip">{totalItems} articles</div>
        </div>
      </div>

      {/* A PREPARER */}
      <div className="log-section">
        <div className="log-section-title">
          À préparer ({toPrepare.length})
        </div>

        {toPrepare.length === 0 ? (
          <div className="log-empty">
            {q ? "Aucun résultat." : "Rien à préparer."}
          </div>
        ) : (
          toPrepare.map((o) => (
            <LogisticsItem
              key={o.id}
              order={o}
              toastIt={toastIt}
              onShip={onShip} // 💥 FIX
            />
          ))
        )}
      </div>

      {/* SHIPPED */}
      <div className="log-section">
        <div className="log-section-title">
          Expédiées ({shipped.length})
        </div>

        {shipped.length === 0 ? (
          <div className="log-empty">
            {q ? "Aucun résultat." : "Aucune expédition."}
          </div>
        ) : (
          shipped.map((o) => (
            <LogisticsItem
              key={o.id}
              order={o}
              toastIt={toastIt}
              onShip={onShip} // 💥 FIX
            />
          ))
        )}
      </div>
    </div>
  );
}