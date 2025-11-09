"use client";

import { useState, use } from "react"; // ✅ import du hook `use`

type Locale = "fr" | "en";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  // ✅ Nouvelle méthode Next.js 16 : déstructuration de la Promise avec `use()`
  const { locale } = use(params);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    shippingMethod: "standard",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          currency: "eur",
          shippingMethod: {
            name: {
              fr:
                form.shippingMethod === "express"
                  ? "Livraison express"
                  : "Livraison standard",
              en:
                form.shippingMethod === "express"
                  ? "Express shipping"
                  : "Standard shipping",
            },
            price: { fr: form.shippingMethod === "express" ? 8.99 : 0 },
          },
          customerEmail: form.email,
          shippingAddress: form,
        }),
      });

const data = await res.json();

if (!res.ok) {
  console.error("❌ Erreur API checkout:", data);
  alert(`Erreur serveur: ${data.error || "Impossible de créer la session Stripe"}`);
  return;
}

if (data.url) {
  window.location.href = data.url;
} else {
  alert("Erreur de redirection Stripe.");
}



    } catch (error) {
      console.error("Erreur checkout:", error);
      alert("Une erreur est survenue lors de la commande 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        {locale === "fr"
          ? "🧾 Informations de livraison"
          : "🧾 Shipping details"}
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4 border border-gray-100">
        <input
          type="text"
          name="name"
          placeholder={locale === "fr" ? "Nom complet" : "Full name"}
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="address"
          placeholder={locale === "fr" ? "Adresse" : "Address"}
          value={form.address}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex gap-3">
          <input
            type="text"
            name="city"
            placeholder={locale === "fr" ? "Ville" : "City"}
            value={form.city}
            onChange={handleChange}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            name="postalCode"
            placeholder={locale === "fr" ? "Code postal" : "Postal code"}
            value={form.postalCode}
            onChange={handleChange}
            className="w-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <input
          type="text"
          name="phone"
          placeholder={locale === "fr" ? "Téléphone" : "Phone"}
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="shippingMethod"
          value={form.shippingMethod}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="standard">
            🚚{" "}
            {locale === "fr"
              ? "Livraison standard (gratuite)"
              : "Standard shipping (free)"}
          </option>
          <option value="express">
            ⚡{" "}
            {locale === "fr"
              ? "Livraison express (8,99 €)"
              : "Express shipping (€8.99)"}
          </option>
        </select>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading
            ? locale === "fr"
              ? "Traitement en cours..."
              : "Processing..."
            : locale === "fr"
            ? "Payer maintenant 💳"
            : "Pay now 💳"}
        </button>
      </div>
    </main>
  );
}
