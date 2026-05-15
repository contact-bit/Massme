"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* =====================================================
   TYPES
===================================================== */

type VATConfig = {
  enabled?: boolean;
  rate?: number;
};

export type Addon = {
  id: string;

  label: string;

  imageUrl?: string;

  description?: string;

  markets?: string[];

  pricesByMarket?: Record<
    string,
    number
  >;

  vatByMarket?: Record<
    string,
    VATConfig
  >;
};

export type CartItem = {
  id: string;

  name: string;

  priceHT: number;

  quantity: number;

  imageUrl?: string;

  description?: string;

  addons?: Addon[];

  vat?: {
    enabled: boolean;
    rate: number;
  };
};

type CartContextType = {
  items: CartItem[];

  addItem: (
    item: CartItem
  ) => void;

  removeItem: (
    id: string
  ) => void;

  clearCart: () => void;

  updateQuantity: (
    id: string,
    quantity: number
  ) => void;

  totalHT: number;

  totalVAT: number;

  totalTTC: number;

  isOpen: boolean;

  toggleCart: () => void;
};

/* =====================================================
   CONSTANTS
===================================================== */

const OCULAREST_ID =
  "3tuSUenbUVVF6cuSHwS9";

const STORAGE_KEY =
  "massme-cart";

/* =====================================================
   CONTEXT
===================================================== */

const CartContext =
  createContext<CartContextType | null>(
    null
  );

/* =====================================================
   PROVIDER
===================================================== */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    items,
    setItems,
  ] = useState<CartItem[]>([]);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  /* =====================================================
     LOAD STORAGE
  ===================================================== */

  useEffect(() => {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {

        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(
            parsed
          )
        ) {
          setItems(parsed);
        }
      }

    } catch {
      setItems([]);
    }

  }, []);

  /* =====================================================
     SAVE STORAGE
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );

  }, [items]);

  /* =====================================================
     ADD ITEM
  ===================================================== */

  function addItem(
    item: CartItem
  ) {

    setItems((prev) => {

      const existing =
        prev.find(
          (p) =>
            p.id ===
            item.id
        );

      const isOcularest =
        item.id ===
        OCULAREST_ID;

      const maxQty =
        isOcularest
          ? 2
          : Infinity;

      if (existing) {

        const safeQty =
          Math.min(
            existing.quantity +
              item.quantity,
            maxQty
          );

        return prev.map(
          (p) =>
            p.id === item.id
              ? {
                  ...p,
                  quantity:
                    safeQty,
                }
              : p
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity:
            Math.min(
              item.quantity,
              maxQty
            ),
        },
      ];
    });

    setIsOpen(true);
  }

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  function removeItem(
    id: string
  ) {

    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  /* =====================================================
     CLEAR CART
  ===================================================== */

  function clearCart() {

    setItems([]);

    localStorage.removeItem(
      STORAGE_KEY
    );
  }

  /* =====================================================
     UPDATE QUANTITY
  ===================================================== */

  function updateQuantity(
    id: string,
    quantity: number
  ) {

    setItems((prev) =>
      prev
        .map((item) => {

          const isOcularest =
            item.id ===
            OCULAREST_ID;

          const maxQty =
            isOcularest
              ? 2
              : Infinity;

          const safeQty =
            Math.max(
              0,
              Math.min(
                quantity,
                maxQty
              )
            );

          return item.id ===
            id
            ? {
                ...item,
                quantity:
                  safeQty,
              }
            : item;
        })
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  /* =====================================================
     TOTALS
  ===================================================== */

  const totalHT =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.priceHT *
          item.quantity,
      0
    );

  const totalVAT =
    items.reduce(
      (
        sum,
        item
      ) => {

        if (
          !item.vat
            ?.enabled
        ) {
          return sum;
        }

        return (
          sum +
          (
            item.priceHT *
            item.quantity *
            item.vat.rate
          ) /
            100
        );
      },
      0
    );

  const totalTTC =
    totalHT +
    totalVAT;

  /* =====================================================
     UI
  ===================================================== */

  function toggleCart() {

    setIsOpen(
      (prev) => !prev
    );
  }

  /* =====================================================
     PROVIDER
  ===================================================== */

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

  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}