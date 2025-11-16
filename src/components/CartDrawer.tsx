"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer({ locale }: { locale: string }) {
  const { items, removeItem, isOpen, toggleCart, getTotal } = useCart();

  return (
    <div>
      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={toggleCart}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 p-6 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <h2 className="text-xl font-semibold mb-4">
          {locale === "fr" ? "Votre panier" : "Your cart"}
        </h2>

        {/* PANIER VIDE */}
        {items.length === 0 ? (
          <p className="text-gray-500">
            {locale === "fr" ? "Votre panier est vide." : "Your cart is empty."}
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div className="flex flex-col">
                  <p className="font-medium">{item.name}</p>

                  <p className="text-sm text-gray-500">
                    {(Number(item.price) || 0).toFixed(2)} € × {item.quantity}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:underline"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* TOTAL */}
            <div className="text-right font-semibold text-lg mt-4">
              Total : {getTotal().toFixed(2)} €
            </div>

            {/* CTA */}
            <Link
              href={`/${locale}/checkout`}
              className="btn-primary block text-center mt-4"
              onClick={toggleCart}
            >
              {locale === "fr" ? "Commander" : "Checkout"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
