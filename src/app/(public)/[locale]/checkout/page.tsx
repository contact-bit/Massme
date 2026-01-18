"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import ChooseShipping from "@/components/shipping/ChooseShipping";
import type { ShippingMethod, RelayPoint } from "@/components/shipping/types";

/* -------------------------------------
   LOCALES
------------------------------------- */
const LOCALES = ["fr", "en", "es", "de", "it", "nl", "pt"] as const;
type Locale = (typeof LOCALES)[number];
type ShippingLocale = "fr" | "en" | "es" | "de" | "it" | "nl";

function getLocale(path: string | null): Locale {
  const l = path?.split("/")?.[1];
  return LOCALES.includes(l as Locale) ? (l as Locale) : "fr";
}

function adaptLocale(l: Locale): ShippingLocale {
  return l === "pt" ? "fr" : l;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* =====================================
   PAGE
===================================== */
export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const shippingLocale = adaptLocale(locale);

  const { items, totalHT, totalVAT, totalTTC, clearCart } = useCart();

  /* -------------------------------------
     CLIENT (PRÉNOM / NOM SÉPARÉS)
  ------------------------------------- */
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  /* -------------------------------------
     SHIPPING
  ------------------------------------- */
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod | null>(null);
  const [relayPoint, setRelayPoint] =
    useState<RelayPoint | null>(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------
     LOAD SHIPPING METHODS
  ------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setShippingMethod(null);
      setRelayPoint(null);

      const qRef = query(
        collection(db, "shipping_methods"),
        where("country", "==", customer.country),
        where("isActive", "==", true)
      );

      const snap = await getDocs(qRef);

      const list: ShippingMethod[] = snap.docs.map((doc) => {
        const raw = doc.data() as any;

        const priceHT = Number(raw.priceHT ?? 0);
        const vatRate =
          typeof raw.vatRate === "number" && raw.vatRate > 0
            ? raw.vatRate
            : 0;

        const priceTTC =
          vatRate > 0
            ? round2(priceHT * (1 + vatRate / 100))
            : priceHT;

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
        };
      });

      setMethods(list);
      setLoading(false);
    }

    load();
  }, [customer.country, locale]);

  /* -------------------------------------
     TOTALS
  ------------------------------------- */
  const shippingTTC = shippingMethod?.priceTTC ?? 0;
  const finalTTC = totalTTC + shippingTTC;

  /* -------------------------------------
     PAY
  ------------------------------------- */
  async function pay() {
    if (!items.length) return alert("Panier vide");
    if (!shippingMethod) return alert("Choisissez une livraison");
    if (!customer.email) return alert("Email requis");
    if (!customer.firstName || !customer.lastName) {
      return alert("Prénom et nom requis");
    }

    // 🔥 NOM COMPLET CANONIQUE
    const fullName = `${customer.firstName.trim()} ${customer.lastName.trim()}`;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        locale,
        customerEmail: customer.email,

        // ✅ FORMAT OFFICIEL PARTOUT
        shippingAddress: {
          name: fullName,
          firstName: customer.firstName,
          lastName: customer.lastName,
          address: customer.address,
          postalCode: customer.postalCode,
          city: customer.city,
          country: customer.country,
        },

        shippingMethod,
        relayPoint,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.url) {
      alert("Erreur paiement");
      return;
    }

    clearCart();
    window.location.href = json.url;
  }

  /* =====================================
     RENDER
  ===================================== */
  return (
    <main className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Commande</h1>

      {/* CLIENT */}
      <section className="space-y-3">
        <input
          className="input"
          placeholder="Prénom"
          value={customer.firstName}
          onChange={(e) =>
            setCustomer({ ...customer, firstName: e.target.value })
          }
        />
        <input
          className="input"
          placeholder="Nom"
          value={customer.lastName}
          onChange={(e) =>
            setCustomer({ ...customer, lastName: e.target.value })
          }
        />
        <input
          className="input"
          placeholder="Email"
          value={customer.email}
          onChange={(e) =>
            setCustomer({ ...customer, email: e.target.value })
          }
        />
        <input
          className="input"
          placeholder="Adresse"
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
        />
        <input
          className="input"
          placeholder="Code postal"
          value={customer.postalCode}
          onChange={(e) =>
            setCustomer({ ...customer, postalCode: e.target.value })
          }
        />
        <input
          className="input"
          placeholder="Ville"
          value={customer.city}
          onChange={(e) =>
            setCustomer({ ...customer, city: e.target.value })
          }
        />
      </section>

      {/* SHIPPING */}
      {loading ? (
        <p>Chargement livraison…</p>
      ) : (
        <ChooseShipping
          methods={methods}
          locale={shippingLocale}
          onMethodSelect={setShippingMethod}
          onRelaySelect={setRelayPoint}
        />
      )}

      {/* TOTAL */}
      <section className="border-t pt-4 space-y-2">
        <p>Sous-total HT : {totalHT.toFixed(2)} €</p>
        {totalVAT > 0 && <p>TVA produits : {totalVAT.toFixed(2)} €</p>}
        <p>Livraison TTC : {shippingTTC.toFixed(2)} €</p>
        <p className="font-bold text-lg">
          Total TTC : {finalTTC.toFixed(2)} €
        </p>
      </section>

      <button
        onClick={pay}
        className="btn btn-primary w-full py-4 text-lg"
      >
        Payer avec Stripe 💳
      </button>
    </main>
  );
}
