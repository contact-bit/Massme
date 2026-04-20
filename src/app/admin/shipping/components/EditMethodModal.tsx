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

export default function EditMethodPanel({
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
            name: form.name,
            delay: form.delay,
            type: form.type,
            relayProvider: form.relayProvider ?? null,
            priceHT: Number(form.priceHT),
            vatRate: Number(form.vatRate ?? 0),
            isActive: form.isActive,
            sortOrder:
              form.sortOrder == null
                ? null
                : Number(form.sortOrder),
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        alert("Erreur lors de l’enregistrement");
        return;
      }

      onSaved();
    } catch {
      alert("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Livraison</h1>
          <p>{country} • {lang.toUpperCase()}</p>
        </div>

        <button className="close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* GRID */}
        <div className="grid">

          <div className="field">
            <label>Nom</label>
            <input
              value={form.name[lang] ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: {
                    ...f.name,
                    [lang]: e.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="field">
            <label>Délai</label>
            <input
              value={form.delay[lang] ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  delay: {
                    ...f.delay,
                    [lang]: e.target.value,
                  },
                }))
              }
            />
          </div>

        </div>

        <div className="field">
          <label>Type</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as any,
              }))
            }
          >
            <option value="home">Domicile</option>
            <option value="relay">Point relais</option>
            <option value="local_pickup">Retrait</option>
          </select>
        </div>

        <div className="grid">
          <div className="field">
            <label>Prix HT</label>
            <input
              type="number"
              value={form.priceHT}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  priceHT: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="field">
            <label>TVA</label>
            <input
              type="number"
              disabled={country === "CH"}
              value={form.vatRate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  vatRate: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="field">
          <label>Ordre</label>
          <input
            type="number"
            value={form.sortOrder ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                sortOrder:
                  e.target.value === ""
                    ? null
                    : Number(e.target.value),
              }))
            }
          />
        </div>

        <div className="toggle">
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
          <span>Actif</span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="footer">
        <button className="btn ghost" onClick={onClose}>
          Annuler
        </button>

        <button
          className="btn primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {/* STYLE */}
      <style jsx>{`

        .panel {
          height: 100%;
          width: 100%;
          max-width: 720px;
          margin: auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;

          background:
            radial-gradient(circle at top, rgba(37,99,235,0.15), transparent 40%),
            #020617;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h1 {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        p {
          color: #64748b;
          font-size: 13px;
        }

        .close {
          background: rgba(255,255,255,0.06);
          border: none;
          border-radius: 10px;
          width: 38px;
          height: 38px;
          cursor: pointer;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-size: 12px;
          color: #94a3b8;
        }

        input, select {
          height: 46px;
          padding: 0 14px;
          border-radius: 12px;

          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(8px);

          border: 1px solid rgba(255,255,255,0.08);
          color: white;

          transition: all 0.2s ease;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn.primary {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
          color: white;
        }

        .btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.5);
        }

        .btn.ghost {
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .btn.ghost:hover {
          background: rgba(255,255,255,0.1);
        }

      `}</style>
    </div>
  );
}