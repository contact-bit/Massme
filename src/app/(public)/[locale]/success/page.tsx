"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

/* -------------------------------------
   TRANSLATIONS
------------------------------------- */
const TRANSLATIONS: Record<
  Locale,
  {
    paymentConfirmed: string;
    thankYou: string;
    orderConfirmed: string;
    date: string;
    emailSent: string;
    customer: string;
    address: string;
    delivery: string;
    relayPoint: string;
    orderedItems: string;
    totalExclTax: string;
    vat: string;
    totalInclTax: string;
    backToHome: string;
    loading: string;
    orderNotFound: string;
    errorLoading: string;
  }
> = {
  fr: {
    paymentConfirmed: "✓ Paiement confirmé",
    thankYou: "Merci",
    orderConfirmed: "Commande",
    date: "Date :",
    emailSent: "Un email avec votre facture vous a été envoyé.",
    customer: "Client",
    address: "Adresse",
    delivery: "Livraison",
    relayPoint: "Point relais",
    orderedItems: "Articles commandés",
    totalExclTax: "Total HT",
    vat: "TVA",
    totalInclTax: "Total TTC",
    backToHome: "Retour à l'accueil",
    loading: "Chargement de votre commande…",
    orderNotFound: "Commande introuvable",
    errorLoading: "Impossible de charger la commande",
  },
  en: {
    paymentConfirmed: "✓ Payment confirmed",
    thankYou: "Thank you",
    orderConfirmed: "Order",
    date: "Date:",
    emailSent: "An email with your invoice has been sent to you.",
    customer: "Customer",
    address: "Address",
    delivery: "Delivery",
    relayPoint: "Relay point",
    orderedItems: "Ordered items",
    totalExclTax: "Total excl. tax",
    vat: "VAT",
    totalInclTax: "Total incl. tax",
    backToHome: "Back to home",
    loading: "Loading your order…",
    orderNotFound: "Order not found",
    errorLoading: "Unable to load order",
  },
  es: {
    paymentConfirmed: "✓ Pago confirmado",
    thankYou: "Gracias",
    orderConfirmed: "Pedido",
    date: "Fecha:",
    emailSent: "Se le ha enviado un correo electrónico con su factura.",
    customer: "Cliente",
    address: "Dirección",
    delivery: "Entrega",
    relayPoint: "Punto de retransmisión",
    orderedItems: "Artículos pedidos",
    totalExclTax: "Total sin IVA",
    vat: "IVA",
    totalInclTax: "Total con IVA",
    backToHome: "Volver al inicio",
    loading: "Cargando su pedido…",
    orderNotFound: "Pedido no encontrado",
    errorLoading: "No se puede cargar el pedido",
  },
  de: {
    paymentConfirmed: "✓ Zahlung bestätigt",
    thankYou: "Danke",
    orderConfirmed: "Bestellung",
    date: "Datum:",
    emailSent: "Eine E-Mail mit Ihrer Rechnung wurde Ihnen zugesandt.",
    customer: "Kunde",
    address: "Adresse",
    delivery: "Lieferung",
    relayPoint: "Abholpunkt",
    orderedItems: "Bestellte Artikel",
    totalExclTax: "Gesamt ohne MwSt",
    vat: "MwSt",
    totalInclTax: "Gesamt inkl. MwSt",
    backToHome: "Zurück zur Startseite",
    loading: "Ihre Bestellung wird geladen…",
    orderNotFound: "Bestellung nicht gefunden",
    errorLoading: "Bestellung kann nicht geladen werden",
  },
  it: {
    paymentConfirmed: "✓ Pagamento confermato",
    thankYou: "Grazie",
    orderConfirmed: "Ordine",
    date: "Data:",
    emailSent: "Ti è stata inviata un'email con la tua fattura.",
    customer: "Cliente",
    address: "Indirizzo",
    delivery: "Consegna",
    relayPoint: "Punto di ritiro",
    orderedItems: "Articoli ordinati",
    totalExclTax: "Totale IVA esclusa",
    vat: "IVA",
    totalInclTax: "Totale IVA inclusa",
    backToHome: "Torna alla home",
    loading: "Caricamento del tuo ordine…",
    orderNotFound: "Ordine non trovato",
    errorLoading: "Impossibile caricare l'ordine",
  },
  nl: {
    paymentConfirmed: "✓ Betaling bevestigd",
    thankYou: "Bedankt",
    orderConfirmed: "Bestelling",
    date: "Datum:",
    emailSent: "Er is een e-mail met uw factuur naar u verzonden.",
    customer: "Klant",
    address: "Adres",
    delivery: "Levering",
    relayPoint: "Afhaalpunt",
    orderedItems: "Bestelde artikelen",
    totalExclTax: "Totaal excl. BTW",
    vat: "BTW",
    totalInclTax: "Totaal incl. BTW",
    backToHome: "Terug naar home",
    loading: "Uw bestelling wordt geladen…",
    orderNotFound: "Bestelling niet gevonden",
    errorLoading: "Kan bestelling niet laden",
  },
};



