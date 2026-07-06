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
  productCode?: string;

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
  sku?: string;
  productCode?: string;

  name: string;

  priceHT: number;

  weightKg?: number;

  deliveryPackageCount?: number;

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

  totalItems: number;

  isHydrated: boolean;

  isOpen: boolean;

  toggleCart: () => void;

  closeCart: () => void;
};

/* =====================================================
   CONSTANTS
===================================================== */

const VITRECTOMED_PRODUCT_ID =
  "3tuSUenbUVVF6cuSHwS9";

const STORAGE_KEY =
  "vitrectomed-cart";

export function isMainVitrectomedProduct(item: Pick<CartItem, "id">) {
  return (
    item.id === VITRECTOMED_PRODUCT_ID ||
    (item.id.startsWith(`${VITRECTOMED_PRODUCT_ID}:`) &&
      !item.id.includes(":addon:"))
  );
}

function getMaxQuantity(item: Pick<CartItem, "id">) {
  return isMainVitrectomedProduct(item) ? 2 : 10;
}

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

  const [
    isHydrated,
    setIsHydrated,
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
          const validItems = parsed.filter(
            (item): item is CartItem =>
              Boolean(
                item &&
                  typeof item.id === "string" &&
                  typeof item.name === "string" &&
                  Number.isFinite(item.priceHT) &&
                  Number.isFinite(item.quantity) &&
                  item.quantity > 0
              )
          );

          let hasMainProduct = false;

          setItems(
            validItems.flatMap((item) => {
              if (isMainVitrectomedProduct(item)) {
                if (hasMainProduct) return [];
                hasMainProduct = true;
              }

              return [{
                ...item,
                quantity: Math.min(
                  Math.max(1, Math.floor(item.quantity)),
                  getMaxQuantity(item)
                ),
              }];
            })
          );
        }
      }

    } catch {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }

  }, []);

  /* =====================================================
     SAVE STORAGE
  ===================================================== */

  useEffect(() => {

    if (!isHydrated) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );

  }, [isHydrated, items]);

  /* =====================================================
     ADD ITEM
  ===================================================== */

  function addItem(
    item: CartItem
  ) {

    setItems((prev) => {

      const isMainProduct =
        isMainVitrectomedProduct(item);

      const existingMainProduct =
        isMainProduct
          ? prev.find(isMainVitrectomedProduct)
          : undefined;

      const existing =
        prev.find(
          (p) =>
            p.id ===
            item.id
        );

      const maxQty =
        getMaxQuantity(item);

      const requestedQuantity =
        Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (isMainProduct && existingMainProduct) {
        if (existingMainProduct.id !== item.id) {
          return [
            ...prev.filter((current) => !isMainVitrectomedProduct(current)),
            {
              ...item,
              quantity: Math.min(requestedQuantity, 2),
            },
          ];
        }

        return prev.map((current) =>
          current.id === item.id
            ? {
                ...current,
                ...item,
                quantity: Math.min(
                  current.quantity + requestedQuantity,
                  2
                ),
              }
            : current
        );
      }

      if (existing) {

        const safeQty =
          Math.min(
            existing.quantity +
              requestedQuantity,
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
              requestedQuantity,
              maxQty
            ),
        },
      ];
    });

    // Adding an item never opens the floating cart. The customer keeps
    // control and can reveal it only from the navigation cart button.
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

          const maxQty =
            getMaxQuantity(item);

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

  const totalItems =
    items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  /* =====================================================
     UI
  ===================================================== */

  function toggleCart() {

    setIsOpen(
      (prev) => !prev
    );
  }

  function closeCart() {
    setIsOpen(false);
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
        totalItems,
        isHydrated,

        isOpen,
        toggleCart,
        closeCart,
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
