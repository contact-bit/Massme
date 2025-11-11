"use client";

import { useState, use, useEffect } from "react"; // ✅ on ajoute useEffect ici
import { useRouter } from "next/navigation";

type Locale = "fr" | "en";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }> | { locale: Locale };
}) {
  // ✅ Si params est une Promise, on la résout avec `use()`
  const resolvedParams =
    typeof (params as any).then === "function"
      ? use(params as Promise<{ locale: Locale }>)
      : (params as { locale: Locale });

  const { locale } = resolvedParams;
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
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

  // 🛒 Charger le panier depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 📝 Gestion des champs du formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // 💳 Lancer la commande (création session Stripe)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert(
        locale === "fr" ? "Votre panier est vide 🛒" : "Your cart is empty 🛒"
      );
      return;
    }

    if (!form.email || !form.name || !form.address) {
      alert(
        locale === "fr"
          ? "Veuillez remplir toutes les informations obligatoires."
          : "Please fill all required fields."
      );
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
      console.log("📦 Réponse API checkout :", data);

      if (!res.ok) {
        console.error("❌ Erreur API checkout:", data);
        alert(
          `Erreur serveur: ${
            data.error || "Impossible de créer la session Stripe"
          }`
        );
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur : lien de paiement introuvable.");
      }
    } catch (error) {
      console.error("💥 Erreur checkout:", error);
      alert("Une erreur est survenue lors de la commande 😢");
    } finally {
      setLoading(false);
    }
  };

  // 💶 Calcul du total estimé
  const total =
    cart.reduce(
      (sum, p) => sum + (p.price?.eur || 0) * (p.quantity || 1),
      0
    ) + (form.shippingMethod === "express" ? 8.99 : 0);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        {locale === "fr"
          ? "🧾 Informations de livraison"
          : "🧾 Shipping details"}
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4 border border-gray-100">
        {/* FORMULAIRE */}
        <input
          type="text"
          name="name"
          placeholder={locale === "fr" ? "Nom complet" : "Full name"}
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          name="address"
          placeholder={locale === "fr" ? "Adresse" : "Address"}
          value={form.address}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
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

        {/* MÉTHODE DE LIVRAISON */}
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

        {/* TOTAL */}
        <div className="text-right border-t pt-4">
          <p className="text-lg font-semibold">
            {locale === "fr" ? "Total estimé :" : "Estimated total:"}{" "}
            <span className="text-blue-600">
              {new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "EUR",
              }).format(total)}
            </span>
          </p>
        </div>

        {/* BOUTON DE PAIEMENT */}
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
