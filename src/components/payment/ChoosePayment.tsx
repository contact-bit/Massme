"use client";

import {
  useMemo,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

import type { PaymentMethod } from "@/app/admin/payments/types";

/* =====================================================
   PROPS
===================================================== */

type Props = {
  methods: PaymentMethod[];

  locale: Locale;

  selectedMethod?: PaymentMethod | null;

  onMethodSelect: (
    method: PaymentMethod | null
  ) => void;

  error?: string | null;
};

/* =====================================================
   UI
===================================================== */

const UI: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    selected: string;
  }
> = {
  fr: {
    title:
      "Méthode de paiement",

    subtitle:
      "Choisissez votre mode de paiement.",

    selected:
      "Sélectionné",
  },

  en: {
    title:
      "Payment method",

    subtitle:
      "Choose your payment method.",

    selected:
      "Selected",
  },

  es: {
    title:
      "Método de pago",

    subtitle:
      "Elige tu método de pago.",

    selected:
      "Seleccionado",
  },

  de: {
    title:
      "Zahlungsmethode",

    subtitle:
      "Wähle deine Zahlungsmethode.",

    selected:
      "Ausgewählt",
  },

  it: {
    title:
      "Metodo di pagamento",

    subtitle:
      "Scegli il tuo metodo di pagamento.",

    selected:
      "Selezionato",
  },

  nl: {
    title:
      "Betaalmethode",

    subtitle:
      "Kies je betaalmethode.",

    selected:
      "Geselecteerd",
  },
};

/* =====================================================
   COMPONENT
===================================================== */

export default function ChoosePayment({
  methods,
  locale,
  selectedMethod:
    initialSelectedMethod,
  onMethodSelect,
  error,
}: Props) {
  const t =
    UI[locale] ??
    UI.fr;

  const [
    selected,
    setSelected,
  ] = useState<
    PaymentMethod | null
  >(
    initialSelectedMethod ??
      null
  );

  /* =====================================================
     VISIBLE METHODS
  ===================================================== */

  const visibleMethods =
    useMemo(() => {
      return methods
        .filter(
          (method) =>
            method.isActive !==
            false
        )
        .slice()
        .sort(
          (a, b) =>
            (a.sortOrder ??
              999) -
            (b.sortOrder ??
              999)
        );
    }, [methods]);

  /* =====================================================
     EMPTY
  ===================================================== */

  if (
    visibleMethods.length ===
    0
  ) {
    return null;
  }

  /* =====================================================
     SELECT
  ===================================================== */

  function select(
    method: PaymentMethod
  ) {
    setSelected(
      method
    );

    onMethodSelect(
      method
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="space-y-6">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {t.title}
        </h2>

        <p className="text-sm text-neutral-500">
          {t.subtitle}
        </p>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =========================================
          METHODS
      ========================================= */}

      <div className="space-y-4">
        {visibleMethods.map(
          (method) => {
            const isSelected =
              selected?.id ===
              method.id;

            const label =
              (
                method.name as Record<
                  string,
                  string
                >
              )?.[
                locale
              ] ??
              (
                method.name as Record<
                  string,
                  string
                >
              )?.fr ??
              "—";

            const description =
              (
                method.description as Record<
                  string,
                  string
                >
              )?.[
                locale
              ] ??
              (
                method.description as Record<
                  string,
                  string
                >
              )?.fr ??
              "";

            return (
              <button
                key={
                  method.id
                }
                type="button"
                onClick={() =>
                  select(
                    method
                  )
                }
                className={`
                  group
                  relative
                  w-full
                  overflow-hidden
                  rounded-3xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-300
                  ${
                    isSelected
                      ? `
                        border-blue-500
                        bg-blue-50/80
                        shadow-[0_10px_40px_rgba(59,130,246,0.12)]
                      `
                      : `
                        border-neutral-200
                        bg-white
                        hover:border-neutral-300
                        hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                      `
                  }
                `}
              >

                {/* Glow */}
                <div
                  className={`
                    absolute
                    inset-0
                    opacity-0
                    transition-opacity
                    duration-300
                    ${
                      isSelected
                        ? "opacity-100"
                        : ""
                    }
                  `}
                >
                  <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
                </div>

                <div className="relative flex items-start justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-base font-semibold text-neutral-950">
                        {
                          label
                        }
                      </h3>

                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          {
                            t.selected
                          }
                        </span>
                      )}
                    </div>

                    {description && (
                      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                        {
                          description
                        }
                      </p>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="flex shrink-0 items-center">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {
                        method.provider
                      }
                    </span>
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}