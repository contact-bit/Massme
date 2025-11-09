"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  description?: Record<Locale, string>;
  price: { eur: number; usd?: number; gbp?: number };
};

export default function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    async function fetchProducts() {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);

      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Product),
        id: doc.id, // ✅ id placé à la fin pour éviter le conflit
      }));
      setProducts(data);
    }

    fetchProducts();
  }, [params]);

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = [...cart, product];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name?.[locale] || product.name?.fr} ajouté au panier ! 🛒`);
  };

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">🧾 Nos prestations</h1>

      {products.length === 0 ? (
        <p className="text-gray-600">Aucun produit disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between bg-white"
            >
              <div>
                <Link href={`/${locale}/products/${p.id}`}>
                  <h2 className="font-semibold text-lg mb-2 hover:underline">
                    {p.name?.[locale] || p.name?.fr}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-4">
                  {p.description?.[locale] || p.description?.fr}
                </p>
                <p className="font-medium text-lg mb-6">{p.price?.eur} €</p>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              >
                Ajouter au panier 🛒
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
