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
    <main className="page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Modifier le produit</h1>
          <p>Édition du produit #{id.slice(0, 8)}</p>
        </div>

        <button
          className="btn ghost"
          onClick={() => router.push("/admin/products")}
        >
          ← Retour
        </button>
      </div>

      {/* CONTENT */}
      <div className="card">

        {loading ? (
          <div className="state">Chargement…</div>
        ) : !product ? (
          <div className="state error">Produit introuvable</div>
        ) : (
          <ProductEditForm
            product={product}
            onClose={() => router.push("/admin/products")}
            onUpdated={() => router.push("/admin/products")}
          />
        )}

      </div>

      {/* STYLE */}
      <style jsx>{`

        .page {
          max-width: 1000px;
          margin: auto;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: white;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        h1 {
          font-size: 22px;
          font-weight: 900;
        }

        p {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }

        /* CARD */
        .card {
          border-radius: 18px;
          padding: 22px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }

        /* STATES */
        .state {
          padding: 30px;
          text-align: center;
          color: rgba(255,255,255,0.7);
        }

        .error {
          color: #ef4444;
        }

        /* BUTTONS */
        .btn {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .btn:hover {
          background: rgba(255,255,255,0.08);
        }

        .ghost {
          opacity: 0.8;
        }

      `}</style>
    </main>
  );
}