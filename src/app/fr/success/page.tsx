"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Locale = "fr" | "en";

export default function SuccessPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/get-order?session_id=${sessionId}`);
        const data = await res.json();

        if (data.order) {
          setOrder(data.order);
        } else {
          console.error("❌ Aucune commande trouvée pour cette session");
        }
      } catch (err) {
        console.error("Erreur récupération commande :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        {locale === "fr" ? "Chargement de la commande..." : "Loading order..."}
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          {locale === "fr"
            ? "Aucune commande trouvée ❌"
            : "No order found ❌"}
        </h1>
        <a
          href={`/${locale}/products`}
          className="mt-6 inline-block text-blue-600 underline"
        >
          {locale === "fr" ? "Retourner à la boutique" : "Return to shop"}
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        {locale === "fr" ? "Merci pour votre achat 🎉" : "Thank you for your purchase 🎉"}
      </h1>
      <p className="text-gray-700 mb-2">
        {locale === "fr" ? "Commande n°" : "Order #"} {order.id}
      </p>
      <p className="text-gray-700">
        {locale === "fr"
          ? `Montant total : ${order.total || "—"} €`
          : `Total amount: ${order.total || "—"} €`}
      </p>
    </main>
  );
}
