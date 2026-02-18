"use client";

import { useState } from "react";
import type { PaymentMethod, PaymentMethodProvider } from "../types";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type LocaleKey = (typeof LOCALES)[number];

type Props = {
  data: PaymentMethod;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditPaymentMethodModal({
  data,
  onClose,
  onSaved,
}: Props) {
  const [provider, setProvider] = useState<PaymentMethodProvider>(
    data.provider
  );
  const [isActive, setIsActive] = useState<boolean>(data.isActive);
  const [sortOrder, setSortOrder] = useState<number | "">(
    data.sortOrder ?? ""
  );
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("fr");

  const [name, setName] = useState<Record<LocaleKey, string>>({
    fr: (data.name as any)?.fr ?? "",
    en: (data.name as any)?.en ?? "",
    es: (data.name as any)?.es ?? "",
    de: (data.name as any)?.de ?? "",
    it: (data.name as any)?.it ?? "",
    nl: (data.name as any)?.nl ?? "",
  });

  const [description, setDescription] = useState<
    Record<LocaleKey, string>
  >({
    fr: (data.description as any)?.fr ?? "",
    en: (data.description as any)?.en ?? "",
    es: (data.description as any)?.es ?? "",
    de: (data.description as any)?.de ?? "",
    it: (data.description as any)?.it ?? "",
    nl: (data.description as any)?.nl ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateName(locale: LocaleKey, value: string) {
    setName((prev) => ({ ...prev, [locale]: value }));
  }

  function updateDescription(locale: LocaleKey, value: string) {
    setDescription((prev) => ({ ...prev, [locale]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const hasName = Object.values(name).some((v) => v.trim().length > 0);
    if (!hasName) {
      setError("Renseigne au moins un nom dans une langue.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        provider,
        isActive,
        sortOrder: sortOrder === "" ? null : Number(sortOrder),
        name,
        description,
      };

      const res = await fetch(`/api/admin/payment-methods/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? "Erreur serveur");
      }

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-lg p-4 max-w-lg w-full space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Modifier la méthode</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Pays : <strong>{data.country}</strong>
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span>Active</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </label>
        </div>

        {/* Provider + ordre */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as PaymentMethodProvider)
              }
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="manual">Manuel / Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </div>
        </div>

        {/* Onglets langues */}
        <div>
          <div className="flex gap-2 mb-2">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`px-2 py-1 text-xs rounded border ${
                  activeLocale === loc
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom ({activeLocale.toUpperCase()})
              </label>
              <input
                type="text"
                value={name[activeLocale]}
                onChange={(e) =>
                  updateName(activeLocale, e.target.value)
                }
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description ({activeLocale.toUpperCase()})
              </label>
              <input
                type="text"
                value={description[activeLocale]}
                onChange={(e) =>
                  updateDescription(activeLocale, e.target.value)
                }
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  );
}
