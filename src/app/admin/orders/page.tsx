"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React from "react";

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
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
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
      <h1 className="text-3xl font-bold mb-8 text-blue-700">
        🧾 Tableau de bord - Commandes
      </h1>

      {/* FILTRE */}
      <div className="mb-6 flex gap-4">
        {["all", "paid", "pending_payment"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === type
                ? type === "paid"
                  ? "bg-green-600 text-white"
                  : type === "pending_payment"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {type === "all"
              ? "Toutes"
              : type === "paid"
              ? "Payées"
              : "En attente"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-20">
          Chargement des commandes...
        </p>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Détails</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">{order.shippingAddress?.name || "—"}</td>
                    <td className="px-4 py-3">{order.email}</td>
                    <td className="px-4 py-3 font-medium">
                      {order.amount_total
                        ? (order.amount_total / 100).toFixed(2)
                        : "—"}{" "}
                      {order.currency?.toUpperCase() || "EUR"}
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
                    <td className="px-4 py-3 text-blue-600 underline text-sm">
                      {expanded === order.id ? "▲ Fermer" : "▼ Voir"}
                    </td>
                  </tr>

                  {/* DÉTAILS ÉTENDUS */}
                  {expanded === order.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold mb-1">Adresse</p>
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                              {order.shippingAddress?.postalCode}{" "}
                              {order.shippingAddress?.city}
                            </p>
                            <p>{order.shippingAddress?.phone}</p>
                          </div>

                          <div>
                            <p className="font-semibold mb-1">Méthode d’envoi</p>
                            <p>
                              {order.shippingMethod?.name?.fr ||
                                order.shippingMethod?.name?.en}
                            </p>
                            <p>
                              {order.shippingMethod?.price?.fr
                                ? `${order.shippingMethod?.price?.fr.toFixed(2)} €`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold mb-1">Produits</p>
                            <ul className="list-disc list-inside space-y-1">
                              {order.items?.map((item, i) => (
                                <li key={i}>
                                  {item.name.fr || item.name.en} —{" "}
                                  {(item.price / 100).toFixed(2)}€ ×{" "}
                                  {item.quantity || 1}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
