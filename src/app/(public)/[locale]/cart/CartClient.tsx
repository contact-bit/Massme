"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  price: { eur: number; usd?: number; gbp?: number };
  description?: Record<Locale, string>;
  quantity?: number;
};

export default function CartClient({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ✅ Ne s’exécute que côté client
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(storedCart);
    } catch (err) {
      console.error("Erreur lecture panier :", err);
      setCart([]);
    }
    setMounted(true);
  }, []);

  // 🧩 Tant que le composant n’est pas monté, on ne rend rien (évite le mismatch SSR)
  if (!mounted) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-gray-900">
        <p className="text-gray-500">
          {locale === "fr" ? "Chargement du panier..." : "Loading cart..."}
        </p>
      </main>
    );
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((acc, item) => acc + (item.price?.eur || 0), 0);

  return (
    <main className="max-w-3xl mx-auto py-10 text-gray-900">
      <h1 className="text-2xl font-bold mb-6">
        {locale === "fr" ? "🛒 Votre panier" : "🛒 Your cart"}
      </h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">
          {locale === "fr" ? "Votre panier est vide." : "Your cart is empty."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-4">
                <div>
                  <h2 className="font-medium text-lg">
                    {item?.name
                      ? locale === "en"
                        ? item.name.en
                        : item.name.fr
                      : "Produit"}
                  </h2>
                  <p className="text-gray-600 text-sm">{item.price?.eur} €</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  {locale === "fr" ? "Supprimer" : "Remove"}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">
              {locale === "fr" ? "Total" : "Total"} : {total.toFixed(2)} €
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
