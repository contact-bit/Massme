// src/app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name?: { fr?: string; en?: string } | string;
  price?: { eur?: number } | number;
  isActive?: boolean;
  stock?: number;
  imageUrl?: string;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔐 Vérif login admin (token posé par /admin/login)
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    if (token !== "true") {
      window.location.href = "/admin/login";
      return;
    }

    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/products");
      const text = await res.text();

      if (!res.ok) {
        console.error("Réponse brute /api/admin/products:", text);
        setError("Impossible de charger la liste des produits.");
        setProducts([]);
        return;
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Réponse non JSON de /api/admin/products:", e);
        setError("Réponse invalide de l'API produits.");
        setProducts([]);
        return;
      }

      if (!json.ok) {
        console.error("Erreur API admin/products:", json.error);
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
  };

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
    <div className="admin-content admin-page">
      {/* HEADER */}
      <h1 className="admin-page-title">🛍️ Produits</h1>

      <Link
        href="/admin/products/new"
        className="btn-primary"
        style={{ marginBottom: 20 }}
      >
        ➕ Ajouter un produit
      </Link>

      {/* ÉTATS */}
      {loading && <p>Chargement…</p>}
      {error && !loading && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}
      {!loading && !error && products.length === 0 && <p>Aucun produit.</p>}

      {/* LISTE */}
      {!loading && !error && products.length > 0 && (
        <div className="admin-card">
          <h3>Liste des produits</h3>

          {products.map((p) => (
            <div key={p.id} className="admin-list-row">
              {/* INFO */}
              <div className="admin-product-info">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={getName(p)}
                    className="admin-product-img"
                  />
                ) : (
                  <div className="admin-product-placeholder">No image</div>
                )}

                <div>
                  <h3>{getName(p)}</h3>
                  <p>{getPrice(p).toFixed(2)} €</p>
                  <span className="admin-product-status">
                    Stock : {p.stock ?? 0} |{" "}
                    {p.isActive ? "🟢 Actif" : "🔴 Inactif"}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="admin-product-actions">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="btn-primary"
                >
                  ✏️ Modifier
                </Link>
                {/* La suppression se fera plus tard via /api/admin/products/[id] si tu veux */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
