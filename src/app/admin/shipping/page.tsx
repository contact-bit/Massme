"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddMethodForm from "./components/AddMethodForm";

type Method = {
  id: string;
  name: string;
  delay: string;
  price: number;
  isActive: boolean;
};

export default function ShippingAdminPage() {
  const [zones, setZones] = useState<string[]>(["fr", "en"]); // ✔️ simple
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Method | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Charger les transporteurs pour la zone sélectionnée
  async function loadMethods(zone: string) {
    setSelectedZone(zone);
    setLoading(true);

    const snap = await getDocs(collection(db, "shipping_methods"));

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m: any) => m.zone === zone && m.name?.[zone]); // ✔️ lire uniquement cette langue

    setMethods(
      list.map((m: any) => ({
        id: m.id,
        name: m.name[zone] || "",
        delay: m.delay[zone] || "",
        price: m.price[zone] || 0,
        isActive: m.isActive ?? true,
      }))
    );

    setLoading(false);
  }

  // Supprimer une méthode
  async function deleteMethod(id: string) {
    if (!confirm("Supprimer ce transporteur ?")) return;
    await deleteDoc(doc(db, "shipping_methods", id));
    if (selectedZone) loadMethods(selectedZone);
  }

  // Sauvegarder modification
  async function saveEditing() {
    if (!editing || !selectedZone) return;

    setSavingEdit(true);

    await updateDoc(doc(db, "shipping_methods", editing.id), {
      [`name.${selectedZone}`]: editing.name,
      [`delay.${selectedZone}`]: editing.delay,
      [`price.${selectedZone}`]: editing.price,
      isActive: editing.isActive,
    });

    setSavingEdit(false);
    setEditing(null);
    loadMethods(selectedZone);
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        🌍 Gestion des zones & livraisons
      </h1>

      {/* ZONES */}
      <div className="flex gap-3 mb-6">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => loadMethods(zone)}
            className={`px-4 py-2 rounded ${
              selectedZone === zone
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {zone.toUpperCase()}
          </button>
        ))}
      </div>

      {!selectedZone && <p>Choisis un pays pour gérer ses transporteurs.</p>}

      {selectedZone && (
        <>
          {/* FORMULAIRE AJOUT */}
          <AddMethodForm zone={selectedZone} onAdded={() => loadMethods(selectedZone)} />

          <h2 className="text-xl font-semibold mb-4">
            🚚 Transporteurs — {selectedZone.toUpperCase()}
          </h2>

          {loading ? (
            <p>Chargement…</p>
          ) : methods.length === 0 ? (
            <p>Aucun transporteur pour ce pays.</p>
          ) : (
            <div className="space-y-4">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className="border rounded-lg p-4 bg-white shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">{m.name}</p>
                    <p className="text-sm">Délai : {m.delay}</p>
                    <p className="text-sm">Prix : {m.price.toFixed(2)} €</p>
                    <p className="text-xs mt-1">{m.isActive ? "🟢 Actif" : "🔴 Inactif"}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => deleteMethod(m.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL EDIT */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Modifier transporteur</h3>

            <div className="space-y-3 mb-4">
              <input
                className="input"
                placeholder="Nom"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />

              <input
                className="input"
                placeholder="Délai"
                value={editing.delay}
                onChange={(e) => setEditing({ ...editing, delay: e.target.value })}
              />

              <input
                type="number"
                className="input"
                placeholder="Prix (€)"
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                />
                <span>{editing.isActive ? "🟢 Actif" : "🔴 Inactif"}</span>
              </label>
            </div>

            <div className="flex justify-between">
              <button
                className="btn-secondary"
                onClick={() => setEditing(null)}
                disabled={savingEdit}
              >
                Annuler
              </button>

              <button
                className="btn-primary"
                onClick={saveEditing}
                disabled={savingEdit}
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
