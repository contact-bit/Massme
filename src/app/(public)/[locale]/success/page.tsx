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

  // -------- Shipping -------- //
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
        : sm.price?.[locale] || sm.price?.fr || sm.price?.en;
  }

  const totalPaid =
    order?.amount_total ? (order.amount_total / 100).toFixed(2) : "0.00";

  const firstName =
    order?.shippingAddress?.name?.split(" ")?.[0] ||
    (locale === "fr" ? "client" : "customer");

  return (
    <main className="success-page">
      <div className="success-container">

        {/* BADGE */}
        <div className="success-badge">
          ✓ {t("Paiement confirmé", "Payment confirmed")}
        </div>

        {/* TITRES */}
        <h1 className="success-title">
          {t(`Merci ${firstName} ! 🎉`, `Thank you, ${firstName}! 🎉`)}
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
            "A confirmation email was sent to you."
          )}
        </p>

        {/* LOADING */}
        {loading && (
          <p className="success-loading">
            {t("Chargement de la commande…", "Loading order…")}
          </p>
        )}

        {/* COMMANDE */}
        {order && (
          <div className="success-box">

            {/* NUMÉRO + TOTAL */}
            <div className="success-order-header">
              <div>
                <p className="success-block-title">
                  {t("Numéro de commande", "Order ID")}
                </p>
                <p className="success-block-value">{order.id}</p>
              </div>

              <div className="text-right">
                <p className="success-block-title">
                  {t("Total payé", "Total paid")}
                </p>
                <p className="success-total">{totalPaid} €</p>
              </div>
            </div>

            {/* ADRESSE + SHIPPING */}
            <div className="success-grid">
              {/* Adresse */}
              <div className="success-box-alt">
                <p className="success-block-title">
                  {t("Adresse de livraison", "Shipping address")}
                </p>
                <p className="success-block-value">
                  {order.shippingAddress?.name}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.postalCode}{" "}
                  {order.shippingAddress?.city}
                </p>
                <p className="success-muted">{order.shippingAddress?.phone}</p>
              </div>

              {/* Shipping */}
              <div className="success-box-alt">
                <p className="success-block-title">
                  {t("Méthode d’envoi", "Shipping method")}
                </p>
                <p className="success-block-value">{shippingName}</p>
                <p className="success-muted">{shippingPrice.toFixed(2)} €</p>
              </div>
            </div>

            {/* ARTICLES COMMANDÉS */}
            <div className="success-items-section">
              <p className="success-block-title">
                {t("Articles commandés", "Ordered items")}
              </p>

              <div className="success-items-list">
                {order.items?.map((item: any, i: number) => {
                  const price =
                    typeof item.price === "number"
                      ? item.price
                      : typeof item.price?.eur === "number"
                      ? item.price.eur
                      : Number(item.price) || 0;

                  const quantity = Number(item.quantity) || 1;

                  return (
                    <div key={i} className="success-item">
                      <div>
                        <p className="success-item-name">{item.name}</p>
                        <p className="success-item-qty">× {quantity}</p>
                      </div>

                      <p className="success-item-price">
                        {(price * quantity).toFixed(2)} €
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
            {t("Retourner à l’accueil", "Return to home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
