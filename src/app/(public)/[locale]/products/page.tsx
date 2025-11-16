"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  description?: Record<Locale, string>;
  price: { eur: number };
  imageUrl?: string;
  isActive?: boolean;
};

export default function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((p: Product) => p.isActive);

      setProducts(data as Product[]);
    }

    fetchProducts();
  }, []);

  // 🧩 Nouvelle version compatible CartContext
  const addToCart = (p: Product) => {
    const name = p.name?.[locale] || p.name.fr;
    const description = p.description?.[locale] || p.description?.fr || "";

    addItem({
      id: p.id,
      name,
      description,
      imageUrl: p.imageUrl || "",
      unit_price: p.price.eur,
      quantity: 1,
      total: p.price.eur,
    });
  };

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">
        {locale === "fr" ? "Nos produits" : "Our products"}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-600">
          {locale === "fr" ? "Aucun produit disponible." : "No products found."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {p.imageUrl && (
                <Image
                  src={p.imageUrl}
                  alt={p.name[locale] || p.name.fr}
                  width={500}
                  height={500}
                  className="rounded-md object-cover w-full h-64 mb-4"
                />
              )}

              <div>
                <Link href={`/${locale}/products/${p.id}`}>
                  <h2 className="font-semibold text-lg mb-2 hover:underline">
                    {p.name[locale] || p.name.fr}
                  </h2>
                </Link>

                <p className="text-gray-600 text-sm mb-4">
                  {p.description?.[locale] || p.description?.fr}
                </p>

                <p className="font-medium text-lg mb-6">{p.price.eur} €</p>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              >
                {locale === "fr" ? "Ajouter au panier 🛒" : "Add to cart 🛒"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
