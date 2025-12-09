"use client";

import { useEffect, useState } from "react";
import AddMethodForm from "./components/AddMethodForm";
import EditMethodModal from "./components/EditMethodModal";

export type ShippingMethod = {
  id: string;

  // valeurs par langue
  nameFr: string;
  nameEn: string;
  delayFr: string;
  delayEn: string;
  priceFr: number;
  priceEn: number;

  // pour l’affichage rapide
  isActive: boolean;
  type: "home" | "relay" | "local_pickup";
  relayProvider?: string | null;
  country?: string;
};

export default function ShippingAdminPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/shipping-methods");
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        console.error("Erreur API shipping-methods:", json.error);
        setMethods([]);
        return;
      }

      const raw = json.methods || [];

      const normalized: ShippingMethod[] = raw.map((m: any) => {
        const nameFr =
          typeof m.name === "object" ? m.name?.fr || "" : m.name || "";
        const nameEn =
          typeof m.name === "object" ? m.name?.en || "" : m.name || "";

        const delayFr =
          typeof m.delay === "object" ? m.delay?.fr || "" : m.delay || "";
        const delayEn =
          typeof m.delay === "object" ? m.delay?.en || "" : m.delay || "";

        const priceFr =
          typeof m.price === "object"
            ? typeof m.price?.fr === "number"
              ? m.price.fr
              : 0
            : typeof m.price === "number"
            ? m.price
            : 0;

        const priceEn =
          typeof m.price === "object"
            ? typeof m.price?.en === "number"
              ? m.price.en
              : priceFr
            : priceFr;

        return {
          id: m.id,
          nameFr,
          nameEn,
          delayFr,
          delayEn,
          priceFr,
          priceEn,
          isActive: m.isActive ?? true,
          type: m.type || "home",
          relayProvider: m.relayProvider ?? null,
          country: m.country,
        };
      });

      setMethods(normalized);
    } catch (e) {
      console.error("Erreur chargement shipping methods:", e);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

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
      console.error("Erreur suppression méthode:", e);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <main className="admin-page">
      <h1 className="admin-title">🚚 Méthodes de livraison</h1>

      {/* FORM AJOUT SIMPLE */}
      <section className="mb-8">
        <h2 className="admin-section-title mb-2">Créer un mode de livraison</h2>
        <AddMethodForm onCreated={reload} />
      </section>

      {/* LISTE */}
      <section>
        <h2 className="admin-section-title mb-2">Liste des méthodes</h2>

        {loading ? (
          <p>Chargement…</p>
        ) : methods.length === 0 ? (
          <p>Aucune méthode de livraison.</p>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => {
              const displayName = m.nameFr || m.nameEn || "Méthode";
              const displayDelay =
                m.delayFr || m.delayEn || "Délai non spécifié";
              const displayPrice =
                typeof m.priceFr === "number" ? m.priceFr : m.priceEn || 0;

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between border rounded-md p-3 bg-white"
                >
                  <div>
                    <p className="font-semibold">
                      {displayName}{" "}
                      {!m.isActive && (
                        <span className="text-xs text-red-500">
                          (désactivée)
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {displayPrice.toFixed(2)} € — {displayDelay} —{" "}
                      {m.type === "home"
                        ? "Domicile"
                        : m.type === "relay"
                        ? "Point relais"
                        : "Retrait sur place"}
                      {m.relayProvider && ` (${m.relayProvider})`}
                      {m.country && ` • ${m.country}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                    >
                      Configuration
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
