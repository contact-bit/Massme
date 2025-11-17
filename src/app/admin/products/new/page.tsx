"use client";

import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="admin-content admin-page">

      <h1 className="admin-page-title">➕ Ajouter un produit</h1>

      <div className="admin-card">
        <ProductForm onSuccess={() => window.location.href = "/admin/products"} />
      </div>

    </div>
  );
}
