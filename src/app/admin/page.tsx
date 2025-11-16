"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductForm from "./ProductForm";
import ProductEditForm from "./ProductEditForm";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================================
        CHECK SESSION
  ================================= */
  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");

    if (saved !== "true") {
      window.location.href = "/admin/login";
      return;
    }

    fetchProducts();
  }, []);

  /* ================================
        FIRESTORE
  ================================= */
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin/login";
  };

  /* ================================
        DASHBOARD ADMIN PAGE
  ================================= */
  return (
    <main className="admin-container">

      {/* HEADER TOP */}
      <div className="admin-header-row">
        <h1 className="admin-title">🛍️ Produits</h1>

        <div className="admin-nav">
          <Link href="/admin" className="btn btn-secondary">Produits</Link>
          <Link href="/admin/shipping" className="btn btn-secondary">Livraisons</Link>
          <Link href="/admin/orders" className="btn btn-secondary">Commandes</Link>
          <button onClick={handleLogout} className="btn btn-danger">Déconnexion</button>
        </div>
      </div>

      {/* FORMULAIRE AJOUT PRODUIT */}
      <div className="admin-card">
        <h2 className="admin-section-title">Ajouter un produit</h2>
        <ProductForm onSuccess={fetchProducts} />
      </div>

      {/* LISTE PRODUITS */}
      <div className="admin-products-list">
        <h2 className="admin-section-title">Liste des produits</h2>

        {loading && <p className="admin-loading">Chargement…</p>}

        {!loading && products.length === 0 && (
          <p className="admin-empty">Aucun produit disponible.</p>
        )}

        {products.map((product) => (
          <div key={product.id} className="admin-product-row">

            {/* IMAGE + INFORMATIONS */}
            <div className="admin-product-info">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name?.fr}
                  className="admin-product-img"
                />
              ) : (
                <div className="admin-product-placeholder">No image</div>
              )}

              <div className="admin-product-text">
                <h3>{product.name?.fr}</h3>
                <p>{product.price?.eur} €</p>
                <span className="admin-product-status">
                  Stock : {product.stock} | {product.isActive ? "🟢 Actif" : "🔴 Inactif"}
                </span>
              </div>
            </div>

            {/* BOUTONS ACTION */}
            <div className="admin-product-actions">
              <button
                onClick={() => setEditingProduct(product)}
                className="btn btn-primary"
              >
                ✏️ Modifier
              </button>

              <button
                onClick={() => handleDelete(product.id)}
                className="btn btn-danger"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITION */}
      {editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button
              onClick={() => setEditingProduct(null)}
              className="admin-modal-close"
            >
              ✖
            </button>

            <h2 className="admin-section-title">Modifier le produit</h2>

            <ProductEditForm
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onUpdated={fetchProducts}
            />
          </div>
        </div>
      )}
    </main>
  );
}
