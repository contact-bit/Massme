"use client";

import { useState } from "react";

import "./product-form.css";

export default function ProductForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [name, setName] =
    useState("");

  const [desc, setDesc] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (
      !name ||
      !price ||
      !password
    ) {
      return setError(
        "Champs requis manquants"
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

            "x-admin-password":
              password,
          },

          body: JSON.stringify({
            data: {
              name: {
                fr: name,
              },

              description: {
                fr: desc,
              },

              imageUrl,

              pricesByMarket: {
                FR: price,
              },
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      onSuccess();
    } catch {
      setError(
        "Impossible de créer le produit"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="product-form"
    >

      {/* GLOW */}
      <div className="product-form-glow" />

      {/* HEADER */}
      <div className="product-form-header">

        <div className="product-form-kicker">
          Product Creation
        </div>

        <h2 className="product-form-title">
          Nouveau produit
        </h2>

        <p className="product-form-subtitle">
          Création et gestion d’un
          nouveau produit dans le
          catalogue.
        </p>

      </div>

      {/* GRID */}
      <div className="product-form-grid">

        {/* NAME */}
        <div className="product-form-field">

          <label>
            Nom du produit
          </label>

          <input
            className="product-form-input"
            placeholder="Nom FR"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

        </div>

        {/* PRICE */}
        <div className="product-form-field">

          <label>
            Prix HT
          </label>

          <input
            type="number"
            className="product-form-input"
            placeholder="0.00"
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* DESCRIPTION */}
      <div className="product-form-field">

        <label>
          Description
        </label>

        <textarea
          className="product-form-textarea"
          placeholder="Description FR"
          value={desc}
          onChange={(e) =>
            setDesc(
              e.target.value
            )
          }
        />

      </div>

      {/* IMAGE */}
      <div className="product-form-field">

        <label>
          Image URL
        </label>

        <input
          className="product-form-input"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) =>
            setImageUrl(
              e.target.value
            )
          }
        />

      </div>

      {/* PASSWORD */}
      <div className="product-form-field">

        <label>
          Mot de passe admin
        </label>

        <input
          type="password"
          className="product-form-input"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

      </div>

      {/* ERROR */}
      {error && (
        <div className="product-form-error">
          {error}
        </div>
      )}

      {/* ACTION */}
      <button
        className="product-form-submit"
        disabled={loading}
      >
        <span>
          {loading
            ? "Création..."
            : "Créer le produit"}
        </span>
      </button>

    </form>
  );
}
