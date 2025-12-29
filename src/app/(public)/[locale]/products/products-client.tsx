"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

/* ----------------------------------
   🌍 LOCALES SUPPORTÉES
---------------------------------- */
export type Locale =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "nl"
  | "pt";

/* ----------------------------------
   🧠 UI TRANSLATIONS
---------------------------------- */
const UI_TEXT: Record<
  Locale,
  {
    noProduct: string;
    view: string;
    add: string;
    priceLabel?: string;
  }
> = {
  fr: {
    noProduct: "Aucun produit disponible.",
    view: "Voir le produit →",
    add: "Ajouter au panier 🛒",
  },
  en: {
    noProduct: "No product available.",
    view: "View product →",
    add: "Add to cart 🛒",
  },
  es: {
    noProduct: "No hay productos disponibles.",
    view: "Ver producto →",
    add: "Añadir al carrito 🛒",
  },
  de: {
    noProduct: "Kein Produkt verfügbar.",
    view: "Produkt ansehen →",
    add: "In den Warenkorb 🛒",
  },
  it: {
    noProduct: "Nessun prodotto disponibile.",
    view: "Vedi prodotto →",
    add: "Aggiungi al carrello 🛒",
  },
  nl: {
    noProduct: "Geen product beschikbaar.",
    view: "Bekijk product →",
    add: "Toevoegen aan winkelwagen 🛒",
  },
  pt: {
    noProduct: "Nenhum produto disponível.",
    view: "Ver produto →",
    add: "Adicionar ao carrinho 🛒",
  },
};

/* ----------------------------------
   📦 PRODUCT TYPE
---------------------------------- */
export type Product = {
  id: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  price: { eur: number };
  imageUrl?: string;
  isActive?: boolean;
};

/* ----------------------------------
   🧩 HELPERS
---------------------------------- */
function pickLocaleValue(
  obj: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  return (
    obj?.[locale] ||
    obj?.en ||
    obj?.fr ||
    ""
  );
}

/* ----------------------------------
   🛍️ COMPONENT
---------------------------------- */
export default function ProductsClient({ locale }: { locale: Locale }) {
  const [product, setProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const safeLocale: Locale = UI_TEXT[locale] ? locale : "fr";
  const T = UI_TEXT[safeLocale];

  /* -----------------------------
     🔄 LOAD PRODUCT
  ----------------------------- */
  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));

      const activeProducts = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((p: Product) => p.isActive);

      setProduct(activeProducts[0] ?? null);
    }

    fetchProducts();
  }, []);

  /* -----------------------------
     ❌ NO PRODUCT
  ----------------------------- */
  if (!product) {
    return (
      <main className="products-page">
        <p className="text-center text-gray-600">{T.noProduct}</p>
      </main>
    );
  }

  const name = pickLocaleValue(product.name, safeLocale);
  const desc = pickLocaleValue(product.description, safeLocale);

  const addToCartHandler = () => {
    addItem({
      id: product.id,
      name,
      price: product.price.eur,
      quantity: 1,
      description: desc,
      imageUrl: product.imageUrl,
    });
  };

  /* -----------------------------
     ✅ RENDER
  ----------------------------- */
  return (
    <main className="products-page">
      <div className="product-card">
        <div className="product-img-wrapper">
          <Image
            src={product.imageUrl || "/placeholder.jpg"}
            alt={name}
            fill
            className="product-img"
          />
        </div>

        <h1 className="product-title">{name}</h1>

        {desc && <p className="product-desc">{desc}</p>}

        <p className="product-price">{product.price.eur.toFixed(2)} €</p>

        <div className="product-actions">
          <Link
            href={`/${safeLocale}/products/${product.id}`}
            className="btn btn-secondary"
          >
            {T.view}
          </Link>

          <button onClick={addToCartHandler} className="btn btn-primary">
            {T.add}
          </button>
        </div>
      </div>
    </main>
  );
}
