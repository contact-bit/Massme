"use client";

import { useEffect, useState } from "react";
import AddMethodForm from "./components/AddMethodForm";
import EditMethodModal from "./components/EditMethodModal";
import {
  CountryCode,
  ShippingLocale,
} from "@/lib/shipping-i18n";

/* =====================================================
   TYPES — SOURCE DE VÉRITÉ
===================================================== */
export type ShippingMethod = {
  id: string;
  country: CountryCode;

  name: Partial<Record<ShippingLocale, string>>;
  delay: Partial<Record<ShippingLocale, string>>;

  type: "home" | "relay" | "local_pickup";
  relayProvider?: string | null;

  priceHT: number;
  vatRate: number;
  isActive: boolean;

  sortOrder?: number | null;
};

/* =====================================================
   CONST
===================================================== */
const COUNTRIES: {
  code: CountryCode;
  label: string;
  flag: string;
}[] = [
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "GB", label: "Angleterre", flag: "🇬🇧" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "NL", label: "Pays-Bas", flag: "🇳🇱" },
];

const COUNTRY_TO_LOCALE: Record<CountryCode, ShippingLocale> = {
  FR: "fr",
  GB: "en",
  DE: "de",
  ES: "es",
  IT: "it",
  NL: "nl",
  CH: "fr",
};

/* =====================================================
   PAGE
===================================================== */
export default function ShippingAdminPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [activeCountry, setActiveCountry] =
    useState<CountryCode>("FR");

  const reload = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/shipping-methods", {
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMethods([]);
        return;
      }

      const normalized: ShippingMethod[] = json.methods.map(
        (m: any) => ({
          id: m.id,
          country: m.country,
          name: m.name ?? {},
          delay: m.delay ?? {},
          type: m.type || "home",
          relayProvider: m.relayProvider ?? null,
          priceHT: Number(m.priceHT ?? 0),
          vatRate: Number(m.vatRate ?? 0),
          isActive: m.isActive ?? true,
          sortOrder:
            m.sortOrder === null || m.sortOrder === undefined
              ? null
              : Number(m.sortOrder),
        })
      );

      setMethods(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette méthode ?")) return;
    await fetch(`/api/admin/shipping-methods/${id}`, {
      method: "DELETE",
    });
    reload();
  }

  const filtered = methods
    .filter((m) => m.country === activeCountry)
    .sort((a, b) => {
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      return aOrder - bOrder;
    });

  return (
    <main className="admin-page">
      <h1 className="admin-title">🚚 Livraison</h1>

      {/* 🌍 ONGLET PAYS */}
      <div className="flex gap-2 mb-6">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setActiveCountry(c.code)}
            className={`px-4 py-2 rounded-md border ${
              activeCountry === c.code
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* ➕ AJOUT */}
      <AddMethodForm
        country={activeCountry}
        onCreated={reload}
      />

      {/* 📋 LISTE */}
      <section className="mt-6 space-y-3">
        {loading ? (
          <p>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p>Aucune méthode pour ce pays.</p>
        ) : (
          filtered.map((m) => {
            const locale = COUNTRY_TO_LOCALE[m.country];

            return (
              <div
                key={m.id}
                className="flex justify-between border rounded-md p-3 bg-white"
              >
                <div>
                  <p className="font-semibold">
                    {m.name?.[locale] || "—"}
                    {!m.isActive && (
                      <span className="text-xs text-red-500 ml-2">
                        (désactivée)
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-500">
                    {m.priceHT.toFixed(2)} € HT • TVA {m.vatRate}%
                    {m.sortOrder != null && (
                      <span className="ml-2 text-xs text-gray-400">
                        Ordre : {m.sortOrder}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(m)}
                    className="btn btn-primary"
                  >
                    Configurer
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="btn btn-danger"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
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
