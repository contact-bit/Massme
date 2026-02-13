"use client";

import { useState } from "react";

/* ==================================
   COMPONENT
================================== */
export default function ProductForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [nameFr, setNameFr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [priceHT, setPriceHT] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // 🔥 nouveau : ce produit gère-t-il le stock ?
  const [manageStock, setManageStock] = useState<boolean>(false); // par défaut : stock NON géré

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameFr.trim()) {
      return setError("Le nom FR est obligatoire.");
    }
    if (!priceHT) {
      return setError("Le prix est obligatoire.");
    }
    if (manageStock && !stock) {
      return setError("Le stock est obligatoire quand la gestion de stock est activée.");
    }

    setLoading(true);
    try {
      const adminPassword =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_password") || ""
          : "";

      if (!adminPassword) {
        setLoading(false);
        return setError("Mot de passe admin manquant (reconnecte-toi).");
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          nameFr,
          descFr,
          priceHT,
          stock: stock || "0",
          imageUrl,
          manageStock, // 🔥 on envoie bien au backend
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      // reset
      setNameFr("");
      setDescFr("");
      setPriceHT("");
      setStock("");
      setImageUrl("");
      setManageStock(false);

      onSuccess();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors de la création du produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-6">
      <h2 className="text-xl font-bold">➕ Ajouter un produit</h2>

      {/* INFOS PRINCIPALES */}
      <section className="space-y-4">
        <input
          className="admin-input"
          placeholder="Nom du produit (FR)"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          required
        />

        <textarea
          className="admin-textarea"
          rows={4}
          placeholder="Description (FR)"
          value={descFr}
          onChange={(e) => setDescFr(e.target.value)}
        />

        <input
          className="admin-input"
          placeholder="URL de l’image (CDN)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {imageUrl && (
          <div className="admin-img-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="admin-img-preview"
            />
          </div>
        )}
      </section>

      {/* PRIX & STOCK */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            className="admin-input"
            placeholder="Prix HT (FR)"
            value={priceHT}
            onChange={(e) => setPriceHT(e.target.value)}
            required
          />

          <input
            type="number"
            className="admin-input"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={!manageStock}
          />
        </div>

        <label className="admin-switch flex items-center gap-2">
          <input
            type="checkbox"
            checked={manageStock}
            onChange={(e) => setManageStock(e.target.checked)}
          />
          <span>
            Gestion du stock pour ce produit{" "}
            {!manageStock && "(le stock ne sera pas pris en compte)"}
          </span>
        </label>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Création…" : "💾 Créer le produit"}
        </button>
      </div>
    </form>
  );
}
