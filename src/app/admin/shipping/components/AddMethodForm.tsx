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

export default function AddMethodForm({
  country,
  onCreated,
}: Props) {
  const lang = COUNTRY_LANGUAGE_MAP[country];

  const [form, setForm] = useState({
    name: "",
    delay: "",
    type: "home" as ShippingMethodType,
    relayProvider: null as RelayProvider | null,
    priceHT: "",
    vatRate: country === "CH" ? "0" : "",
  });

  /* -----------------------------
     SUBMIT
  ------------------------------ */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // 🔒 VALIDATION RELAY
    if (form.type === "relay" && !form.relayProvider) {
      alert("Choisissez un fournisseur de point relais");
      return;
    }

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
      }),
    });

    if (!res.ok) {
      alert("Erreur création méthode de livraison");
      return;
    }

    setForm({
      name: "",
      delay: "",
      type: "home",
      relayProvider: null,
      priceHT: "",
      vatRate: country === "CH" ? "0" : "",
    });

    onCreated();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 border rounded-xl p-4 bg-white"
    >
      <p className="text-sm text-gray-500">
        ➕ Méthode pour <strong>{country}</strong> — langue{" "}
        <strong>{lang.toUpperCase()}</strong>
      </p>

      {/* NOM */}
      <input
        className="admin-input"
        placeholder={`Nom (${lang.toUpperCase()})`}
        value={form.name}
        onChange={(e) =>
          setForm((f) => ({ ...f, name: e.target.value }))
        }
        required
      />

      {/* DÉLAI */}
      <input
        className="admin-input"
        placeholder={`Délai (${lang.toUpperCase()})`}
        value={form.delay}
        onChange={(e) =>
          setForm((f) => ({ ...f, delay: e.target.value }))
        }
      />

      {/* TYPE */}
      <select
        className="admin-input"
        value={form.type}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            type: e.target.value as ShippingMethodType,
            relayProvider: null,
          }))
        }
      >
        <option value="home">Livraison à domicile</option>
        <option value="relay">Point relais</option>
        <option value="local_pickup">Retrait sur place</option>
      </select>

      {/* FOURNISSEUR RELAY */}
      {form.type === "relay" && (
        <div>
          <p className="text-sm font-semibold mb-2">
            Fournisseur point relais
          </p>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(RELAY_PROVIDERS) as RelayProvider[]).map(
              (provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      relayProvider: provider,
                    }))
                  }
                  className={`border rounded-lg p-3 text-sm font-medium transition ${
                    form.relayProvider === provider
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {RELAY_PROVIDERS[provider].label.fr}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* PRIX */}
      <input
        type="number"
        step="0.01"
        min="0"
        className="admin-input"
        placeholder="Prix HT (€)"
        value={form.priceHT}
        onChange={(e) =>
          setForm((f) => ({ ...f, priceHT: e.target.value }))
        }
        required
      />

      {/* TVA */}
      <input
        type="number"
        step="0.01"
        min="0"
        className="admin-input"
        placeholder="TVA (%)"
        value={form.vatRate}
        disabled={country === "CH"}
        onChange={(e) =>
          setForm((f) => ({ ...f, vatRate: e.target.value }))
        }
      />

      <button className="btn-blue w-full">
        ➕ Ajouter la livraison
      </button>
    </form>
  );
}
