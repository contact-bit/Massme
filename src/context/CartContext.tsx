"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* =====================================================
   TYPES
===================================================== */

export type CartItem = {
  id: string;
  name: string;
  priceHT: number;
  quantity: number;
  imageUrl?: string;
  description?: string;

  /**
   * TVA figée au moment de l'ajout au panier
   * (par produit, par pays)
   */
  vat?: {
    enabled: boolean;
    rate: number;
  };
};

type CartContextType = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;

  /** Totaux calculés UNE FOIS ici */
  totalHT: number;
  totalVAT: number;
  totalTTC: number;

  /** UI */
  isOpen: boolean;
  toggleCart: () => void;
};

/* =====================================================
   CONTEXT
===================================================== */

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "massme-cart";

/* =====================================================
   PROVIDER
===================================================== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------- LOAD FROM STORAGE ---------------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      setItems([]);
    }
  }, []);

  /* ---------------- SAVE TO STORAGE ---------------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + item.quantity,
              }
            : p
        );
      }

      return [...prev, item];
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* =====================================================
     TOTALS (SOURCE DE VÉRITÉ)
  ===================================================== */

  const totalHT = items.reduce(
    (sum, item) => sum + item.priceHT * item.quantity,
    0
  );

  const totalVAT = items.reduce((sum, item) => {
    if (!item.vat?.enabled || item.vat.rate <= 0) return sum;

    return (
      sum +
      (item.priceHT * item.quantity * item.vat.rate) / 100
    );
  }, 0);

  const totalTTC = totalHT + totalVAT;

  /* =====================================================
     UI
  ===================================================== */

  const toggleCart = () => setIsOpen((o) => !o);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        updateQuantity,
        totalHT,
        totalVAT,
        totalTTC,
        isOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
