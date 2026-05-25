"use client";

import { useMemo, useState } from "react";
import type { Order } from "../orders/domain/types";
import { getLogisticStatus } from "../orders/domain/logistics";
import { ShippingStatusPill } from "../orders/components/ShippingStatusPill";

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
  const [editingBl, setEditingBl] = useState(false);
  const [savingBl, setSavingBl] = useState(false);
  const [localDeliveryNote, setLocalDeliveryNote] =
    useState<any>(
      (order as any)?.deliveryNote || null
    );
  const [blDraft, setBlDraft] =
    useState({
      packageCount:
        (order as any)?.deliveryNote?.packageCount == null
          ? ""
          : String(
              (order as any).deliveryNote
                .packageCount
            ),
      weight:
        (order as any)?.deliveryNote?.weight || "",
      instructions:
        (order as any)?.deliveryNote
          ?.instructions || "",
    });

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

  const shippingVatRate =
    Number(shippingMethod?.vatRate ?? 20);

  const shippingPriceHT =
    shippingMethod?.priceHT ??
    (order as any)?.shippingPrice ??
    0;

  const shippingPriceTTC =
    shippingMethod?.priceTTC ??
    (shippingPriceHT > 0
      ? shippingPriceHT *
        (1 + shippingVatRate / 100)
      : 0);

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

  const createdDate = createdAt
    ? createdAt.toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      )
    : "—";

  const createdTime = createdAt
    ? createdAt.toLocaleTimeString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "";

  const shippingDelay =
    shippingMethod?.delay ||
    (isPickup
      ? "Retrait"
      : "Non renseigné");

  function deliveryNoteHref(
    mode: "preview" | "download"
  ) {
    return `/api/admin/orders/delivery-note?orderId=${encodeURIComponent(
      order.id
    )}&mode=${mode}`;
  }

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

  function startBlEdit(
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    setBlDraft({
      packageCount:
        localDeliveryNote?.packageCount == null
          ? ""
          : String(
              localDeliveryNote.packageCount
            ),
      weight:
        localDeliveryNote?.weight || "",
      instructions:
        localDeliveryNote?.instructions || "",
    });
    setEditingBl(true);
  }

  async function saveBl(
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    try {
      setSavingBl(true);

      const pass =
        localStorage.getItem(
          "admin_password"
        ) || "";

      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          order.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            "x-admin-password": pass,
          },
          body: JSON.stringify({
            deliveryNote: blDraft,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error();
      }

      setLocalDeliveryNote(
        data.deliveryNote
      );

      (order as any).deliveryNote =
        data.deliveryNote;

      setEditingBl(false);
      toastIt("BL enregistré ✅");
    } catch {
      toastIt("Erreur BL ❌");
    } finally {
      setSavingBl(false);
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
            {displayId}
          </div>

          <div className="log-email">
            {email}
          </div>
        </div>

        {/* PASSAGE */}
        <div className="log-col log-stack">
          <span className="log-main">
            {createdDate}
          </span>

          {createdTime && (
            <span className="log-sub">
              {createdTime}
            </span>
          )}
        </div>

        {/* CLIENT */}
        <div className="log-col">
          {address?.name || "—"}
        </div>

        {/* PAYS */}
        <div className="log-col">
          {address?.country || "—"}
        </div>

        {/* DELAI */}
        <div className="log-col log-delay-col">
          <span className="log-delay-pill">
            {shippingDelay}
          </span>
        </div>

        {/* TARIF TTC */}
        <div className="log-col log-stack">
          {shippingPriceTTC > 0
            ? `${shippingPriceTTC
                .toFixed(
                2
              )
                .replace(
                  ".",
                  ","
                )} €`
            : "Gratuit"}

          <span className="log-sub">
            TTC
          </span>
        </div>

        {/* STATUS */}
        <div className="log-col status">
          <ShippingStatusPill order={order} />
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
              Produits
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
              Livraison
            </div>

            <div className="log-address">
              <div className="log-detail-row">
                <span>Mode</span>
                <strong>
                  {shippingLabel}
                </strong>
              </div>

              <div className="log-detail-row">
                <span>Délai</span>
                <strong>
                  {shippingDelay}
                </strong>
              </div>

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
                  Retrait magasin
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
              Facturation
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

          {/* BON DE LIVRAISON */}
          <div className="log-expanded-card">
            <div className="log-title">
              Bon de livraison
            </div>

            {editingBl ? (
              <div className="log-bl-form">
                <label>
                  <span>Colis</span>
                  <input
                    type="number"
                    min="0"
                    value={
                      blDraft.packageCount
                    }
                    onChange={(e) =>
                      setBlDraft(
                        (prev) => ({
                          ...prev,
                          packageCount:
                            e.target.value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  <span>Poids</span>
                  <input
                    value={blDraft.weight}
                    placeholder="Ex : 1,2 kg"
                    onChange={(e) =>
                      setBlDraft(
                        (prev) => ({
                          ...prev,
                          weight:
                            e.target.value,
                        })
                      )
                    }
                  />
                </label>

                <label className="wide">
                  <span>Consignes</span>
                  <textarea
                    value={
                      blDraft.instructions
                    }
                    onChange={(e) =>
                      setBlDraft(
                        (prev) => ({
                          ...prev,
                          instructions:
                            e.target.value,
                        })
                      )
                    }
                  />
                </label>

                <div className="log-doc-actions">
                  <button
                    className="log-btn primary"
                    onClick={saveBl}
                    disabled={savingBl}
                  >
                    {savingBl
                      ? "Enregistrement..."
                      : "Enregistrer"}
                  </button>

                  <button
                    className="log-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBl(false);
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="log-detail-row">
                  <span>Colis</span>
                  <strong>
                    {localDeliveryNote?.packageCount ??
                      "—"}
                  </strong>
                </div>

                <div className="log-detail-row">
                  <span>Poids</span>
                  <strong>
                    {localDeliveryNote?.weight ||
                      "—"}
                  </strong>
                </div>

                {localDeliveryNote?.instructions && (
                  <div className="log-muted log-bl-note">
                    {
                      localDeliveryNote.instructions
                    }
                  </div>
                )}

                <div className="log-doc-actions">
                  <button
                    className="log-btn"
                    onClick={startBlEdit}
                  >
                    Éditer BL
                  </button>

                  <a
                    className="log-btn"
                    href={deliveryNoteHref(
                      "preview"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    Prévisualiser
                  </a>

                  <a
                    className="log-btn"
                    href={deliveryNoteHref(
                      "download"
                    )}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    Télécharger
                  </a>
                </div>
              </>
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