/* -------------------------------------
   Helpers
------------------------------------- */
function eur(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} €`;
}

function getDateLocale(locale: Locale) {
  switch (locale) {
    case "fr":
      return "fr-FR";
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "de":
      return "de-DE";
    case "it":
      return "it-IT";
    case "nl":
      return "nl-NL";
    default:
      return undefined;
  }
}

/* -------------------------------------
   Page
------------------------------------- */
export default function SuccessPage() {
  const { locale } = useParams() as { locale: Locale };
  const search = useSearchParams();
  const t = TRANSLATIONS[locale];

  // Nouveau format (recommandé)
  const provider = (search.get("provider") || "").toLowerCase();
  const ref = search.get("ref");

  // Legacy
  const legacyOrderId = search.get("order_id");
  const legacySessionId = search.get("session_id");

  /**
   * Normalise vers un seul objet { kind, value }
   */
  const query = useMemo(() => {
    if (provider && ref) {
      if (provider === "stripe")
        return { kind: "session_id" as const, value: ref };
      return { kind: "order_id" as const, value: ref };
    }

    if (legacyOrderId)
      return { kind: "order_id" as const, value: legacyOrderId };
    if (legacySessionId)
      return { kind: "session_id" as const, value: legacySessionId };

    return null;
  }, [provider, ref, legacyOrderId, legacySessionId]);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setError(t.orderNotFound);
      setLoading(false);
      return;
    }

    // ✅ on fige query pour TS (non-null)
    const q = query;
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        setLoading(true);

        const url =
          q.kind === "order_id"
            ? `/api/get-order?order_id=${encodeURIComponent(q.value)}`
            : `/api/get-order?session_id=${encodeURIComponent(q.value)}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => null);

        const hasOrder = !!data?.order;
        const okFlag = data?.ok === true || data?.ok === undefined;

        if (!res.ok || !okFlag || !hasOrder) {
          throw new Error(data?.error || t.orderNotFound);
        }

        if (!cancelled) setOrder(data.order);
      } catch (err) {
        console.error("❌ Success error:", err);
        if (!cancelled) setError(t.errorLoading);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [query, t.errorLoading, t.orderNotFound]);

  if (loading) {
    return (
      <main className="max-w-xl mx-auto mt-16 text-center">
        <p>{t.loading}</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-red-600">{error}</p>
        <Link href={`/${locale}`} className="btn-home mt-6 inline-block">
          {t.backToHome}
        </Link>
      </main>
    );
  }

  if (!order) return null;

  const customer = order.shippingAddress || {};
  const shipping = order.shippingMethod || {};
  const totals = order.totals || {};
  const relay = order.relayPoint || null;

  const firstName =
    order.customerFirstName || customer.name?.trim().split(/\s+/)[0] || "";

  const dateLocale = getDateLocale(locale);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* HEADER */}
      <section className="text-center">
        <div className="text-green-600 font-semibold text-sm">
          {t.paymentConfirmed}
        </div>

        <h1 className="text-3xl font-bold mt-2">
          {t.thankYou}
          {firstName ? ` ${firstName}` : ""} 🎉
        </h1>

        <p className="text-gray-600 mt-2">
          {t.orderConfirmed} <strong>{order.id}</strong> confirmée
        </p>

        <p className="text-sm text-gray-500 mt-1">
          {t.date} {new Date().toLocaleDateString(dateLocale)}
        </p>

        <p className="text-sm text-gray-500 mt-1">{t.emailSent}</p>
      </section>

      {/* CLIENT */}
      <section className="border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-2">{t.customer}</h2>
        <p className="font-medium">{customer.name || "—"}</p>
        <p>{order.email || "—"}</p>
        {customer.phone && <p>{customer.phone}</p>}
      </section>

      {/* ADRESSE + LIVRAISON */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-1">{t.address}</h3>
          <p>{customer.address || "—"}</p>
          <p>
            {customer.postalCode || "—"} {customer.city || ""}
          </p>
          <p>{customer.country || "—"}</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-1">{t.delivery}</h3>
          <p className="font-medium">{shipping.name || "—"}</p>
          <p className="text-sm">{eur(shipping.priceTTC ?? shipping.price)}</p>

          {shipping.type === "relay" && relay && (
            <div className="mt-3 text-sm">
              <p className="font-medium">{t.relayPoint}</p>
              <p>{relay.name || relay.Nom || "—"}</p>
              <p>{relay.address || relay.Adresse1 || "—"}</p>
              <p>
                {relay.postalCode || relay.CP || "—"}{" "}
                {relay.city || relay.Ville || ""}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">{t.orderedItems}</h2>

        {Array.isArray(order.items) && order.items.length ? (
          order.items.map((it: any, i: number) => {
            const unitHT = Number(it.priceHT ?? it.price ?? 0);
            const qty = Number(it.quantity || 1);

            return (
              <div key={i} className="flex justify-between text-sm mb-2">
                <div>
                  <p className="font-medium">{it.name || "Produit"}</p>
                  <p className="text-gray-500">
                    {qty} × {eur(unitHT)} HT
                  </p>
                </div>
                <p className="font-medium">{eur(unitHT * qty)}</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">—</p>
        )}
      </section>

      {/* TOTAUX */}
      <section className="border rounded-lg p-6">
        <div className="flex justify-between">
          <span>{t.totalExclTax}</span>
          <span>{eur(totals.totalHT)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.vat}</span>
          <span>{eur(totals.vatAmount ?? totals.totalVAT)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
          <span>{t.totalInclTax}</span>
          <span>{eur(totals.totalTTC)}</span>
        </div>
      </section>

      <div className="text-center pt-6">
        <Link href={`/${locale}`} className="btn-home">
          {t.backToHome}
        </Link>
      </div>
    </main>
  );
}
