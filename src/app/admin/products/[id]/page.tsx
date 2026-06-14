"use client";

import React, {
  useEffect,
  useState,
} from "react";


import { useRouter } from "next/navigation";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import ProductEditForm from "../ProductEditForm";

import "./edit-product.css";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id } = React.use(params);

  const [product, setProduct] =
    useState<any | null>(null);

  const [loading, setLoading] =
    useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);

  const leavePage = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Des modifications ne sont pas enregistrées. Pour les conserver, saisissez le mot de passe admin puis cliquez sur Enregistrer en bas de page. Quitter quand même ?"
      )
    ) {
      return;
    }

    router.push("/admin/products");
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(
          db,
          "products",
          id
        );

        const snap =
          await getDoc(ref);

        if (snap.exists()) {
          setProduct({
            id,
            ...snap.data(),
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return (
    <main className="edit-product-page">

      {/* CONTAINER */}
      <div className="edit-product-container">

        {/* HEADER */}
        <section className="edit-product-head">

            <div>

              <h1 className="edit-product-title">
                Modifier le produit
              </h1>

              <p className="edit-product-description">
                {loading
                  ? "Chargement du code produit..."
                  : String(product?.productCode || "").trim()
                    ? `Code produit : ${String(product.productCode).trim()}`
                    : "Code produit non renseigné"}
              </p>

            </div>

            <button
              className="edit-product-back"
              onClick={leavePage}
            >
              <span>
                ←
              </span>

              Retour
            </button>

        </section>

        {/* CONTENT */}
        <section className="edit-product-card">

          <div className="edit-product-card-content">

            {loading ? (
              <div className="edit-product-state">

                <div className="loader" />

                <span>
                  Chargement du produit...
                </span>

              </div>
            ) : !product ? (
              <div className="edit-product-state error">

                <div className="state-icon">
                  ⚠️
                </div>

                <span>
                  Produit introuvable
                </span>

              </div>
            ) : (
              <ProductEditForm
                product={product}
                onClose={() =>
                  router.push(
                    "/admin/products"
                  )
                }
                onUpdated={() =>
                  router.push(
                    "/admin/products"
                  )
                }
                onDirtyChange={setHasUnsavedChanges}
              />
            )}

          </div>

        </section>

      </div>

    </main>
  );
}
