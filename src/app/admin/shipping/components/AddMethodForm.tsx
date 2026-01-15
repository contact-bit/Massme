"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "FR", label: "France (UE)" },
  { code: "BE", label: "Belgique (UE)" },
  { code: "DE", label: "Allemagne (UE)" },
  { code: "ES", label: "Espagne (UE)" },
  { code: "IT", label: "Italie (UE)" },
  { code: "NL", label: "Pays-Bas (UE)" },
  { code: "CH", label: "Suisse (Hors UE)" },
];

export default function AddMethodForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    nameFr: "",
    nameEn: "",
    country: "FR",
    type: "home" as "home" | "relay" | "local_pickup",
    priceHT: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/shipping-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: {
            fr: form.nameFr,
            en: form.nameEn || form.nameFr,
          },
          delay: {
            fr: "",
            en: "",
          },

          // 🔐 SOURCE DE VÉRITÉ
          priceHT: Number(form.priceHT),

          country: form.country,
          type: form.type,
          isActive: true,
        },
      }),
    });

    if (!res.ok) {
      alert("Erreur création méthode de livraison");
      return;
    }

    setForm({
      nameFr: "",
      nameEn: "",
      country: "FR",
      type: "home",
      priceHT: "",
    });

    onCreated();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="input"
        placeholder="Nom FR"
        value={form.nameFr}
        onChange={(e) =>
          setForm({ ...form, nameFr: e.target.value })
        }
        required
      />

      <input
        className="input"
        placeholder="Nom EN (optionnel)"
        value={form.nameEn}
        onChange={(e) =>
          setForm({ ...form, nameEn: e.target.value })
        }
      />

      <select
        className="input"
        value={form.country}
        onChange={(e) =>
          setForm({ ...form, country: e.target.value })
        }
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={form.type}
        onChange={(e) =>
          setForm({
            ...form,
            type: e.target.value as any,
          })
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
          setForm({ ...form, priceHT: e.target.value })
        }
        required
      />

      <button className="btn-blue w-full">
        ➕ Ajouter la livraison
      </button>
    </form>
  );
}
