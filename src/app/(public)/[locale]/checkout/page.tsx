"use client";

import { useState, useEffect } from "react";
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

export default function CheckoutPage({ params }: any) {
  // ✔️ Next.js 16 fournit automatiquement params
  const locale: Locale = params.locale;

  // -----------------------------
  // STATES
  // -----------------------------
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

  // -----------------------------
  // Load Cart
  // -----------------------------
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // -----------------------------
  // Load Shipping Methods (Firestore)
  // -----------------------------
  useEffect(() => {
    loadShippingMethods();
  }, [locale]);

  async function loadShippingMethods() {
    setLoadingShipping(true);

    const snap = await getDocs(collection(db, "shipping_methods"));

    const list: ShippingMethod[] = snap.docs.map((d) => {
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

  // -----------------------------
  // Handle Form
  // -----------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // -----------------------------
  // Checkout
  // -----------------------------
  const handleCheckout = async () => {
    const selected = shippingMethods.find((m) => m.id === form.shippingMethod);

    if (!selected) {
      alert("Sélectionnez un transporteur");
      return;
    }

    try {
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

      if (!res.ok) {
        alert("Erreur serveur : " + data.error);
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Erreur paiement.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Total price
  // -----------------------------
  const selectedMethod = shippingMethods.find(
    (m) => m.id === form.shippingMethod
  );

  const shippingPrice = selectedMethod?.price || 0;

  const total =
    cart.reduce(
      (sum, p) => sum + (p.price?.eur || 0) * (p.quantity || 1),
      0
    ) + shippingPrice;

  // -----------------------------
  // UI — Perfect Checkout
  // -----------------------------
  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        🧾 {locale === "fr" ? "Informations de livraison" : "Shipping details"}
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 space-y-10">

        {/* ADRESSE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📍 {locale === "fr" ? "Adresse de livraison" : "Shipping address"}
          </h2>

          <input className="input" name="name" placeholder={locale === "fr" ? "Nom complet" : "Full name"} value={form.name} onChange={handleChange} />
          <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input className="input" name="address" placeholder={locale === "fr" ? "Adresse" : "Address"} value={form.address} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <input className="input" name="city" placeholder={locale === "fr" ? "Ville" : "City"} value={form.city} onChange={handleChange} />
            <input className="input" name="postalCode" placeholder={locale === "fr" ? "Code postal" : "ZIP"} value={form.postalCode} onChange={handleChange} />
          </div>

          <input className="input" name="phone" placeholder={locale === "fr" ? "Téléphone" : "Phone"} value={form.phone} onChange={handleChange} />
        </section>

        {/* SHIPPING METHOD */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🚚 {locale === "fr" ? "Méthode de livraison" : "Shipping method"}
          </h2>

          {loadingShipping ? (
            <p>Chargement…</p>
          ) : shippingMethods.length === 0 ? (
            <p className="text-red-600">Aucun transporteur disponible.</p>
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

        {/* TOTAL */}
        <section className="flex justify-between text-xl font-semibold pt-6 border-t">
          <span>{locale === "fr" ? "Total à payer :" : "Total:"}</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </section>

        {/* BUTTON */}
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
