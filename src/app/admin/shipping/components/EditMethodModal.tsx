"use client";

import { useState, ChangeEvent } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COUNTRY_OPTIONS = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "ES", label: "Espagne" },
  { code: "DE", label: "Allemagne" },
  { code: "IT", label: "Italie" },
  { code: "NL", label: "Pays-Bas" },
  { code: "PT", label: "Portugal" },
];

type Props = {
  data: any;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditMethodModal({ data, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name_fr: data.name?.fr || "",
    name_en: data.name?.en || "",
    price_fr: data.price?.fr ?? "",
    price_en: data.price?.en ?? "",
    delay_fr: data.delay?.fr || "",
    delay_en: data.delay?.en || "",
    type: data.type || "home",
    relayProvider: data.relayProvider || "",
    country: data.country || "FR",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    try {
      setLoading(true);

      await updateDoc(doc(db, "shipping_methods", data.id), {
        name: {
          fr: form.name_fr,
          en: form.name_en,
        },
        price: {
          fr: Number(form.price_fr),
          en: Number(form.price_en || form.price_fr),
        },
        delay: {
          fr: form.delay_fr,
          en: form.delay_en || form.delay_fr,
        },
        type: form.type,
        relayProvider: form.type === "relay" ? form.relayProvider : null,
        country: form.country, // ✅ pays enregistré
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Erreur update :", err);
      alert("Erreur lors de l’enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer ce transporteur ?")) return;

    try {
      await deleteDoc(doc(db, "shipping_methods", data.id));
      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Modifier la méthode</h2>

        <div className="space-y-3">
          {/* Nom FR */}
          <div>
            <label className="block text-sm font-medium">Nom (FR)</label>
            <input
              name="name_fr"
              value={form.name_fr}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Nom EN */}
          <div>
            <label className="block text-sm font-medium">Nom (EN)</label>
            <input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Prix FR/EN */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">Prix (FR)</label>
              <input
                name="price_fr"
                type="number"
                value={form.price_fr}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Prix (EN)</label>
              <input
                name="price_en"
                type="number"
                value={form.price_en}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* Délais FR/EN */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">Délai (FR)</label>
              <input
                name="delay_fr"
                value={form.delay_fr}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Délai (EN)</label>
              <input
                name="delay_en"
                value={form.delay_en}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* Pays */}
          <div>
            <label className="block text-sm font-medium">Pays</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="home">Domicile</option>
              <option value="relay">Point relais</option>
              <option value="local_pickup">Retrait sur place</option>
            </select>
          </div>

          {/* Relay Provider */}
          {form.type === "relay" && (
            <div>
              <label className="block text-sm font-medium">
                Réseau point relais
              </label>
              <select
                name="relayProvider"
                value={form.relayProvider}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="">—</option>
                <option value="mondialrelay">Mondial Relay</option>
                <option value="pickup">Pickup / Shop2Shop</option>
                <option value="colissimo">Colissimo</option>
                <option value="relais-colis">Relais Colis</option>
              </select>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>

          <button
            onClick={remove}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Supprimer
          </button>

          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
