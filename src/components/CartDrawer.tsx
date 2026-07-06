"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  isMainVitrectomedProduct,
  useCart,
} from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------
   🌍 LOCALES
------------------------------------------ */
type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const SUPPORTED_LOCALES: Locale[] = [
  "fr",
  "en",
  "es",
  "de",
  "it",
  "nl",
];

/* ------------------------------------------
   🌍 TRANSLATIONS
------------------------------------------ */
const TRANSLATIONS: Record<
  Locale,
  {
    title: string;
    empty: string;
    remove: string;
    subtotalHT: string;
    vat: string;
    totalHT: string;
    totalTTC: string;
    checkout: string;
  }
> = {
  fr: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    remove: "Retirer",
    subtotalHT: "Sous-total HT",
    vat: "TVA",
    totalHT: "Total HT",
    totalTTC: "Total TTC",
    checkout: "Commander",
  },
  en: {
    title: "Your cart",
    empty: "Your cart is empty.",
    remove: "Remove",
    subtotalHT: "Subtotal (excl. VAT)",
    vat: "VAT",
    totalHT: "Total excl. VAT",
    totalTTC: "Total incl. VAT",
    checkout: "Checkout",
  },
  es: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío.",
    remove: "Eliminar",
    subtotalHT: "Subtotal sin IVA",
    vat: "IVA",
    totalHT: "Total sin IVA",
    totalTTC: "Total con IVA",
    checkout: "Pagar",
  },
  de: {
    title: "Ihr Warenkorb",
    empty: "Ihr Warenkorb ist leer.",
    remove: "Entfernen",
    subtotalHT: "Zwischensumme netto",
    vat: "MwSt",
    totalHT: "Gesamt netto",
    totalTTC: "Gesamt brutto",
    checkout: "Zur Kasse",
  },
  it: {
    title: "Il tuo carrello",
    empty: "Il tuo carrello è vuoto.",
    remove: "Rimuovi",
    subtotalHT: "Subtotale IVA esclusa",
    vat: "IVA",
    totalHT: "Totale IVA esclusa",
    totalTTC: "Totale IVA inclusa",
    checkout: "Checkout",
  },
  nl: {
    title: "Je winkelwagen",
    empty: "Je winkelwagen is leeg.",
    remove: "Verwijderen",
    subtotalHT: "Subtotaal excl. btw",
    vat: "BTW",
    totalHT: "Totaal excl. btw",
    totalTTC: "Totaal incl. btw",
    checkout: "Afrekenen",
  },
};

/* ------------------------------------------
   🛒 CART DRAWER
------------------------------------------ */
export default function CartDrawer() {
  const drawerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];

  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";

  const t = TRANSLATIONS[locale];

  const {
    items,
    removeItem,
    updateQuantity,
    isOpen,
    closeCart,
    totalHT,
    totalVAT,
    totalTTC,
  } = useCart();

  const showVAT = totalVAT > 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (drawerRef.current?.contains(target)) return;

      const element = target instanceof Element ? target : target.parentElement;
      if (element?.closest("[data-cart-trigger]")) return;

      closeCart();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeCart, isOpen]);

  // Keep the drawer completely out of the page until the customer
  // explicitly opens it from the navigation cart button.
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      ref={drawerRef}
      id="cart-drawer"
      className="cart-drawer cart-drawer--popover open"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cart-drawer-title"
    >
        {/* HEADER */}
        <div className="cart-header">
          <h2 className="cart-title" id="cart-drawer-title">{t.title}</h2>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* ITEMS */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={38} aria-hidden="true" />
              <p>{t.empty}</p>
            </div>
          ) : (
            items.map((item) => {
              const isMainProduct = isMainVitrectomedProduct(item);

              return (
              <article key={item.id} className="cart-item">
                <img
                  src={item.imageUrl || "/placeholder.jpg"}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>

                  <p className="cart-item-price">
                    {item.priceHT.toFixed(2)} € HT × {item.quantity}
                  </p>

                  <div className="cart-item-actions">
                    {isMainProduct ? (
                      <div className="cart-item-quantity cart-item-quantity--choice" aria-label={`Quantité de ${item.name}`}>
                        {[1, 2].map((quantity) => (
                          <button
                            key={quantity}
                            type="button"
                            className={item.quantity === quantity ? "is-active" : ""}
                            onClick={() => updateQuantity(item.id, quantity)}
                            aria-pressed={item.quantity === quantity}
                          >
                            ×{quantity}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="cart-item-quantity" aria-label={`Quantité de ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={15} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={15} /> {t.remove}
                    </button>
                  </div>
                </div>
              </article>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div>
                <span>{t.subtotalHT}</span>
                <span>{totalHT.toFixed(2)} €</span>
              </div>

              {showVAT && (
                <div>
                  <span>{t.vat}</span>
                  <span>{totalVAT.toFixed(2)} €</span>
                </div>
              )}

              <div className="cart-total">
                <strong>
                  {showVAT ? t.totalTTC : t.totalHT}
                </strong>
                <strong>
                  {(showVAT ? totalTTC : totalHT).toFixed(2)} €
                </strong>
              </div>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="btn btn-primary btn-full"
              onClick={closeCart}
            >
              {t.checkout}
            </Link>
          </div>
        )}
    </aside>
  );
}
