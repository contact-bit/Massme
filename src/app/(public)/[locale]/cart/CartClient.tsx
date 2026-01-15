"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name?: Record<string, string> | string;
  priceHT: number; // 🔥 HT UNIQUEMENT
  quantity?: number;
  imageUrl?: string;
};

function moneyEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Math.round(n * 100) / 100);
}

function getName(p: Product, locale: Locale) {
  if (!p?.name) return locale === "fr" ? "Produit" : "Product";
  if (typeof p.name === "string") return p.name;
  return p.name[locale] || p.name.fr || p.name.en;
}

export default function CartClient({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(Array.isArray(stored) ? stored : []);
    } catch {
      setCart([]);
    }
    setMounted(true);
  }, []);

  const saveCart = (next: Product[]) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const removeItem = (id: string) =>
    saveCart(cart.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) => {
    const q = Math.max(1, Math.min(99, qty));
    saveCart(cart.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
  };

  const subtotalHT = useMemo(
    () =>
      cart.reduce(
        (sum, i) => sum + i.priceHT * Math.max(1, i.quantity || 1),
        0
      ),
    [cart]
  );

  if (!mounted) return null;

  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <main className="cart-page">
      <h1 className="cart-title">{t("Votre panier", "Your cart")}</h1>

      {cart.length === 0 ? (
        <p>{t("Votre panier est vide.", "Your cart is empty.")}</p>
      ) : (
        <>
          {cart.map((item) => {
            const qty = Math.max(1, item.quantity || 1);
            const lineHT = item.priceHT * qty;

            return (
              <div key={item.id} className="cart-row">
                <div>
                  <b>{getName(item, locale)}</b>
                  <div>
                    {t("Prix HT", "Price excl. VAT")} :{" "}
                    {moneyEUR(item.priceHT)}
                  </div>

                  <div>
                    {t("Quantité", "Quantity")} :
                    <button onClick={() => setQty(item.id, qty - 1)}>−</button>
                    {qty}
                    <button onClick={() => setQty(item.id, qty + 1)}>+</button>
                  </div>
                </div>

                <div>
                  <b>{moneyEUR(lineHT)}</b>
                  <div className="text-xs">
                    {t("HT (TVA calculée au paiement)", "VAT calculated at checkout")}
                  </div>
                  <button onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <hr />

          <div>
            <b>{t("Sous-total HT", "Subtotal excl. VAT")}</b>
            <b>{moneyEUR(subtotalHT)}</b>
          </div>

          <Link href={`/${locale}/checkout`}>
            {t("Passer au paiement", "Proceed to checkout")} →
          </Link>
        </>
      )}
    </main>
  );
}
