"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const { locale } = useParams() as { locale: string };
  const search = useSearchParams();
  const sessionId = search.get("session_id");

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  /* -------------------------------------------------------
     🔄 LOAD ORDER (ROBUSTE)
  ------------------------------------------------------- */
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("Session Stripe manquante");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }

        const data = await res.json();

        if (!data?.success || !data?.order) {
          throw new Error("Commande introuvable");
        }

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (e: any) {
        console.error("❌ SuccessPage error:", e);
        if (!cancelled) {
          setError(e.message || "Erreur de chargement");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  /* -------------------------------------------------------
     🧮 DATA SAFE
  ------------------------------------------------------- */
  if (loading) {
    return (
      <main className="success-page">
        <p className="success-loading">
          {t("Chargement de la commande…", "Loading order…")}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="success-page">
        <p className="text-red-600 text-center mt-10">
          {error}
        </p>
        <div className="text-center mt-6">
          <Link href={`/${locale}`} className="btn-home">
            {t("Retour à l’accueil", "Back home")}
          </Link>
        </div>
      </main>
    );
  }

  if (!order) return null;

  /* -------------------------------------------------------
     NORMALISATION
  ------------------------------------------------------- */
  const firstName =
    order.shippingAddress?.name?.split(" ")?.[0] ??
    t("client", "customer");

  const totalPaid = order.amount_total
    ? (order.amount_total / 100).toFixed(2)
    : "0.00";

  const sm = order.shippingMethod || {};
  const shippingName =
    typeof sm.name === "string"
      ? sm.name
      : sm.name?.[locale] || sm.name?.fr || sm.name?.en || "—";

  const shippingPrice =
    typeof sm.price === "number"
      ? sm.price
      : sm.priceTTC ?? 0;

  const isRelay = sm.type === "relay";
  const relay = order.relayPoint || null;

  /* ======================================================
     🎨 RENDER
  ====================================================== */
  return (
    <main className="success-page">
      <div className="success-container">
        <div className="success-badge">
          ✓ {t("Paiement confirmé", "Payment confirmed")}
        </div>

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

        <div className="success-box">
          <div className="success-order-header">
            <div>
              <p className="success-block-title">
                {t("Commande", "Order")}
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

          <div className="success-grid">
            <div className="success-box-alt">
              <p className="success-block-title">
                {isRelay
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
            </div>

            <div className="success-box-alt">
              <p className="success-block-title">
                {t("Méthode d’envoi", "Shipping method")}
              </p>
              <p className="success-block-value">{shippingName}</p>
              <p className="success-muted">
                {shippingPrice.toFixed(2)} €
              </p>
            </div>
          </div>

          {isRelay && relay && (
            <div className="success-box-alt mt-4">
              <p className="success-block-title">
                {t("Point relais", "Relay point")}
              </p>
              <p className="success-block-value">
                {relay.name || relay.Nom}
              </p>
            </div>
          )}

          <div className="success-items-section">
            <p className="success-block-title">
              {t("Articles commandés", "Ordered items")}
            </p>

            {order.items?.map((it: any, i: number) => {
              const price =
                typeof it.price === "number"
                  ? it.price
                  : it.priceHT ?? 0;
              const qty = Number(it.quantity || 1);

              return (
                <div key={i} className="success-item">
                  <div>
                    <p className="success-item-name">{it.name}</p>
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

        <div className="success-cta">
          <Link href={`/${locale}`} className="btn-home">
            {t("Retourner à l’accueil", "Return home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
