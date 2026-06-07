"use client";

import "./OrderDetails.css";

import React, { useEffect, useState } from "react";

import type { Order } from "../domain/types";

import {
  moneyEUR,
  formatAddress,
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

type PaymentFeeMethod = {
  id: string;
  provider: string;
  label: string;
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

function formatAddressBlock(value: any) {
  if (!value) return "";

  const name =
    value?.name ||
    [value?.firstName, value?.lastName]
      .filter(Boolean)
      .join(" ");

  const cityLine = [
    value?.postalCode,
    value?.city,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    name,
    value?.address,
    cityLine,
    value?.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function getLocalizedName(value: any) {
  if (typeof value === "string") return value;

  return (
    value?.fr ||
    value?.en ||
    value?.label ||
    ""
  );
}

function paymentProviderFallbackLabel(
  provider: string
) {
  if (provider === "stripe") return "Stripe";
  if (provider === "paypal") return "PayPal";
  if (provider === "manual") return "Virement bancaire";

  return provider || "Paiement";
}

export function OrderDetails({
  order,
  onCopyAddress,
}: {
  order: Order;
  onCopyAddress: () => void;
}) {
  const [sendingInvoice, setSendingInvoice] =
    useState(false);

  const [localInvoice, setLocalInvoice] =
    useState(
      (order as any)?.invoiceEmail || null
    );
  const [
    localInvoiceNumber,
    setLocalInvoiceNumber,
  ] = useState(
    (order as any)?.invoiceNumber ||
      (order as any)?.invoiceEmail
        ?.invoiceNumber ||
      ""
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

  const [feeMethodDraft, setFeeMethodDraft] =
    useState("");

  const [paymentFeeMethods, setPaymentFeeMethods] =
    useState<PaymentFeeMethod[]>([]);

  const [savingFee, setSavingFee] =
    useState(false);

  const [, setFeeTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadPaymentMethods() {
      try {
        const res = await fetch(
          "/api/admin/payment-methods",
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!alive || !res.ok || !data?.ok) {
          return;
        }

        const methods: PaymentFeeMethod[] =
          (data.methods || [])
            .map((method: any) => {
              const provider = String(
                method?.provider || "manual"
              ).toLowerCase();

              const label =
                getLocalizedName(method?.name) ||
                paymentProviderFallbackLabel(provider);

              return {
                id: String(method?.id || provider),
                provider,
                label,
              };
            })
            .filter(
              (method: PaymentFeeMethod) =>
                method.id && method.label
            );

        setPaymentFeeMethods(methods);
      } catch {
        if (alive) {
          setPaymentFeeMethods([]);
        }
      }
    }

    loadPaymentMethods();

    return () => {
      alive = false;
    };
  }, []);

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

    setLocalInvoiceNumber(
      (order as any)?.invoiceNumber ||
        (order as any)?.invoiceEmail
          ?.invoiceNumber ||
        ""
    );

  }, [order]);

  const invoice =
    localInvoice?.status === "sent"
      ? localInvoice
      : (order as any)?.invoiceEmail ||
        localInvoice;

  const invoiceNumber =
    localInvoiceNumber ||
    (order as any)?.invoiceNumber ||
    invoice?.invoiceNumber ||
    "";

  const orderSequence = Number(
    String(
      (order as any)?.orderNumber || ""
    ).match(/^ID(\d+)$/)?.[1] || 0
  );

  const invoiceSequence = Number(
    String(invoiceNumber).match(
      /^FID(\d+)$/
    )?.[1] || 0
  );

  const shouldLoadInvoiceNumber =
    Boolean(order.id) &&
    (!invoiceNumber ||
      (orderSequence > 0 &&
        invoiceSequence > 0 &&
        invoiceSequence < orderSequence));

  useEffect(() => {
    let cancelled = false;

    if (!shouldLoadInvoiceNumber) {
      return;
    }

    async function loadInvoiceNumber() {
      try {
        const res = await fetch(
          `/api/admin/orders/invoice-number?orderId=${encodeURIComponent(
            order.id
          )}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (
          !cancelled &&
          res.ok &&
          data?.invoiceNumber
        ) {
          setLocalInvoiceNumber(
            data.invoiceNumber
          );

          setLocalInvoice((prev: any) => ({
            ...(prev || {}),
            invoiceNumber:
              data.invoiceNumber,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadInvoiceNumber();

    return () => {
      cancelled = true;
    };
  }, [order.id, shouldLoadInvoiceNumber]);

  const shippingAddress =
    localShippingAddress ||
    (order as any)?.shippingAddress ||
    null;

  const billingAddress =
    localBillingAddress ||
    (order as any)?.billingAddress ||
    shippingAddress;

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

  const storedFeeProvider =
    String(
      (order as any)?.payment?.feeProvider ||
        (order as any)?.payment?.provider ||
        (order as any)?.paymentMethod?.provider ||
        (order as any)?.paymentProvider ||
        ""
    ).toLowerCase();

  const storedFeeMethodId =
    String(
      (order as any)?.payment?.feeMethodId ||
        (order as any)?.paymentMethod?.id ||
        ""
    );

  const fallbackPaymentFeeMethods =
    [
      {
        id: "stripe",
        provider: "stripe",
        label: "Stripe",
      },
      {
        id: "paypal",
        provider: "paypal",
        label: "PayPal",
      },
      {
        id: "manual",
        provider: "manual",
        label: "Virement bancaire",
      },
    ];

  const feeMethodOptions =
    [
      ...paymentFeeMethods,
      ...fallbackPaymentFeeMethods,
    ].reduce<PaymentFeeMethod[]>(
      (acc, method) => {
        const key = `${method.provider}:${method.label.toLowerCase()}`;

        if (
          acc.some(
            (existing) =>
              `${existing.provider}:${existing.label.toLowerCase()}` ===
              key
          )
        ) {
          return acc;
        }

        acc.push(method);

        return acc;
      },
      []
    );

  const netTotal =
    total -
    (paymentFee?.amount || 0);

  const vatRate =
    Number(
      (order as any)?.totals?.vatRate ??
        (order as any)?.shippingMethod?.vatRate ??
        20
    ) || 20;

  const itemVat = (amount: number) =>
    amount * (vatRate / 100);

  const shippingVat =
    shipping * (vatRate / 100);

  const totalVat =
    Number((order as any)?.totals?.totalVAT) ||
    itemVat(subtotal + shipping);

  const shippingMethodName =
    (order as any)?.shippingMethod?.name ||
    "Expédition";

  const shippingMethodDelay =
    (order as any)?.shippingMethod?.delay ||
    "—";

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
        orderNumber:
          data?.orderNumber ??
          prev?.orderNumber,
        invoiceNumber:
          data?.invoiceNumber ??
          prev?.invoiceNumber,
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
    const currentMethod =
      feeMethodOptions.find(
        (method) =>
          method.id === storedFeeMethodId ||
          method.provider === storedFeeProvider ||
          method.label === paymentFee?.label
      ) || feeMethodOptions[0];

    setFeeDraft(
      paymentFee?.amount
        ? String(paymentFee.amount)
        : ""
    );
    setFeeMethodDraft(currentMethod?.id || "");

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

      const selectedMethod =
        feeMethodOptions.find(
          (method) =>
            method.id === feeMethodDraft
        );

      if (!selectedMethod) {
        throw new Error(
          "Méthode de paiement obligatoire"
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
              methodId: selectedMethod.id,
              provider: selectedMethod.provider,
              label: selectedMethod.label,
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
        feeProvider:
          data.paymentFee.provider ||
          selectedMethod.provider,
        feeLabel:
          data.paymentFee.label ||
          selectedMethod.label,
        feeMethodId:
          data.paymentFee.methodId ||
          selectedMethod.id,
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
    const billingEmail =
      localEmail ||
      (order as any)?.billingAddress
        ?.email ||
      (order as any)?.customerEmail ||
      (order as any)?.email ||
      "";

    await copyText(
      [
        formatAddress(billingAddress),
        billingEmail
          ? `Email : ${billingEmail}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
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

  function renderInvoiceStatus() {
    if (!invoice?.status) {
      return "—";
    }

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
            Détail commande
          </h2>
        </div>

        <div className="od-section-body">

          <div className="od-detail-grid">

            <div className="od-detail-card">
              <div className="od-detail-title">
                Général
              </div>

              <div className="od-detail-line">
                <span>Site</span>
                <strong>{site}</strong>
              </div>

              <div className="od-detail-line">
                <span>Média</span>
                <strong>{heardFromLabel}</strong>
              </div>

              <div className="od-detail-line od-invoice-number-line">
                <span>N° facture</span>
                <strong>
                  {invoiceNumber || "Création..."}
                </strong>
              </div>

              <div className="od-detail-line od-detail-invoice">
                <span>Facture</span>

                <strong>
                  <span className="od-invoice-status">
                    {renderInvoiceStatus()}
                  </span>

                  <span className="od-invoice-actions">
                    <a
                      className="btn-secondary od-mini-action"
                      href={invoiceHref("preview")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir
                    </a>

                    <a
                      className="btn-secondary od-mini-action"
                      href={invoiceHref("download")}
                    >
                      PDF
                    </a>

                    <button
                      className={
                        invoice?.status ===
                        "sent"
                          ? "btn-secondary od-mini-action"
                          : "btn-primary od-mini-action"
                      }
                      disabled={sendingInvoice}
                      onClick={() =>
                        sendInvoiceNow(order.id)
                      }
                    >
                      {sendingInvoice
                        ? "..."
                        : invoice?.status ===
                          "sent"
                        ? "Renvoyer"
                        : "Envoyer"}
                    </button>
                  </span>
                </strong>
              </div>

              {heardFromOther && (
                <div className="od-detail-line">
                  <span>Détail</span>
                  <strong>{heardFromOther}</strong>
                </div>
              )}
            </div>

            <div className="od-detail-card">
              <div className="od-detail-title-row">
                <div className="od-detail-title">
                  Adresse facturation
                </div>

                {editingAddress !==
                  "billingAddress" && (
                  <button
                    className="btn-secondary od-mini-action"
                    onClick={() =>
                      startAddressEdit(
                        "billingAddress"
                      )
                    }
                  >
                    Modifier
                  </button>
                )}
              </div>

              <div className="od-address-text">
                {editingAddress ===
                "billingAddress"
                  ? renderAddressEditor(
                      "billingAddress"
                    )
                  : formatAddressBlock(
                      billingAddress
                    ) || "—"}
              </div>

              {editingAddress !==
                "billingAddress" && (
                <>
                  <div className="od-contact-row">
                    <span>Adresse e-mail</span>
                    {editingContact ===
                    "email" ? (
                      <span className="od-contact-edit">
                        <input
                          value={contactDraft.email}
                          onChange={(e) =>
                            updateContactDraft(
                              "email",
                              e.target.value
                            )
                          }
                        />

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
                      </span>
                    ) : (
                      <strong>
                        {localEmail || "—"}
                        <button
                          className="btn-secondary od-mini-action"
                          onClick={() =>
                            startContactEdit(
                              "email"
                            )
                          }
                        >
                          Modifier
                        </button>
                      </strong>
                    )}
                  </div>

                  <div className="od-contact-row">
                    <span>Téléphone</span>
                    {editingContact ===
                    "phone" ? (
                      <span className="od-contact-edit">
                        <input
                          value={contactDraft.phone}
                          onChange={(e) =>
                            updateContactDraft(
                              "phone",
                              e.target.value
                            )
                          }
                        />

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
                      </span>
                    ) : (
                      <strong>
                        {phone}
                        <button
                          className="btn-secondary od-mini-action"
                          onClick={() =>
                            startContactEdit(
                              "phone"
                            )
                          }
                        >
                          Modifier
                        </button>
                      </strong>
                    )}
                  </div>
                </>
              )}

              {editingAddress !==
                "billingAddress" && (
                <div className="od-inline-actions">
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

            <div className="od-detail-card">
              <div className="od-detail-title-row">
                <div className="od-detail-title">
                  Adresse expédition
                </div>

                {editingAddress !==
                  "shippingAddress" && (
                  <button
                    className="btn-secondary od-mini-action"
                    onClick={() =>
                      startAddressEdit(
                        "shippingAddress"
                      )
                    }
                  >
                    Modifier
                  </button>
                )}
              </div>

              <div className="od-address-text">
                {editingAddress ===
                "shippingAddress"
                  ? renderAddressEditor(
                      "shippingAddress"
                    )
                  : formatAddressBlock(
                      shippingAddress
                    ) || "—"}
              </div>

              {editingAddress !==
                "shippingAddress" && (
                <div className="od-inline-actions">
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

          </div>

        </div>

      </section>

      <section className="od-section">

        <div className="od-table-wrap">

          <table className="od-table od-order-table">

            <colgroup>
              <col className="od-col-item" />
              <col className="od-col-price" />
              <col className="od-col-qty" />
              <col className="od-col-total" />
              <col className="od-col-vat" />
            </colgroup>

            <thead>
              <tr>
                <th>Article(s)</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Total</th>
                <th>TVA</th>
              </tr>
            </thead>

            <tbody>

              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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

                  const lineTotal =
                    price * qty;

                  return (
                    <tr key={idx}>

                      <td>
                        <div className="od-product-name">
                          {name}
                        </div>
                      </td>

                      <td className="od-table-price">
                        {moneyEUR(price)}
                      </td>

                      <td>x {qty}</td>

                      <td className="od-table-price">
                        {moneyEUR(lineTotal)}
                      </td>

                      <td className="od-table-price">
                        {moneyEUR(
                          itemVat(lineTotal)
                        )}
                      </td>

                    </tr>
                  );
                })
              )}

              <tr className="od-shipping-row">
                <td colSpan={5}>
                  Expédition
                </td>
              </tr>

              <tr>
                <td>
                  <div className="od-product-name">
                    {shippingMethodName}
                  </div>
                </td>

                <td>
                  {shippingMethodDelay}
                </td>

                <td />

                <td className="od-table-price">
                  {moneyEUR(shipping)}
                </td>

                <td className="od-table-price">
                  {moneyEUR(shippingVat)}
                </td>
              </tr>

            </tbody>

          </table>

          <div className="od-totals od-totals-inline">

            <div className="od-total-row">

              <div className="od-total-label">
                Total articles
              </div>

              <div className="od-total-value">
                {moneyEUR(subtotal)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                Expédition
              </div>

              <div className="od-total-value">
                {moneyEUR(shipping)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                TVA
              </div>

              <div className="od-total-value">
                {moneyEUR(totalVat)}
              </div>

            </div>

            <div className="od-total-row od-total-final">

              <div className="od-total-label">
                Total payé
              </div>

              <div className="od-total-value">
                {moneyEUR(total)}
              </div>

            </div>

            <div className="od-total-row">

              <div className="od-total-label">
                {paymentFee
                  ? `Frais ${paymentFee.label}`
                  : "Frais"}
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
                    <select
                      className="od-fee-method-select"
                      value={feeMethodDraft}
                      onChange={(e) =>
                        setFeeMethodDraft(
                          e.target.value
                        )
                      }
                    >
                      {feeMethodOptions.map(
                        (method) => (
                          <option
                            key={method.id}
                            value={method.id}
                          >
                            {method.label}
                          </option>
                        )
                      )}
                    </select>

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
                    <button
                      className="btn-secondary"
                      onClick={startFeeEdit}
                    >
                      Modifier
                    </button>
                    <span className="od-fee-amount">
                      -{moneyEUR(paymentFee.amount)}
                    </span>
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

    </div>
  );
}
