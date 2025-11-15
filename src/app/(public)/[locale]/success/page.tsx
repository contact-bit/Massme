"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

type SuccessPageProps = {
  params: Promise<{ locale: string }> | { locale: string };
  searchParams: Promise<{ session_id?: string }> | { session_id?: string };
};

export default function SuccessPage({ params, searchParams }: SuccessPageProps) {
  // ✅ OBLIGATOIRE : déballer les Promises avec use()
  const resolvedParams =
    typeof (params as any).then === "function" ? use(params) : params;

  const resolvedSearch =
    typeof (searchParams as any).then === "function"
      ? use(searchParams)
      : searchParams;

  const locale = resolvedParams.locale;
  const sessionId = resolvedSearch.session_id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();
        setOrder(data.order || null);
      } catch (e) {
        console.error("Erreur récupération commande :", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  // -----------------------------
  // Shipping method formatter
  // -----------------------------
  let shippingName = "—";
  let shippingPrice: string | null = null;

  if (order?.shippingMethod) {
    const sm = order.shippingMethod;

    if (typeof sm.name === "string") shippingName = sm.name;
    else if (sm.name?.fr || sm.name?.en)
      shippingName = sm.name.fr || sm.name.en;

    if (typeof sm.price === "number")
      shippingPrice = sm.price.toFixed(2);
    else if (typeof sm.price?.fr === "number")
      shippingPrice = sm.price.fr.toFixed(2);
    else if (typeof sm.price?.en === "number")
      shippingPrice = sm.price.en.toFixed(2);
  }

  const firstName =
    order?.shippingAddress?.name?.split(" ")?.[0] ||
    (locale === "fr" ? "client" : "customer");

  const totalPaid =
    typeof order?.amount_total === "number"
      ? (order.amount_total / 100).toFixed(2)
      : "—";

  return (
    <main className="max-w-3xl mx-auto py-12 px-6 text-gray-900">

      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-600 w-14 h-14"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75l2.25 2.25L15 9.75m6 2.25a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {order
            ? t(`Merci ${firstName} ! 🎉`, `Thank you ${firstName}! 🎉`)
            : t("Paiement confirmé 🎉", "Payment confirmed 🎉")}
        </h1>

        {order && (
          <p className="text-gray-700 mt-4 text-lg">
            {t(
              `Votre achat de ${totalPaid} € a bien été confirmé.`,
              `Your purchase of ${totalPaid} € has been confirmed.`
            )}
          </p>
        )}

        <p className="text-gray-500 mt-2">
          {t(
            "Un email contenant votre facture et le suivi d’expédition vous a été envoyé.",
            "An email with your invoice and shipping details has been sent."
          )}
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 text-lg">
          {t("Chargement de votre commande…", "Loading your order…")}
        </p>
      )}

      {/* DETAILS */}
      {order && (
        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100 space-y-8">

          {/* ID */}
          <section>
            <p className="text-xs text-gray-500 font-semibold uppercase">
              {t("Numéro de commande", "Order ID")}
            </p>
            <p className="text-xl font-bold">{order.id}</p>
          </section>

          {/* Adresse */}
          <section>
            <p className="text-xs text-gray-500 font-semibold uppercase">
              {t("Adresse de livraison", "Shipping address")}
            </p>
            <div className="mt-2">
              <p>{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.postalCode}{" "}
                {order.shippingAddress?.city}
              </p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <p className="text-xs text-gray-500 font-semibold uppercase">
              {t("Méthode d’envoi", "Shipping method")}
            </p>
            <p className="font-medium mt-1">{shippingName}</p>
            <p className="text-gray-600 text-sm">
              {shippingPrice ? `${shippingPrice} €` : "—"}
            </p>
          </section>

          {/* Articles */}
          <section>
            <p className="text-xs text-gray-500 font-semibold uppercase mb-3">
              {t("Articles commandés", "Ordered items")}
            </p>

            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between bg-gray-50 p-4 rounded-xl shadow-sm"
                >
                  <div>
                    <p className="font-medium">{item.name.fr || item.name.en}</p>
                    <p className="text-xs text-gray-500">
                      x{item.quantity || 1}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {(item.price?.eur || 0).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Total */}
          <section className="flex justify-between text-xl font-bold pt-4 border-t">
            <span>{t("Total payé", "Total paid")}</span>
            <span className="text-blue-600">{totalPaid} €</span>
          </section>
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-12 space-y-4">
        <Link
          href={`/${locale}`}
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-blue-700 transition"
        >
          {t("Retourner à l’accueil", "Return home")}
        </Link>

        <p className="text-gray-500 text-sm">
          {t(
            "Un email de confirmation vient de vous être envoyé.",
            "A confirmation email has been sent."
          )}
        </p>
      </div>
    </main>
  );
}
