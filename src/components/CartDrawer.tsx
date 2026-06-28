"use client";

import { useCart } from "@/context/CartContext";
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
  const pathname = usePathname();
  const rawLocale = pathname?.split("/")[1];

  const locale: Locale = SUPPORTED_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "fr";

  const t = TRANSLATIONS[locale];

  const {
    items,
    removeItem,
    isOpen,
    toggleCart,
    totalHT,
    totalVAT,
    totalTTC,
  } = useCart();

  const showVAT = totalVAT > 0;

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div className="cart-backdrop" onClick={toggleCart} />
      )}

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
                    {item.priceHT.toFixed(2)} € HT × {item.quantity}
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
