"use client";

import { useMemo, useState } from "react";
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
  const [open, setOpen] = useState(false);

  /* ================= SAFE DATA ================= */

  const displayId =
    (order as any)?.orderNumber ||
    (order as any)?.number ||
    order?.id?.slice(-6) ||
    "—";

  const email =
    (order as any)?.__email ||
    order?.email ||
    "—";

  const logisticStatus =
    getLogisticStatus(order);

  const relay =
    (order as any)?.relayPoint ?? null;

  const shippingMethod =
    order?.shippingMethod as any;

  const billing =
    (order as any)?.billingAddress ?? null;

  const address =
    order?.shippingAddress ?? null;

  const isPickup =
    shippingMethod?.type === "pickup" ||
    shippingMethod?.name
      ?.toLowerCase?.()
      .includes("retrait");

  const items = useMemo(() => {
    if (!order || !Array.isArray(order.items)) {
      return [];
    }

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

  const createdAt =
    (order as any)?.createdAt?.toDate?.() ||
    ((order as any)?.createdAt?._seconds
      ? new Date(
          (order as any).createdAt._seconds *
            1000
        )
      : null);

  /* ================= ACTION ================= */

  async function handleShip(
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    if (
      !confirm("Confirmer l’expédition ?")
    ) {
      return;
    }

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
    <div
      className={`log-row-wrap ${
        open ? "open" : ""
      }`}
    >
      {/* MAIN ROW */}
      <div
        className="log-row-main"
        onClick={() =>
          setOpen((v) => !v)
        }
      >
        {/* COMMANDE */}
        <div className="log-col order">
          <div className="log-id">
            #{displayId}
          </div>

          <div className="log-email">
            {email}
          </div>
        </div>

        {/* DATE */}
<div className="log-col">
  {createdAt
    ? createdAt.toLocaleString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",

          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "—"}
</div>

        {/* CLIENT */}
        <div className="log-col">
          {address?.name || "—"}
        </div>

        {/* PAYS */}
        <div className="log-col">
          {address?.country || "—"}
        </div>

        {/* SERVICE */}
        <div className="log-col">
          {shippingLabel}
        </div>

        {/* TARIF */}
        <div className="log-col">
          {shippingPriceTTC > 0
            ? `${shippingPriceTTC.toFixed(
                2
              )} €`
            : "Gratuit"}
        </div>

        {/* STATUS */}
        <div className="log-col status">
          <div
            className={`log-status ${
              logisticStatus === "shipped"
                ? "success"
                : "warning"
            }`}
          >
            {logisticStatus ===
            "shipped"
              ? "Expédiée"
              : "Préparation"}
          </div>
        </div>

        {/* TOGGLE */}
        <div className="log-col arrow">
          {open ? "−" : "+"}
        </div>
      </div>

      {/* EXPANDED */}
      {open && (
        <div className="log-expanded">
          {/* PRODUITS */}
          <div className="log-expanded-card">
            <div className="log-title">
              🛒 Produits
            </div>

            {items.length === 0 ? (
              <div className="log-muted">
                Aucun article
              </div>
            ) : (
              items.map(
                (
                  item: any,
                  i: number
                ) => {
                  const name =
                    item?.name ||
                    item?.title ||
                    item?.productName ||
                    item?.product?.name ||
                    "Produit";

                  const qty =
                    item?.quantity ?? 1;

                  const price =
                    item?.priceTTC ??
                    item?.priceHT ??
                    0;

                  return (
                    <div
                      key={i}
                      className="log-product-row"
                    >
                      <div>
                        <div className="log-name">
                          {name}
                        </div>

                        <div className="log-muted">
                          Qté : {qty}
                        </div>
                      </div>

                      <div className="log-price">
                        {(
                          price * qty
                        ).toFixed(2)}{" "}
                        €
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* LIVRAISON */}
          <div className="log-expanded-card">
            <div className="log-title">
              🚚 Livraison
            </div>

            <div className="log-address">
              {relay ? (
                <>
                  <div>
                    {relay.name}
                  </div>

                  <div>
                    {relay.address}
                  </div>

                  <div>
                    {relay.city}
                  </div>
                </>
              ) : isPickup ? (
                <div>
                  🏪 Retrait magasin
                </div>
              ) : (
                <>
                  <div>
                    {address?.name}
                  </div>

                  <div>
                    {address?.address}
                  </div>

                  <div>
                    {address?.city}
                  </div>

                  <div>
                    {address?.country}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* FACTURATION */}
          <div className="log-expanded-card">
            <div className="log-title">
              🧾 Facturation
            </div>

            {billing ? (
              <div className="log-address">
                <div>
                  {billing.name}
                </div>

                <div>
                  {billing.address}
                </div>

                <div>
                  {billing.city}
                </div>

                <div>
                  {billing.country}
                </div>

                {billing.phone && (
                  <div>
                    {billing.phone}
                  </div>
                )}
              </div>
            ) : (
              <div className="log-muted">
                —
              </div>
            )}
          </div>

          {/* ACTION */}
          {logisticStatus ===
            "to_prepare" && (
            <button
              className="log-btn primary"
              onClick={handleShip}
              disabled={loading}
            >
              {loading
                ? "Expédition..."
                : "Expédier"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}