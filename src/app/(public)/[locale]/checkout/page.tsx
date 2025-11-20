"use client";

import { use, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import TestMRModal from "@/components/TestMRModal";
import RelayModalPickup from "@/components/RelayWidget";

/* ============================================================
   📦 Types Firestore + Relay Points
============================================================ */

type ShippingMethodFS = {
  name: any;
  delay: any;
  price: any;
  type: "home" | "relay";
  relayProvider?: string | null;
  isActive: boolean;
};

type RelayPoint = {
  name: string;
  address: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  raw?: any;
};

type Locale = "fr" | "en";

/* ============================================================
   📦 COMPONENT
============================================================ */

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { items, getTotal } = useCart();

  const [shippingMethods, setShipping] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [showRelayModal, setShowRelayModal] = useState(false);

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
     🔥 Load shipping methods
  ============================================================ */
  useEffect(() => {
    async function load() {
      setLoadingShipping(true);

      const snap = await getDocs(collection(db, "shipping_methods"));

      const list = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as ShippingMethodFS),
        }))
        .filter((m) => m.isActive)
        .map((m) => ({
          id: m.id,
          name: m.name?.[locale] || m.name?.fr,
          delay: m.delay?.[locale] || m.delay?.fr,
          price: m.price?.[locale] || m.price?.fr,
          type: m.type,
          relayProvider: m.relayProvider || null,
        }));

      setShipping(list);

      if (list.length > 0) {
        setForm((f) => ({ ...f, shippingMethod: list[0].id }));
      }

      setLoadingShipping(false);
    }

    load();
  }, [locale]);

  /* ============================================================
     📝 Form handler
  ============================================================ */
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const currentMethod = shippingMethods.find(
    (m) => m.id === form.shippingMethod
  );

  /* ============================================================
     💳 Checkout / Stripe
  ============================================================ */
  const handleCheckout = async () => {
    if (!currentMethod)
      return alert(locale === "fr" ? "Méthode invalide" : "Invalid method");

    if (currentMethod.type === "relay" && !relayPoint) {
      return alert(
        locale === "fr"
          ? "Veuillez sélectionner un point relais"
          : "Select a relay point"
      );
    }

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
    else alert("Erreur paiement");
  };

  const total = getTotal() + (currentMethod?.price || 0);

  /* ============================================================
     🎨 RENDER
  ============================================================ */
  return (
    <main className="checkout-page">
      <h1 className="checkout-title">
        {locale === "fr" ? "Informations de livraison" : "Shipping details"}
      </h1>

      <div className="checkout-card">

        {/* FORMULAIRE */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Adresse" : "Address"}
          </h2>

          <div className="checkout-fields">
            <input name="name" className="checkout-input" placeholder={locale === "fr" ? "Nom complet" : "Full name"} value={form.name} onChange={handleChange} />
            <input name="email" className="checkout-input" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="address" className="checkout-input" placeholder={locale === "fr" ? "Adresse" : "Address"} value={form.address} onChange={handleChange} />

            <div className="checkout-row">
              <input name="city" className="checkout-input" placeholder={locale === "fr" ? "Ville" : "City"} value={form.city} onChange={handleChange} />
              <input name="postalCode" className="checkout-input" placeholder={locale === "fr" ? "Code postal" : "ZIP"} value={form.postalCode} onChange={handleChange} />
            </div>

            <input name="phone" className="checkout-input" placeholder={locale === "fr" ? "Téléphone" : "Phone"} value={form.phone} onChange={handleChange} />
          </div>
        </section>

        {/* MÉTHODES */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Méthode de livraison" : "Shipping method"}
          </h2>

          {loadingShipping ? (
            <p className="checkout-loading">Chargement…</p>
          ) : (
            <select
              className="checkout-input"
              name="shippingMethod"
              value={form.shippingMethod}
              onChange={(e) => {
                handleChange(e);
                setRelayPoint(null);
              }}
            >
              {shippingMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.price.toFixed(2)} €
                </option>
              ))}
            </select>
          )}

          {/* MONDIAL RELAY */}
          {currentMethod?.type === "relay" &&
            currentMethod.relayProvider === "mondialrelay" && (
              <>
                <button
                  className="checkout-button mt-3"
                  onClick={() => setShowRelayModal(true)}
                >
                  {locale === "fr"
                    ? "Choisir un point Mondial Relay"
                    : "Select Mondial Relay point"}
                </button>

                {relayPoint && (
                  <div className="p-3 mt-3 bg-blue-50 border rounded">
                    <p className="font-semibold">{relayPoint.name}</p>
                    <p>{relayPoint.address}</p>
                    {relayPoint.address2 && <p>{relayPoint.address2}</p>}
                    <p>{relayPoint.postalCode} {relayPoint.city}</p>
                  </div>
                )}
              </>
            )}

          {/* PICKUP */}
          {currentMethod?.type === "relay" &&
            currentMethod.relayProvider === "pickup" && (
              <>
                <button
                  className="checkout-button mt-3"
                  onClick={() => setShowRelayModal(true)}
                >
                  {locale === "fr"
                    ? "Choisir un point Pickup"
                    : "Select Pickup point"}
                </button>

                {relayPoint && (
                  <div className="p-3 mt-3 bg-blue-50 border rounded">
                    <p className="font-semibold">{relayPoint.name}</p>
                    <p>{relayPoint.address}</p>
                    <p>{relayPoint.postalCode} {relayPoint.city}</p>
                  </div>
                )}
              </>
            )}
        </section>

        {/* TOTAL */}
        <section className="checkout-total">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="checkout-total-amount">{total.toFixed(2)} €</span>
        </section>

        <button className="checkout-button" onClick={handleCheckout}>
          {locale === "fr" ? "Payer maintenant 💳" : "Pay now 💳"}
        </button>
      </div>

      {/* MODALS */}

      {/* Mondial Relay */}
      {showRelayModal &&
        currentMethod?.relayProvider === "mondialrelay" && (
          <TestMRModal
            onSelect={(data: RelayPoint) => {
              setRelayPoint(data);
              setShowRelayModal(false);
            }}
          />
        )}

      {/* Pickup */}
      {showRelayModal &&
        currentMethod?.relayProvider === "pickup" && (
          <RelayModalPickup
            onClose={() => setShowRelayModal(false)}
            onSelect={(data: RelayPoint) => setRelayPoint(data)}
          />
        )}
    </main>
  );
}
