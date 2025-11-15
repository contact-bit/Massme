"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }> | { locale: string };
  searchParams: Promise<{ session_id: string }> | { session_id: string };
}) {
  // ✅ Next.js 16 – params / searchParams peuvent être des Promises
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

  // Petit helper de traduction
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  // 🔎 Extraction propre de la méthode de livraison
  let shippingName = "—";
  let shippingPrice: number | null = null;

  if (order?.shippingMethod) {
    const sm = order.shippingMethod;

    // name peut être une string ou un objet { fr, en }
    if (typeof sm.name === "string") {
      shippingName = sm.name;
    } else if (sm.name?.fr || sm.name?.en) {
      shippingName = sm.name.fr || sm.name.en;
    }

    // price peut être un number ou un objet { fr, en }
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
    <main className="max-w-2xl mx-auto py-10 px-6 text-gray-900">
      {/* HEADER ------------------------------------------------------ */}
      <div className="text-center mt-4 animate-fade-in">
        {/* Check icon style startup */}
        <div className="mx-auto w-24 h-24 text-green-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Message principal */}
        <h1 className="text-3xl font-bold">
          {order
            ? t(`🎉 Merci ${firstName} !`, `🎉 Thank you, ${firstName}!`)
            : t("🎉 Paiement confirmé !", "🎉 Payment confirmed!")}
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
            "Vous recevrez un email avec votre facture ainsi que les informations d’expédition.",
            "You will receive an email with your invoice and shipping information."
          )}
        </p>
      </div>

      {/* LOADING ----------------------------------------------------- */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">
          {t("Chargement de votre commande…", "Loading your order…")}
        </p>
      )}

      {/* DETAILS COMMANDE ------------------------------------------- */}
      {order && (
        <div className="bg-white border rounded-2xl shadow-xl p-6 mt-10 space-y-6 animate-fade-in">
          {/* Numéro de commande */}
          <div>
            <p className="text-sm font-semibold text-gray-500">
              {t("Numéro de commande", "Order ID")}
            </p>
            <p className="text-lg font-bold">{order.id}</p>
          </div>

          {/* Adresse de livraison */}
          <div>
            <p className="text-sm font-semibold text-gray-500">
              {t("Adresse de livraison", "Shipping address")}
            </p>
            <p>{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.postalCode}{" "}
              {order.shippingAddress?.city}
            </p>
            <p>{order.shippingAddress?.phone}</p>
          </div>

          {/* Méthode d’envoi */}
          <div>
            <p className="text-sm font-semibold text-gray-500">
              {t("Méthode d’envoi", "Shipping method")}
            </p>
            <p className="font-medium">{shippingName || "—"}</p>
            <p className="text-gray-600">
              {shippingPrice != null ? `${shippingPrice.toFixed(2)} €` : "—"}
            </p>
          </div>

          {/* Produits */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              {t("Articles commandés", "Ordered items")}
            </p>

            {order.items?.map((item: any, i: number) => (
              <div
                key={i}
                className="flex justify-between bg-gray-50 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {item.name?.fr || item.name?.en || "Produit"}
                  </p>
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

          {/* Total payé */}
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>{t("Total payé", "Total paid")}</span>
            <span className="text-blue-600">{totalPaid} €</span>
          </div>

          {/* Message d’expédition */}
          <p className="text-gray-500 text-sm pt-2">
            {t(
              "Votre commande sera préparée sous 24h et expédiée dans les meilleurs délais.",
              "Your order will be prepared within 24 hours and shipped as soon as possible."
            )}
          </p>
        </div>
      )}

      {/* CTA --------------------------------------------------------- */}
      <div className="text-center mt-12 space-y-4">
        <Link
          href={`/${locale}`}
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
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
    </main>
  );
}
