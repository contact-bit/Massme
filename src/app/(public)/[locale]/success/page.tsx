"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

type Locale = "fr" | "en" | "es" | "de" | "it" | "nl";

function isLocale(v: string): v is Locale {
  return ["fr", "en", "es", "de", "it", "nl"].includes(v);
}

const UI: Record<
  Locale,
  {
    badge: string;
    thankYou: (name: string) => string;
    confirmed: (amount: string) => string;
    emailSent: string;
    loading: string;
    order: string;
    totalPaid: string;
    billingAddress: string;
    shippingAddress: string;
    shippingMethod: string;
    relayPoint: string;
    orderedItems: string;
    backHome: string;
    customerFallback: string;
  }
> = {
  fr: {
    badge: "Paiement confirmé",
    thankYou: (name) => `Merci ${name}! 🎉`,
    confirmed: (amount) => `Votre achat de ${amount} € a bien été confirmé.`,
    emailSent: "Un email avec votre facture vous a été envoyé.",
    loading: "Chargement de la commande…",
    order: "Commande",
    totalPaid: "Total payé",
    billingAddress: "Adresse de facturation",
    shippingAddress: "Adresse de livraison",
    shippingMethod: "Méthode d’envoi",
    relayPoint: "Point relais",
    orderedItems: "Articles commandés",
    backHome: "Retourner à l’accueil",
    customerFallback: "client",
  },
  en: {
    badge: "Payment confirmed",
    thankYou: (name) => `Thank you, ${name}! 🎉`,
    confirmed: (amount) => `Your purchase of ${amount} € has been confirmed.`,
    emailSent: "A confirmation email has been sent.",
    loading: "Loading order…",
    order: "Order",
    totalPaid: "Total paid",
    billingAddress: "Billing address",
    shippingAddress: "Shipping address",
    shippingMethod: "Shipping method",
    relayPoint: "Relay point",
    orderedItems: "Ordered items",
    backHome: "Return home",
    customerFallback: "customer",
  },
  es: {
    badge: "Pago confirmado",
    thankYou: (name) => `¡Gracias, ${name}! 🎉`,
    confirmed: (amount) => `Tu compra de ${amount} € ha sido confirmada.`,
    emailSent: "Te hemos enviado un correo de confirmación con tu factura.",
    loading: "Cargando pedido…",
    order: "Pedido",
    totalPaid: "Total pagado",
    billingAddress: "Dirección de facturación",
    shippingAddress: "Dirección de envío",
    shippingMethod: "Método de envío",
    relayPoint: "Punto de recogida",
    orderedItems: "Artículos pedidos",
    backHome: "Volver al inicio",
    customerFallback: "cliente",
  },
  de: {
    badge: "Zahlung bestätigt",
    thankYou: (name) => `Danke, ${name}! 🎉`,
    confirmed: (amount) => `Dein Kauf über ${amount} € wurde bestätigt.`,
    emailSent: "Eine Bestätigungs-E-Mail mit deiner Rechnung wurde gesendet.",
    loading: "Bestellung wird geladen…",
    order: "Bestellung",
    totalPaid: "Bezahlt",
    billingAddress: "Rechnungsadresse",
    shippingAddress: "Lieferadresse",
    shippingMethod: "Versandart",
    relayPoint: "Abholstelle",
    orderedItems: "Bestellte Artikel",
    backHome: "Zur Startseite",
    customerFallback: "Kunde",
  },
  it: {
    badge: "Pagamento confermato",
    thankYou: (name) => `Grazie, ${name}! 🎉`,
    confirmed: (amount) => `Il tuo acquisto di ${amount} € è stato confermato.`,
    emailSent: "Abbiamo inviato un’email di conferma con la fattura.",
    loading: "Caricamento ordine…",
    order: "Ordine",
    totalPaid: "Totale pagato",
    billingAddress: "Indirizzo di fatturazione",
    shippingAddress: "Indirizzo di spedizione",
    shippingMethod: "Metodo di spedizione",
    relayPoint: "Punto di ritiro",
    orderedItems: "Articoli ordinati",
    backHome: "Torna alla home",
    customerFallback: "cliente",
  },
  nl: {
    badge: "Betaling bevestigd",
    thankYou: (name) => `Bedankt, ${name}! 🎉`,
    confirmed: (amount) => `Je aankoop van ${amount} € is bevestigd.`,
    emailSent: "Er is een bevestigingsmail met je factuur verzonden.",
    loading: "Bestelling laden…",
    order: "Bestelling",
    totalPaid: "Totaal betaald",
    billingAddress: "Factuuradres",
    shippingAddress: "Bezorgadres",
    shippingMethod: "Verzendmethode",
    relayPoint: "Afhaalpunt",
    orderedItems: "Bestelde artikelen",
    backHome: "Terug naar start",
    customerFallback: "klant",
  },
};

function moneyEUR(n: number) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

