"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  id: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les commandes
  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const list = snapshot.docs.map(
      (doc) => ({ ...(doc.data() as Order), id: doc.id }) // ✅ id après le spread
    );

    // 🕒 Trier du plus récent au plus ancien
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Chargement des commandes...</p>;
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8">📦 Commandes</h1>

      {orders.length === 0 ? (
        <p>Aucune commande enregistrée.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-2 px-4">Client</th>
              <th className="py-2 px-4">Montant</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{order.customer_email}</td>
                <td className="py-3 px-4">
                  {order.amount_total} {order.currency?.toUpperCase()}
                </td>
                <td className="py-3 px-4">
                  {order.payment_status === "paid" ? "✅ Payé" : "⏳ En attente"}
                </td>
                <td className="py-3 px-4">
                  {new Date(order.created_at).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
