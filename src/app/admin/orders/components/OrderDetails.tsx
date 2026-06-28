"use client";

import "./OrderDetails.css";

import React, { useEffect, useState } from "react";
import { FiPackage, FiTruck } from "react-icons/fi";

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

type CatalogProduct = {
  id?: string;
  sku?: string;
  productCode?: string;
  name?: string | { fr?: string; en?: string };
  imageUrl?: string;
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
  const [editingAll, setEditingAll] =
    useState(false);
  const [savingAll, setSavingAll] =
    useState(false);
  const [copiedAll, setCopiedAll] =
    useState(false);
  const [billingDraft, setBillingDraft] =
    useState<AddressDraft>(addressToDraft(null));
  const [shippingDraft, setShippingDraft] =
    useState<AddressDraft>(addressToDraft(null));
  const [allContactDraft, setAllContactDraft] =
    useState<ContactDraft>({ email: "", phone: "" });

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
  const [catalogProducts, setCatalogProducts] =
    useState<CatalogProduct[]>([]);

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
    let alive = true;

    async function loadCatalogProducts() {
      try {
        const response = await fetch("/api/admin/products", {
          cache: "no-store",
        });
        const data = await response.json();

        if (alive && response.ok) {
          setCatalogProducts(data?.products || []);
        }
      } catch {
        if (alive) setCatalogProducts([]);
      }
    }

    loadCatalogProducts();
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

  }, [order]);

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
    getPaymentFee(order);

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

  function catalogImageForItem(item: (typeof items)[number], name: string) {
    const normalizedName = name.trim().toLowerCase();
    const product = catalogProducts.find((candidate) => {
      const candidateName =
        typeof candidate.name === "string"
          ? candidate.name
          : candidate.name?.fr || candidate.name?.en || "";

      return (
        Boolean(item.id && candidate.id === item.id) ||
        Boolean(item.sku && candidate.sku === item.sku) ||
        Boolean(
          item.productCode &&
            candidate.productCode === item.productCode
        ) ||
        candidateName.trim().toLowerCase() === normalizedName
      );
    });

    return product?.imageUrl || "";
  }

  function startEditAll() {
    setBillingDraft(addressToDraft(billingAddress));
    setShippingDraft(addressToDraft(shippingAddress));
    setAllContactDraft({
      email: localEmail,
      phone: localPhone,
    });
    if (paymentFee) {
      startFeeEdit();
    }
    setEditingAll(true);
  }

  async function saveAllDetails() {
    try {
      setSavingAll(true);
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billingAddress: billingDraft,
            shippingAddress: shippingDraft,
            contact: allContactDraft,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "order_update_failed");
      }

      setLocalBillingAddress(billingDraft);
      setLocalShippingAddress(shippingDraft);
      setLocalEmail(allContactDraft.email);
      setLocalPhone(allContactDraft.phone);
      (order as any).billingAddress = billingDraft;
      (order as any).shippingAddress = shippingDraft;
      (order as any).email = allContactDraft.email;
      (order as any).__email = allContactDraft.email;
      if (editingFee) {
        await saveManualFee();
      }
      setEditingAll(false);
    } catch (error) {
      console.error(error);
      alert("Erreur mise à jour commande");
    } finally {
      setSavingAll(false);
    }
  }

  async function copyAllDetails() {
    await copyText(
      [
        formatAddressBlock(billingAddress) || "—",
        "Adresse e-mail",
        localEmail || "—",
        "Téléphone",
        phone,
      ].join("\n")
    );
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1600);
    onCopyAddress();
  }

  function renderGlobalAddressFields(
    title: string,
    draft: AddressDraft,
    setDraft: React.Dispatch<React.SetStateAction<AddressDraft>>
  ) {
    return (
      <div className="od-detail-card">
        <div className="od-detail-title">{title}</div>
        <div className="od-address-form">
          {(
            [
              ["name", "Nom"],
              ["address", "Adresse"],
              ["postalCode", "Code postal"],
              ["city", "Ville"],
              ["country", "Pays"],
            ] as Array<[keyof AddressDraft, string]>
          ).map(([key, label]) => (
            <label className="od-address-field" key={key}>
              <span>{label}</span>
              <input
                value={draft[key]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>
    );
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

      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          order.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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

      const res = await fetch(
        "/api/admin/orders/detect-payment-fee",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
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

      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          order.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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
          <div className="od-global-actions">
            {editingAll ? (
              <>
                <button
                  className="btn-primary"
                  disabled={savingAll}
                  onClick={saveAllDetails}
                >
                  {savingAll ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  className="btn-secondary"
                  disabled={savingAll}
                  onClick={() => {
                    setEditingAll(false);
                    setEditingFee(false);
                  }}
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={startEditAll}>
                  Modifier
                </button>
                <button className="btn-secondary" onClick={copyAllDetails}>
                  {copiedAll ? "Copié" : "Copier"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="od-section-body">

          <div
            className={`od-detail-grid${
              editingAll ? " od-detail-grid-editing" : ""
            }`}
          >
            {editingAll ? (
              <>
                {renderGlobalAddressFields(
                  "Adresse facturation",
                  billingDraft,
                  setBillingDraft
                )}
                {renderGlobalAddressFields(
                  "Adresse expédition",
                  shippingDraft,
                  setShippingDraft
                )}
                <div className="od-detail-card od-edit-contact-card">
                  <div className="od-detail-title">Contact</div>
                  <div className="od-address-form">
                    <label className="od-address-field">
                      <span>Adresse e-mail</span>
                      <input
                        value={allContactDraft.email}
                        onChange={(event) =>
                          setAllContactDraft((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="od-address-field">
                      <span>Téléphone</span>
                      <input
                        value={allContactDraft.phone}
                        onChange={(event) =>
                          setAllContactDraft((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>

            <div className="od-detail-card">
              <div className="od-detail-title">Adresse facturation</div>

              <div className="od-address-text">
                {formatAddressBlock(billingAddress) || "—"}
              </div>
            </div>

            <div className="od-detail-card">
              <div className="od-detail-title">Adresse expédition</div>

              <div className="od-address-text">
                {formatAddressBlock(shippingAddress) || "—"}
              </div>
            </div>

            <div className="od-detail-card od-contact-card">
              <div className="od-detail-title">Contact</div>

              <div className="od-contact-row">
                <span>Adresse e-mail</span>
                <strong>{localEmail || "—"}</strong>
              </div>
              <div className="od-contact-row">
                <span>Téléphone</span>
                <strong>{phone}</strong>
              </div>
            </div>
              </>
            )}

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

                  const image =
                    it?.imageUrl ||
                    it?.image ||
                    it?.thumbnail ||
                    it?.photo ||
                    catalogImageForItem(it, name) ||
                    "";

                  return (
                    <tr className="od-product-row" key={idx}>

                      <td>
                        <div className="od-product-cell">
                          <div className="od-product-image">
                            {image ? (
                              <img src={image} alt="" />
                            ) : (
                              <FiPackage />
                            )}
                          </div>
                          <div>
                            <div className="od-product-name">
                              {name}
                            </div>
                            <span className="od-product-sub">
                              Article
                            </span>
                          </div>
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

              <tr className="od-shipping-detail-row">
                <td>
                  <div className="od-shipping-cell">
                    <div className="od-shipping-icon">
                      <FiTruck />
                    </div>
                    <div>
                      <div className="od-product-name">
                        {shippingMethodName}
                      </div>
                      <span className="od-product-sub">
                        Expédition
                      </span>
                    </div>
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
                  </span>
                ) : paymentFee ? (
                  <span className="od-total-inline-action">
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
