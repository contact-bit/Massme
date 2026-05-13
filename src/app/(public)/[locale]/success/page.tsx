"use client";

import "./success.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import type { Locale } from "@/lib/i18n";

/* =====================================================
   TRANSLATIONS
===================================================== */

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
    recoveryMessage: string;
  }
> = {
  fr: {
    paymentConfirmed:
      "✓ Paiement confirmé",

    thankYou:
      "Merci",

    orderConfirmed:
      "Commande",

    date:
      "Date :",

    emailSent:
      "Un email avec votre facture vous a été envoyé.",

    customer:
      "Client",

    address:
      "Adresse",

    delivery:
      "Livraison",

    relayPoint:
      "Point relais",

    orderedItems:
      "Articles commandés",

    totalExclTax:
      "Total HT",

    vat:
      "TVA",

    totalInclTax:
      "Total TTC",

    backToHome:
      "Retour à l’accueil",

    loading:
      "Chargement de votre commande…",

    orderNotFound:
      "Commande introuvable",

    errorLoading:
      "Impossible de charger la commande",

    recoveryMessage:
      "Nous vous souhaitons une excellente récupération post-opératoire.",
  },

  en: {
    paymentConfirmed:
      "✓ Payment confirmed",

    thankYou:
      "Thank you",

    orderConfirmed:
      "Order",

    date:
      "Date:",

    emailSent:
      "An email with your invoice has been sent to you.",

    customer:
      "Customer",

    address:
      "Address",

    delivery:
      "Delivery",

    relayPoint:
      "Relay point",

    orderedItems:
      "Ordered items",

    totalExclTax:
      "Total excl. tax",

    vat:
      "VAT",

    totalInclTax:
      "Total incl. tax",

    backToHome:
      "Back to home",

    loading:
      "Loading your order…",

    orderNotFound:
      "Order not found",

    errorLoading:
      "Unable to load order",

    recoveryMessage:
      "We wish you a smooth post-operative recovery.",
  },

  es: {
    paymentConfirmed:
      "✓ Pago confirmado",

    thankYou:
      "Gracias",

    orderConfirmed:
      "Pedido",

    date:
      "Fecha:",

    emailSent:
      "Se le ha enviado un correo electrónico con su factura.",

    customer:
      "Cliente",

    address:
      "Dirección",

    delivery:
      "Entrega",

    relayPoint:
      "Punto de recogida",

    orderedItems:
      "Artículos pedidos",

    totalExclTax:
      "Total sin IVA",

    vat:
      "IVA",

    totalInclTax:
      "Total con IVA",

    backToHome:
      "Volver al inicio",

    loading:
      "Cargando su pedido…",

    orderNotFound:
      "Pedido no encontrado",

    errorLoading:
      "No se puede cargar el pedido",

    recoveryMessage:
      "Le deseamos una excelente recuperación.",
  },

  de: {
    paymentConfirmed:
      "✓ Zahlung bestätigt",

    thankYou:
      "Danke",

    orderConfirmed:
      "Bestellung",

    date:
      "Datum:",

    emailSent:
      "Eine E-Mail mit Ihrer Rechnung wurde gesendet.",

    customer:
      "Kunde",

    address:
      "Adresse",

    delivery:
      "Lieferung",

    relayPoint:
      "Abholpunkt",

    orderedItems:
      "Bestellte Artikel",

    totalExclTax:
      "Gesamt ohne MwSt",

    vat:
      "MwSt",

    totalInclTax:
      "Gesamt inkl. MwSt",

    backToHome:
      "Zurück zur Startseite",

    loading:
      "Ihre Bestellung wird geladen…",

    orderNotFound:
      "Bestellung nicht gefunden",

    errorLoading:
      "Bestellung konnte nicht geladen werden",

    recoveryMessage:
      "Wir wünschen Ihnen eine gute Genesung.",
  },

  it: {
    paymentConfirmed:
      "✓ Pagamento confermato",

    thankYou:
      "Grazie",

    orderConfirmed:
      "Ordine",

    date:
      "Data:",

    emailSent:
      "Ti è stata inviata un'email con la fattura.",

    customer:
      "Cliente",

    address:
      "Indirizzo",

    delivery:
      "Consegna",

    relayPoint:
      "Punto di ritiro",

    orderedItems:
      "Articoli ordinati",

    totalExclTax:
      "Totale IVA esclusa",

    vat:
      "IVA",

    totalInclTax:
      "Totale IVA inclusa",

    backToHome:
      "Torna alla home",

    loading:
      "Caricamento ordine…",

    orderNotFound:
      "Ordine non trovato",

    errorLoading:
      "Impossibile caricare l'ordine",

    recoveryMessage:
      "Ti auguriamo una pronta guarigione.",
  },

  nl: {
    paymentConfirmed:
      "✓ Betaling bevestigd",

    thankYou:
      "Bedankt",

    orderConfirmed:
      "Bestelling",

    date:
      "Datum:",

    emailSent:
      "Er is een e-mail met uw factuur verzonden.",

    customer:
      "Klant",

    address:
      "Adres",

    delivery:
      "Levering",

    relayPoint:
      "Afhaalpunt",

    orderedItems:
      "Bestelde artikelen",

    totalExclTax:
      "Totaal excl. BTW",

    vat:
      "BTW",

    totalInclTax:
      "Totaal incl. BTW",

    backToHome:
      "Terug naar home",

    loading:
      "Uw bestelling wordt geladen…",

    orderNotFound:
      "Bestelling niet gevonden",

    errorLoading:
      "Kan bestelling niet laden",

    recoveryMessage:
      "Wij wensen u een goed herstel.",
  },
};

