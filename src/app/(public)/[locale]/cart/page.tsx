"use client";

import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, clearCart, getTotal } = useCart();
  const params = useParams();
  const locale = params.locale as "fr" | "en";

  const total = getTotal();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">
        {locale === "fr" ? "🛒 Votre panxxxier" : "🛒 Your cart"}
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-500">
          {locale === "fr" ? "Votre panier est vide." : "Your cart is empty."}
        </p>
      ) : (
        <>
          <ul className="divide-y mb-6">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.price} € × {item.quantity}
                  </p>
                </div>

                <button
                  className="text-red-600 hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between text-xl font-semibold mb-6">
            <span>Total :</span>
            <span>{total.toFixed(2)} €</span>
          </div>

          <a
            href={`/${locale}/checkout`}
            className="bg-black text-white px-6 py-3 rounded-md block text-center hover:bg-gray-800 transition"
          >
            {locale === "fr" ? "Passer au paiement" : "Checkout"}
          </a>
        </>
      )}
    </main>
  );
}
