"use client";

import { useEffect, useState } from "react";
import type { PaymentMethod } from "@/types/payment";

export default function usePaymentMethods({ country }: { country: string }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setError(null);
      setPaymentMethod(null);

      try {
        const res = await fetch(`/api/payment-methods?country=${country}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (!res.ok || !json.ok) throw new Error(json?.error ?? "Erreur chargement paiements");

        if (!cancelled) setPaymentMethods(json.methods || []);
      } catch (e: any) {
        console.error("usePaymentMethods error", e);
        if (!cancelled) {
          setError(e?.message ?? "Erreur chargement paiements");
          setPaymentMethods([]);
        }
      }
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [country]);

  return { paymentMethods, paymentMethod, setPaymentMethod, error };
}
