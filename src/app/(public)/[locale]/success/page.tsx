"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const { locale } = useParams() as { locale: string };
  const search = useSearchParams();
  const sessionId = search.get("session_id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  /* -------------------------------------------------------
     🔄 CHARGEMENT DE LA COMMANDE
  ------------------------------------------------------- */
  useEffect(() => {
    if (!sessionId) return;

    async function load() {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();
        setOrder(data.order || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  /* -------------------------------------------------------
     🚚 SHIPPING METHOD NORMALISÉE
  ------------------------------------------------------- */
  let shippingName = "—";
  let shippingPrice = 0;

  if (order?.shippingMethod) {
    const sm = order.shippingMethod;

    shippingName =
      typeof sm.name === "string"
        ? sm.name
        : sm.name?.[locale] || sm.name?.fr || sm.name?.en;

    shippingPrice =
      typeof sm.price === "number"
        ? sm.price
        : sm.price?.[locale] || sm.price?.fr || sm.price?.en || 0;
  }

  const totalPaid = order?.amount_total
    ? (order.amount_total / 100).toFixed(2)
    : "0.00";

  const firstName =
    order?.shippingAddress?.name?.split(" ")?.[0] ||
    t("client", "customer");

  /* -------------------------------------------------------
     📦 POINT RELAIS : NORMALISATION
  ------------------------------------------------------- */
  const relay = order?.relayPoint || null;

  const relayName = relay?.name || relay?.Nom || null;
  const relayAddress = relay?.address || relay?.Adresse1 || null;
  const relayAddress2 = relay?.Adresse2 || null;
  const relayCity = relay?.city || relay?.Ville || null;
  const relayPostal = relay?.postalCode || relay?.CP || null;
  const relayCountry = relay?.country || relay?.Pays || null;

  const isRelayShipping = order?.shippingMethod?.type === "relay";

  /* ======================================================
     🎨 RENDER
  ====================================================== */
  return (
    <main className="success-page">
      <div className="success-container">

        {/* BADGE */}
        <div className="success-badge">
          ✓ {t("Paiement confirmé", "Payment confirmed")}
        </div>

        {/* TITRE */}
        <h1 className="success-title">
          {t(`Merci ${firstName}! 🎉`, `Thank you, ${firstName}! 🎉`)}
        </h1>

        <p className="success-subtitle">
          {t(
            `Votre achat de ${totalPaid} € a bien été confirmé.`,
            `Your purchase of ${totalPaid} € has been confirmed.`
          )}
        </p>

        <p className="success-subtitle-small">
          {t(
            "Un email avec votre facture vous a été envoyé.",
            "A confirmation email has been sent."
          )}
        </p>

        {/* LOADING */}
        {loading && (
          <p className="success-loading">
            {t("Chargement de la commande…", "Loading order…")}
          </p>
        )}

        {/* ------------------- COMMANDE -------------------- */}
        {order && (
          <div className="success-box">

            {/* HEADER */}
            <div className="success-order-header">
              <div>
                <p className="success-block-title">{t("Commande", "Order")}</p>
                <p className="success-block-value">{order.id}</p>
              </div>

              <div className="text-right">
                <p className="success-block-title">{t("Total payé", "Total paid")}</p>
                <p className="success-total">{totalPaid} €</p>
              </div>
            </div>

            {/* ADRESSE + MÉTHODE */}
            <div className="success-grid">

              {/* ADRESSE (DYNAMIQUE) */}
              <div className="success-box-alt">
                <p className="success-block-title">
                  {isRelayShipping
                    ? t("Adresse de facturation", "Billing address")
                    : t("Adresse de livraison", "Shipping address")}
                </p>

                <p className="success-block-value">
                  {order.shippingAddress?.name}
                </p>

                <p>{order.shippingAddress?.address}</p>

                <p>
                  {order.shippingAddress?.postalCode}{" "}
                  {order.shippingAddress?.city}
                </p>

                <p className="success-muted">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* MÉTHODE */}
              <div className="success-box-alt">
                <p className="success-block-title">
                  {t("Méthode d’envoi", "Shipping method")}
                </p>

                <p className="success-block-value">{shippingName}</p>
                <p className="success-muted">{shippingPrice.toFixed(2)} €</p>
              </div>
            </div>

            {/* ----------------- POINT RELAIS ----------------- */}
            {isRelayShipping && relay && (
              <div className="success-box-alt mt-4">
                <p className="success-block-title">{t("Point relais", "Relay point")}</p>

                <p className="success-block-value">{relayName}</p>

                {relayAddress && <p>{relayAddress}</p>}
                {relayAddress2 && <p>{relayAddress2}</p>}
                {(relayPostal || relayCity) && (
                  <p>{relayPostal} {relayCity}</p>
                )}
                {relayCountry && <p>{relayCountry}</p>}

                <p className="success-muted mt-1">
                  {order.shippingMethod.relayProvider === "mondialrelay"
                    ? "Mondial Relay"
                    : order.shippingMethod.relayProvider === "pickup"
                    ? "Pickup / Shop2Shop"
                    : ""}
                </p>
              </div>
            )}

            {/* ARTICLES */}
            <div className="success-items-section">
              <p className="success-block-title">
                {t("Articles commandés", "Ordered items")}
              </p>

              <div className="success-items-list">
                {order.items?.map((item: any, i: number) => {
                  const price =
                    typeof item.price === "number"
                      ? item.price
                      : item.price?.eur || 0;

                  const qty = Number(item.quantity) || 1;

                  return (
                    <div key={i} className="success-item">
                      <div>
                        <p className="success-item-name">{item.name}</p>
                        <p className="success-item-qty">× {qty}</p>
                      </div>
                      <p className="success-item-price">
                        {(price * qty).toFixed(2)} €
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="success-cta">
          <Link href={`/${locale}`} className="btn-home">
            {t("Retourner à l’accueil", "Return home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
