"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

type Locale = "fr" | "en";

type Product = {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: { eur: number };
  stock: number;
};

export default function ProductPage() {
  const params = useParams();
  const { locale, id } = params as { locale: Locale; id: string };
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct({ ...(snap.data() as Product), id: snap.id });
      }
    }
    fetchProduct();
  }, [id]);

  if (!product)
    return <p className="text-center py-10 text-gray-600">Chargement...</p>;

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">
        {product.name?.[locale as "fr" | "en"] || product.name?.fr}
      </h1>
      <p className="text-gray-700 mb-6">
        {product.description?.[locale as "fr" | "en"] || product.description?.fr}
      </p>
      <p className="text-lg font-semibold mb-4">{product.price.eur} €</p>

      <Link
        href={`/${locale}/cart`}
        className="bg-black text-white px-6 py-2 rounded-md"
      >
        Ajouter au panier
      </Link>
    </main>
  );
}
