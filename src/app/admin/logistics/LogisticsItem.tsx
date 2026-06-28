"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileSearch,
} from "lucide-react";
import type { Order } from "../orders/domain/types";
import { getLogisticStatus } from "../orders/domain/logistics";
import { ShippingStatusPill } from "../orders/components/ShippingStatusPill";
import { ActionIconButton } from "../orders/components/ActionIconButton";
import { IconEye } from "../orders/components/icons";

type Props = {
  order: Order;
  open: boolean;
  onToggle: () => void;
  toastIt: (msg: string) => void;
  onShip: (order: Order) => Promise<void>;
  onUpdateShippingAddress: (
    order: Order,
    shippingAddress: Record<string, unknown>
  ) => Promise<void>;
};

type ShippingAddressDraft = {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
};

type ShippingAddressValue = {
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  address?: unknown;
  postalCode?: unknown;
  city?: unknown;
  country?: unknown;
  phone?: unknown;
  email?: unknown;
};

function fieldToString(value: unknown) {
  return typeof value === "string"
    ? value
    : "";
}

function firstEmail(
  ...values: unknown[]
) {
  return (
    values
      .map(fieldToString)
      .map((value) => value.trim())
      .find(
        (value) =>
          value && value !== "—"
      ) || ""
  );
}

function toShippingAddressDraft(
  value: ShippingAddressValue | null,
  fallbackEmail = ""
): ShippingAddressDraft {
  const name =
    fieldToString(value?.name) ||
    [
      fieldToString(value?.firstName),
      fieldToString(value?.lastName),
    ]
      .filter(Boolean)
      .join(" ");

  return {
    name: name || "",
    address: fieldToString(value?.address),
    postalCode: fieldToString(value?.postalCode),
    city: fieldToString(value?.city),
    country: fieldToString(value?.country),
    phone: fieldToString(value?.phone),
    email:
      fieldToString(value?.email) ||
      fallbackEmail,
  };
}

