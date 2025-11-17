"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved !== "true") {
      window.location.href = "/admin/login";
      return;
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <div className="admin-content admin-page">

      {/* HEADER */}
      <h1 className="admin-page-title">🛍️ Produits</h1>

      <Link href="/admin/products/new" className="btn-primary" style={{ marginBottom: 20 }}>
        ➕ Ajouter un produit
      </Link>

      {/* LISTE */}
      <div className="admin-card">
        <h3>Liste des produits</h3>

        {loading && <p>Chargement…</p>}

        {!loading && products.length === 0 && <p>Aucun produit.</p>}

        {products.map((p) => (
          <div key={p.id} className="admin-list-row">
            
            {/* INFO */}
            <div className="admin-product-info">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name?.fr} className="admin-product-img" />
              ) : (
                <div className="admin-product-placeholder">No image</div>
              )}

              <div>
                <h3>{p.name?.fr}</h3>
                <p>{p.price?.eur} €</p>
                <span className="admin-product-status">
                  Stock : {p.stock} | {p.isActive ? "🟢 Actif" : "🔴 Inactif"}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="admin-product-actions">
              <Link href={`/admin/products/${p.id}`} className="btn-primary">
                ✏️ Modifier
              </Link>

              <button onClick={() => deleteProduct(p.id)} className="btn-danger">
                🗑️ Supprimer
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
