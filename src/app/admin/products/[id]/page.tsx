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

      {/* BG */}
      <div className="edit-product-grid" />

      <div className="edit-product-glow glow-1" />

      <div className="edit-product-glow glow-2" />

      {/* CONTAINER */}
      <div className="edit-product-container">

        {/* HERO */}
        <section className="edit-product-hero">

          <div className="edit-product-kicker">
            Product Management
          </div>

          <div className="edit-product-head">

            <div>

              <h1 className="edit-product-title">
                Modifier le produit
              </h1>

              <p className="edit-product-description">
                Édition avancée du produit
                et gestion complète du contenu.
              </p>

            </div>

            <button
              className="edit-product-back"
              onClick={() =>
                router.push(
                  "/admin/products"
                )
              }
            >
              <span>
                ←
              </span>

              Retour
            </button>

          </div>

        </section>

        {/* PRODUCT META */}
        <section className="edit-product-meta">

          <div className="edit-meta-card">

            <div className="edit-meta-label">
              Product ID
            </div>

            <div className="edit-meta-value mono">
              {id}
            </div>

          </div>

          <div className="edit-meta-card">

            <div className="edit-meta-label">
              Status
            </div>

            <div className="edit-meta-value success">
              Active
            </div>

          </div>

          <div className="edit-meta-card">

            <div className="edit-meta-label">
              Environment
            </div>

            <div className="edit-meta-value">
              Production
            </div>

          </div>

        </section>

        {/* CONTENT */}
        <section className="edit-product-card">

          <div className="edit-product-card-glow" />

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
              />
            )}

          </div>

        </section>

      </div>

    </main>
  );
}