/* =====================================================
   HELPERS
===================================================== */

function eur(
  value?: number
) {
  if (
    typeof value !==
      "number" ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return `${value.toFixed(
    2
  )} €`;
}

function getDateLocale(
  locale: Locale
) {
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

/* =====================================================
   PAGE
===================================================== */

export default function SuccessPage() {
  const {
    locale,
  } = useParams() as {
    locale: Locale;
  };

  const search =
    useSearchParams();

  const t =
    TRANSLATIONS[
      locale
    ];

  /* =====================================================
     QUERY
  ===================================================== */

  const provider = (
    search.get(
      "provider"
    ) || ""
  ).toLowerCase();

  const ref =
    search.get("ref");

  const legacyOrderId =
    search.get(
      "order_id"
    );

  const legacySessionId =
    search.get(
      "session_id"
    );

  const query =
    useMemo(() => {
      if (
        provider &&
        ref
      ) {
        if (
          provider ===
          "stripe"
        ) {
          return {
            kind:
              "session_id" as const,

            value: ref,
          };
        }

        return {
          kind:
            "order_id" as const,

          value: ref,
        };
      }

      if (
        legacyOrderId
      ) {
        return {
          kind:
            "order_id" as const,

          value:
            legacyOrderId,
        };
      }

      if (
        legacySessionId
      ) {
        return {
          kind:
            "session_id" as const,

          value:
            legacySessionId,
        };
      }

      return null;
    }, [
      provider,
      ref,
      legacyOrderId,
      legacySessionId,
    ]);

  /* =====================================================
     STATES
  ===================================================== */

  const [
    order,
    setOrder,
  ] = useState<
    any | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {
    if (!query) {
      setError(
        t.orderNotFound
      );

      setLoading(false);

      return;
    }

    const q = query;

    let cancelled =
      false;

    async function load() {
      try {
        setLoading(true);

        setError(null);

        const url =
          q.kind ===
          "order_id"
            ? `/api/get-order?order_id=${encodeURIComponent(
                q.value
              )}`
            : `/api/get-order?session_id=${encodeURIComponent(
                q.value
              )}`;

        const response =
          await fetch(
            url,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        const hasOrder =
          !!data?.order;

        const okFlag =
          data?.ok ===
            true ||
          data?.ok ===
            undefined;

        if (
          !response.ok ||
          !okFlag ||
          !hasOrder
        ) {
          throw new Error(
            data?.error ||
              t.orderNotFound
          );
        }

        if (
          !cancelled
        ) {
          setOrder(
            data.order
          );
        }
      } catch (
        err
      ) {
        console.error(
          err
        );

        if (
          !cancelled
        ) {
          setError(
            t.errorLoading
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    t.errorLoading,
    t.orderNotFound,
  ]);

  /* =====================================================
     STATES UI
  ===================================================== */

  if (loading) {
    return (
      <main className="success-page">

        <div className="success-loading">
          {t.loading}
        </div>

      </main>
    );
  }

  if (error) {
    return (
      <main className="success-page">

        <div className="success-card success-error-card">

          <div className="success-eyebrow">
            VitrectoMed
          </div>

          <h1 className="success-title">
            {error}
          </h1>

          <div className="success-actions">

            <Link
              href={`/${locale}`}
              className="success-btn-primary"
            >
              {
                t.backToHome
              }
            </Link>

          </div>

        </div>

      </main>
    );
  }

  if (!order) {
    return null;
  }

  /* =====================================================
     DATA
  ===================================================== */

  const customer =
    order.shippingAddress ||
    {};

  const shipping =
    order.shippingMethod ||
    {};

  const totals =
    order.totals || {};

  const relay =
    order.relayPoint ||
    null;

  const firstName =
    order.customerFirstName ||
    customer.name
      ?.trim()
      .split(/\s+/)[0] ||
    "";

  const dateLocale =
    getDateLocale(
      locale
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="success-page">

      <div className="success-background-grid" />

      <section className="success-shell">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="success-hero">

          <div className="success-confirmed">
            {
              t.paymentConfirmed
            }
          </div>

          <div className="success-eyebrow">
            VitrectoMed
          </div>

          <h1 className="success-title">
            {t.thankYou}
            {firstName
              ? ` ${firstName}`
              : ""}{" "}
            🎉
          </h1>

          <p className="success-subtitle">
            {
              t.recoveryMessage
            }
          </p>

          <div className="success-meta">

            <p>
              {
                t.orderConfirmed
              }{" "}
              <strong>
                {order.orderNumber ||
                  order.id}
              </strong>
            </p>

            <p>
              {t.date}{" "}
              {new Date().toLocaleDateString(
                dateLocale
              )}
            </p>

            <p>
              {
                t.emailSent
              }
            </p>

          </div>

        </div>

        {/* =====================================================
            GRID
        ===================================================== */}

        <div className="success-grid">

          {/* =====================================================
              CUSTOMER
          ===================================================== */}

          <div className="success-card">

            <h2 className="success-card-title">
              {t.customer}
            </h2>

            <div className="success-card-content">

              <p className="success-strong">
                {customer.name ||
                  "—"}
              </p>

              <p>
                {order.email ||
                  "—"}
              </p>

              {customer.phone && (
                <p>
                  {
                    customer.phone
                  }
                </p>
              )}

            </div>

          </div>

          {/* =====================================================
              ADDRESS
          ===================================================== */}

          <div className="success-card">

            <h2 className="success-card-title">
              {t.address}
            </h2>

            <div className="success-card-content">

              <p>
                {customer.address ||
                  "—"}
              </p>

              <p>
                {customer.postalCode ||
                  "—"}{" "}
                {customer.city ||
                  ""}
              </p>

              <p>
                {customer.country ||
                  "—"}
              </p>

            </div>

          </div>

          {/* =====================================================
              DELIVERY
          ===================================================== */}

          <div className="success-card">

            <h2 className="success-card-title">
              {t.delivery}
            </h2>

            <div className="success-card-content">

              <p className="success-strong">
                {shipping.name ||
                  "—"}
              </p>

              <p>
                {eur(
                  shipping.priceTTC ??
                    shipping.price
                )}
              </p>

              {shipping.type ===
                "relay" &&
                relay && (
                  <div className="success-relay">

                    <span className="success-relay-title">
                      {
                        t.relayPoint
                      }
                    </span>

                    <p>
                      {relay.name ||
                        relay.Nom ||
                        "—"}
                    </p>

                    <p>
                      {relay.address ||
                        relay.Adresse1 ||
                        "—"}
                    </p>

                    <p>
                      {relay.postalCode ||
                        relay.CP ||
                        "—"}{" "}
                      {relay.city ||
                        relay.Ville ||
                        ""}
                    </p>

                  </div>
                )}

            </div>

          </div>

          {/* =====================================================
              ITEMS
          ===================================================== */}

          <div className="success-card success-card-large">

            <h2 className="success-card-title">
              {
                t.orderedItems
              }
            </h2>

            <div className="success-items">

              {Array.isArray(
                order.items
              ) &&
              order.items
                .length ? (
                order.items.map(
                  (
                    item: any,
                    index: number
                  ) => {
                    const unitHT =
                      Number(
                        item.priceHT ??
                          item.price ??
                          0
                      );

                    const qty =
                      Number(
                        item.quantity ||
                          1
                      );

                    return (
                      <div
                        key={
                          index
                        }
                        className="success-item"
                      >

                        <div>

                          <p className="success-strong">
                            {item.name ||
                              "Produit"}
                          </p>

                          <p className="success-item-meta">
                            {qty} ×{" "}
                            {eur(
                              unitHT
                            )}{" "}
                            HT
                          </p>

                        </div>

                        <div className="success-item-price">
                          {eur(
                            unitHT *
                              qty
                          )}
                        </div>

                      </div>
                    );
                  }
                )
              ) : (
                <p>
                  —
                </p>
              )}

            </div>

          </div>

          {/* =====================================================
              TOTALS
          ===================================================== */}

          <div className="success-card success-card-large">

            <div className="success-total-row">

              <span>
                {
                  t.totalExclTax
                }
              </span>

              <strong>
                {eur(
                  totals.totalHT
                )}
              </strong>

            </div>

            <div className="success-total-row">

              <span>
                {t.vat}
              </span>

              <strong>
                {eur(
                  totals.vatAmount ??
                    totals.totalVAT
                )}
              </strong>

            </div>

            <div className="success-total-row success-total-final">

              <span>
                {
                  t.totalInclTax
                }
              </span>

              <strong>
                {eur(
                  totals.totalTTC
                )}
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================================
            CTA
        ===================================================== */}

        <div className="success-actions">

          <Link
            href={`/${locale}`}
            className="success-btn-primary"
          >
            {
              t.backToHome
            }
          </Link>

        </div>

      </section>

    </main>
  );
}