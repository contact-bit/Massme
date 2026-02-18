"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";
import { moneyToCents, centsToMoney } from "../money";
import type { Locale } from "../i18n";

export default function useShippingMethods({
  country,
  locale,
}: {
  country: string;
  locale: Locale;
}) {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setShippingMethod(null);
      setRelayPoint(null);

      const qRef = query(
        collection(db, "shipping_methods"),
        where("country", "==", country),
        where("isActive", "==", true)
      );

      const snap = await getDocs(qRef);

      const list: ShippingMethod[] = snap.docs.map((doc) => {
        const raw = doc.data() as any;

        const priceHT = Number(raw.priceHT ?? 0);
        const vatRate = typeof raw.vatRate === "number" && raw.vatRate > 0 ? raw.vatRate : 0;

        const priceHTCents = moneyToCents(priceHT);
        const vatCents = vatRate > 0 ? Math.round((priceHTCents * vatRate) / 100) : 0;

        const priceTTC =
          vatRate > 0 ? Number(centsToMoney(priceHTCents + vatCents)) : priceHT;

        return {
          id: doc.id,
          name: raw.name?.[locale] || raw.name?.fr || "",
          delay: raw.delay?.[locale] || raw.delay?.fr || "",
          priceHT,
          vatRate,
          priceTTC,
          type: raw.type || "home",
          relayProvider: raw.relayProvider || null,
          isActive: true,
          sortOrder:
            raw.sortOrder === null || raw.sortOrder === undefined
              ? null
              : Number(raw.sortOrder),
          country: raw.country || country,
        };
      });

      if (!cancelled) {
        setMethods(list);
        setLoading(false);
      }
    }

    load().catch((e) => {
      console.error("useShippingMethods error", e);
      if (!cancelled) {
        setMethods([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [country, locale]);

  return {
    methods,
    loading,
    shippingMethod,
    setShippingMethod,
    relayPoint,
    setRelayPoint,
  };
}
