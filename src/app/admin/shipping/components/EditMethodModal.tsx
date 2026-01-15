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

  /* ---------- SAVE ---------- */
  const save = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `/api/admin/shipping-methods/${data.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              name: form.name,
              delay: form.delay,

              // 🔒 SOURCE DE VÉRITÉ
              priceHT: Number(form.priceHT),
              vatRate:
                typeof form.vatRate === "number"
                  ? form.vatRate
                  : null,

              isActive: form.isActive,
              type: form.type,
              relayProvider: form.relayProvider || null,
              country: form.country || null,
            },
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        console.error("❌ API UPDATE ERROR:", json);
        alert("Erreur lors de l’enregistrement");
        return;
      }

      onSaved();
      onClose();
    } catch (e) {
      console.error("❌ SAVE SHIPPING ERROR:", e);
      alert("Erreur réseau");
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

        {/* PRIX */}
        <label className="admin-label">Prix HT (€)</label>
        <input
          type="number"
          step="0.01"
          className="admin-input"
          value={form.priceHT}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              priceHT: Number(e.target.value),
            }))
          }
        />

        {/* TVA */}
        <label className="admin-label">TVA (%)</label>
        <input
          type="number"
          step="0.01"
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

        {/* ACTIF */}
        <label className="admin-switch">
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

        {/* ACTIONS */}
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
