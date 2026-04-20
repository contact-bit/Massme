"use client";

import { useState, useMemo } from "react";
import type { Order } from "../orders/domain/types";
import { getLogisticStatus } from "../orders/domain/logistics";

type Props = {
  order: Order;
  toastIt: (msg: string) => void;
  onShip: (order: Order) => Promise<void>;
};

export default function LogisticsItem({
  order,
  toastIt,
  onShip,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ================= SAFE DATA ================= */

  const displayId =
    (order as any)?.orderNumber ||
    (order as any)?.number ||
    order?.id?.slice(-6) ||
    "—";

  const email = (order as any)?.__email || order?.email || "—";
  const logisticStatus = getLogisticStatus(order);

  const relay = (order as any)?.relayPoint ?? null;
  const shippingMethod = order?.shippingMethod as any;
  const billing = (order as any)?.billingAddress ?? null;
  const address = order?.shippingAddress ?? null;

  const isPickup =
    shippingMethod?.type === "pickup" ||
    shippingMethod?.name?.toLowerCase?.().includes("retrait");

  const items = useMemo(() => {
    if (!order || !Array.isArray(order.items)) return [];
    return order.items;
  }, [order?.items]);

  /* ================= SHIPPING ================= */

  const shippingPriceTTC =
    shippingMethod?.priceTTC ??
    (order as any)?.shippingPrice ??
    0;

  const shippingLabel = relay
    ? "Point relais"
    : isPickup
    ? "Retrait magasin"
    : shippingMethod?.label || "Livraison";

  const shippingDelay = shippingMethod?.delay || "—";

  const createdAt =
    (order as any)?.createdAt?.toDate?.() ||
    ((order as any)?.createdAt?._seconds
      ? new Date((order as any).createdAt._seconds * 1000)
      : null);

  /* ================= ACTION ================= */

  async function handleShip() {
    if (!confirm("Confirmer l’expédition ?")) return;

    try {
      setLoading(true);
      await onShip(order);
      toastIt("Commande expédiée ✅");
    } catch {
      toastIt("Erreur ❌");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="log-item">

      {/* HEADER */}
      <div className="log-header">
        <div>
          <div className="log-id">#{displayId}</div>
          <div className="log-email">{email}</div>
        </div>

        <div
          className={`log-status ${
            logisticStatus === "shipped" ? "success" : "warning"
          }`}
        >
          {logisticStatus === "shipped" ? "Expédiée" : "À préparer"}
        </div>
      </div>

      {/* GRID */}
      <div className="log-grid">

        {/* LEFT */}
        <div className="log-card">
          <div className="log-title">🛒 Produits</div>

          {items.length === 0 ? (
            <div className="log-muted">Aucun article</div>
          ) : (
            items.map((item: any, i: number) => {
              const name =
                item?.name ||
                item?.title ||
                item?.productName ||
                item?.product?.name ||
                "Produit";

              const qty = item?.quantity ?? 1;
              const price = item?.priceTTC ?? item?.priceHT ?? 0;

              return (
                <div key={i} className="log-row">
                  <div>
                    <div className="log-name">{name}</div>
                    <div className="log-muted">Qté : {qty}</div>
                  </div>

                  <div className="log-price">
                    {(price * qty).toFixed(2)} €
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT */}
        <div className="log-right">

          <div className="log-card">
            <div className="log-title">Livraison</div>

            <div className="log-muted">{shippingLabel}</div>

            <div className="log-delay">
              ⏱ {shippingDelay}
            </div>

            {/* 💥 DATE COMMANDE */}
            <div className="log-created">
              {createdAt ? (
                <>
                  🕒 Commande passée
                  <br />
                  {createdAt.toLocaleDateString("fr-FR")} à{" "}
                  {createdAt.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              ) : (
                "—"
              )}
            </div>

            <div className="log-price">
              {shippingPriceTTC > 0
                ? `${shippingPriceTTC.toFixed(2)} €`
                : "Gratuit"}
            </div>

            <div className="log-address">
              {relay ? (
                <>
                  <div>{relay.name}</div>
                  <div>{relay.address}</div>
                  <div>{relay.city}</div>
                </>
              ) : isPickup ? (
                <div>🏪 Retrait magasin</div>
              ) : (
                <>
                  <div>{address?.name}</div>
                  <div>{address?.address}</div>
                  <div>{address?.city}</div>
                  <div>{address?.country}</div>
                </>
              )}
            </div>
          </div>

          <div className="log-card">
            <div className="log-title">🧾 Facturation</div>

            {billing ? (
              <div className="log-address">
                <div>{billing.name}</div>
                <div>{billing.address}</div>
                <div>{billing.city}</div>
                <div>{billing.country}</div>
                {billing.phone && <div>{billing.phone}</div>}
              </div>
            ) : (
              <div className="log-muted">—</div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION */}
      {logisticStatus === "to_prepare" && (
        <button
          className="log-btn primary"
          onClick={handleShip}
          disabled={loading}
        >
          {loading ? "Expédition..." : "Expédier"}
        </button>
      )}
    </div>
  );
}