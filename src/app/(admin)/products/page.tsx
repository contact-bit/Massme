"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name?: { fr?: string; en?: string } | string;
  price?: { eur?: number } | number;
  isActive?: boolean;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/products");
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) {
          console.error("API admin/products error:", json.error);
          setError("Impossible de charger la liste des produits.");
          setProducts([]);
          return;
        }

        setProducts(json.products || []);
      } catch (e) {
        console.error("Erreur chargement produits admin:", e);
        setError("Erreur réseau lors du chargement des produits.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const getName = (p: Product) =>
    typeof p.name === "string"
      ? p.name
      : p.name?.fr || p.name?.en || "Produit";

  const getPrice = (p: Product) =>
    typeof p.price === "number"
      ? p.price
      : typeof p.price?.eur === "number"
      ? p.price.eur
      : 0;

  return (
    <main className="admin-page">
      <h1 className="admin-title">📦 Produits</h1>

      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/products/new" className="btn btn-primary">
          ➕ Ajouter un produit
        </Link>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : products.length === 0 ? (
        <p>Aucun produit.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between border p-3 rounded bg-white"
            >
              <div>
                <p className="font-semibold">{getName(p)}</p>
                <p className="text-sm text-gray-500">
                  {getPrice(p).toFixed(2)} €
                  {p.isActive === false && (
                    <span className="ml-2 text-xs text-red-500">
                      (désactivé)
                    </span>
                  )}
                </p>
              </div>

              <Link
                href={`/admin/products/${p.id}`}
                className="text-blue-600 underline text-sm"
              >
                Modifier
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
