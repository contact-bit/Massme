"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit_price: number;  // 🔥 Prix unitaire
  quantity: number;
  total: number;        // 🔥 quantity * unit_price
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = "massme-cart";

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart safely
  useEffect(() => {
    if (localStorage.getItem("cart")) {
      localStorage.removeItem("cart"); // 🔥 Supprime ANCIEN format
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ADD ITEM (pro complet)
  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + item.quantity,
                total: (p.quantity + item.quantity) * p.unit_price,
              }
            : p
        );
      }

      return [...prev, item];
    });

    setIsOpen(true); // Ouvre le drawer
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.total, 0); // 🔥 total propre

  const toggleCart = () => setIsOpen((o) => !o);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        getTotal,
        isOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
