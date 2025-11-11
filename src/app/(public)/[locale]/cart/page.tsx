"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  price: { eur: number };
  quantity?: number;
};

export default function CartPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale) as Locale;

  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Charger le panier depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 🔹 Supprimer un article
  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // 🔹 Modifier la quantité
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = cart.map((p, i) =>
      i === index ? { ...p, quantity } : p
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // 🔹 Calcul du total
  const total = cart.reduce(
    (sum, p) => sum + p.price.eur * (p.quantity || 1),
    0
  );

  // 🔹 Lancer le paiement Stripe
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, locale }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("❌ Erreur lors de la création de la session Stripe");
        console.error(data);
      }
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert("❌ Impossible de démarrer le paiement");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Si panier vide
  if (cart.length === 0)
    return (
      <main className="max-w-3xl mx-auto py-10 px-4 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">
          {locale === "fr" ? "Votre panier est vide 🛒" : "Your cart is empty 🛒"}
        </h1>
        <p>
          <a
            href={`/${locale}/products`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {locale === "fr" ? "Voir les produits" : "View products"}
          </a>
        </p>
      </main>
    );

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8">
        {locale === "fr" ? "Mon panier 🛒" : "My cart 🛒"}
      </h1>

      <div className="space-y-6">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${index}`} // ✅ clé unique, bug corrigé
            className="flex items-center justify-between border-b pb-4"
          >
            <div>
              <h2 className="font-semibold text-lg">
                {item.name?.[locale] || item.name.fr}
              </h2>
              <p className="text-gray-600">
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price.eur)}{" "}
                ×{" "}
                <input
                  type="number"
                  min={1}
                  value={item.quantity || 1}
                  onChange={(e) => updateQuantity(index, Number(e.target.value))}
                  className="w-16 ml-2 border rounded text-center"
                />
              </p>
            </div>
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:underline"
            >
              {locale === "fr" ? "Supprimer" : "Remove"}
            </button>
          </div>
        ))}
      </div>

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
  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
>
  {locale === "fr" ? "Valider ma commande 🧾" : "Proceed to checkout 🧾"}
</button>

      </div>
    </main>
  );
}
