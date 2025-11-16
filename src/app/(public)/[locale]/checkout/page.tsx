"use client";

import { use, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

type Locale = "fr" | "en";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { items, getTotal } = useCart();

  const [shippingMethods, setShipping] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    shippingMethod: "",
  });

  useEffect(() => {
    loadShippingMethods();
  }, [locale]);

  async function loadShippingMethods() {
    setLoadingShipping(true);

    const snap = await getDocs(collection(db, "shipping_methods"));

    const list = snap.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        name: data.name?.[locale],
        delay: data.delay?.[locale],
        price: data.price?.[locale],
        isActive: data.isActive ?? true,
      };
    });

    const usable = list.filter(
      (m) => m.isActive && m.name && m.delay && typeof m.price === "number"
    );

    setShipping(usable);
    setLoadingShipping(false);

    if (usable.length > 0) {
      setForm((f) => ({ ...f, shippingMethod: usable[0].id }));
    }
  }

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async () => {
    const method = shippingMethods.find((m) => m.id === form.shippingMethod);
    if (!method)
      return alert(
        locale === "fr"
          ? "Sélectionnez une méthode de livraison"
          : "Select a shipping method"
      );

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        shippingMethod: method,
        customerEmail: form.email,
        shippingAddress: form,
        currency: "eur",
      }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Erreur paiement");
  };

  const shippingPrice =
    shippingMethods.find((m) => m.id === form.shippingMethod)?.price || 0;

  const total = getTotal() + shippingPrice;

  return (
    <main className="checkout-page">
      <h1 className="checkout-title">
        {locale === "fr" ? "Informations de livraison" : "Shipping details"}
      </h1>

      <div className="checkout-card">
        {/* FORMULAIRE CLIENT */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">
            {locale === "fr" ? "Adresse" : "Address"}
          </h2>

          <div className="checkout-fields">
            <input
              name="name"
              className="checkout-input"
              placeholder={locale === "fr" ? "Nom complet" : "Full name"}
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="email"
              className="checkout-input"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="address"
              className="checkout-input"
              placeholder={locale === "fr" ? "Adresse" : "Address"}
              value={form.address}
              onChange={handleChange}
            />

            <div className="checkout-row">
              <input
                name="city"
                className="checkout-input"
                placeholder={locale === "fr" ? "Ville" : "City"}
                value={form.city}
                onChange={handleChange}
              />
              <input
                name="postalCode"
                className="checkout-input"
                placeholder={locale === "fr" ? "Code postal" : "ZIP"}
                value={form.postalCode}
                onChange={handleChange}
              />
            </div>

            <input
              name="phone"
              className="checkout-input"
              placeholder={locale === "fr" ? "Téléphone" : "Phone"}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* SHIPPING METHODS */}
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
              onChange={handleChange}
            >
              {shippingMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.price.toFixed(2)} €
                </option>
              ))}
            </select>
          )}
        </section>

        {/* TOTAL */}
        <section className="checkout-total">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="checkout-total-amount">
            {total.toFixed(2)} €
          </span>
        </section>

        <button className="checkout-button" onClick={handleCheckout}>
          {locale === "fr" ? "Payer maintenant 💳" : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
