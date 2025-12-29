"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type Locale = (typeof LOCALES)[number];

function isLocale(v: any): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

function pickLocaleValue(
  obj: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  return obj?.[locale] || obj?.en || obj?.fr || "";
}

type Product = {
  id: string;
  name: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  price: { eur: number };
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
};

export default function ProductPage() {
  const params = useParams() as { locale?: string; id?: string };

  const locale: Locale = isLocale(params.locale) ? params.locale : "fr";
  const id = params.id || "";

  const { addItem, toggleCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProduct({ ...(snap.data() as any), id: snap.id } as Product);
      } else {
        setProduct(null);
      }

      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center py-10">Chargement...</p>;
  if (!product) return <p className="text-center py-10">Produit introuvable.</p>;

  const name = pickLocaleValue(product.name, locale);
  const desc = pickLocaleValue(product.description, locale);

  const addToCart = () => {
    addItem({
      id: product.id,
      name,
      description: desc,
      imageUrl: product.imageUrl,
      price: Number(product.price.eur),
      quantity: 1,
    });
    toggleCart();
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-gray-900">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          className="w-full h-80 object-cover rounded-lg mb-6 border"
          alt={name}
        />
      )}

      <h1 className="text-3xl font-bold mb-3">{name}</h1>
      {desc && <p className="text-gray-600 mb-6">{desc}</p>}

      <p className="text-xl font-semibold mb-4">{product.price.eur} €</p>

      <button
        onClick={addToCart}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition text-lg"
      >
        {locale === "fr" ? "Ajouter au panier 🛒" : "Add to cart 🛒"}
      </button>
    </main>
  );
}
