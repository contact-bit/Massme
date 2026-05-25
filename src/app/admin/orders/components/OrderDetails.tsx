"use client";

import "./OrderDetails.css";

import React, { useEffect, useState } from "react";

import type { Order } from "../domain/types";

import {
  moneyEUR,
  formatAddress,
  compactId,
  copyText,
} from "../domain/utils";

import {
  getItemPrice,
  getShipping,
  getSubtotal,
  getTotal,
} from "../domain/orderMath";
import {
  getPaymentFee,
} from "../domain/paymentFees";

import {
  ShippingStatusPill,
} from "./ShippingStatusPill";

type AddressDraft = {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

type AddressKind =
  | "shippingAddress"
  | "billingAddress";

type ContactDraft = {
  email: string;
  phone: string;
};

type DeliveryNoteDraft = {
  packageCount: string;
  weight: string;
  instructions: string;
};

/* =========================================================
   DATE SAFE
========================================================= */

function toDateSafe(value: any): Date | null {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (typeof value?._seconds === "number") {
    return new Date(value._seconds * 1000);
  }

  const d = new Date(value);

  return isNaN(d.getTime()) ? null : d;
}

function getRemainingTime(scheduledAt?: any) {
  const date = toDateSafe(scheduledAt);

  if (!date) return null;

  const diff = date.getTime() - Date.now();

  if (diff <= 0) return "Prêt à envoyer";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  return `${days}j ${hours}h ${minutes}m`;
}

function addressToDraft(value: any): AddressDraft {
  const name =
    value?.name ||
    [value?.firstName, value?.lastName]
      .filter(Boolean)
      .join(" ");

  return {
    name: name || "",
    address: value?.address || "",
    postalCode: value?.postalCode || "",
    city: value?.city || "",
    country: value?.country || "",
  };
}

function deliveryNoteToDraft(value: any): DeliveryNoteDraft {
  return {
    packageCount:
      value?.packageCount == null
        ? ""
        : String(value.packageCount),
    weight: value?.weight || "",
    instructions: value?.instructions || "",
  };
}

/* ========================================================= */

export function OrderDetails({
  order,
  onCopyAddress,
}: {
  order: Order;
  onCopyAddress: () => void;
}) {
  const [sendingReview, setSendingReview] =
    useState(false);

  const [sendingInvoice, setSendingInvoice] =
    useState(false);

  const [localReview, setLocalReview] =
    useState(
      (order as any)?.reviewEmail || null
    );

  const [localInvoice, setLocalInvoice] =
    useState(
      (order as any)?.invoiceEmail || null
    );

  const [localShippingAddress, setLocalShippingAddress] =
    useState(
      (order as any)?.shippingAddress || null
    );

  const [localBillingAddress, setLocalBillingAddress] =
    useState(
      (order as any)?.billingAddress || null
    );

  const [editingAddress, setEditingAddress] =
    useState<AddressKind | null>(null);

  const [addressDraft, setAddressDraft] =
    useState<AddressDraft>(
      addressToDraft(null)
    );

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [localEmail, setLocalEmail] =
    useState(
      (order as any)?.__email ||
        (order as any)?.email ||
        ""
    );

  const [localPhone, setLocalPhone] =
    useState(
      (order as any)?.shippingAddress?.phone ||
        (order as any)?.billingAddress?.phone ||
        ""
    );

  const [editingContact, setEditingContact] =
    useState<keyof ContactDraft | null>(null);

  const [contactDraft, setContactDraft] =
    useState<ContactDraft>({
      email: "",
      phone: "",
    });

  const [savingContact, setSavingContact] =
    useState(false);

  const [detectingFee, setDetectingFee] =
    useState(false);

  const [editingFee, setEditingFee] =
    useState(false);

  const [feeDraft, setFeeDraft] =
    useState("");

  const [savingFee, setSavingFee] =
    useState(false);

  const [, setFeeTick] = useState(0);

  const [localDeliveryNote, setLocalDeliveryNote] =
    useState(
      (order as any)?.deliveryNote || null
    );

  const [editingDeliveryNote, setEditingDeliveryNote] =
    useState(false);

  const [deliveryNoteDraft, setDeliveryNoteDraft] =
    useState<DeliveryNoteDraft>(
      deliveryNoteToDraft(
        (order as any)?.deliveryNote || null
      )
    );

  const [savingDeliveryNote, setSavingDeliveryNote] =
    useState(false);

  /* =========================================================
     SYNC REVIEW
  ========================================================= */

  useEffect(() => {
    const incoming =
      (order as any)?.reviewEmail;

    if (localReview?.status === "sent") {
      return;
    }

    setLocalReview(incoming || null);
  }, [order]);

  useEffect(() => {
    setLocalShippingAddress(
      (order as any)?.shippingAddress || null
    );

    setLocalBillingAddress(
      (order as any)?.billingAddress || null
    );

    setLocalEmail(
      (order as any)?.__email ||
        (order as any)?.email ||
        ""
    );

    setLocalPhone(
      (order as any)?.shippingAddress?.phone ||
        (order as any)?.billingAddress?.phone ||
        ""
    );

    setLocalDeliveryNote(
      (order as any)?.deliveryNote || null
    );
  }, [order]);

  const review =
    localReview?.status === "sent"
      ? localReview
      : (order as any)?.reviewEmail ||
        localReview;

  const invoice =
    localInvoice?.status === "sent"
      ? localInvoice
      : (order as any)?.invoiceEmail ||
        localInvoice;

  const shippingAddress =
    localShippingAddress ||
    (order as any)?.shippingAddress ||
    null;

  const billingAddress =
    localBillingAddress ||
    (order as any)?.billingAddress ||
    shippingAddress;

  const deliveryNote =
    localDeliveryNote ||
    (order as any)?.deliveryNote ||
    null;

  /* =========================================================
     LIVE TIMER
  ========================================================= */

  const [, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setTick((x) => x + 1);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  /* =========================================================
     DATA
  ========================================================= */

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const total =
    order.__total ?? getTotal(order);

  const shipping = getShipping(order);

  const subtotal = getSubtotal(order);

  const paymentFee =
    getPaymentFee(order, total);

  const netTotal =
    total -
    (paymentFee?.amount || 0);

  const displayId =
    (order as any).orderNumber ||
    (order as any).number ||
    compactId(order.id);

  const phone =
    localPhone || "—";

const site =
  "vitrectomed.com";

const heardFrom =
  (order as any)?.heardFrom || "—";

const heardFromOther =
  (order as any)?.heardFromOther || "";

const heardFromLabelMap: Record<string, string> = {
  internet: "Internet",
  social: "Réseaux sociaux",
  medical: "Recommandation médicale",
  other: "Autre",
};

  const heardFromLabel =
  heardFromLabelMap[heardFrom] ||
  heardFrom;

  /* =========================================================
     SEND INVOICE
  ========================================================= */

  async function sendInvoiceNow(
    orderId: string
  ) {
    try {
      setSendingInvoice(true);

      const res = await fetch(
        "/api/admin/orders/send-invoice",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "invoice_send_failed"
        );
      }

      const now = new Date();

      setLocalInvoice((prev: any) => ({
        ...prev,
        status: "sent",
        sentAt: now,
        lastSentAt: now,
      }));
    } catch (e) {
      console.error(e);

      alert("❌ Erreur envoi facture");
    } finally {
      setSendingInvoice(false);
    }
  }

  function startAddressEdit(kind: AddressKind) {
    const current =
      kind === "shippingAddress"
        ? shippingAddress
        : billingAddress;

    setEditingAddress(kind);
    setAddressDraft(addressToDraft(current));
  }

  function updateAddressDraft(
    key: keyof AddressDraft,
    value: string
  ) {
    setAddressDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function startContactEdit(
    field: keyof ContactDraft
  ) {
    setContactDraft({
      email: localEmail,
      phone: localPhone,
    });

    setEditingContact(field);
  }

  function updateContactDraft(
    key: keyof ContactDraft,
    value: string
  ) {
    setContactDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveContact() {
    try {
      setSavingContact(true);

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
            contact: contactDraft,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "contact_update_failed"
        );
      }

      setLocalEmail(contactDraft.email);
      setLocalPhone(contactDraft.phone);

      (order as any).email =
        contactDraft.email;
      (order as any).__email =
        contactDraft.email;

      const shipping =
        ((order as any).shippingAddress ||
          {}) as Record<string, unknown>;
      const billing =
        ((order as any).billingAddress ||
          {}) as Record<string, unknown>;

      (order as any).shippingAddress = {
        ...shipping,
        phone: contactDraft.phone,
      };

      (order as any).billingAddress = {
        ...billing,
        phone: contactDraft.phone,
      };

      setLocalShippingAddress(
        (order as any).shippingAddress
      );

      setLocalBillingAddress(
        (order as any).billingAddress
      );

      setEditingContact(null);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour contact");
    } finally {
      setSavingContact(false);
    }
  }

  async function detectPaymentFee() {
    try {
      setDetectingFee(true);

      const pass =
        localStorage.getItem(
          "admin_password"
        ) || "";

      const res = await fetch(
        "/api/admin/orders/detect-payment-fee",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "x-admin-password": pass,
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "fee_detection_failed"
        );
      }

      if (!data.detected) {
        alert(
          `Commission non détectée par l'API${
            data.reason
              ? ` : ${data.reason}`
              : ""
          }.`
        );
        return;
      }

      (order as any).payment = {
        ...((order as any).payment || {}),
        fee: data.fee,
        feeCurrency: data.feeCurrency,
        feeSource: data.feeSource,
        feeDetectedAt: new Date(),
        balanceTransactionId:
          data.balanceTransactionId || null,
      };

      setFeeTick((x) => x + 1);
    } catch (e) {
      console.error(e);
      alert(
        `❌ Erreur récupération commission : ${
          e instanceof Error
            ? e.message
            : "erreur inconnue"
        }`
      );
    } finally {
      setDetectingFee(false);
    }
  }

  function startFeeEdit() {
    setFeeDraft(
      paymentFee?.amount
        ? String(paymentFee.amount)
        : ""
    );

    setEditingFee(true);
  }

  async function saveManualFee() {
    try {
      setSavingFee(true);

      const amount = Number(
        feeDraft.replace(",", ".")
      );

      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error(
          "Montant commission invalide"
        );
      }

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
            paymentFee: {
              amount,
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "manual_fee_update_failed"
        );
      }

      (order as any).payment = {
        ...((order as any).payment || {}),
        fee: data.paymentFee.amount,
        feeCurrency: data.paymentFee.currency,
        feeSource: data.paymentFee.source,
        feeDetectedAt: new Date(),
      };

      setEditingFee(false);
      setFeeTick((x) => x + 1);
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error
          ? e.message
          : "Erreur commission"
      );
    } finally {
      setSavingFee(false);
    }
  }

  async function copyCurrentShippingAddress() {
    await copyText(
      formatAddress(shippingAddress) || ""
    );

    onCopyAddress();
  }

  async function copyCurrentBillingAddress() {
    await copyText(
      formatAddress(billingAddress) || ""
    );
  }

  async function saveAddress(kind: AddressKind) {
    try {
      setSavingAddress(true);

      const pass =
        localStorage.getItem(
          "admin_password"
        ) || "";

      const nextAddress = {
        ...addressDraft,
      };

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
            [kind]: nextAddress,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "address_update_failed"
        );
      }

      if (kind === "shippingAddress") {
        setLocalShippingAddress(nextAddress);
      } else {
        setLocalBillingAddress(nextAddress);
      }

      (order as any)[kind] = nextAddress;

      setEditingAddress(null);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour adresse");
    } finally {
      setSavingAddress(false);
    }
  }

  function startDeliveryNoteEdit() {
    setDeliveryNoteDraft(
      deliveryNoteToDraft(deliveryNote)
    );
    setEditingDeliveryNote(true);
  }

  function updateDeliveryNoteDraft(
    key: keyof DeliveryNoteDraft,
    value: string
  ) {
    setDeliveryNoteDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveDeliveryNote() {
    try {
      setSavingDeliveryNote(true);

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
            deliveryNote: deliveryNoteDraft,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "delivery_note_update_failed"
        );
      }

      setLocalDeliveryNote(data.deliveryNote);
      (order as any).deliveryNote =
        data.deliveryNote;
      setEditingDeliveryNote(false);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour BL");
    } finally {
      setSavingDeliveryNote(false);
    }
  }

  function renderAddressEditor(kind: AddressKind) {
    return (
      <div className="od-address-form">
        {(
          [
            ["name", "Nom"],
            ["address", "Adresse"],
            ["postalCode", "Code postal"],
            ["city", "Ville"],
            ["country", "Pays"],
          ] as Array<
            [keyof AddressDraft, string]
          >
        ).map(([key, label]) => (
          <label
            key={key}
            className="od-address-field"
          >
            <span>{label}</span>
            <input
              value={addressDraft[key]}
              onChange={(e) =>
                updateAddressDraft(
                  key,
                  e.target.value
                )
              }
            />
          </label>
        ))}

        <div className="od-inline-actions">
          <button
            className="btn-primary"
            disabled={savingAddress}
            onClick={() =>
              saveAddress(kind)
            }
          >
            {savingAddress
              ? "Enregistrement..."
              : "Enregistrer"}
          </button>

          <button
            className="btn-secondary"
            disabled={savingAddress}
            onClick={() =>
              setEditingAddress(null)
            }
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  function invoiceHref(mode: "preview" | "download") {
    return `/api/admin/orders/invoice?orderId=${encodeURIComponent(
      order.id
    )}&mode=${mode}`;
  }

  function deliveryNoteHref(mode: "preview" | "download") {
    return `/api/admin/orders/delivery-note?orderId=${encodeURIComponent(
      order.id
    )}&mode=${mode}`;
  }

  /* =========================================================
     SEND REVIEW
  ========================================================= */

  async function sendReviewNow(
    orderId: string
  ) {
    try {
      setSendingReview(true);

      const res = await fetch(
        "/api/admin/reviews/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      if (!data?.ok) {
        throw new Error();
      }

      const now = new Date();

      setLocalReview((prev: any) => ({
        ...prev,
        status: "sent",
        sentAt: now,
        scheduledAt: null,
      }));
    } catch (e) {
      console.error(e);

      alert("❌ Erreur envoi email");
    } finally {
      setSendingReview(false);
    }
  }

  /* =========================================================
     REVIEW STATUS
  ========================================================= */

  function renderReviewStatus() {
    if (!review?.status) return "—";

    switch (review.status) {
      case "scheduled":
        return "⏳ Programmé";

      case "sending":
        return "📤 Envoi...";

      case "sent":
        return "✅ Envoyé";

      case "error":
        return "❌ Erreur";

      default:
        return review.status;
    }
  }

  function renderInvoiceStatus() {
    if (!invoice?.status) return "—";

    switch (invoice.status) {
      case "sending":
        return "📤 Envoi...";

      case "sent":
        return "✅ Envoyée";

      case "error":
        return "❌ Erreur";

      default:
        return invoice.status;
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="od-page">

      {/* =====================================================
         GENERAL INFO
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Informations générales
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-info-grid">

            <div className="od-info-card od-info-card-email">
              <div className="od-info-label">
                Commande
              </div>

              <div className="od-info-value">
                {displayId}
              </div>
            </div>

            <div className="od-info-card">
              <div className="od-info-label">
                Email
              </div>

              <div className="od-info-value">
                <div className="od-info-edit">
                  {editingContact ===
                  "email" ? (
                    <>
                      <label className="od-address-field">
                        <input
                          value={contactDraft.email}
                          onChange={(e) =>
                            updateContactDraft(
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <button
                        className="btn-primary"
                        disabled={savingContact}
                        onClick={saveContact}
                      >
                        OK
                      </button>

                      <button
                        className="btn-secondary"
                        disabled={savingContact}
                        onClick={() =>
                          setEditingContact(null)
                        }
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <span>
                        {localEmail || "—"}
                      </span>

                      <button
                        className="btn-secondary"
                        onClick={() =>
                          startContactEdit(
                            "email"
                          )
                        }
                      >
                        Modifier email
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="od-info-card">
              <div className="od-info-label">
                Livraison
              </div>

              <div className="od-info-value">
                <ShippingStatusPill
                  order={order}
                />
              </div>
            </div>

<div className="od-info-card">
  <div className="od-info-label">
    Téléphone
  </div>

  <div className="od-info-value">
    <div className="od-info-edit">
      {editingContact ===
      "phone" ? (
        <>
          <label className="od-address-field">
            <input
              value={contactDraft.phone}
              onChange={(e) =>
                updateContactDraft(
                  "phone",
                  e.target.value
                )
              }
            />
          </label>

          <button
            className="btn-primary"
            disabled={savingContact}
            onClick={saveContact}
          >
            OK
          </button>

          <button
            className="btn-secondary"
            disabled={savingContact}
            onClick={() =>
              setEditingContact(null)
            }
          >
            Annuler
          </button>
        </>
      ) : (
        <>
          <span>{phone}</span>

          <button
            className="btn-secondary"
            onClick={() =>
              startContactEdit(
                "phone"
              )
            }
          >
            Modifier
          </button>
        </>
      )}
    </div>
  </div>
</div>


<div className="od-info-card">
  <div className="od-info-label">
    Site
  </div>

  <div className="od-info-value">
    {site}
  </div>
</div>

<div className="od-info-card">
  <div className="od-info-label">
    Média
  </div>

  <div className="od-info-value">
    {heardFromLabel}
  </div>
</div>

{heardFromOther && (
  <div className="od-info-card">
    <div className="od-info-label">
      Détail média
    </div>

    <div className="od-info-value">
      {heardFromOther}
    </div>
  </div>
)}

          </div>

        </div>

      </section>

      {/* =====================================================
         ADDRESSES
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Adresses
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-address-grid">

            <div className="od-address-card">

              <div className="od-address-title">
                Livraison
              </div>

              <div className="od-address-text">
                {editingAddress ===
                "shippingAddress"
                  ? renderAddressEditor(
                      "shippingAddress"
                    )
                  : formatAddress(
                      shippingAddress
                    ) || "—"}
              </div>

              {editingAddress !==
                "shippingAddress" && (
                <div className="od-inline-actions">
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      startAddressEdit(
                        "shippingAddress"
                      )
                    }
                  >
                    Modifier
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={
                      copyCurrentShippingAddress
                    }
                  >
                    Copier
                  </button>
                </div>
              )}

            </div>

            <div className="od-address-card">

              <div className="od-address-title">
                Facturation
              </div>

              <div className="od-address-text">
                {editingAddress ===
                "billingAddress"
                  ? renderAddressEditor(
                      "billingAddress"
                    )
                  : formatAddress(
                      billingAddress
                    ) || "—"}
              </div>

              {editingAddress !==
                "billingAddress" && (
                <div className="od-inline-actions">
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      startAddressEdit(
                        "billingAddress"
                      )
                    }
                  >
                    Modifier
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={
                      copyCurrentBillingAddress
                    }
                  >
                    Copier
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
         PRODUCTS
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Produits
          </h2>
        </div>

        <div className="od-table-wrap">

          <table className="od-table">

            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Aucun produit
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const name =
                    typeof it?.name ===
                    "string"
                      ? it.name
                      : it?.name?.fr ||
                        it?.name?.en ||
                        "Produit";

                  const qty =
                    it?.quantity ?? 1;

                  const price =
                    getItemPrice(it);

                  return (
                    <tr key={idx}>

                      <td>

                        <div className="od-product-name">
                          {name}
                        </div>

                        <div className="od-product-sub">
                          Produit boutique
                        </div>

                      </td>

                      <td className="od-table-price">
                        {moneyEUR(price)}
                      </td>

                      <td>
                        x{qty}
                      </td>

                      <td className="od-table-price">
                        {moneyEUR(
                          price * qty
                        )}
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
         TOTALS
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Totaux
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-totals">

            <div className="od-total-row">

              <div className="od-total-label">
                Sous-total
              </div>

              <div className="od-total-value">
                {moneyEUR(subtotal)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                Livraison
              </div>

              <div className="od-total-value">
                {moneyEUR(shipping)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                Commission
                {paymentFee
                  ? ` ${paymentFee.label}`
                  : ""}
              </div>

              <div
                className={
                  paymentFee
                    ? "od-total-value od-total-negative"
                    : "od-total-value od-total-muted"
                }
              >
                {editingFee ? (
                  <span className="od-total-inline-action">
                    <input
                      className="od-fee-input"
                      value={feeDraft}
                      onChange={(e) =>
                        setFeeDraft(
                          e.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="0,00"
                    />

                    <button
                      className="btn-primary"
                      disabled={savingFee}
                      onClick={saveManualFee}
                    >
                      OK
                    </button>

                    <button
                      className="btn-secondary"
                      disabled={savingFee}
                      onClick={() =>
                        setEditingFee(false)
                      }
                    >
                      Annuler
                    </button>
                  </span>
                ) : paymentFee ? (
                  <span className="od-total-inline-action">
                    -{moneyEUR(paymentFee.amount)}
                    <button
                      className="btn-secondary"
                      onClick={startFeeEdit}
                    >
                      Modifier
                    </button>
                  </span>
                ) : (
                    <span className="od-total-inline-action">
                      Non détectée
                      <button
                        className="btn-secondary"
                        disabled={detectingFee}
                        onClick={detectPaymentFee}
                      >
                        {detectingFee
                          ? "Recherche..."
                          : "Récupérer"}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={startFeeEdit}
                      >
                        Saisir
                      </button>
                    </span>
                  )}
              </div>

            </div>

            <div className="od-total-row od-total-final">

              <div className="od-total-label">
                Total
              </div>

              <div className="od-total-value">
                {moneyEUR(total)}
              </div>

            </div>

            {paymentFee && (
              <div className="od-total-row od-total-net">

                <div className="od-total-label">
                  Total net
                </div>

                <div className="od-total-value">
                  {moneyEUR(netTotal)}
                </div>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
         META
      ===================================================== */}

      <section className="od-section">

        <div className="od-section-head">
          <h2 className="od-section-title">
            Facture & avis
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-meta-grid">

            {/* INVOICE */}

            <div className="od-meta-card">
              <div className="od-meta-card-title">
                Facture
              </div>

              <div className="od-meta-row">

                <div className="od-meta-label">
                  Statut facture
                </div>

                <div className="od-meta-value">
                  {renderInvoiceStatus()}
                </div>

              </div>

              {(sendingInvoice ||
                invoice?.status ===
                  "sent") && (
                <div className="od-meta-row">

                  <div className="od-meta-label">
                    Dernier envoi
                  </div>

                  <div className="od-meta-value">
                    {toDateSafe(
                      invoice?.lastSentAt ||
                        invoice?.sentAt
                    )?.toLocaleString(
                      "fr-FR"
                    ) || "—"}
                  </div>

                </div>
              )}

              <div className="od-inline-actions">
                <a
                  className="btn-secondary"
                  href={invoiceHref("preview")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Prévisualiser
                </a>

                <a
                  className="btn-secondary"
                  href={invoiceHref("download")}
                >
                  Télécharger
                </a>

                <button
                  className={
                    invoice?.status ===
                    "sent"
                      ? "btn-secondary"
                      : "btn-primary"
                  }
                  disabled={sendingInvoice}
                  onClick={() =>
                    sendInvoiceNow(order.id)
                  }
                >
                  {sendingInvoice
                    ? "Envoi..."
                    : invoice?.status ===
                      "sent"
                    ? "Renvoyer"
                    : "Envoyer"}
                </button>
              </div>

            </div>

            {/* DELIVERY NOTE */}

            <div className="od-meta-card">
              <div className="od-meta-card-title">
                Bon de livraison
              </div>

              {editingDeliveryNote ? (
                <div className="od-delivery-form">
                  <label className="od-address-field">
                    <span>Colis</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryNoteDraft.packageCount}
                      onChange={(e) =>
                        updateDeliveryNoteDraft(
                          "packageCount",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="od-address-field">
                    <span>Poids</span>
                    <input
                      value={deliveryNoteDraft.weight}
                      placeholder="Ex : 1,2 kg"
                      onChange={(e) =>
                        updateDeliveryNoteDraft(
                          "weight",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="od-address-field od-delivery-wide">
                    <span>Consignes</span>
                    <textarea
                      value={deliveryNoteDraft.instructions}
                      placeholder="Consignes de préparation ou d'impression..."
                      onChange={(e) =>
                        updateDeliveryNoteDraft(
                          "instructions",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <div className="od-inline-actions">
                    <button
                      className="btn-primary"
                      disabled={savingDeliveryNote}
                      onClick={saveDeliveryNote}
                    >
                      {savingDeliveryNote
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>

                    <button
                      className="btn-secondary"
                      disabled={savingDeliveryNote}
                      onClick={() =>
                        setEditingDeliveryNote(false)
                      }
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="od-meta-row">
                    <div className="od-meta-label">
                      Colis
                    </div>

                    <div className="od-meta-value">
                      {deliveryNote?.packageCount ?? "—"}
                    </div>
                  </div>

                  <div className="od-meta-row">
                    <div className="od-meta-label">
                      Poids
                    </div>

                    <div className="od-meta-value">
                      {deliveryNote?.weight || "—"}
                    </div>
                  </div>

                  <div className="od-meta-row">
                    <div className="od-meta-label">
                      Consignes
                    </div>

                    <div className="od-meta-value">
                      {deliveryNote?.instructions
                        ? deliveryNote.instructions.slice(
                            0,
                            80
                          )
                        : "—"}
                    </div>
                  </div>

                  <div className="od-inline-actions">
                    <button
                      className="btn-secondary"
                      onClick={startDeliveryNoteEdit}
                    >
                      Éditer BL
                    </button>

                    <a
                      className="btn-secondary"
                      href={deliveryNoteHref("preview")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Prévisualiser
                    </a>

                    <a
                      className="btn-secondary"
                      href={deliveryNoteHref("download")}
                    >
                      Télécharger
                    </a>
                  </div>
                </>
              )}

            </div>

            {/* REVIEW */}

            <div className="od-meta-card">
              <div className="od-meta-card-title">
                Avis client
              </div>

              <div className="od-meta-row">

                <div className="od-meta-label">
                  Statut email
                </div>

                <div className="od-meta-value">
                  {renderReviewStatus()}
                </div>

              </div>

              {(sendingReview ||
                review?.status ===
                  "sent") && (
                <div className="od-meta-row">

                  <div className="od-meta-label">
                    Dernier envoi
                  </div>

                  <div className="od-meta-value">
                    {toDateSafe(
                      review?.sentAt
                    )?.toLocaleString(
                      "fr-FR"
                    ) || "—"}
                  </div>

                </div>
              )}

              {!sendingReview &&
                review?.status ===
                  "scheduled" &&
                toDateSafe(
                  review?.scheduledAt
                ) && (
                  <div className="od-meta-row">

                    <div className="od-meta-label">
                      Prévu dans
                    </div>

                    <div className="od-meta-value">
                      {getRemainingTime(
                        review?.scheduledAt
                      )}
                    </div>

                  </div>
                )}

              <div className="od-inline-actions">
                <button
                  className={
                    review?.status ===
                    "sent"
                      ? "btn-secondary"
                      : "btn-primary"
                  }
                  disabled={sendingReview}
                  onClick={() =>
                    sendReviewNow(order.id)
                  }
                >
                  {sendingReview
                    ? "Envoi..."
                    : review?.status ===
                      "sent"
                    ? "Renvoyer"
                    : "Envoyer"}
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
