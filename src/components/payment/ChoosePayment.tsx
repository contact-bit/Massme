"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { PaymentMethod } from "@/app/admin/payments/types";

type Props = {
  methods: PaymentMethod[];
  locale: Locale;
  onMethodSelect: (method: PaymentMethod | null) => void;
  error?: string | null;
};

const UI: Record<Locale, { title: string; subtitle: string }> = {
  fr: {
    title: "Méthode de paiement",
    subtitle: "Choisissez votre mode de paiement :",
  },
  en: {
    title: "Payment method",
    subtitle: "Choose your payment method:",
  },
  es: {
    title: "Método de pago",
    subtitle: "Elige tu método de pago:",
  },
  de: {
    title: "Zahlungsmethode",
    subtitle: "Wähle deine Zahlungsmethode:",
  },
  it: {
    title: "Metodo di pagamento",
    subtitle: "Scegli il tuo metodo di pagamento:",
  },
  nl: {
    title: "Betaalmethode",
    subtitle: "Kies je betaalmethode:",
  },
};

export default function ChoosePayment({
  methods,
  locale,
  onMethodSelect,
  error,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const t = UI[locale] ?? UI.fr;

  const visibleMethods = useMemo(
    () =>
      methods
        .filter((m) => m.isActive !== false)
        .slice()
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)),
    [methods]
  );

  if (visibleMethods.length === 0) return null;

  function select(m: PaymentMethod) {
    setSelected(m);
    onMethodSelect(m);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {visibleMethods.map((m) => {
          const isSelected = selected?.id === m.id;
          const label =
            (m.name as any)?.[locale] ??
            (m.name as any)?.fr ??
            "—";
          const desc =
            (m.description as any)?.[locale] ??
            (m.description as any)?.fr ??
            "";

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => select(m)}
              className={`w-full flex justify-between gap-4 border rounded-lg p-4 text-left transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">{label}</p>
                {desc && (
                  <p className="text-sm text-gray-600">
                    {desc}
                  </p>
                )}
              </div>
              <div className="text-xs uppercase text-gray-500">
                {m.provider}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
