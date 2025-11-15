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

  // 🔥 Nouveau champ pour l'image
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await addDoc(collection(db, "products"), {
      name: { fr: nameFr, en: nameEn },
      description: { fr: descFr, en: descEn },
      price: { eur: parseFloat(price) },
      stock: parseInt(stock),
      imageUrl: imageUrl || null, // 👈 on enregistre l’image
      isActive: true,
    });

    // Reset
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        ➕ Ajouter un produit
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nom FR"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="border border-gray-300 p-3 rounded-md text-gray-800"
          required
        />
        <input
          type="text"
          placeholder="Nom EN"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="border border-gray-300 p-3 rounded-md text-gray-800"
        />
      </div>

      <textarea
        placeholder="Description FR"
        value={descFr}
        onChange={(e) => setDescFr(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
      />

      <textarea
        placeholder="Description EN"
        value={descEn}
        onChange={(e) => setDescEn(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Prix (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 p-3 rounded-md text-gray-800"
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border border-gray-300 p-3 rounded-md text-gray-800"
          required
        />
      </div>

      {/* 🔥 Champ URL image */}
      <input
        type="text"
        placeholder="URL de l'image (Cloudflare, CDN, etc.)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border border-gray-300 p-3 rounded-md text-gray-800 w-full"
      />

      {/* 🔥 Prévisualisation */}
      {imageUrl && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
          <img
            src={imageUrl}
            alt="Preview"
            className="w-40 h-40 object-cover border rounded shadow-sm"
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition w-full"
      >
        💾 Enregistrer le produit
      </button>
    </form>
  );
}
