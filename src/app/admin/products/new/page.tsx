"use client";

import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="admin-content admin-page">


      <div>
        <ProductForm onSuccess={() => window.location.href = "/admin/products"} />
      </div>

    </div>
  );
}
