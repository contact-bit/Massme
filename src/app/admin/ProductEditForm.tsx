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
  const [imageUrl, setImageUrl] = useState(""); // 👈 nouvel état image

  useEffect(() => {
    setNameFr(product.name?.fr || "");
    setNameEn(product.name?.en || "");
    setPrice(product.price?.eur || "");
    setStock(product.stock || "");
    setDescFr(product.description?.fr || "");
    setDescEn(product.description?.en || "");
    setIsActive(product.isActive ?? true);
    setImageUrl(product.imageUrl || ""); // 👈 initialiser la preview
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
      imageUrl: imageUrl || null, // 👈 sauvegarder l'image
    });

    onUpdated();
    onClose();
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 bg-white p-4 rounded-md shadow max-w-lg mx-auto"
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        ✏️ Modifier le produit
      </h2>

      {/* 🖼️ Preview image */}
      <div className="flex flex-col items-center gap-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded border shadow"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
            Pas d’image
          </div>
        )}
      </div>

      {/* 🔥 Champ image */}
      <input
        type="text"
        placeholder="URL de l'image Cloudflare"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
      />

      <input
        type="text"
        value={nameFr}
        onChange={(e) => setNameFr(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        placeholder="Nom FR"
      />

      <input
        type="text"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        placeholder="Nom EN"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        placeholder="Prix EUR"
      />

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        placeholder="Stock"
      />

      <textarea
        value={descFr}
        onChange={(e) => setDescFr(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
        placeholder="Description FR"
      />

      <textarea
        value={descEn}
        onChange={(e) => setDescEn(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
        placeholder="Description EN"
      />

      {/* Switch actif/inactif */}
      <label className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-5 h-5 accent-green-600"
        />
        <span className="text-gray-800">
          Produit actif ({isActive ? "🟢 visible" : "🔴 masqué"})
        </span>
      </label>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          💾 Enregistrer
        </button>
      </div>
    </form>
  );
}
