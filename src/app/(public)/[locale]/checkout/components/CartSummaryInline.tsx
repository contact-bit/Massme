"use client";

import { useCart } from "@/context/CartContext";

const OCULAREST_ID = "3tuSUenbUVVF6cuSHwS9";

export default function CartSummaryInline() {
  const { items, totalHT, totalVAT, totalTTC, updateQuantity, removeItem } =
    useCart();

  if (!items.length) {
    return (
      <section className="checkout-section">
        <p>Votre panier est vide.</p>
      </section>
    );
  }

  return (
    <section className="checkout-section checkout-cart">
      <div className="checkout-cart-header">
        <h2 className="checkout-cart-title">Votre panier</h2>
        <span className="checkout-cart-count">
          {items.length} article{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="checkout-cart-list">
        {items.map((item, index) => {
          const isOcularest = item.id === OCULAREST_ID;
          const isMaxForOcularest = isOcularest && item.quantity >= 2;

          return (
            <div key={`${item.id}-${index}`} className="checkout-cart-item">
              <div className="checkout-cart-thumb-wrap">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="checkout-cart-thumb"
                  />
                ) : (
                  <div className="checkout-cart-thumb placeholder" />
                )}
              </div>

              <div className="checkout-cart-main">
                <p className="checkout-cart-name">{item.name}</p>
                <p className="checkout-cart-unit">
                  {item.priceHT.toFixed(2)} € HT / unité
                </p>

                <div className="checkout-cart-bottom">
                  <div className="checkout-cart-qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      disabled={isMaxForOcularest}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="checkout-cart-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Retirer
                  </button>
                </div>
              </div>

              <div className="checkout-cart-line-total">
                {(item.priceHT * item.quantity).toFixed(2)} €
              </div>
            </div>
          );
        })}
      </div>

      <div className="checkout-cart-summary">
        <div className="checkout-cart-summary-row">
          <span>Total HT</span>
          <span>{totalHT.toFixed(2)} €</span>
        </div>

        {totalVAT > 0 && (
          <div className="checkout-cart-summary-row">
            <span>TVA</span>
            <span>{totalVAT.toFixed(2)} €</span>
          </div>
        )}

        <div className="checkout-cart-summary-row total">
          <span>Total TTC produits</span>
          <span>{totalTTC.toFixed(2)} €</span>
        </div>
      </div>
    </section>
  );
}
