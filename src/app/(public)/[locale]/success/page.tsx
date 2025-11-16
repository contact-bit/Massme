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

  // Traduction courte
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  useEffect(() => {
    if (!sessionId) return;

    async function load() {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();

        setOrder(data.order || null);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  // ==============================
  //      SHIPPING METHOD
  // ==============================
  let shippingName = "—";
  let shippingPrice = 0;

  if (order?.shippingMethod) {
    const sm = order.shippingMethod;

    if (typeof sm.name === "string") shippingName = sm.name;
    else shippingName = sm.name?.[locale] || sm.name?.fr || sm.name?.en;

    if (typeof sm.price === "number") shippingPrice = sm.price;
    else shippingPrice = sm.price?.[locale] || sm.price?.fr || sm.price?.en;
  }

  const totalPaid =
    order?.amount_total ? (order.amount_total / 100).toFixed(2) : "0.00";

  const firstName =
    order?.shippingAddress?.name?.split(" ")?.[0] ||
    (locale === "fr" ? "client" : "customer");

  return (
    <main className="min-h-[80vh] bg-[#FFF7F2] flex items-center">
      <div className="max-w-3xl mx-auto w-full px-4 py-10">

        {/* ===========================
            HEADER CONFIRMATION
        =========================== */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-[#FF385C]/20 text-[#FF385C] text-sm font-medium mb-4">
            ✓ {t("Paiement confirmé", "Payment confirmed")}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t(`Merci ${firstName} ! 🎉`, `Thank you, ${firstName}! 🎉`)}
          </h1>

          <p className="text-gray-700 text-lg">
            {t(
              `Votre achat de ${totalPaid} € a bien été confirmé.`,
              `Your purchase of ${totalPaid} € has been confirmed.`
            )}
          </p>

          <p className="text-gray-500 mt-2">
            {t(
              "Un email avec votre facture vous a été envoyé.",
              "A confirmation email was sent to you."
            )}
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500">
            {t("Chargement de la commande…", "Loading order…")}
          </p>
        )}

        {/* ===========================
            CONTENU COMMANDE
        =========================== */}
        {order && (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100">

            {/* NUMÉRO */}
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {t("Numéro de commande", "Order ID")}
                </p>
                <p className="text-lg font-semibold text-gray-900">{order.id}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {t("Total payé", "Total paid")}
                </p>
                <p className="text-2xl font-bold text-[#FF385C]">
                  {totalPaid} €
                </p>
              </div>
            </div>

            {/* ADRESSE & SHIPPING */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Adresse */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1 font-semibold">
                  {t("Adresse de livraison", "Shipping address")}
                </p>
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.postalCode}{" "}
                  {order.shippingAddress?.city}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              {/* Shipping */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1 font-semibold">
                  {t("Méthode d’envoi", "Shipping method")}
                </p>
                <p className="font-medium">{shippingName}</p>
                <p className="text-gray-700 text-sm mt-1">
                  {shippingPrice.toFixed(2)} €
                </p>
              </div>
            </div>

            {/* ===========================
                ARTICLES COMMANDÉS
            =========================== */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-3 font-semibold">
                {t("Articles commandés", "Ordered items")}
              </p>

              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => {
                  
                  // 🔥 NORMALISATION DU PRIX
                  const price =
                    typeof item.price === "number"
                      ? item.price
                      : typeof item.price?.eur === "number"
                      ? item.price.eur
                      : Number(item.price) || 0;

                  const quantity = Number(item.quantity) || 1;

                  return (
                    <div
                      key={i}
                      className="flex justify-between bg-gray-50 rounded-2xl px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">× {quantity}</p>
                      </div>

                      <p className="font-semibold">
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
        <div className="text-center mt-10">
          <Link
            href={`/${locale}`}
            className="inline-flex px-8 py-3 rounded-full bg-[#FF385C] text-white font-semibold shadow-md hover:bg-[#E03150] transition"
          >
            {t("Retourner à l’accueil", "Return to home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
