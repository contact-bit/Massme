"use client";
import { useState } from "react";

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !price || !password) {
      return setError("Champs requis manquants");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          data: {
            name: { fr: name },
            description: { fr: desc },
            imageUrl,
            stock,
            pricesByMarket: { FR: price },
          },
        }),
      });

      if (!res.ok) throw new Error();

      onSuccess();
    } catch {
      setError("Impossible de créer le produit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="admin-card space-y-4">
      <input className="admin-input" placeholder="Nom FR" value={name} onChange={e => setName(e.target.value)} />
      <textarea className="admin-textarea" placeholder="Description FR" value={desc} onChange={e => setDesc(e.target.value)} />
      <input className="admin-input" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <input type="number" className="admin-input" placeholder="Prix HT" value={price} onChange={e => setPrice(e.target.value)} />
      <input type="number" className="admin-input" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} />
      <input type="password" className="admin-input" placeholder="Mot de passe admin" value={password} onChange={e => setPassword(e.target.value)} />

      {error && <p className="text-red-600">{error}</p>}

      <button className="btn-primary" disabled={loading}>
        {loading ? "Création…" : "Créer le produit"}
      </button>
    </form>
  );
}
