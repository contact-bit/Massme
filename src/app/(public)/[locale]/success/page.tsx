"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default function SuccessPage({ params, searchParams }: SuccessPageProps) {
  // ✅ Next 16 : params & searchParams sont des Promises → on les "use"
  const { locale } = use(params);
  const { session_id: sessionId } = use(searchParams);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();
        setOrder(data.order || null);
      } catch (e) {
        console.error("Erreur récupération commande:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  // Petite fonction de trad
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  // 🔎 Méthode de livraison (nom + prix) avec structure souple
  let shippingName = "—";
  let shippingPrice: number | null = null;

  if (order?.shippingMethod) {
    const sm = order.shippingMethod;

    // name peut être string ou { fr, en }
    if (typeof sm.name === "string") {
      shippingName = sm.name;
    } else if (sm.name?.fr || sm.name?.en) {
      shippingName = sm.name.fr || sm.name.en;
    }

    // price peut être number ou { fr, en }
    if (typeof sm.price === "number") {
      shippingPrice = sm.price;
    } else if (typeof sm.price?.fr === "number") {
      shippingPrice = sm.price.fr;
    } else if (typeof sm.price?.en === "number") {
      shippingPrice = sm.price.en;
    }
  }

  const firstName =
    order?.shippingAddress?.name?.split(" ")?.[0] ||
    (locale === "fr" ? "client" : "customer");

  const totalPaid =
    typeof order?.amount_total === "number"
      ? (order.amount_total / 100).toFixed(2)
      : "—";

  return (
    <main className="min-h-[80vh] bg-[#FFF7F2] flex items-center">
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        {/* HEADER Airbnb-like */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/70 border border-[#FF385C]/20 text-[#FF385C] text-sm font-medium mb-4">
            <span>✓</span>
            <span>
              {t("Paiement confirmé", "Payment confirmed")}
            </span>
          </div>

          <div className="mx-auto w-20 h-20 rounded-full bg-[#FF385C]/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="#FF385C"
              className="w-11 h-11"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {order
              ? t(
                  `Merci ${firstName} ! 🎉`,
                  `Thank you, ${firstName}! 🎉`
                )
              : t("Paiement confirmé 🎉", "Payment confirmed 🎉")}
          </h1>

          {order && (
            <p className="text-gray-700 mt-3 text-lg">
              {t(
                `Votre achat de ${totalPaid} € a bien été confirmé.`,
                `Your purchase of ${totalPaid} € has been confirmed.`
              )}
            </p>
          )}

          <p className="text-gray-500 mt-2">
            {t(
              "Un email avec votre facture et le suivi d’expédition vous a été envoyé.",
              "An email with your invoice and shipping details has been sent to you."
            )}
          </p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <p className="text-center text-gray-500 mt-6">
            {t("Chargement de votre commande…", "Loading your order…")}
          </p>
        )}

        {/* CARD DÉTAILS */}
        {order && (
          <div className="bg-white rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] p-6 md:p-8 space-y-8 border border-gray-100">
            {/* Ligne 1 : ID + total */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  {t("Numéro de commande", "Order ID")}
                </p>
                <p className="text-base md:text-lg font-semibold text-gray-900">
                  {order.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  {t("Total payé", "Total paid")}
                </p>
                <p className="text-xl font-bold text-[#FF385C]">
                  {totalPaid} €
                </p>
              </div>
            </div>

            {/* Ligne 2 : adresse + shipping */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Adresse */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1">
                  {t("Adresse de livraison", "Shipping address")}
                </p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.name}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress?.address}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress?.postalCode}{" "}
                  {order.shippingAddress?.city}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* Méthode d’envoi */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1">
                  {t("Méthode d’envoi", "Shipping method")}
                </p>
                <p className="font-medium text-gray-900">
                  {shippingName}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  {shippingPrice != null
                    ? `${shippingPrice.toFixed(2)} €`
                    : "—"}
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  {t(
                    "Votre commande sera préparée sous 24h puis transmise au transporteur sélectionné.",
                    "Your order will be prepared within 24h and handed over to your selected carrier."
                  )}
                </p>
              </div>
            </div>

            {/* Produits */}
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-3">
                {t("Articles commandés", "Ordered items")}
              </p>

              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name?.fr || item.name?.en}
                      </p>
                      <p className="text-xs text-gray-500">
                        x{item.quantity || 1}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      {(item.price?.eur || 0).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA bas de page */}
        <div className="text-center mt-10 space-y-3">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#FF385C] text-white font-semibold shadow-md hover:bg-[#E03150] transition"
          >
            {t("Retourner à l’accueil", "Return to home")}
          </Link>

          <p className="text-gray-500 text-sm">
            {t(
              "Un email de confirmation vient de vous être envoyé.",
              "A confirmation email has been sent to you."
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
