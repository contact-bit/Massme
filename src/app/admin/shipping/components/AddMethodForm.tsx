"use client";

import { useState } from "react";
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

  const [form, setForm] = useState({
    name: "",
    delay: "",
    type: "home" as "home" | "relay" | "local_pickup",
    priceHT: "",
    vatRate: country === "CH" ? "0" : "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/shipping-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          country,
          name: { [lang]: form.name },
          delay: { [lang]: form.delay },
          type: form.type,
          priceHT: Number(form.priceHT),
          vatRate: Number(form.vatRate || 0),
          isActive: true,
        },
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
      priceHT: "",
      vatRate: country === "CH" ? "0" : "",
    });

    onCreated();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-gray-500">
        ➕ Méthode pour <strong>{country}</strong> — langue{" "}
        <strong>{lang.toUpperCase()}</strong>
      </p>

      <input
        className="input"
        placeholder={`Nom (${lang.toUpperCase()})`}
        value={form.name}
        onChange={(e) =>
          setForm((f) => ({ ...f, name: e.target.value }))
        }
        required
      />

      <input
        className="input"
        placeholder={`Délai (${lang.toUpperCase()})`}
        value={form.delay}
        onChange={(e) =>
          setForm((f) => ({ ...f, delay: e.target.value }))
        }
      />

      <select
        className="input"
        value={form.type}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            type: e.target.value as any,
          }))
        }
      >
        <option value="home">Livraison à domicile</option>
        <option value="relay">Point relais</option>
        <option value="local_pickup">Retrait sur place</option>
      </select>

      <input
        type="number"
        step="0.01"
        min="0"
        className="input"
        placeholder="Prix HT (€)"
        value={form.priceHT}
        onChange={(e) =>
          setForm((f) => ({ ...f, priceHT: e.target.value }))
        }
        required
      />

      <input
        type="number"
        step="0.01"
        min="0"
        className="input"
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
