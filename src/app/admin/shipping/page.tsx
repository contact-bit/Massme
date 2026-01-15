"use client";

import { useEffect, useState } from "react";
import AddMethodForm from "./components/AddMethodForm";
import EditMethodModal from "./components/EditMethodModal";

/* =====================================================
   TYPES — SOURCE DE VÉRITÉ
===================================================== */
export type ShippingMethod = {
  id: string;

  name: {
    fr: string;
    en: string;
  };

  delay: {
    fr: string;
    en: string;
  };

  priceHT: number;        // ✅ SOURCE DE VÉRITÉ
  vatRate?: number;       // optionnel

  isActive: boolean;
  type: "home" | "relay" | "local_pickup";
  relayProvider?: string | null;
  country?: string;
};

/* =====================================================
   PAGE
===================================================== */
export default function ShippingAdminPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);

  /* ---------- LOAD ---------- */
  const reload = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/shipping-methods", {
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        console.error("Erreur API shipping-methods:", json.error);
        setMethods([]);
        return;
      }

      const normalized: ShippingMethod[] = (json.methods || []).map(
        (m: any) => ({
          id: m.id,

          name: {
            fr: m.name?.fr || "",
            en: m.name?.en || "",
          },

          delay: {
            fr: m.delay?.fr || "",
            en: m.delay?.en || "",
          },

          // 🔒 SOURCE DE VÉRITÉ
          priceHT: Number(m.priceHT ?? 0),
          vatRate:
            typeof m.vatRate === "number" ? m.vatRate : undefined,

          isActive: m.isActive ?? true,
          type: m.type || "home",
          relayProvider: m.relayProvider ?? null,
          country: m.country,
        })
      );

      setMethods(normalized);
    } catch (e) {
      console.error("Erreur chargement shipping:", e);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette méthode de livraison ?")) return;

    try {
      const res = await fetch(`/api/admin/shipping-methods/${id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        alert("Erreur lors de la suppression");
        return;
      }

      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error("Erreur suppression shipping:", e);
      alert("Erreur lors de la suppression");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <main className="admin-page">
      <h1 className="admin-title">🚚 Méthodes de livraison</h1>

      {/* ➕ AJOUT */}
      <section className="mb-8">
        <h2 className="admin-section-title mb-2">
          Créer un mode de livraison
        </h2>
        <AddMethodForm onCreated={reload} />
      </section>

      {/* 📋 LISTE */}
      <section>
        <h2 className="admin-section-title mb-2">
          Liste des méthodes
        </h2>

        {loading ? (
          <p>Chargement…</p>
        ) : methods.length === 0 ? (
          <p>Aucune méthode de livraison.</p>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => {
              const name = m.name.fr || m.name.en || "Méthode";
              const delay = m.delay.fr || m.delay.en || "—";

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between border rounded-md p-3 bg-white"
                >
                  <div>
                    <p className="font-semibold">
                      {name}{" "}
                      {!m.isActive && (
                        <span className="text-xs text-red-500">
                          (désactivée)
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {m.priceHT.toFixed(2)} € HT
                      {m.vatRate != null && ` • TVA ${m.vatRate}%`}
                      {" — "}
                      {delay}
                      {" — "}
                      {m.type === "home"
                        ? "Domicile"
                        : m.type === "relay"
                        ? "Point relais"
                        : "Retrait sur place"}
                      {m.relayProvider && ` (${m.relayProvider})`}
                      {m.country && ` • ${m.country}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                    >
                      Configurer
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editing && (
        <EditMethodModal
          data={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </main>
  );
}
