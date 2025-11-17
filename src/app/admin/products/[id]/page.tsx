"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductEditForm from "../ProductEditForm";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // On unwrap les params depuis la promesse Next.js
  const { id } = React.use(params);

  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    async function loadProduct() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        setProduct({ id, ...snap.data() });
      }
    }

    loadProduct();
  }, [id]);

  return (
    <div className="admin-content admin-page">
      <h1 className="admin-page-title">✏️ Modifier le produit</h1>

      <div className="admin-card">
        {!product ? (
          <p>Chargement…</p>
        ) : (
          <ProductEditForm
            product={product}
            onClose={() => (window.location.href = "/admin/products")}
            onUpdated={() => (window.location.href = "/admin/products")}
          />
        )}
      </div>
    </div>
  );
}