function formatAddressForCopy(
  value: ShippingAddressValue | null,
  options?: { email?: string }
) {
  const draft =
    toShippingAddressDraft(value);

  return [
    draft.name,
    options?.email
      ? `Email : ${options.email}`
      : "",
    draft.address,
    [draft.postalCode, draft.city]
      .filter(Boolean)
      .join(" "),
    draft.country,
    draft.phone,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function LogisticsItem({
  order,
  open,
  onToggle,
  toastIt,
  onShip,
  onUpdateShippingAddress,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [editingDelivery, setEditingDelivery] =
    useState(false);
  const [
    savingDelivery,
    setSavingDelivery,
  ] = useState(false);
  const [
    deliveryDraft,
    setDeliveryDraft,
  ] = useState<ShippingAddressDraft>(() =>
    toShippingAddressDraft(
      order?.shippingAddress ?? null,
      firstEmail(
        order?.shippingAddress?.email,
        (order as any)?.billingAddress
          ?.email,
        (order as any)?.billingCustomer
          ?.email,
        (order as any)?.__email,
        order?.email,
        (order as any)?.customerEmail,
        (order as any)?.customer_email
      )
    )
  );

  /* ================= SAFE DATA ================= */

  const displayId =
    (order as any)?.orderNumber ||
    (order as any)?.number ||
    order?.id?.slice(-6) ||
    "—";

  const email =
    firstEmail(
      order?.shippingAddress?.email,
      (order as any)?.billingAddress
        ?.email,
      (order as any)?.billingCustomer
        ?.email,
      (order as any)?.__email,
      order?.email,
      (order as any)?.customerEmail,
      (order as any)?.customer_email
    ) || "—";

  const logisticStatus =
    getLogisticStatus(order);

  const relay =
    (order as any)?.relayPoint ?? null;

  const shippingMethod =
    order?.shippingMethod as any;

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
  }, [order]);

  const itemsLabel =
    (items.length
      ? items
          .map((item: any) => {
            const name =
              typeof item?.name === "string"
                ? item.name
                : item?.name?.fr ||
                  item?.name?.en ||
                  item?.title ||
                  item?.productName ||
                  item?.product?.name ||
                  "Produit";

            const quantity =
              item?.quantity ?? 1;

            return `${name} x${quantity}`;
          })
          .join(" • ")
      : (order as any)?.__itemsLabel || "—");

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

  const deliveryCopyText = relay
    ? [
        relay?.name,
        relay?.address,
        relay?.city,
        email !== "—"
          ? `Email : ${email}`
          : "",
        address?.phone
          ? `Téléphone : ${address.phone}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : isPickup
    ? [
        "Retrait magasin",
        email !== "—"
          ? `Email : ${email}`
          : "",
        address?.phone
          ? `Téléphone : ${address.phone}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : formatAddressForCopy(address, {
        email:
          email !== "—"
            ? email
            : undefined,
      });

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

  function startDeliveryEdit(
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    setDeliveryDraft(
      toShippingAddressDraft(
        address,
        email === "—" ? "" : email
      )
    );
    setEditingDelivery(true);
  }

  function updateDeliveryDraft(
    key: keyof ShippingAddressDraft,
    value: string
  ) {
    setDeliveryDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveDelivery(
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    try {
      setSavingDelivery(true);

      const nextAddress = {
        ...((address || {}) as Record<
          string,
          unknown
        >),
        ...deliveryDraft,
      };

      await onUpdateShippingAddress(
        order,
        nextAddress
      );

      setEditingDelivery(false);
    } finally {
      setSavingDelivery(false);
    }
  }

  async function copyToClipboard(
    e: React.MouseEvent,
    text: string
  ) {
    e.stopPropagation();

    if (!text.trim()) {
      toastIt("Rien à copier");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toastIt("Copié ✅");
    } catch {
      toastIt("Copie impossible ❌");
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
        onClick={onToggle}
      >
        {/* COMMANDE */}
        <div className="log-col order">
          <div className="log-id-line">
            <div className="log-id">
              {displayId}
            </div>

            <span
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <ActionIconButton
                title="Voir"
                onClick={onToggle}
                icon={<IconEye />}
                variant="primary"
              />
            </span>
          </div>
        </div>

        {/* DATE */}
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
        <div className="log-col log-stack log-client-col">
          <span className="log-main">
            {address?.name || "—"}
          </span>

          <span
            className="log-sub log-items-line"
            title={itemsLabel}
          >
            {itemsLabel}
          </span>
        </div>

        {/* PAYS */}
        <div className="log-col">
          {address?.country || "—"}
        </div>

        {/* SERVICE DE LIVRAISON */}
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

        {/* BON DE LIVRAISON */}
        <div className="log-col log-doc-col">
          <div className="log-doc-actions-main">
            <a
              className="log-doc-icon-btn"
              href={deliveryNoteHref(
                "preview"
              )}
              target="_blank"
              rel="noreferrer"
              title="Prévisualiser le bon de livraison"
              aria-label="Prévisualiser le bon de livraison"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <FileSearch
                size={15}
                strokeWidth={2}
              />
            </a>

            <a
              className="log-doc-icon-btn"
              href={deliveryNoteHref(
                "download"
              )}
              title="Télécharger le bon de livraison"
              aria-label="Télécharger le bon de livraison"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <Download
                size={15}
                strokeWidth={2}
              />
            </a>
          </div>
        </div>

        {/* ACTION */}
        <div className="log-col log-action-col">
          {logisticStatus ===
            "to_prepare" && (
            <button
              className="log-ship-btn"
              onClick={handleShip}
              disabled={loading}
            >
          {loading
            ? "Expédition..."
            : "À expédier"}
        </button>
          )}
        </div>
      </div>

      {/* EXPANDED */}
      {open && (
        <div className="log-expanded">
          {/* LIVRAISON */}
          <div className="log-expanded-card">
            <div className="log-title-row">
              <div className="log-title">
                Livraison
              </div>

              {!editingDelivery && (
                <div className="log-title-actions">
                  <button
                    className="log-mini-btn"
                    onClick={(e) =>
                      copyToClipboard(
                        e,
                        deliveryCopyText
                      )
                    }
                  >
                    Copier
                  </button>

                  {!relay && !isPickup && (
                    <button
                      className="log-mini-btn"
                      onClick={
                        startDeliveryEdit
                      }
                    >
                      Modifier
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="log-address log-detail-lines">
              {editingDelivery ? (
                <div
                  className="log-delivery-form"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  {(
                    [
                      ["name", "Nom"],
                      [
                        "address",
                        "Adresse",
                      ],
                      [
                        "postalCode",
                        "Code postal",
                      ],
                      ["city", "Ville"],
                      ["country", "Pays"],
                      [
                        "phone",
                        "Téléphone",
                      ],
                      ["email", "Email"],
                    ] as Array<
                      [
                        keyof ShippingAddressDraft,
                        string
                      ]
                    >
                  ).map(
                    ([key, label]) => (
                      <label
                        key={key}
                        className={
                          key === "address" ||
                          key === "email"
                            ? "wide"
                            : undefined
                        }
                      >
                        <span>
                          {label}
                        </span>
                        <input
                          value={
                            deliveryDraft[
                              key
                            ]
                          }
                          onChange={(e) =>
                            updateDeliveryDraft(
                              key,
                              e.target.value
                            )
                          }
                        />
                      </label>
                    )
                  )}

                  <div className="log-form-actions">
                    <button
                      className="log-btn primary"
                      disabled={
                        savingDelivery
                      }
                      onClick={
                        saveDelivery
                      }
                    >
                      {savingDelivery
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>

                    <button
                      className="log-btn"
                      disabled={
                        savingDelivery
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDelivery(
                          false
                        );
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : relay ? (
                <>
                  <div className="log-info-line">
                    <span>Point relais</span>
                    <strong>{relay.name}</strong>
                  </div>

                  <div className="log-info-line">
                    <span>Adresse</span>
                    <strong>{relay.address}</strong>
                  </div>

                  <div className="log-info-line">
                    <span>Ville</span>
                    <strong>{relay.city}</strong>
                  </div>
                </>
              ) : isPickup ? (
                <div className="log-info-line">
                  <span>Mode</span>
                  <strong>Retrait magasin</strong>
                </div>
              ) : (
                <>
                  <div className="log-info-line">
                    <span>Nom</span>
                    <strong>{address?.name || "—"}</strong>
                  </div>

                  <div className="log-info-line">
                    <span>Adresse</span>
                    <strong>{address?.address || "—"}</strong>
                  </div>

                  <div className="log-info-line">
                    <span>Ville</span>
                    <strong>
                      {[
                        address?.postalCode,
                        address?.city,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </strong>
                  </div>

                  <div className="log-info-line">
                    <span>Pays</span>
                    <strong>{address?.country || "—"}</strong>
                  </div>

                </>
              )}

              {!editingDelivery && (
                <>
                  <div className="log-info-line">
                    <span>Email</span>
                    <strong>{email}</strong>
                  </div>

                  <div className="log-info-line">
                    <span>Téléphone</span>
                    <strong>
                      {address?.phone || "—"}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
