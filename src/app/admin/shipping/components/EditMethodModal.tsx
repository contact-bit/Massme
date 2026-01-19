"use client";

import { useState } from "react";
import type { ShippingMethod } from "../page";

/* =====================================================
   PROPS
===================================================== */
type Props = {
  data: ShippingMethod;
  onClose: () => void;
  onSaved: () => void;
};

/* =====================================================
   MODAL
===================================================== */
export default function EditMethodModal({
  data,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<ShippingMethod>({ ...data });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     SAVE
  ===================================================== */
  const save = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: {
          fr: form.name.fr,
          en: form.name.en,
        },

        delay: {
          fr: form.delay.fr,
          en: form.delay.en,
        },

        // 🔒 SOURCE DE VÉRITÉ
        priceHT: Number(form.priceHT) || 0,

        vatRate:
          typeof form.vatRate === "number"
            ? form.vatRate
            : null,

        isActive: form.isActive,
        type: form.type,
        relayProvider: form.relayProvider || null,
        country: form.country || null,
      };

      const res = await fetch(
        `/api/admin/shipping-methods/${data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ data: payload }),
        }
      );

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        console.error("❌ UPDATE SHIPPING ERROR:", json);
        setError("Erreur lors de l’enregistrement");
        return;
      }

      onSaved(); // reload parent
      onClose();
    } catch (e) {
      console.error("❌ SAVE SHIPPING ERROR:", e);
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <h2 className="admin-section-title">
          Configurer la livraison
        </h2>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* =========================
            NOM
        ========================= */}
        <h3 className="admin-subtitle">Nom du mode</h3>

        <label className="admin-label">Nom (FR)</label>
        <input
          className="admin-input"
          value={form.name.fr}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              name: { ...p.name, fr: e.target.value },
            }))
          }
        />

        <label className="admin-label">Nom (EN)</label>
        <input
          className="admin-input"
          value={form.name.en}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              name: { ...p.name, en: e.target.value },
            }))
          }
        />

        {/* =========================
            DÉLAIS
        ========================= */}
        <h3 className="admin-subtitle mt-4">Délais de livraison</h3>

        <label className="admin-label">Délai (FR)</label>
        <input
          className="admin-input"
          placeholder="Ex : 2 à 4 jours ouvrés"
          value={form.delay.fr}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              delay: { ...p.delay, fr: e.target.value },
            }))
          }
        />

        <label className="admin-label">Délai (EN)</label>
        <input
          className="admin-input"
          placeholder="Ex: 2–4 business days"
          value={form.delay.en}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              delay: { ...p.delay, en: e.target.value },
            }))
          }
        />

        {/* =========================
            PRIX / TVA
        ========================= */}
        <h3 className="admin-subtitle mt-4">Tarification</h3>

        <label className="admin-label">Prix HT (€)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="admin-input"
          value={form.priceHT}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              priceHT: Number(e.target.value),
            }))
          }
        />

        <label className="admin-label">TVA (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="admin-input"
          value={form.vatRate ?? ""}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              vatRate:
                e.target.value === ""
                  ? undefined
                  : Number(e.target.value),
            }))
          }
        />

        {/* =========================
            ACTIF
        ========================= */}
        <label className="admin-switch mt-3">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                isActive: e.target.checked,
              }))
            }
          />
          Méthode active
        </label>

        {/* =========================
            ACTIONS
        ========================= */}
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
