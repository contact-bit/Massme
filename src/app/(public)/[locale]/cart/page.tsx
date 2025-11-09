"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  price: { eur: number; usd?: number; gbp?: number };
  description?: Record<Locale, string>;
  quantity?: number;
};

export default function CartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  // ✅ Nouvelle API Next.js 16 : déballer la Promise
  const { locale } = React.use(params);

  const [cart, setCart] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Lecture du panier côté client uniquement
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(storedCart);
    } catch (err) {
      console.error("Erreur lors du chargement du panier :", err);
      setCart([]);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // ⚙️ Suppression d’un article
  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // 💰 Calcul du total
  const total = cart.reduce((acc, item) => acc + (item.price?.eur || 0), 0);

  // 🚫 Empêche le rendu avant hydratation
  if (!isMounted) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center text-gray-600">
        {locale === "fr" ? "Chargement du panier..." : "Loading your cart..."}
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-2xl font-bold mb-6">
        {locale === "fr" ? "🛒 Votre panier" : "🛒 Your cart"}
      </h1>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center">
          {locale === "fr" ? "Votre panier est vide." : "Your cart is empty."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-4"
              >
                <div>
                  <h2 className="font-medium text-lg">
                    {item?.name?.[locale] ?? item?.name?.fr ?? "Produit"}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {item.price?.eur?.toFixed(2)} €
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 text-sm hover:underline transition"
                >
                  {locale === "fr" ? "Supprimer" : "Remove"}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">
              {locale === "fr" ? "Total" : "Total"} :{" "}
              <span className="font-bold">{total.toFixed(2)} €</span>
            </p>

            <Link
              href={`/${locale}/checkout`}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
            >
              {locale === "fr"
                ? "Passer au paiement"
                : "Proceed to checkout"}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
