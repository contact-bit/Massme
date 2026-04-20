"use client";

import { useState } from "react";
import { COUNTRY_LANGUAGE_MAP } from "@/lib/shipping-i18n";
import type { PaymentMethod, PaymentMethodProvider } from "../types";

type Props = {
  data: PaymentMethod;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditPaymentMethodPanel({
  data,
  onClose,
  onSaved,
}: Props) {
  const locale = COUNTRY_LANGUAGE_MAP[data.country];

  const [provider, setProvider] = useState<PaymentMethodProvider>(
    data.provider
  );
  const [isActive, setIsActive] = useState(data.isActive);
  const [sortOrder, setSortOrder] = useState<number | "">(
    data.sortOrder ?? ""
  );

  const [name, setName] = useState(
    data.name?.[locale] ?? ""
  );
  const [description, setDescription] = useState(
    data.description?.[locale] ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ajoute un nom.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/payment-methods/${data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            isActive,
            sortOrder: sortOrder === "" ? null : Number(sortOrder),
            name: { ...data.name, [locale]: name },
            description: {
              ...data.description,
              [locale]: description,
            },
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();

      onSaved();
    } catch {
      setError("Erreur sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="wrap">

      {/* HEADER */}
      <div className="header">
        <div>
          <h3>Modifier</h3>
          <span>
            {data.country} • {locale.toUpperCase()}
          </span>
        </div>

        <button
          type="button"
          className="close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* PROVIDER */}
      <div className="block">
        <p className="label">Provider</p>

        <div className="providers">
          {[
            { id: "stripe", label: "Stripe" },
            { id: "paypal", label: "PayPal" },
            { id: "manual", label: "Manuel" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setProvider(p.id as PaymentMethodProvider)
              }
              className={`provider ${
                provider === p.id ? "active" : ""
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="block">
        <p className="label">Contenu</p>

        <div className="grid">
          <input
            placeholder={`Nom (${locale.toUpperCase()})`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder={`Description (${locale.toUpperCase()})`}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>
      </div>

      {/* SETTINGS */}
      <div className="block grid">

        <input
          type="number"
          placeholder="Ordre"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        />

        <label className="toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
          />
          Actif
        </label>

      </div>

      {error && <p className="error">{error}</p>}

      {/* ACTIONS */}
      <div className="actions">
        <button
          type="button"
          className="ghost"
          onClick={onClose}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="primary"
          disabled={loading}
        >
          {loading ? "..." : "Sauvegarder"}
        </button>
      </div>

      <style jsx>{`

        .wrap {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h3 {
          font-size: 20px;
          font-weight: 600;
        }

        span {
          font-size: 12px;
          color: #64748b;
        }

        .close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
        }

        .block {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .providers {
          display: flex;
          gap: 10px;
        }

        .provider {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
        }

        .provider.active {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        input {
          height: 46px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .ghost {
          background: rgba(255,255,255,0.05);
          padding: 8px 14px;
          border-radius: 10px;
        }

        .primary {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          padding: 8px 14px;
          border-radius: 10px;
        }

        .error {
          color: #f87171;
        }

      `}</style>
    </form>
  );
}