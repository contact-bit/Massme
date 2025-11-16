"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";   // ✅ MANQUANT !!

export default function CartDrawer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];
  const locale = rawLocale === "fr" || rawLocale === "en" ? rawLocale : "fr";

  const { items, removeItem, isOpen, toggleCart, getTotal } = useCart();

  const T = {
    fr: {
      title: "Votre panier",
      empty: "Votre panier est vide.",
      remove: "Retirer",
      total: "Total",
      checkout: "Commander",
    },
    en: {
      title: "Your cart",
      empty: "Your cart is empty.",
      remove: "Remove",
      total: "Total",
      checkout: "Checkout",
    },
  }[locale];

  return (
    <>
      {/* BACKDROP */}
      {isOpen && <div className="cart-backdrop" onClick={toggleCart} />}

      {/* DRAWER */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2 className="cart-title">{T.title}</h2>
          <button className="cart-close-btn" onClick={toggleCart}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="text-gray-500">{T.empty}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imageUrl || "/placeholder.jpg"}
                  className="cart-item-img"
                  alt={item.name}
                />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">
                    {(Number(item.price) || 0).toFixed(2)} € × {item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="cart-item-remove"
                  >
                    {T.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{T.total}</span>
              <span>{getTotal().toFixed(2)} €</span>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="btn btn-primary btn-full"
              onClick={toggleCart}
            >
              {T.checkout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
