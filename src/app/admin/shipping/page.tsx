"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

import AddMethodForm from "./components/AddMethodForm";
import ToggleActivation from "./components/ToggleActivation";
import EditMethodModal from "./components/EditMethodModal";

/* ============================================================
   🔥 TYPAGE FIRESTORE SHIPPING METHOD
============================================================ */
export type ShippingMethod = {
  id: string;
  name: {
    fr: string;
    en?: string;
  };
  delay: {
    fr: string;
    en?: string;
  };
  price: {
    fr: number;
    en?: number;
  };
  type: "home" | "relay";
  relayProvider?: "mondialrelay" | "pickup" | null;
  isActive: boolean;
};

export default function ShippingAdminPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ShippingMethod | null>(null);

  /* ============================================================
     🔄 CHARGEMENT DES MÉTHODES
  ============================================================ */
  async function loadMethods() {
    try {
      setLoading(true);

      const q = query(collection(db, "shipping_methods"));
      const snap = await getDocs(q);

      let list: ShippingMethod[] = snap.docs.map((doc) => {
        const data = doc.data() as Omit<ShippingMethod, "id">;
        return { id: doc.id, ...data };
      });

      // Trier : actifs en premier
      list.sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
      });

      setMethods(list);
    } catch (err) {
      console.error("❌ Erreur chargement méthodes :", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
  }, []);

  /* ============================================================
     🎨 RENDER
  ============================================================ */
  return (
    <div className="space-y-6">
      <h1 className="admin-title">Méthodes de livraison</h1>

      {/* AJOUT */}
      <div className="admin-card">
        <AddMethodForm zone="fr" onAdded={loadMethods} />
      </div>

      {/* LISTE */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-4">
          Transporteurs configurés
        </h2>

        {loading ? (
          <p>Chargement…</p>
        ) : methods.length === 0 ? (
          <p>Aucune méthode configurée.</p>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between border p-4 rounded-lg ${
                  m.isActive ? "bg-white" : "bg-gray-100 opacity-70"
                }`}
              >
                {/* INFO */}
                <div>
                  <p className="font-semibold text-lg">
                    {m.name?.fr || "(Sans nom)"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Type : <b>{m.type}</b>{" "}
                    {m.relayProvider && (
                      <span className="text-blue-700">
                        ({m.relayProvider})
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-700">
                    Prix : <b>{m.price?.fr ?? "—"} €</b> — Délai :{" "}
                    {m.delay?.fr || "—"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(m)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Modifier
                  </button>

                  <ToggleActivation
                    id={m.id}
                    initial={m.isActive}
                    onChanged={loadMethods}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ÉDITION */}
      {editing && (
        <EditMethodModal
          data={editing}
          onClose={() => setEditing(null)}
          onSaved={loadMethods}
        />
      )}
    </div>
  );
}
