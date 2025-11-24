"use client";

import { use, useEffect, useState, ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import SendcloudWidget from "@/components/shipping/sendcloud/SendcloudWidget"; // ⬅️ TON WIDGET UNIQUE

/* ============================================================
   Types
============================================================ */

type Locale = "fr" | "en";

type ShippingMethodFS = {
  name: any;
  delay: any;
  price: any;
  type: "relay" | "home";
  isActive: boolean;
};

type ShippingMethod = {
  id: string;
  name: string;
  delay: string;
  price: number;
  type: "relay" | "home";
};

/* ============================================================
   CHECKOUT PAGE
============================================================ */

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { items, getTotal } = useCart();

  /* === STATES === */
  const [shippingMethods, setShipping] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [relayPoint, setRelayPoint] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    shippingMethod: "",
  });

  /* ============================================================
     LOAD SHIPPING FROM FIRESTORE
  ============================================================ */
  useEffect(() => {
    async function load() {
      setLoadingShipping(true);

      const snap = await getDocs(collection(db, "shipping_methods"));

      const list: ShippingMethod[] = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as ShippingMethodFS) }))
        .filter((m) => m.isActive)
        .map((m) => {
          const price =
            typeof m.price === "number"
              ? m.price
              : m.price?.[locale] ?? m.price?.fr ?? 0;

          return {
            id: m.id,
            name: m.name?.[locale] ?? m.name?.fr ?? "Livraison",
            delay: m.delay?.[locale] ?? m.delay?.fr ?? "",
            price,
            type: m.type,
          };
        });

      setShipping(list);

      if (list.length > 0) {
        setForm((f) => ({ ...f, shippingMethod: list[0].id }));
      }

      setLoadingShipping(false);
    }

    load();
  }, [locale]);

  /* ============================================================
     FORM HANDLER
  ============================================================ */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const currentMethod = shippingMethods.find(
    (m) => m.id === form.shippingMethod
  );

  const relayMissing = currentMethod?.type === "relay" && !relayPoint;

  /* ============================================================
     STRIPE CHECKOUT
  ============================================================ */

  const handleCheckout = async () => {
    if (!currentMethod) {
      alert("Méthode invalide");
      return;
    }

    if (currentMethod.type === "relay" && !relayPoint) {
      alert(
        locale === "fr"
          ? "Veuillez sélectionner un point relais."
          : "Please select a relay point."
      );
      return;
    }

    setIsPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingMethod: currentMethod,
          customerEmail: form.email,
          shippingAddress: form,
          relayPoint,
          currency: "eur",
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erreur pendant la redirection vers Stripe.");
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert("Erreur inattendue.");
    } finally {
      setIsPaying(false);
    }
  };

  const total = getTotal() + (currentMethod?.price || 0);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="checkout-page">
      <h1 className="checkout-title">
        {locale === "fr" ? "Informations de livraison" : "Shipping details"}
      </h1>

      <div className="checkout-card">
        {/* ========================= FORMULAIRE ========================= */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Adresse" : "Address"}
          </h2>

          <div className="checkout-fields">
            {["name", "email", "address", "city", "postalCode", "phone"].map(
              (field) => (
                <input
                  key={field}
                  name={field}
                  className="checkout-input"
                  placeholder={
                    locale === "fr"
                      ? {
                          name: "Nom complet",
                          email: "Email",
                          address: "Adresse",
                          city: "Ville",
                          postalCode: "Code postal",
                          phone: "Téléphone",
                        }[field]
                      : {
                          name: "Full name",
                          email: "Email",
                          address: "Address",
                          city: "City",
                          postalCode: "ZIP",
                          phone: "Phone",
                        }[field]
                  }
                  value={(form as any)[field]}
                  onChange={handleChange}
                />
              )
            )}
          </div>
        </section>

        {/* ========================= SHIPPING METHOD ========================= */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Méthode de livraison" : "Shipping method"}
          </h2>

          {loadingShipping ? (
            <p>Chargement…</p>
          ) : shippingMethods.length === 0 ? (
            <p className="text-red-500 text-sm">
              {locale === "fr"
                ? "Aucune méthode de livraison n’est configurée."
                : "No shipping method configured."}
            </p>
          ) : (
            <select
              name="shippingMethod"
              className="checkout-input"
              value={form.shippingMethod}
              onChange={handleChange}
            >
              {shippingMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.price.toFixed(2)} €
                </option>
              ))}
            </select>
          )}

          {/* ========================= SENDCLOUD WIDGET UNIQUE ========================= */}

          <div className="mt-4">
            <SendcloudWidget
              onSelect={(data: any) => {
                console.log("📦 Selected in Sendcloud:", data);
                setRelayPoint(data);
              }}
            />
          </div>

          {/* Message si point relais manquant */}
          {relayMissing && (
            <p className="mt-2 text-red-600 text-sm">
              {locale === "fr"
                ? "Veuillez sélectionner une méthode de livraison."
                : "Please select a delivery method."}
            </p>
          )}

          {/* Résumé */}
          {relayPoint && (
            <div className="p-3 mt-3 bg-blue-50 border rounded">
              <p className="font-semibold">
                {locale === "fr"
                  ? "Méthode de livraison sélectionnée"
                  : "Selected shipping method"}
              </p>
              <p>{relayPoint.name}</p>
              <p>{relayPoint.street}</p>
              <p>
                {relayPoint.postalCode} {relayPoint.city}
              </p>
            </div>
          )}
        </section>

        {/* ========================= TOTAL ========================= */}
        <section className="checkout-total">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="checkout-total-amount">{total.toFixed(2)} €</span>
        </section>

        {/* ========================= PAY BUTTON ========================= */}
        <button
          className={`checkout-button ${
            relayMissing || isPaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={relayMissing || isPaying}
          onClick={handleCheckout}
        >
          {isPaying
            ? locale === "fr"
              ? "Redirection…"
              : "Redirecting…"
            : locale === "fr"
            ? "Payer maintenant 💳"
            : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
