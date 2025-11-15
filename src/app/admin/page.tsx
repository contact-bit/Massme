"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductForm from "./ProductForm";
import ProductEditForm from "./ProductEditForm";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Vérifie la session à l’ouverture
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchProducts();
    }
  }, []);

  // 🔐 Vérification du mot de passe
  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchProducts();
    } else {
      alert("Mot de passe incorrect 🚫");
    }
  };

  // 🚪 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  // 🔄 Charger les produits Firestore
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(list);
  };

  // 🗑️ Supprimer un produit
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // 🧱 Page de connexion admin
  if (!isAuthenticated) {
    return (
      <main className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-80 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            🔐 Admin Massme
          </h1>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-md w-full p-2 mb-4"
          />
          <button
            onClick={handleLogin}
            className="bg-black text-white px-4 py-2 rounded-md w-full hover:bg-gray-800"
          >
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  // 🧩 Interface principale admin
  return (
    <main className="max-w-4xl mx-auto py-10 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🛍️ Espace Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
        >
          🚪 Déconnexion
        </button>
      </div>

      {/* ➕ Ajouter un produit */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow">
        <ProductForm onSuccess={fetchProducts} />
      </div>

      {/* 📝 Liste des produits */}
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 border rounded-md shadow-sm flex justify-between items-center bg-white"
          >
            {/* 🔥 IMAGE + INFOS */}
            <div className="flex items-center gap-4">
              {/* 🖼️ Mini image */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name?.fr}
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-[10px] text-gray-400">
                  No image
                </div>
              )}

              {/* Infos produit */}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {product.name?.fr}
                </h3>
                <p className="text-sm text-gray-600">{product.price?.eur} €</p>
                <p className="text-xs text-gray-500">
                  Stock : {product.stock} |{" "}
                  {product.isActive ? "🟢 Actif" : "🔴 Inactif"}
                </p>
              </div>
            </div>

            {/* ✏️ Modifier / 🗑️ Supprimer */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🪟 Modal d’édition */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✖
            </button>

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
