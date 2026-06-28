"use client";

import { useState } from "react";

import "./product-form.css";

export default function ProductForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [nameFr, setNameFr] =
    useState("");

  const [productCode, setProductCode] =
    useState("");

  const [descFr, setDescFr] =
    useState("");

  const [priceHT, setPriceHT] =
    useState("");

  const [weightKg, setWeightKg] =
    useState("");

  const [
    deliveryPackageCount,
    setDeliveryPackageCount,
  ] = useState("1");

  const [imageUrl, setImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError(null);

    if (!nameFr.trim()) {
      return setError(
        "Nom obligatoire"
      );
    }

    if (!priceHT) {
      return setError(
        "Prix obligatoire"
      );
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/admin/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nameFr,
            productCode,
            descFr,
            priceHT,
            weightKg,
            deliveryPackageCount,
            imageUrl,
          }),
        }
      );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json?.ok
      ) {
        throw new Error(
          json?.error
        );
      }

      /* RESET */
      setNameFr("");
      setProductCode("");
      setDescFr("");
      setPriceHT("");
      setWeightKg("");
      setDeliveryPackageCount("1");
      setImageUrl("");

      onSuccess();
    } catch (e: any) {
      setError(
        e?.message || "Erreur"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="product-form"
    >

      {/* HERO */}
      <div className="product-form-head">

        <div className="product-form-badge">
          PRODUCT CREATION
        </div>

        <div>

          <h2 className="product-form-title">
            Ajouter un produit
          </h2>

          <p className="product-form-description">
            Création avancée d’un
            produit avec gestion du
            contenu et des
            médias.
          </p>

        </div>

      </div>

      {/* GRID */}
      <div className="product-form-grid">

        {/* LEFT */}
        <div className="product-form-main">

          {/* NAME */}
          <div className="pf-field">

            <label>
              Nom du produit
            </label>

            <input
              className="pf-input"
              placeholder="Ex : Nom du produit"
              value={nameFr}
              onChange={(e) =>
                setNameFr(
                  e.target.value
                )
              }
            />

          </div>

          <div className="pf-field">

            <label>
              Référence interne
            </label>

            <input
              className="pf-input"
              placeholder="Ex : SKU-001"
              value={productCode}
              onChange={(e) =>
                setProductCode(
                  e.target.value
                )
              }
            />

          </div>

          {/* DESCRIPTION */}
          <div className="pf-field">

            <label>
              Description
            </label>

            <textarea
              className="pf-input pf-textarea"
              placeholder="Description du produit..."
              value={descFr}
              onChange={(e) =>
                setDescFr(
                  e.target.value
                )
              }
            />

          </div>

          {/* IMAGE */}
          <div className="pf-field">

            <label>
              URL image
            </label>

            <input
              className="pf-input"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(
                  e.target.value
                )
              }
            />

          </div>

          {/* ROW */}
          <div className="pf-row">

            <div className="pf-field">

              <label>
                Prix (€)
              </label>

              <input
                type="number"
                className="pf-input"
                placeholder="149"
                value={priceHT}
                onChange={(e) =>
                  setPriceHT(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="pf-field">

              <label>
                Poids unitaire (kg)
              </label>

              <input
                type="number"
                step="0.01"
                className="pf-input"
                placeholder="1.20"
                value={weightKg}
                onChange={(e) =>
                  setWeightKg(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="pf-field">

              <label>
                Colis par unité
              </label>

              <input
                type="number"
                min="1"
                step="1"
                className="pf-input"
                placeholder="1"
                value={deliveryPackageCount}
                onChange={(e) =>
                  setDeliveryPackageCount(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="pf-error">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="pf-actions">

            <button
              type="submit"
              className="pf-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Création..."
                  : "Créer le produit"}
              </span>
            </button>

          </div>

        </div>

        {/* RIGHT */}
        <aside className="product-form-side">

          <div className="pf-preview-card">

            <div className="pf-preview-kicker">
              LIVE PREVIEW
            </div>

            <div className="pf-preview-image">

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="preview"
                />
              ) : (
                <div className="pf-preview-placeholder">
                  Aperçu produit
                </div>
              )}

            </div>

            <div className="pf-preview-content">

              <h3>
                {nameFr ||
                  "Nom du produit"}
              </h3>

              <p>
                {descFr ||
                  "La description du produit apparaîtra ici."}
              </p>

              <div className="pf-preview-price">
                {priceHT
                  ? `${priceHT} €`
                  : "-- €"}
              </div>

            </div>

          </div>

        </aside>

      </div>

    </form>
  );
}
