"use client";

import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";

/* ----------------------------------
   🌍 LOCALES
---------------------------------- */
type Locale = "fr" | "en" | "es" | "de" | "it" | "nl" | "pt";

const UI: Record<
  Locale,
  {
    title: string;
    empty: string;
    product: string;
    quantity: string;
    price: string;
    total: string;
  }
> = {
  fr: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    product: "Produit",
    quantity: "Quantité",
    price: "Prix",
    total: "Total",
  },
  en: {
    title: "Your cart",
    empty: "Your cart is empty.",
    product: "Product",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
  },
  es: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío.",
    product: "Producto",
    quantity: "Cantidad",
    price: "Precio",
    total: "Total",
  },
  de: {
    title: "Ihr Warenkorb",
    empty: "Ihr Warenkorb ist leer.",
    product: "Produkt",
    quantity: "Menge",
    price: "Preis",
    total: "Summe",
  },
  it: {
    title: "Il tuo carrello",
    empty: "Il tuo carrello è vuoto.",
    product: "Prodotto",
    quantity: "Quantità",
    price: "Prezzo",
    total: "Totale",
  },
  nl: {
    title: "Je winkelwagen",
    empty: "Je winkelwagen is leeg.",
    product: "Product",
    quantity: "Aantal",
    price: "Prijs",
    total: "Totaal",
  },
  pt: {
    title: "Seu carrinho",
    empty: "Seu carrinho está vazio.",
    product: "Produto",
    quantity: "Quantidade",
    price: "Preço",
    total: "Total",
  },
};

/* ==================================
   🛒 CART PAGE
================================== */
export default function CartPage() {
  const params = useParams() as { locale?: string };
  const locale: Locale = UI[params.locale as Locale]
    ? (params.locale as Locale)
    : "fr";

  const T = UI[locale];

  const {
    items,
    totalHT,
    totalVAT,
    totalTTC,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">{T.title}</h1>
        <p>{T.empty}</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{T.title}</h1>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex justify-between items-center border-b pb-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.quantity} × {item.priceHT.toFixed(2)} € HT
              </p>
            </div>

            <div className="font-semibold">
              {(item.priceHT * item.quantity).toFixed(2)} €
            </div>
          </div>
        ))}
      </div>

      {/* TOTALS */}
      <div className="mt-6 border-t pt-4 space-y-1">
        <p>Total HT : {totalHT.toFixed(2)} €</p>

        {totalVAT > 0 && (
          <p>TVA : {totalVAT.toFixed(2)} €</p>
        )}

        <p className="text-lg font-bold">
          Total TTC : {totalTTC.toFixed(2)} €
        </p>
      </div>
    </main>
  );
}
