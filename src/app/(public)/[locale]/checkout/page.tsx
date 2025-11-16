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
  // ✅ Next.js 16 — unwrap de la Promise
  const { locale } = use(params);

  const { items, getTotal, clearCart } = useCart();

  // --------------------------------------------------
  // Shipping methods
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Checkout Stripe
  // --------------------------------------------------
  const handleCheckout = async () => {
    const method = shippingMethods.find((m) => m.id === form.shippingMethod);
    if (!method) return alert("Sélectionnez un transporteur");

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

  // Total final
  const shippingPrice =
    shippingMethods.find((m) => m.id === form.shippingMethod)?.price || 0;

  const total = getTotal() + shippingPrice;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <main className="max-w-2xl mx-auto py-12 px-6 text-gray-900">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700">
        {locale === "fr" ? "🧾 Informations de livraison" : "🧾 Shipping details"}
      </h1>

      <div className="bg-white shadow-xl rounded-3xl p-8 space-y-10 border border-gray-100">
        {/* Adresse */}
        <section>
          <h2 className="text-xl font-bold mb-6">📍 Adresse</h2>

          <div className="flex flex-col gap-5">
            <input
              className="input"
              name="name"
              placeholder={locale === "fr" ? "Nom complet" : "Full name"}
              value={form.name}
              onChange={handleChange}
            />

            <input
              className="input"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              className="input"
              name="address"
              placeholder={locale === "fr" ? "Adresse" : "Address"}
              value={form.address}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-5">
              <input
                className="input"
                name="city"
                placeholder={locale === "fr" ? "Ville" : "City"}
                value={form.city}
                onChange={handleChange}
              />

              <input
                className="input"
                name="postalCode"
                placeholder={locale === "fr" ? "Code postal" : "ZIP"}
                value={form.postalCode}
                onChange={handleChange}
              />
            </div>

            <input
              className="input"
              name="phone"
              placeholder={locale === "fr" ? "Téléphone" : "Phone"}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Méthode de livraison */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            {locale === "fr" ? "🚚 Méthode de livraison" : "🚚 Shipping method"}
          </h2>

          {loadingShipping ? (
            <p>Chargement…</p>
          ) : shippingMethods.length === 0 ? (
            <p className="text-red-600">
              {locale === "fr"
                ? "Aucun transporteur disponible."
                : "No carrier available."}
            </p>
          ) : (
            <select
              className="input"
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

        {/* Total */}
        <section className="flex justify-between text-2xl font-bold border-t pt-6">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </section>

        <button
          onClick={handleCheckout}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-semibold hover:bg-blue-700"
        >
          {locale === "fr" ? "Payer maintenant 💳" : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
