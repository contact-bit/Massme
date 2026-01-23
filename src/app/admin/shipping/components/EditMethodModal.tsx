"use client";

import { useState } from "react";
import type { ShippingMethod } from "../page";
import {
  COUNTRY_LANGUAGE_MAP,
  CountryCode,
} from "@/lib/shipping-i18n";

type Props = {
  data: ShippingMethod;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditMethodModal({
  data,
  onClose,
  onSaved,
}: Props) {
  const country = data.country as CountryCode;
  const lang = COUNTRY_LANGUAGE_MAP[country];

  const [form, setForm] = useState<ShippingMethod>({ ...data });
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);

      const res = await fetch(
        `/api/admin/shipping-methods/${data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              name: form.name,
              delay: form.delay,
              type: form.type,
              relayProvider: form.relayProvider ?? null,
              priceHT: Number(form.priceHT),
              vatRate: Number(form.vatRate ?? 0),
              isActive: form.isActive,
            },
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        alert("Erreur lors de l’enregistrement");
        return;
      }

      onSaved();
      onClose();
    } catch {
      alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal max-w-xl">
        <h2 className="admin-section-title">
          Livraison — {country} ({lang.toUpperCase()})
        </h2>

        <label className="admin-label">
          Nom ({lang.toUpperCase()})
        </label>
        <input
          className="admin-input"
          value={form.name[lang] ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name: { ...f.name, [lang]: e.target.value },
            }))
          }
        />

        <label className="admin-label">
          Délai ({lang.toUpperCase()})
        </label>
        <input
          className="admin-input"
          value={form.delay[lang] ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              delay: { ...f.delay, [lang]: e.target.value },
            }))
          }
        />

        <label className="admin-label">Type</label>
        <select
          className="admin-input"
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

        <label className="admin-label">Prix HT (€)</label>
        <input
          type="number"
          step="0.01"
          className="admin-input"
          value={form.priceHT}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              priceHT: Number(e.target.value),
            }))
          }
        />

        <label className="admin-label">TVA (%)</label>
        <input
          type="number"
          step="0.01"
          className="admin-input"
          value={form.vatRate}
          disabled={country === "CH"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              vatRate: Number(e.target.value),
            }))
          }
        />

        <label className="admin-switch mt-3">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                isActive: e.target.checked,
              }))
            }
          />
          Méthode active
        </label>

        <div className="admin-form-actions">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Enregistrement…" : "💾 Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
