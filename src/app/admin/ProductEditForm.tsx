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

  useEffect(() => {
    setNameFr(product.name?.fr || "");
    setNameEn(product.name?.en || "");
    setPrice(product.price?.eur || "");
    setStock(product.stock || "");
    setDescFr(product.description?.fr || "");
    setDescEn(product.description?.en || "");
    setIsActive(product.isActive ?? true);
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
    });
    onUpdated();
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 bg-white p-4 rounded-md shadow">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">✏️ Modifier le produit</h2>

      <input
        type="text"
        value={nameFr}
        onChange={(e) => setNameFr(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
      />
      <input
        type="text"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
      />

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
      />

      <textarea
        value={descFr}
        onChange={(e) => setDescFr(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
      />
      <textarea
        value={descEn}
        onChange={(e) => setDescEn(e.target.value)}
        className="border border-gray-300 p-3 rounded-md w-full text-gray-800"
        rows={2}
      />

      {/* ✅ Switch actif/inactif */}
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
