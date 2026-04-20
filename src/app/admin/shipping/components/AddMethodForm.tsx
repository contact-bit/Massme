"use client";

import { useState } from "react";
import type {
  ShippingMethodType,
  RelayProvider,
} from "@/components/shipping/types";
import { RELAY_PROVIDERS } from "@/components/shipping/relayProviders";
import {
  COUNTRY_LANGUAGE_MAP,
  CountryCode,
} from "@/lib/shipping-i18n";

type Props = {
  country: CountryCode;
  onCreated: () => void;
};

export default function AddMethodForm({ country, onCreated }: Props) {
  const lang = COUNTRY_LANGUAGE_MAP[country];

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    delay: "",
    type: "home" as ShippingMethodType,
    relayProvider: null as RelayProvider | null,
    priceHT: "",
    vatRate: country === "CH" ? "0" : "",
    sortOrder: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (form.type === "relay" && !form.relayProvider) {
      alert("Choisissez un transporteur relais");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/shipping-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          name: { [lang]: form.name },
          delay: { [lang]: form.delay },
          type: form.type,
          relayProvider:
            form.type === "relay" ? form.relayProvider : null,
          priceHT: Number(form.priceHT),
          vatRate: Number(form.vatRate || 0),
          isActive: true,
          sortOrder:
            form.sortOrder !== ""
              ? Number(form.sortOrder)
              : undefined,
        }),
      });

      if (!res.ok) throw new Error();

      setForm({
        name: "",
        delay: "",
        type: "home",
        relayProvider: null,
        priceHT: "",
        vatRate: country === "CH" ? "0" : "",
        sortOrder: "",
      });

      onCreated();
    } catch {
      alert("Erreur création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="wrap">

      {/* HEADER */}
      <div className="header">
        <h3>Nouvelle méthode</h3>
        <span>{country} • {lang.toUpperCase()}</span>
      </div>

      {/* INFOS */}
      <div className="block">
        <div className="grid">
          <input
            placeholder="Nom de la méthode"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            placeholder="Délai (ex: 2-3 jours)"
            value={form.delay}
            onChange={(e) =>
              setForm({ ...form, delay: e.target.value })
            }
          />
        </div>
      </div>

      {/* TYPE VISUEL */}
      <div className="block">
        <p className="label">Type de livraison</p>

        <div className="types">
          {[
            { id: "home", label: "Domicile" },
            { id: "relay", label: "Point relais" },
            { id: "local_pickup", label: "Retrait" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: t.id as ShippingMethodType,
                  relayProvider: null,
                })
              }
              className={`type ${
                form.type === t.id ? "active" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* RELAY */}
      {form.type === "relay" && (
        <div className="block">
          <p className="label">Transporteur</p>

          <div className="relay">
            {(Object.keys(RELAY_PROVIDERS) as RelayProvider[]).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, relayProvider: p })
                  }
                  className={`relayBtn ${
                    form.relayProvider === p ? "active" : ""
                  }`}
                >
                  {RELAY_PROVIDERS[p].label.fr}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* PRIX */}
      <div className="block">
        <p className="label">Tarification</p>

        <div className="grid">
          <input
            type="number"
            placeholder="Prix HT"
            value={form.priceHT}
            onChange={(e) =>
              setForm({ ...form, priceHT: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="TVA %"
            value={form.vatRate}
            disabled={country === "CH"}
            onChange={(e) =>
              setForm({ ...form, vatRate: e.target.value })
            }
          />
        </div>
      </div>

      {/* ORDER */}
      <input
        type="number"
        placeholder="Ordre d’affichage"
        value={form.sortOrder}
        onChange={(e) =>
          setForm({ ...form, sortOrder: e.target.value })
        }
      />

      {/* CTA */}
      <button className="submit" disabled={loading}>
        {loading ? "Création…" : "Ajouter la méthode"}
      </button>

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

        .block {
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        input {
          height: 44px;
          padding: 0 12px;
          border-radius: 10px;

          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* TYPES */
        .types {
          display: flex;
          gap: 10px;
        }

        .type {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
        }

        .type.active {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
        }

        /* RELAY */
        .relay {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .relayBtn {
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
        }

        .relayBtn.active {
          background: #3b82f6;
        }

        .submit {
          height: 46px;
          border-radius: 12px;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          font-weight: 600;
          cursor: pointer;
        }

      `}</style>
    </form>
  );
}