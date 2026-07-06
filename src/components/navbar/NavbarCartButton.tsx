"use client";

import { ShoppingCart } from "lucide-react";

import { useCart } from "@/context/CartContext";

import type { Locale } from "./navbar.types";

import "./NavbarCartButton.css";

const CART_LABELS: Record<Locale, string> = {
  fr: "Ouvrir le panier",
  en: "Open cart",
  es: "Abrir el carrito",
  de: "Warenkorb öffnen",
  it: "Apri il carrello",
  nl: "Winkelwagen openen",
};

export default function NavbarCartButton({ locale }: { locale: Locale }) {
  const { totalItems, isOpen, toggleCart } = useCart();

  return (
    <button
      type="button"
      className="vm-navbar-cart"
      data-cart-trigger
      onClick={toggleCart}
      aria-label={`${CART_LABELS[locale]}${totalItems ? ` (${totalItems})` : ""}`}
      aria-controls="cart-drawer"
      aria-expanded={isOpen}
    >
      <ShoppingCart size={22} aria-hidden="true" />
      {totalItems > 0 && (
        <span className="vm-navbar-cart__count" aria-hidden="true">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
