"use client";

import { useEffect, useMemo, useState } from "react";
import { CountryCode, ShippingLocale } from "@/lib/shipping-i18n";
import { COUNTRIES, COUNTRY_TO_LOCALE } from "@/lib/countries";
import AddPaymentMethodForm from "./components/AddPaymentMethodForm";
import EditPaymentMethodModal from "./components/EditPaymentMethodModal";
import type { PaymentMethod } from "./types";


function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && value in COUNTRY_TO_LOCALE;
}

function normalizeCountryCode(value: unknown, fallback: CountryCode = "FR") {
  return isCountryCode(value) ? value : fallback;
}

export default function PaymentsAdminPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [activeCountry, setActiveCountry] = useState<CountryCode>("FR");

  const reload = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/payment-methods", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        setMethods([]);
        return;
      }

      const normalized: PaymentMethod[] = (json.methods ?? []).map((m: any) => {
        const country = normalizeCountryCode(m?.country, "FR");

        return {
          id: String(m?.id),
          country, // ✅ CountryCode garanti
          name: (m?.name ?? {}) as Partial<Record<ShippingLocale, string>>,
          description: (m?.description ?? {}) as Partial<Record<ShippingLocale, string>>,
          provider: m?.provider ?? "stripe",
          config: m?.config ?? {},
          isActive: m?.isActive ?? true,
          sortOrder: m?.sortOrder == null ? null : Number(m.sortOrder),
        };
      });

      setMethods(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette méthode de paiement ?")) return;
    await fetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
    reload();
  }

  const filtered = useMemo(() => {
    return methods
      .filter((m) => m.country === activeCountry)
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [methods, activeCountry]);

  return (
    <main className="admin-page">
      <h1 className="admin-title">💳 Méthodes de paiement</h1>

      {/* Onglets pays */}
      <div className="flex gap-2 mb-6">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setActiveCountry(c.code)}
            className={`px-4 py-2 rounded-md border ${
              activeCountry === c.code ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* Ajout */}
      <AddPaymentMethodForm country={activeCountry} onCreated={reload} />

      {/* Liste */}
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
                      <span className="text-xs text-red-500 ml-2">(désactivée)</span>
                    )}
                  </p>

                  <p className="text-sm text-gray-500">
                    {m.provider.toUpperCase()}
                    {m.sortOrder != null && (
                      <span className="ml-2 text-xs text-gray-400">
                        Ordre : {m.sortOrder}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditing(m)} className="btn btn-primary">
                    Configurer
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="btn btn-danger">
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {editing && (
        <EditPaymentMethodModal
          data={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </main>
  );
}
