"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

/* -------------------------------------
   Helpers
------------------------------------- */
function eur(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} €`;
}

function formatDate(value: any) {
  if (!value) return "—";

  // Firestore Timestamp
  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleDateString("fr-FR");
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("fr-FR");
}

/* -------------------------------------
   Page
------------------------------------- */
export default function SuccessPage() {
  const { locale } = useParams() as { locale: string };
  const search = useSearchParams();
  const orderId = search.get("order_id");

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------
     Load order (SAFE TS)
  ------------------------------------- */
  useEffect(() => {
    if (!orderId) {
      setError("Commande introuvable");
      setLoading(false);
      return;
    }

    const safeOrderId = orderId; // ✅ string garanti

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/get-order?order_id=${encodeURIComponent(safeOrderId)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }

        const data = await res.json();

        if (!data?.order) {
          throw new Error("Commande introuvable");
        }

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("❌ Success error:", err);
        if (!cancelled) {
          setError("Impossible de charger la commande");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  /* -------------------------------------
     States
  ------------------------------------- */
  if (loading) {
    return (
      <main className="max-w-xl mx-auto mt-16 text-center">
        <p>Chargement de votre commande…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-red-600">{error}</p>
        <Link href={`/${locale}`} className="btn-home mt-6 inline-block">
          Retour à l’accueil
        </Link>
      </main>
    );
  }

  if (!order) return null;

  /* -------------------------------------
     Normalisation
  ------------------------------------- */
  const customer = order.shippingAddress || {};
  const shipping = order.shippingMethod || {};
  const totals = order.totals || {};
  const relay = order.relayPoint || null;

  const firstName =
    order.customerFirstName ||
    customer.name?.trim().split(/\s+/)[0] ||
    "";

  /* -------------------------------------
     Render
  ------------------------------------- */
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* HEADER */}
      <section className="text-center">
        <div className="text-green-600 font-semibold text-sm">
          ✓ Paiement confirmé
        </div>

        <h1 className="text-3xl font-bold mt-2">
          Merci{firstName ? ` ${firstName}` : ""} 🎉
        </h1>

        <p className="text-gray-600 mt-2">
          Commande <strong>{order.id}</strong> confirmée
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Date : {formatDate(order.paidAt || order.createdAt)}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Un email avec votre facture vous a été envoyé.
        </p>
      </section>

      {/* CLIENT */}
      <section className="border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-2">Client</h2>
        <p className="font-medium">{customer.name}</p>
        <p>{order.email}</p>
        {customer.phone && <p>{customer.phone}</p>}
      </section>

      {/* ADRESSE + LIVRAISON */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-1">Adresse</h3>
          <p>{customer.address}</p>
          <p>
            {customer.postalCode} {customer.city}
          </p>
          <p>{customer.country}</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-1">Livraison</h3>
          <p className="font-medium">{shipping.name}</p>
          <p>{eur(shipping.priceTTC ?? shipping.price)}</p>

          {shipping.type === "relay" && relay && (
            <div className="mt-3 text-sm">
              <p className="font-medium">Point relais</p>
              <p>{relay.name || relay.Nom}</p>
              <p>{relay.address || relay.Adresse1}</p>
              <p>
                {relay.postalCode || relay.CP}{" "}
                {relay.city || relay.Ville}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">
          Articles commandés
        </h2>

        {order.items?.map((it: any, i: number) => {
          const unitHT = Number(it.priceHT ?? it.price ?? 0);
          const qty = Number(it.quantity || 1);

          return (
            <div key={i} className="flex justify-between text-sm mb-2">
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-gray-500">
                  {qty} × {eur(unitHT)} HT
                </p>
              </div>
              <p className="font-medium">{eur(unitHT * qty)}</p>
            </div>
          );
        })}
      </section>

      {/* TOTAUX */}
      <section className="border rounded-lg p-6">
        <div className="flex justify-between">
          <span>Total HT</span>
          <span>{eur(totals.totalHT)}</span>
        </div>
        <div className="flex justify-between">
          <span>TVA</span>
          <span>{eur(totals.vatAmount ?? totals.totalVAT)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
          <span>Total TTC</span>
          <span>{eur(totals.totalTTC)}</span>
        </div>
      </section>

      <div className="text-center pt-6">
        <Link href={`/${locale}`} className="btn-home">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
