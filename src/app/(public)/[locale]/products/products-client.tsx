"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

type Locale = "fr" | "en";

export type Product = {
  id: string;
  name: Record<Locale, string>;
  description?: Record<Locale, string>;
  price: { eur: number };
  imageUrl?: string;
  isActive?: boolean;
};

export default function ProductsClient({ locale }: { locale: Locale }) {
  const [product, setProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const safeLocale: Locale = locale === "en" ? "en" : "fr";

  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));

      const activeProducts = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((p: Product) => p.isActive);

      if (activeProducts.length > 0) {
        setProduct(activeProducts[0]); // 👍 un produit complet
      } else {
        setProduct(null);
      }
    }

    fetchProducts();
  }, []);

  if (!product) {
    return (
      <main className="products-page">
        <p className="text-gray-600 text-center">
          {safeLocale === "fr"
            ? "Aucun produit disponible."
            : "No product available."}
        </p>
      </main>
    );
  }

  const addToCartHandler = () => {
    addItem({
      id: product.id,
      name: product.name[safeLocale],
      price: product.price.eur,
      quantity: 1,
      description: product.description?.[safeLocale] || "",
      imageUrl: product.imageUrl,
    });
  };

  return (
    <main className="products-page">
      <div className="product-card">

        <div className="product-img-wrapper">
          <Image
            src={product.imageUrl || "/placeholder.jpg"}
            alt={product.name[safeLocale]}
            fill
            className="product-img"
          />
        </div>

        <h1 className="product-title">{product.name[safeLocale]}</h1>

        <p className="product-desc">
          {product.description?.[safeLocale] || ""}
        </p>

        <p className="product-price">{product.price.eur} €</p>

        <div className="product-actions">
          <Link
            href={`/${safeLocale}/products/${product.id}`}
            className="btn btn-secondary"
          >
            {safeLocale === "fr"
              ? "Voir le produit →"
              : "View product →"}
          </Link>

          <button onClick={addToCartHandler} className="btn btn-primary">
            {safeLocale === "fr"
              ? "Ajouter au panier 🛒"
              : "Add to cart 🛒"}
          </button>
        </div>

      </div>
    </main>
  );
}
