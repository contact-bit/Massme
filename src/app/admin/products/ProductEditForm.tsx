"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductEditForm({
  product,
  onClose,
  onUpdated,
}: {
  product: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (!product) return null;

  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [stock, setStock] = useState<number | string>("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setNameFr(product.name?.fr || "");
    setNameEn(product.name?.en || "");
    setPrice(product.price?.eur || "");
    setStock(product.stock || "");
    setDescFr(product.description?.fr || "");
    setDescEn(product.description?.en || "");
    setIsActive(product.isActive ?? true);
    setImageUrl(product.imageUrl || "");
  }, [product]);

  const handleSave = async (e: any) => {
    e.preventDefault();

    const ref = doc(db, "products", product.id);
    await updateDoc(ref, {
      name: { fr: nameFr, en: nameEn },
      description: { fr: descFr, en: descEn },
      price: { eur: parseFloat(price as string) },
      stock: parseInt(stock as string),
      isActive,
      imageUrl: imageUrl || null,
    });

    onUpdated();
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="admin-form">
      <h2 className="admin-section-title">Modifier le produit</h2>

      {/* IMAGE PREVIEW */}
      <div className="admin-img-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="admin-img-preview" />
        ) : (
          <div className="admin-img-placeholder">Aucune image</div>
        )}
      </div>

      <label className="admin-label">URL de l'image Cloudflare</label>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="admin-input"
      />

      <label className="admin-label">Nom (FR)</label>
      <input
        type="text"
        value={nameFr}
        onChange={(e) => setNameFr(e.target.value)}
        className="admin-input"
      />

      <label className="admin-label">Nom (EN)</label>
      <input
        type="text"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="admin-input"
      />

      <label className="admin-label">Prix (EUR)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="admin-input"
      />

      <label className="admin-label">Stock</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="admin-input"
      />

      <label className="admin-label">Description FR</label>
      <textarea
        value={descFr}
        onChange={(e) => setDescFr(e.target.value)}
        className="admin-textarea"
      />

      <label className="admin-label">Description EN</label>
      <textarea
        value={descEn}
        onChange={(e) => setDescEn(e.target.value)}
        className="admin-textarea"
      />

      <label className="admin-switch">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Produit actif ({isActive ? "🟢 visible" : "🔴 masqué"})</span>
      </label>

      <div className="admin-form-actions">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Annuler
        </button>

        <button type="submit" className="btn btn-primary">
          💾 Enregistrer
        </button>
      </div>
    </form>
  );
}
