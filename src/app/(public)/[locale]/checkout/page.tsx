"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Locale = "fr" | "en";

type ShippingMethod = {
  id: string;
  name: string;
  delay: string;
  price: number;
  isActive: boolean;
};

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {

  // ⬅️ OBLIGATOIRE NEXT.JS 16
  const resolved = use(params);
  const locale: Locale = resolved.locale;

  // --------------------------
  // STATES
  // --------------------------
  const [cart, setCart] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
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

  const [loading, setLoading] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Load shipping methods per locale
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
        name: data.name?.[locale] || null,
        delay: data.delay?.[locale] || null,
        price: data.price?.[locale] || null,
        isActive: data.isActive ?? true,
      };
    });

    const usable = list.filter(
      (m) => m.isActive && m.name && m.delay && typeof m.price === "number"
    );

    setShippingMethods(usable);
    setLoadingShipping(false);

    if (usable.length > 0) {
      setForm((prev) => ({ ...prev, shippingMethod: usable[0].id }));
    }
  }

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async () => {
    const selected = shippingMethods.find((m) => m.id === form.shippingMethod);
    if (!selected) {
      alert(locale === "fr" ? "Sélectionnez un transporteur" : "Select carrier");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        currency: "eur",
        shippingMethod: {
          name: selected.name,
          price: selected.price,
        },
        customerEmail: form.email,
        shippingAddress: form,
      }),
    });

    const data = await res.json();

    if (res.ok && data.url) window.location.href = data.url;
    else alert("Erreur paiement");

    setLoading(false);
  };

  // Total
  const selectedMethod = shippingMethods.find(
    (m) => m.id === form.shippingMethod
  );

  const shippingPrice = selectedMethod?.price || 0;

  const total =
    cart.reduce((s, p) => s + (p.price?.eur || 0) * (p.quantity || 1), 0) +
    shippingPrice;

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        {locale === "fr" ? "🧾 Informations de livraison" : "🧾 Shipping details"}
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-8">

        {/* Adresse */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {locale === "fr" ? "📍 Adresse de livraison" : "📍 Shipping address"}
          </h2>

          <div className="flex flex-col gap-4">
            <input className="input" name="name" placeholder={locale === "fr" ? "Nom complet" : "Full name"} value={form.name} onChange={handleChange} />
            <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input className="input" name="address" placeholder={locale === "fr" ? "Adresse" : "Address"} value={form.address} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <input className="input" name="city" placeholder={locale === "fr" ? "Ville" : "City"} value={form.city} onChange={handleChange} />
              <input className="input" name="postalCode" placeholder={locale === "fr" ? "Code postal" : "ZIP"} value={form.postalCode} onChange={handleChange} />
            </div>

            <input className="input" name="phone" placeholder={locale === "fr" ? "Téléphone" : "Phone"} value={form.phone} onChange={handleChange} />
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="text-lg font-semibold mb-3">
            {locale === "fr" ? "🚚 Méthode de livraison" : "🚚 Shipping method"}
          </h2>

          {loadingShipping ? (
            <p>Chargement…</p>
          ) : shippingMethods.length === 0 ? (
            <p className="text-red-600">
              {locale === "fr" ? "Aucun transporteur disponible." : "No carrier available."}
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
        <section className="flex justify-between text-xl font-semibold border-t pt-4">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </section>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading
            ? locale === "fr" ? "Traitement…" : "Processing…"
            : locale === "fr" ? "Payer maintenant 💳" : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
