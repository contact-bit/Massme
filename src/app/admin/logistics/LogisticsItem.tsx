"use client";

import { useState, useMemo } from "react";
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
  const address = order.shippingAddress;

  const isPickup =
    shippingMethod?.type === "pickup" ||
    shippingMethod?.name?.toLowerCase()?.includes("retrait");

  // 🛒 Items de la commande
  const items: any[] = useMemo(
    () =>
      Array.isArray((order as any)?.items)
        ? ((order as any).items as any[])
        : [],
    [order]
  );

  // 💶 Prix de livraison
  const shippingPriceTTC: number = useMemo(() => {
    const fromMethod =
      typeof shippingMethod?.priceTTC === "number"
        ? shippingMethod.priceTTC
        : undefined;

    const fromRoot =
      typeof (order as any)?.shippingPrice === "number"
        ? (order as any).shippingPrice
        : undefined;

    return fromMethod ?? fromRoot ?? 0;
  }, [shippingMethod, order]);

  const shippingLabel = useMemo(() => {
    if (relay) return "Point relais";
    if (isPickup) return "Retrait en magasin";
    return (
      shippingMethod?.label ||
      shippingMethod?.name ||
      shippingMethod?.type ||
      "Livraison"
    );
  }, [relay, isPickup, shippingMethod]);

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

      {/* METHODE + PRIX LIVRAISON */}
      <div
        style={{
          fontSize: 13,
          background: "#F3F4F6",
          borderRadius: 8,
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600 }}>Méthode :</span>
          <span>{shippingLabel}</span>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Livraison</div>
          <div style={{ fontWeight: 700 }}>
            {shippingPriceTTC > 0 ? `${shippingPriceTTC.toFixed(2)} €` : "Gratuit"}
          </div>
        </div>
      </div>

      {/* CONTENU + ADRESSES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: 12,
        }}
      >
        {/* 🛒 CONTENU */}
        <div
          style={{
            background: "#F9FAFB",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🛒 Contenu</div>

          {items.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13 }}>
              Aucun article
            </div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {items.map((item, index) => {
                const label =
                  item?.name ||
                  item?.title ||
                  item?.productName ||
                  item?.product?.name ||
                  "Article";

                const qty =
                  item?.quantity ??
                  item?.qty ??
                  item?.count ??
                  1;

                const unitPrice =
                  typeof item?.priceTTC === "number"
                    ? item.priceTTC
                    : typeof item?.priceHT === "number"
                    ? item.priceHT
                    : null;

                const lineTotal =
                  unitPrice !== null ? unitPrice * qty : null;

                return (
                  <div
                    key={item?.id || item?.sku || `${label}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      borderBottom: "1px solid #E5E7EB",
                      paddingBottom: 4,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 2,
                        }}
                      >
                        Qté : {qty}
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unitPrice !== null && (
                        <div>{unitPrice.toFixed(2)} €</div>
                      )}
                      {lineTotal !== null && qty > 1 && (
                        <div style={{ fontWeight: 600 }}>
                          {lineTotal.toFixed(2)} €
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📦 LIVRAISON + 🧾 FACTURATION */}
        <div
          style={{
            display: "grid",
            gap: 8,
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