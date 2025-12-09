"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductEditForm from "../ProductEditForm";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 check login admin côté client
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    if (token !== "true") {
      router.replace("/admin/login");
      return;
    }

    const loadProduct = async () => {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct({ id, ...snap.data() });
        } else {
          console.warn("Produit introuvable");
        }
      } catch (e) {
        console.error("Erreur chargement produit:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, router]);

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
