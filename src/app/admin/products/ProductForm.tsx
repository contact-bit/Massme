"use client";

import { useState } from "react";

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
  const [manageStock, setManageStock] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameFr.trim()) return setError("Nom obligatoire");
    if (!priceHT) return setError("Prix obligatoire");
    if (manageStock && !stock)
      return setError("Stock requis si activé");

    setLoading(true);

    try {
      const pass = localStorage.getItem("admin_password") || "";

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pass,
        },
        body: JSON.stringify({
          nameFr,
          descFr,
          priceHT,
          stock: stock || "0",
          imageUrl,
          manageStock,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) throw new Error(json?.error);

      // reset
      setNameFr("");
      setDescFr("");
      setPriceHT("");
      setStock("");
      setImageUrl("");
      setManageStock(false);

      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">

      <h2 className="title">➕ Ajouter un produit</h2>

      {/* INPUTS */}
      <div className="group">
        <input
          className="input"
          placeholder="Nom du produit"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
        />

        <textarea
          className="input textarea"
          placeholder="Description"
          value={descFr}
          onChange={(e) => setDescFr(e.target.value)}
        />

        <input
          className="input"
          placeholder="URL image"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {imageUrl && (
          <div className="preview">
            <img src={imageUrl} />
          </div>
        )}
      </div>

      {/* PRICE + STOCK */}
      <div className="row">
        <input
          type="number"
          className="input"
          placeholder="Prix (€)"
          value={priceHT}
          onChange={(e) => setPriceHT(e.target.value)}
        />

        <input
          type="number"
          className="input"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          disabled={!manageStock}
        />
      </div>

      {/* SWITCH */}
      <label className="switch">
        <input
          type="checkbox"
          checked={manageStock}
          onChange={(e) => setManageStock(e.target.checked)}
        />
        <span className="slider" />
        <span className="label">
          Gestion du stock
        </span>
      </label>

      {error && <div className="error">{error}</div>}

      {/* ACTION */}
      <button className="submit" disabled={loading}>
        {loading ? "Création…" : "💾 Créer"}
      </button>

      {/* STYLE */}
      <style jsx>{`

        .form {
          max-width: 600px;
          margin: auto;
          padding: 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: white;
        }

        .title {
          font-size: 20px;
          font-weight: 800;
        }

        .group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
        }

        .textarea {
          min-height: 90px;
        }

        .preview {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .preview img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* SWITCH */
        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .switch input {
          display: none;
        }

        .slider {
          width: 40px;
          height: 22px;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
          position: relative;
          transition: 0.2s;
        }

        .slider::after {
          content: "";
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: 0.2s;
        }

        .switch input:checked + .slider {
          background: #2563eb;
        }

        .switch input:checked + .slider::after {
          transform: translateX(18px);
        }

        .label {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }

        .error {
          color: #ef4444;
          font-size: 13px;
        }

        .submit {
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: #2563eb;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .submit:hover {
          background: #1d4ed8;
        }

      `}</style>
    </form>
  );
}