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
  imageUrl?: string;
  isActive?: boolean; // ✅ ajouté
};

export default function ProductPage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) as Locale;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!id || typeof id !== "string") return;

        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setProduct(null);
        } else {
          setProduct({ ...(snap.data() as Product), id: snap.id });
        }
      } catch (error) {
        console.error("Erreur produit :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10 text-gray-600">Chargement...</p>;
  }

  if (!product) {
    return <p className="text-center py-10 text-gray-500">Produit introuvable.</p>;
  }

  // 🚫 **Produit masqué**
  if (product.isActive === false) {
    return (
      <main className="max-w-3xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit indisponible 🚫</h1>
        <p className="text-gray-600 mb-6">
          Ce produit n'est plus disponible à la vente.
        </p>
        <Link
          href={`/${locale}/products`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Retour à la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-gray-900">
      {/* Image */}
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name[locale]}
          className="w-full h-80 object-cover rounded-md mb-6 border"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">
        {product.name?.[locale] || product.name.fr}
      </h1>

      <p className="text-gray-700 mb-6">
        {product.description?.[locale] || product.description.fr}
      </p>

      <p className="text-lg font-semibold mb-4">
        {new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "EUR",
        }).format(product.price.eur)}
      </p>

      <p
        className={`mb-4 text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
      >
        {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
      </p>

      <Link
        href={`/${locale}/cart`}
        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
      >
        {locale === "fr" ? "Ajouter au panier" : "Add to cart"}
      </Link>
    </main>
  );
}
