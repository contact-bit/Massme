"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { CountryCode } from "@/lib/shipping-i18n";
import type { PaymentMethodProvider } from "../types";

const LOCALES = ["fr", "en", "es", "de", "it", "nl"] as const;
type LocaleKey = (typeof LOCALES)[number];

type Props = {
  country: CountryCode;
  onCreated: () => void;
};

const EMPTY_I18N: Record<LocaleKey, string> = {
  fr: "",
  en: "",
  es: "",
  de: "",
  it: "",
  nl: "",
};

function isProvider(v: string): v is PaymentMethodProvider {
  return v === "stripe" || v === "paypal" || v === "manual" || v === "bank_transfer";
}

export default function AddPaymentMethodForm({ country, onCreated }: Props) {
  const [provider, setProvider] = useState<PaymentMethodProvider>("stripe");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number | "">("");
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("fr");

  const [name, setName] = useState<Record<LocaleKey, string>>({ ...EMPTY_I18N });
  const [description, setDescription] = useState<Record<LocaleKey, string>>({
    ...EMPTY_I18N,
  });

  // Config virement bancaire
  const [bank, setBank] = useState({
    accountHolder: "",
    iban: "",
    bic: "",
    bankName: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateName(locale: LocaleKey, value: string) {
    setName((prev) => ({ ...prev, [locale]: value }));
  }

  function updateDescription(locale: LocaleKey, value: string) {
    setDescription((prev) => ({ ...prev, [locale]: value }));
  }

  const hasName = useMemo(
    () => Object.values(name).some((v) => v.trim().length > 0),
    [name]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!hasName) {
      setError("Renseigne au moins un nom dans une langue.");
      return;
    }

    // Validation minimale pour le virement (optionnelle mais utile)
    if (provider === "bank_transfer") {
      if (!bank.iban.trim()) {
        setError("Pour le virement bancaire, renseigne au moins l’IBAN.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        country,
        provider,
        isActive,
        sortOrder: sortOrder === "" ? null : Number(sortOrder),
        name,
        description,
        config: provider === "bank_transfer" ? bank : {},
      };

      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: any = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Erreur serveur");
      }

      // reset
      setName({ ...EMPTY_I18N });
      setDescription({ ...EMPTY_I18N });
      setProvider("stripe");
      setIsActive(true);
      setSortOrder("");
      setActiveLocale("fr");
      setBank({
        accountHolder: "",
        iban: "",
        bic: "",
        bankName: "",
        instructions: "",
      });

      onCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="border rounded-md p-4 bg-white space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">
          Ajouter une méthode de paiement pour {country}
        </h2>

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
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => {
              const v = e.target.value;
              if (isProvider(v)) setProvider(v);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="manual">Manuel / Autre</option>
            <option value="bank_transfer">Virement bancaire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Ordre d&apos;affichage
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="border rounded px-2 py-1 text-sm w-24"
            placeholder="ex: 1"
          />
        </div>
      </div>

      {/* Champs virement bancaire */}
      {provider === "bank_transfer" && (
        <div className="border rounded-md p-3 bg-gray-50 space-y-3">
          <p className="font-medium text-sm">Informations de virement</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Titulaire du compte
              </label>
              <input
                className="border rounded px-2 py-1 text-sm w-full"
                value={bank.accountHolder}
                onChange={(e) =>
                  setBank((p) => ({ ...p, accountHolder: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Banque</label>
              <input
                className="border rounded px-2 py-1 text-sm w-full"
                value={bank.bankName}
                onChange={(e) =>
                  setBank((p) => ({ ...p, bankName: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">IBAN</label>
              <input
                className="border rounded px-2 py-1 text-sm w-full"
                value={bank.iban}
                onChange={(e) => setBank((p) => ({ ...p, iban: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                BIC / SWIFT
              </label>
              <input
                className="border rounded px-2 py-1 text-sm w-full"
                value={bank.bic}
                onChange={(e) => setBank((p) => ({ ...p, bic: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Instructions
            </label>
            <textarea
              className="border rounded px-2 py-1 text-sm w-full"
              value={bank.instructions}
              onChange={(e) =>
                setBank((p) => ({ ...p, instructions: e.target.value }))
              }
              placeholder="Ex: Indiquez le n° de commande en référence du virement."
            />
          </div>
        </div>
      )}

      {/* Onglets langues */}
      <div>
        <div className="flex gap-2 mb-2">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveLocale(loc)}
              className={`px-2 py-1 text-xs rounded border ${
                activeLocale === loc ? "bg-blue-600 text-white" : "bg-white"
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
              onChange={(e) => updateName(activeLocale, e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="Ex: Carte bancaire"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description ({activeLocale.toUpperCase()})
            </label>
            <input
              type="text"
              value={description[activeLocale]}
              onChange={(e) => updateDescription(activeLocale, e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="Ex: Paiement sécurisé par Stripe"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : "Ajouter la méthode"}
        </button>
      </div>
    </form>
  );
}
