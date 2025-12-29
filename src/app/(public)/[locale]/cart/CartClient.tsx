"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name?: Record<string, string> | string;
  price?: { eur?: number; usd?: number; gbp?: number } | number;
  description?: Record<string, string> | string;
  quantity?: number;
  imageUrl?: string;
};

function moneyEUR(n: number) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function getName(p: Product, locale: Locale) {
  if (!p?.name) return locale === "fr" ? "Produit" : "Product";
  if (typeof p.name === "string") return p.name;
  return p.name?.[locale] || p.name?.fr || p.name?.en || (locale === "fr" ? "Produit" : "Product");
}

function getDesc(p: Product, locale: Locale) {
  if (!p?.description) return "";
  if (typeof p.description === "string") return p.description;
  return p.description?.[locale] || p.description?.fr || p.description?.en || "";
}

function getUnitPriceEUR(p: Product) {
  const pr = p?.price;
  if (typeof pr === "number") return pr;
  if (pr && typeof pr === "object" && typeof (pr as any).eur === "number") return (pr as any).eur;
  return 0;
}

export default function CartClient({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // load cart once on client
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(Array.isArray(storedCart) ? storedCart : []);
    } catch (err) {
      console.error("Erreur lecture panier :", err);
      setCart([]);
    }
    setMounted(true);
  }, []);

  const saveCart = (next: Product[]) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
    // optionnel: event custom si tu as un header qui écoute
    window.dispatchEvent(new Event("cart_updated"));
  };

  const removeItem = (id: string) => {
    const next = cart.filter((item) => item.id !== id);
    saveCart(next);
  };

  const setQty = (id: string, qty: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(qty || 1)));
    const next = cart.map((it) => (it.id === id ? { ...it, quantity: q } : it));
    saveCart(next);
  };

  const { subtotal, itemsCount } = useMemo(() => {
    const sub = cart.reduce((acc, item) => {
      const unit = getUnitPriceEUR(item);
      const qty = Math.max(1, Number(item.quantity || 1));
      return acc + unit * qty;
    }, 0);
    const count = cart.reduce((acc, item) => acc + Math.max(1, Number(item.quantity || 1)), 0);
    return { subtotal: sub, itemsCount: count };
  }, [cart]);

  // avoid SSR mismatch
  if (!mounted) {
    return (
      <main className="cart-page">
        <div className="cart-shell">
          <div className="cart-skeleton">
            <div className="cart-skel-line" />
            <div className="cart-skel-card" />
            <div className="cart-skel-card" />
          </div>
        </div>

        <style jsx>{`
          .cart-page {
            padding: 28px 16px 60px;
          }
          .cart-shell {
            max-width: 980px;
            margin: 0 auto;
          }
          .cart-skeleton {
            display: grid;
            gap: 12px;
          }
          .cart-skel-line {
            height: 18px;
            width: 220px;
            border-radius: 999px;
            background: rgba(11, 18, 32, 0.06);
          }
          .cart-skel-card {
            height: 88px;
            border-radius: 16px;
            background: linear-gradient(
              90deg,
              rgba(11, 18, 32, 0.04),
              rgba(11, 18, 32, 0.08),
              rgba(11, 18, 32, 0.04)
            );
            background-size: 200% 100%;
            animation: shimmer 1.2s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% {
              background-position: 0% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </main>
    );
  }

  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <main className="cart-page">
      <div className="cart-shell">
        {/* Header */}
        <div className="cart-head">
          <div>
            <h1 className="cart-title">{t("Votre panier", "Your cart")}</h1>
            <p className="cart-sub">
              {cart.length === 0
                ? t("Aucun article pour le moment.", "No items yet.")
                : t(`${itemsCount} article(s)`, `${itemsCount} item(s)`)}
            </p>
          </div>

          {cart.length > 0 && (
            <Link href={`/${locale}/products`} className="cart-link">
              {t("Continuer mes achats", "Continue shopping")} →
            </Link>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-ic">🛒</div>
            <div className="cart-empty-title">{t("Votre panier est vide.", "Your cart is empty.")}</div>
            <div className="cart-empty-desc">
              {t("Ajoutez un produit pour démarrer votre commande.", "Add a product to start your order.")}
            </div>
            <Link href={`/${locale}/products`} className="cart-primary">
              {t("Voir les produits", "Browse products")}
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Items */}
            <section className="cart-card">
              <div className="cart-card-head">
                <div className="cart-card-title">{t("Articles", "Items")}</div>
                <button
                  type="button"
                  className="cart-ghost"
                  onClick={() => {
                    const ok = confirm(t("Vider le panier ?", "Clear cart?"));
                    if (ok) saveCart([]);
                  }}
                >
                  {t("Vider", "Clear")}
                </button>
              </div>

              <div className="cart-list">
                {cart.map((item) => {
                  const unit = getUnitPriceEUR(item);
                  const qty = Math.max(1, Number(item.quantity || 1));
                  const line = unit * qty;

                  return (
                    <div key={item.id} className="cart-row">
                      {/* Thumb */}
                      <div className="cart-thumb">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={getName(item, locale)} />
                        ) : (
                          <div className="cart-thumb-ph" aria-hidden />
                        )}
                      </div>

                      {/* Info */}
                      <div className="cart-info">
                        <div className="cart-name">{getName(item, locale)}</div>
                        {getDesc(item, locale) ? <div className="cart-desc">{getDesc(item, locale)}</div> : null}
                        <div className="cart-meta">
                          <span className="cart-unit">
                            {t("Prix unitaire", "Unit price")}: <b>{moneyEUR(unit)}</b>
                          </span>
                        </div>

                        <div className="cart-actions">
                          {/* Qty */}
                          <div className="cart-qty">
                            <button type="button" className="cart-qtybtn" onClick={() => setQty(item.id, qty - 1)}>
                              −
                            </button>
                            <input
                              className="cart-qtyinput"
                              inputMode="numeric"
                              value={qty}
                              onChange={(e) => setQty(item.id, Number(e.target.value))}
                              aria-label={t("Quantité", "Quantity")}
                            />
                            <button type="button" className="cart-qtybtn" onClick={() => setQty(item.id, qty + 1)}>
                              +
                            </button>
                          </div>

                          {/* Remove */}
                          <button type="button" className="cart-remove" onClick={() => removeItem(item.id)}>
                            <Trash2 size={16} />
                            {t("Supprimer", "Remove")}
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="cart-line">
                        <div className="cart-line-total">{moneyEUR(line)}</div>
                        <div className="cart-line-sub">{t("TTC", "VAT incl.")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Summary */}
            <aside className="cart-card cart-summary">
              <div className="cart-card-title">{t("Résumé", "Summary")}</div>

              <div className="cart-sum-rows">
                <div className="cart-sum-row">
                  <span>{t("Sous-total", "Subtotal")}</span>
                  <b>{moneyEUR(subtotal)}</b>
                </div>

                <div className="cart-sum-row">
                  <span>{t("Livraison", "Shipping")}</span>
                  <span className="cart-muted">{t("Calculée au paiement", "Calculated at checkout")}</span>
                </div>

                <div className="cart-divider" />

                <div className="cart-sum-row cart-sum-total">
                  <span>{t("Total estimé", "Estimated total")}</span>
                  <b>{moneyEUR(subtotal)}</b>
                </div>

                <div className="cart-hint">
                  {t(
                    "Vous pourrez choisir votre mode de livraison à l’étape suivante.",
                    "You’ll choose your shipping method on the next step."
                  )}
                </div>
              </div>

              <Link href={`/${locale}/checkout`} className="cart-primary">
                {t("Passer au paiement", "Proceed to checkout")}
                <ArrowRight size={18} />
              </Link>

              <div className="cart-secure">
                <span className="cart-secure-dot" aria-hidden />
                {t("Paiement sécurisé via Stripe", "Secure payment via Stripe")}
              </div>
            </aside>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-page {
          padding: 28px 16px 70px;
          background: linear-gradient(180deg, rgba(30, 99, 255, 0.06), rgba(255, 255, 255, 0));
        }
        .cart-shell {
          max-width: 1040px;
          margin: 0 auto;
        }

        /* Header */
        .cart-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }
        .cart-title {
          margin: 0;
          font-size: 28px;
          font-weight: 950;
          color: rgba(11, 18, 32, 0.95);
          letter-spacing: -0.4px;
        }
        .cart-sub {
          margin: 6px 0 0;
          color: rgba(11, 18, 32, 0.62);
          font-size: 13px;
          font-weight: 650;
        }
        .cart-link {
          color: rgba(30, 99, 255, 1);
          text-decoration: none;
          font-weight: 900;
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(30, 99, 255, 0.08);
          border: 1px solid rgba(30, 99, 255, 0.18);
          transition: transform 0.15s ease, background 0.15s ease;
          white-space: nowrap;
        }
        .cart-link:hover {
          transform: translateY(-1px);
          background: rgba(30, 99, 255, 0.12);
        }

        /* Grid */
        .cart-grid {
          display: grid;
          grid-template-columns: 1.7fr 0.9fr;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Card */
        .cart-card {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(11, 18, 32, 0.06);
          overflow: hidden;
        }
        .cart-card-head {
          padding: 14px 14px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid rgba(11, 18, 32, 0.06);
          background: linear-gradient(180deg, rgba(11, 18, 32, 0.03), rgba(11, 18, 32, 0));
        }
        .cart-card-title {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.92);
          font-size: 14px;
        }
        .cart-ghost {
          border: 1px solid rgba(11, 18, 32, 0.1);
          background: rgba(255, 255, 255, 0.7);
          color: rgba(11, 18, 32, 0.85);
          border-radius: 999px;
          padding: 8px 12px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .cart-ghost:hover {
          transform: translateY(-1px);
          background: rgba(11, 18, 32, 0.04);
        }

        /* Rows */
        .cart-list {
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .cart-row {
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(255, 255, 255, 0.85);
        }
        @media (max-width: 560px) {
          .cart-row {
            grid-template-columns: 56px 1fr;
            grid-template-rows: auto auto;
          }
          .cart-line {
            grid-column: 1 / -1;
            justify-self: end;
          }
        }

        .cart-thumb {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(11, 18, 32, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cart-thumb-ph {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(30, 99, 255, 0.08), rgba(11, 18, 32, 0.03));
        }

        .cart-info {
          min-width: 0;
        }
        .cart-name {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.95);
          font-size: 14px;
          line-height: 1.25;
        }
        .cart-desc {
          margin-top: 4px;
          color: rgba(11, 18, 32, 0.62);
          font-size: 12px;
          line-height: 1.35;
        }
        .cart-meta {
          margin-top: 6px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          color: rgba(11, 18, 32, 0.62);
          font-size: 12px;
          font-weight: 650;
        }
        .cart-unit b {
          color: rgba(11, 18, 32, 0.9);
        }

        .cart-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Qty */
        .cart-qty {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(11, 18, 32, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }
        .cart-qtybtn {
          width: 36px;
          height: 34px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          font-weight: 950;
          color: rgba(11, 18, 32, 0.85);
          transition: background 0.15s ease;
        }
        .cart-qtybtn:hover {
          background: rgba(11, 18, 32, 0.05);
        }
        .cart-qtyinput {
          width: 44px;
          height: 34px;
          border: none;
          outline: none;
          text-align: center;
          font-weight: 950;
          color: rgba(11, 18, 32, 0.9);
          background: transparent;
        }

        /* Remove */
        .cart-remove {
          border: 1px solid rgba(239, 68, 68, 0.22);
          background: rgba(239, 68, 68, 0.08);
          color: rgba(185, 28, 28, 1);
          border-radius: 999px;
          padding: 8px 10px;
          font-weight: 950;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .cart-remove:hover {
          transform: translateY(-1px);
          background: rgba(239, 68, 68, 0.12);
        }

        /* Line total */
        .cart-line {
          text-align: right;
          min-width: 120px;
          align-self: start;
        }
        .cart-line-total {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.95);
          font-size: 14px;
        }
        .cart-line-sub {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
          font-weight: 700;
        }

        /* Summary */
        .cart-summary {
          padding: 14px;
          position: sticky;
          top: 90px;
        }
        @media (max-width: 980px) {
          .cart-summary {
            position: static;
          }
        }
        .cart-sum-rows {
          margin-top: 10px;
          display: grid;
          gap: 10px;
        }
        .cart-sum-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 13px;
          color: rgba(11, 18, 32, 0.82);
          font-weight: 800;
        }
        .cart-muted {
          color: rgba(11, 18, 32, 0.55);
          font-weight: 700;
        }
        .cart-divider {
          height: 1px;
          background: rgba(11, 18, 32, 0.08);
          margin: 6px 0;
        }
        .cart-sum-total {
          font-size: 14px;
          font-weight: 950;
        }
        .cart-hint {
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
          font-weight: 700;
          line-height: 1.4;
        }

        .cart-primary {
          margin-top: 12px;
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(30, 99, 255, 1);
          color: white;
          font-weight: 950;
          text-decoration: none;
          box-shadow: 0 14px 30px rgba(30, 99, 255, 0.22);
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .cart-primary:hover {
          transform: translateY(-1px);
          filter: brightness(0.98);
        }

        .cart-secure {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(11, 18, 32, 0.62);
          font-weight: 750;
        }
        .cart-secure-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 1);
          box-shadow: 0 10px 18px rgba(16, 185, 129, 0.18);
        }

        /* Empty */
        .cart-empty {
          margin-top: 10px;
          padding: 22px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(11, 18, 32, 0.1);
          box-shadow: 0 18px 40px rgba(11, 18, 32, 0.06);
          display: grid;
          justify-items: center;
          text-align: center;
          gap: 10px;
        }
        .cart-empty-ic {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(30, 99, 255, 0.08);
          border: 1px solid rgba(30, 99, 255, 0.18);
          font-size: 24px;
        }
        .cart-empty-title {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.95);
        }
        .cart-empty-desc {
          color: rgba(11, 18, 32, 0.62);
          font-weight: 700;
          font-size: 13px;
          max-width: 520px;
        }
      `}</style>
    </main>
  );
}
