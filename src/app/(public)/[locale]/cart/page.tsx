"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  price: { eur: number };
  quantity?: number;
  imageUrl?: string; // ✅ CHAMP MANQUANT AJOUTÉ
};

export default function CartPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale) as Locale;

  const [cart, setCart] = useState<Product[]>([]);

  // 🔹 Charger le panier
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 🔹 Supprimer
  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated")); // 🔥 met à jour le mini panier
  };

  // 🔹 Mettre quantité
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = cart.map((p, i) =>
      i === index ? { ...p, quantity } : p
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // 🔹 Total
  const total = cart.reduce(
    (sum, p) => sum + p.price.eur * (p.quantity || 1),
    0
  );

  // 🔹 Panier vide
  if (cart.length === 0)
    return (
      <main className="max-w-3xl mx-auto py-10 px-4 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">
          {locale === "fr" ? "Votre panier est vide 🛒" : "Your cart is empty 🛒"}
        </h1>
        <a
          href={`/${locale}/products`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {locale === "fr" ? "Voir les produits" : "View products"}
        </a>
      </main>
    );

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8">
        {locale === "fr" ? "Mon panier" : "My cart"} 🛒
      </h1>

      {/* =====================================================
          🔥 LISTE PRODUITS AVEC IMAGE
      ===================================================== */}
      <div className="space-y-6">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-5 border-b pb-4"
          >
            {/* IMAGE PRODUIT */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name?.[locale] || item.name.fr}
                className="w-24 h-24 object-cover rounded-md border"
              />
            )}

            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {item.name?.[locale] || item.name.fr}
              </h2>

              <p className="text-gray-600">
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price.eur)}
              </p>

              {/* QUANTITÉ */}
              <input
                type="number"
                min={1}
                value={item.quantity || 1}
                onChange={(e) =>
                  updateQuantity(index, Number(e.target.value))
                }
                className="mt-2 border rounded px-2 py-1 w-16 text-center"
              />
            </div>

            {/* SUPPRIMER */}
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:underline"
            >
              {locale === "fr" ? "Supprimer" : "Remove"}
            </button>
          </div>
        ))}
      </div>

      {/* =====================================================
          🔥 TOTAL + BOUTON CHECKOUT
      ===================================================== */}
      <div className="mt-10 flex justify-between items-center border-t pt-6">
        <p className="text-xl font-semibold">
          {locale === "fr" ? "Total :" : "Total:"}{" "}
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: "EUR",
          }).format(total)}
        </p>

        <button
          onClick={() => router.push(`/${locale}/checkout`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition shadow"
        >
          {locale === "fr" ? "Valider ma commande 🧾" : "Proceed to checkout 🧾"}
        </button>
      </div>
    </main>
  );
}
