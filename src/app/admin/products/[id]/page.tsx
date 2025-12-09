"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductEditForm from "../ProductEditForm";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // ⬅️ Next 16 : params est une Promise → on l’unwrap avec React.use()
  const { id } = React.use(params);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct({ id, ...snap.data() });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return (
    <div className="admin-content admin-page">
      <h1 className="admin-page-title">✏️ Modifier le produit</h1>

      <div className="admin-card">
        {loading ? (
          <p>Chargement…</p>
        ) : !product ? (
          <p>Produit introuvable.</p>
        ) : (
          <ProductEditForm
            product={product}
            onClose={() => router.push("/admin/products")}
            onUpdated={() => router.push("/admin/products")}
          />
        )}
      </div>
    </div>
  );
}
