"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, getDocs, collection, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Locale = "fr" | "en";

interface Product {
  name: Record<Locale, string>;
  price: number;
  quantity: number;
}

interface Order {
  email: string;
  items: Product[];
  shippingMethod: {
    name: Record<Locale, string>;
    price: Record<Locale, number>;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  amount_total?: number;
  currency?: string;
  paid_at?: string;
}

export default function SuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  // ✅ On déballe la Promise pour obtenir la locale
  const { locale } = React.use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) return;
      try {
        // 🔍 Cherche la commande dont stripe_session_id correspond à la session
        const q = query(
          collection(db, "pending_orders"),
          where("stripe_session_id", "==", sessionId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as Order;
          setOrder(docData);
        } else {
          console.warn("Aucune commande trouvée pour cette session");
        }
      } catch (err) {
        console.error("Erreur Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto py-20 text-center text-gray-500">
        {locale === "fr" ? "Chargement de votre commande..." : "Loading your order..."}
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto py-20 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">
          {locale === "fr" ? "Aucune commande trouvée ❌" : "Order not found ❌"}
        </h1>
        <Link href={`/${locale}/products`} className="text-blue-600 hover:underline">
          {locale === "fr" ? "Retourner à la boutique" : "Back to shop"}
        </Link>
      </main>
    );
  }

  // 🧮 Calcule le total (si Firestore ne l’a pas encore)
  const total =
    order.amount_total ??
    order.items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0) +
      (order.shippingMethod?.price?.fr || 0);

  return (
    <main className="max-w-3xl mx-auto py-12 px-4 text-gray-900">
      <h1 className="text-4xl font-bold text-green-600 text-center mb-6">
        ✅ {locale === "fr" ? "Paiement réussi !" : "Payment successful!"}
      </h1>

      <p className="text-center text-gray-700 mb-8">
        {locale === "fr"
          ? `Merci pour votre achat, ${order.shippingAddress?.name || "cher client"} !`
          : `Thank you for your purchase, ${order.shippingAddress?.name || "dear customer"}!`}
      </p>

      <div className="bg-white shadow-lg rounded-2xl p-6 border mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {locale === "fr" ? "🧾 Détails de la commande" : "🧾 Order Details"}
        </h2>

        <ul className="divide-y divide-gray-200 mb-4">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between py-2">
              <span>{item.name?.[locale] || item.name?.fr}</span>
              <span>
                {item.price.toFixed(2)} € × {item.quantity || 1}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between pt-2 border-t font-semibold">
          <span>
            🚚 {locale === "fr" ? "Livraison" : "Shipping"} ({order.shippingMethod.name?.[locale]})
          </span>
          <span>{order.shippingMethod.price?.fr?.toFixed(2) ?? "0.00"} €</span>
        </div>

        <div className="flex justify-between text-lg font-bold mt-4">
          <span>{locale === "fr" ? "Total payé" : "Total paid"} :</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">
          {locale === "fr" ? "Adresse de livraison" : "Shipping address"}
        </h3>
        <p className="text-gray-700 mb-6">
          {order.shippingAddress?.name} <br />
          {order.shippingAddress?.address} <br />
          {order.shippingAddress?.postalCode} {order.shippingAddress?.city}
          <br />
          {order.shippingAddress?.phone}
        </p>

        <Link
          href={`/${locale}/products`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {locale === "fr" ? "Continuer mes achats" : "Continue shopping"}
        </Link>
      </div>
    </main>
  );
}