export default function SuccessPage() {
  const params = useParams() as { locale?: string };
  const rawLocale = params?.locale || "fr";
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "fr";

  const search = useSearchParams();
  const sessionId = search.get("session_id"); // string | null

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ui = UI[locale] ?? UI.fr;

  /* -------------------------------------------------------
     🔄 CHARGEMENT COMMANDE (TS FIX ✅)
  ------------------------------------------------------- */
  useEffect(() => {
    // ✅ Ici TS sait que sessionId peut être null
    if (sessionId == null || sessionId.trim() === "") {
      setLoading(false);
      return;
    }

    // ✅ On force une variable string propre
    const sidRaw: string = sessionId;

    let cancelled = false;

    (async () => {
      try {
        const sid = encodeURIComponent(sidRaw); // ✅ jamais null
        const res = await fetch(`/api/verify-payment?session_id=${sid}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setOrder(data.order || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  /* -------------------------------------------------------
     🚚 SHIPPING METHOD NORMALISÉE
  ------------------------------------------------------- */
  const { shippingName, shippingPrice, totalPaid, firstName, isRelayShipping, relay } =
    useMemo(() => {
      let shippingNameLocal = "—";
      let shippingPriceLocal = 0;

      if (order?.shippingMethod) {
        const sm = order.shippingMethod;

        shippingNameLocal =
          typeof sm.name === "string"
            ? sm.name
            : sm.name?.[locale] || sm.name?.fr || sm.name?.en || "—";

        shippingPriceLocal =
          typeof sm.price === "number"
            ? sm.price
            : sm.price?.[locale] || sm.price?.fr || sm.price?.en || 0;
      }

      const totalPaidLocal = order?.amount_total
        ? (order.amount_total / 100).toFixed(2)
        : "0.00";

      const firstNameLocal =
        order?.shippingAddress?.name?.split(" ")?.[0] || ui.customerFallback;

      const isRelay = order?.shippingMethod?.type === "relay";
      const relayLocal = order?.relayPoint || null;

      return {
        shippingName: shippingNameLocal,
        shippingPrice: shippingPriceLocal,
        totalPaid: totalPaidLocal,
        firstName: firstNameLocal,
        isRelayShipping: isRelay,
        relay: relayLocal,
      };
    }, [order, locale, ui.customerFallback]);

  /* -------------------------------------------------------
     📦 POINT RELAIS NORMALISÉ
  ------------------------------------------------------- */
  const relayName = relay?.name || relay?.Nom || null;
  const relayAddress = relay?.address || relay?.Adresse1 || null;
  const relayAddress2 = relay?.Adresse2 || null;
  const relayCity = relay?.city || relay?.Ville || null;
  const relayPostal = relay?.postalCode || relay?.CP || null;
  const relayCountry = relay?.country || relay?.Pays || null;

  return (
    <main className="success-page">
      <div className="success-container">
        <div className="success-badge">✓ {ui.badge}</div>

        <h1 className="success-title">{ui.thankYou(firstName)}</h1>

        <p className="success-subtitle">{ui.confirmed(totalPaid)}</p>

        <p className="success-subtitle-small">{ui.emailSent}</p>

        {loading && <p className="success-loading">{ui.loading}</p>}

        {order && (
          <div className="success-box">
            <div className="success-order-header">
              <div>
                <p className="success-block-title">{ui.order}</p>
                <p className="success-block-value">{order.id}</p>
              </div>

              <div className="text-right">
                <p className="success-block-title">{ui.totalPaid}</p>
                <p className="success-total">{totalPaid} €</p>
              </div>
            </div>

            <div className="success-grid">
              <div className="success-box-alt">
                <p className="success-block-title">
                  {isRelayShipping ? ui.billingAddress : ui.shippingAddress}
                </p>

                <p className="success-block-value">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.postalCode} {order.shippingAddress?.city}
                </p>
                {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
                <p className="success-muted">{order.shippingAddress?.phone}</p>
              </div>

              <div className="success-box-alt">
                <p className="success-block-title">{ui.shippingMethod}</p>
                <p className="success-block-value">{shippingName}</p>
                <p className="success-muted">{moneyEUR(shippingPrice)}</p>
              </div>
            </div>

            {isRelayShipping && relay && (
              <div className="success-box-alt mt-4">
                <p className="success-block-title">{ui.relayPoint}</p>

                <p className="success-block-value">{relayName}</p>
                {relayAddress && <p>{relayAddress}</p>}
                {relayAddress2 && <p>{relayAddress2}</p>}
                {(relayPostal || relayCity) && (
                  <p>
                    {relayPostal} {relayCity}
                  </p>
                )}
                {relayCountry && <p>{relayCountry}</p>}

                <p className="success-muted mt-1">
                  {order.shippingMethod?.relayProvider === "mondialrelay"
                    ? "Mondial Relay"
                    : order.shippingMethod?.relayProvider === "pickup"
                    ? "Pickup / Shop2Shop"
                    : ""}
                </p>
              </div>
            )}

            <div className="success-items-section">
              <p className="success-block-title">{ui.orderedItems}</p>

              <div className="success-items-list">
                {order.items?.map((item: any, i: number) => {
                  const price =
                    typeof item.price === "number" ? item.price : item.price?.eur || 0;
                  const qty = Number(item.quantity) || 1;

                  return (
                    <div key={i} className="success-item">
                      <div>
                        <p className="success-item-name">{item.name}</p>
                        <p className="success-item-qty">× {qty}</p>
                      </div>
                      <p className="success-item-price">{moneyEUR(price * qty)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="success-cta">
          <Link href={`/${locale}`} className="btn-home">
            {ui.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
