"use client";

import { useMemo, useState } from "react";
import type { CountryCode } from "@/lib/shipping-i18n";
import { COUNTRY_LANGUAGE_MAP } from "@/lib/shipping-i18n";
import type { PaymentMethodProvider } from "../types";

type Props = {
  country: CountryCode;
  onCreated: () => void;
};

type ProviderUI = PaymentMethodProvider | "bank_transfer";

export default function AddPaymentMethodForm({ country, onCreated }: Props) {
  const locale = COUNTRY_LANGUAGE_MAP[country];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState<ProviderUI>("stripe");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number | "">("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [bank, setBank] = useState({
    accountHolder: "",
    iban: "",
    bic: "",
    bankName: "",
    instructions: "",
  });

  const hasName = useMemo(() => name.trim().length > 0, [name]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasName) {
      setError("Ajoute un nom.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          provider,
          isActive,
          sortOrder: sortOrder === "" ? null : Number(sortOrder),
          name: { [locale]: name },
          description: { [locale]: description },
          config: provider === "bank_transfer" ? bank : {},
        }),
      });

      if (!res.ok) throw new Error();

      setName("");
      setDescription("");
      setProvider("stripe");
      setSortOrder("");
      setBank({
        accountHolder: "",
        iban: "",
        bic: "",
        bankName: "",
        instructions: "",
      });

      onCreated();
    } catch {
      setError("Erreur création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="wrap">

      {/* HEADER */}
      <div className="header">
        <div>
          <h3>Nouvelle méthode</h3>
          <span>{country} • {locale.toUpperCase()}</span>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Actif
        </label>
      </div>

      {/* PROVIDER */}
      <div className="block">
        <p className="label">Provider</p>

        <div className="providers">
          {[
            { id: "stripe", label: "Stripe" },
            { id: "paypal", label: "PayPal" },
            { id: "manual", label: "Manuel" },
            { id: "bank_transfer", label: "Virement" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProvider(p.id as ProviderUI)}
              className={`provider ${provider === p.id ? "active" : ""}`}
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
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* BANK */}
      {provider === "bank_transfer" && (
        <div className="block">
          <p className="label">Informations bancaires</p>

          <div className="grid">
            <input
              placeholder="Titulaire"
              value={bank.accountHolder}
              onChange={(e) =>
                setBank({ ...bank, accountHolder: e.target.value })
              }
            />
            <input
              placeholder="Banque"
              value={bank.bankName}
              onChange={(e) =>
                setBank({ ...bank, bankName: e.target.value })
              }
            />
            <input
              placeholder="IBAN"
              value={bank.iban}
              onChange={(e) =>
                setBank({ ...bank, iban: e.target.value })
              }
            />
            <input
              placeholder="BIC"
              value={bank.bic}
              onChange={(e) =>
                setBank({ ...bank, bic: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="Instructions"
            value={bank.instructions}
            onChange={(e) =>
              setBank({ ...bank, instructions: e.target.value })
            }
          />
        </div>
      )}

      {/* SETTINGS */}
      <div className="block grid">
        <input
          type="number"
          placeholder="Ordre d'affichage"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      {error && <p className="error">{error}</p>}

      <button className="submit" disabled={loading}>
        {loading ? "Création…" : "Ajouter la méthode"}
      </button>

      <style jsx>{`

        .wrap {
          display: flex;
          flex-direction: column;
          gap: 24px;
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
          transition: 0.2s;
        }

        .provider.active {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        input, textarea {
          height: 46px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
        }

        textarea {
          height: 90px;
          padding-top: 12px;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .submit {
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(37,99,235,0.4);
        }

        .error {
          color: #f87171;
        }

      `}</style>
    </form>
  );
}