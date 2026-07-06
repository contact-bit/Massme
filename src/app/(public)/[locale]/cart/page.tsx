"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

import {
  isMainVitrectomedProduct,
  useCart,
} from "@/context/CartContext";

import "./cart.css";

type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

const TITLES: Record<Locale, { title: string; empty: string; checkout: string }> = {
  fr: { title: "Votre panier", empty: "Votre panier est vide.", checkout: "Passer au paiement" },
  en: { title: "Your cart", empty: "Your cart is empty.", checkout: "Proceed to checkout" },
  es: { title: "Tu carrito", empty: "Tu carrito está vacío.", checkout: "Continuar al pago" },
  de: { title: "Ihr Warenkorb", empty: "Ihr Warenkorb ist leer.", checkout: "Zur Kasse" },
  it: { title: "Il tuo carrello", empty: "Il tuo carrello è vuoto.", checkout: "Vai al pagamento" },
  nl: { title: "Je winkelwagen", empty: "Je winkelwagen is leeg.", checkout: "Naar afrekenen" },
};

export default function CartPage() {
  const params = useParams() as { locale?: string };
  const locale: Locale = TITLES[params.locale as Locale]
    ? (params.locale as Locale)
    : "fr";

  const {
    items,
    isHydrated,
    totalHT,
    totalVAT,
    totalTTC,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isHydrated) {
    return <main className="cart-page"><p>Chargement du panier…</p></main>;
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-page-empty">
          <ShoppingCart size={44} />
          <h1>{TITLES[locale].title}</h1>
          <p>{TITLES[locale].empty}</p>
          <Link href={`/${locale}/convalescence/coussin`}>
            Découvrir le dispositif VitrectoMed
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <header className="cart-page-header">
        <span>Commande VitrectoMed</span>
        <h1>{TITLES[locale].title}</h1>
        <p>Choisissez un ou deux dispositifs, puis vérifiez les compléments.</p>
      </header>

      <div className="cart-page-layout">
        <section className="cart-page-items">
          {items.map((item) => {
            const isMainProduct = isMainVitrectomedProduct(item);

            return (
              <article className="cart-page-item" key={item.id}>
                <img src={item.imageUrl || "/brand/home-product.png"} alt="" />
                <div className="cart-page-item-copy">
                  <span>{isMainProduct ? "Dispositif principal" : "Complément"}</span>
                  <h2>{item.name}</h2>
                  <p>{item.priceHT.toFixed(2)} € HT / unité</p>
                </div>

                {isMainProduct ? (
                  <div className="cart-page-choice" aria-label="Quantité du dispositif">
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
                  <div className="cart-page-stepper">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <strong className="cart-page-line-total">
                  {(item.priceHT * item.quantity).toFixed(2)} €
                </strong>

                <button
                  type="button"
                  className="cart-page-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Retirer ${item.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </article>
            );
          })}
        </section>

        <aside className="cart-page-summary">
          <h2>Récapitulatif</h2>
          <div><span>Total HT</span><strong>{totalHT.toFixed(2)} €</strong></div>
          {totalVAT > 0 && <div><span>TVA</span><strong>{totalVAT.toFixed(2)} €</strong></div>}
          <div className="cart-page-summary-total">
            <span>Total TTC</span><strong>{totalTTC.toFixed(2)} €</strong>
          </div>
          <Link href={`/${locale}/checkout`}>
            {TITLES[locale].checkout} <ArrowRight size={18} />
          </Link>
          <small>Paiement sécurisé • Livraison calculée à l’étape suivante</small>
        </aside>
      </div>
    </main>
  );
}
