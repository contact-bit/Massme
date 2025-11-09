"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  id: string;
  email: string;
  status: string;
  createdAt?: any;
  amount_total?: number;
  currency?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  shippingMethod?: {
    name: Record<string, string>;
    price: Record<string, number>;
  };
  items: {
    name: Record<string, string>;
    price: number;
    quantity?: number;
  }[];
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending_payment">("all");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        // 🔍 Crée la requête Firestore selon le filtre choisi
        let q;
        if (filter === "all") {
          q = query(collection(db, "pending_orders"), orderBy("createdAt", "desc"));
        } else {
          q = query(
            collection(db, "pending_orders"),
            where("status", "==", filter),
            orderBy("createdAt", "desc")
          );
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(data);
      } catch (err) {
        console.error("Erreur de chargement des commandes :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">🧾 Tableau de bord - Commandes</h1>

      {/* 🔽 FILTRE PAR STATUT */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "paid"
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          Payées
        </button>
        <button
          onClick={() => setFilter("pending_payment")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "pending_payment"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          En attente
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-20">Chargement des commandes...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Aucune commande trouvée.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produits</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{order.shippingAddress?.name || "—"}</td>
                  <td className="px-4 py-3">{order.email}</td>
                  <td className="px-4 py-3 font-medium">
                    {(order.amount_total || 0).toFixed(2)} {order.currency?.toUpperCase() || "EUR"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "paid" ? "Payée" : "En attente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.items?.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.name.fr || item.name.en} × {item.quantity || 1}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
