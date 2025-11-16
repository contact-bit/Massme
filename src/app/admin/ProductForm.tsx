"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await addDoc(collection(db, "products"), {
      name: { fr: nameFr, en: nameEn },
      description: { fr: descFr, en: descEn },
      price: { eur: parseFloat(price) },
      stock: parseInt(stock),
      imageUrl: imageUrl || null,
      isActive: true,
    });

    setNameFr("");
    setNameEn("");
    setDescFr("");
    setDescEn("");
    setPrice("");
    setStock("");
    setImageUrl("");

    onSuccess();
    alert("✅ Produit ajouté !");
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">

      <h2 className="admin-section-title">➕ Ajouter un produit</h2>

      {/* Champ Nom FR / EN */}
      <div className="admin-form-row">
        <div className="admin-form-col">
          <label className="admin-label">Nom (FR)</label>
          <input
            className="admin-input"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            required
          />
        </div>

        <div className="admin-form-col">
          <label className="admin-label">Nom (EN)</label>
          <input
            className="admin-input"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
        </div>
      </div>

      {/* Description FR */}
      <label className="admin-label">Description (FR)</label>
      <textarea
        className="admin-textarea"
        value={descFr}
        onChange={(e) => setDescFr(e.target.value)}
      />

      {/* Description EN */}
      <label className="admin-label">Description (EN)</label>
      <textarea
        className="admin-textarea"
        value={descEn}
        onChange={(e) => setDescEn(e.target.value)}
      />

      {/* Prix + Stock */}
      <div className="admin-form-row">
        <div className="admin-form-col">
          <label className="admin-label">Prix (€)</label>
          <input
            type="number"
            className="admin-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="admin-form-col">
          <label className="admin-label">Stock</label>
          <input
            type="number"
            className="admin-input"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
      </div>

      {/* URL image */}
      <label className="admin-label">URL de l'image (CDN)</label>
      <input
        type="text"
        className="admin-input"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {/* Preview */}
      <div className="admin-img-wrapper">
        {imageUrl ? (
          <img src={imageUrl} className="admin-img-preview" />
        ) : (
          <div className="admin-img-placeholder">Aucune image</div>
        )}
      </div>

      {/* Bouton */}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn-save">
          💾 Enregistrer le produit
        </button>
      </div>

    </form>
  );
}
