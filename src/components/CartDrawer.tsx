"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------
   🌍 LOCALES SUPPORTÉES
------------------------------------------ */
type Locale = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";

const SUPPORTED_LOCALES: Locale[] = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
  "pt",
];

/* ------------------------------------------
   🌍 TRADUCTIONS
------------------------------------------ */
const TRANSLATIONS: Record<
  Locale,
  {
    title: string;
    empty: string;
    remove: string;
    total: string;
    checkout: string;
  }
> = {
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
  es: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío.",
    remove: "Eliminar",
    total: "Total",
    checkout: "Pagar",
  },
  de: {
    title: "Ihr Warenkorb",
    empty: "Ihr Warenkorb ist leer.",
    remove: "Entfernen",
    total: "Gesamt",
    checkout: "Zur Kasse",
  },
  it: {
    title: "Il tuo carrello",
    empty: "Il tuo carrello è vuoto.",
    remove: "Rimuovi",
    total: "Totale",
    checkout: "Checkout",
  },
  nl: {
    title: "Je winkelwagen",
    empty: "Je winkelwagen is leeg.",
    remove: "Verwijderen",
    total: "Totaal",
    checkout: "Afrekenen",
  },
  pt: {
    title: "Seu carrinho",
    empty: "Seu carrinho está vazio.",
    remove: "Remover",
    total: "Total",
    checkout: "Finalizar compra",
  },
};

/* ------------------------------------------
   🛒 CART DRAWER
------------------------------------------ */
export default function CartDrawer() {
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];

  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";

  const t = TRANSLATIONS[locale];

  const { items, removeItem, isOpen, toggleCart, getTotal } = useCart();

  return (
    <>
      {/* BACKDROP */}
      {isOpen && <div className="cart-backdrop" onClick={toggleCart} />}

      {/* DRAWER */}
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        {/* HEADER */}
        <div className="cart-header">
          <h2 className="cart-title">{t.title}</h2>
          <button
            type="button"
            className="cart-close-btn"
            onClick={toggleCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* ITEMS */}
        <div className="cart-items">
          {items.length === 0 ? (
            <p className="cart-empty">{t.empty}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imageUrl || "/placeholder.jpg"}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>

                  <p className="cart-item-price">
                    {(Number(item.price) || 0).toFixed(2)} € ×{" "}
                    {item.quantity}
                  </p>

                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    {t.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{t.total}</span>
              <span>{getTotal().toFixed(2)} €</span>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="btn btn-primary btn-full"
              onClick={toggleCart}
            >
              {t.checkout}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
