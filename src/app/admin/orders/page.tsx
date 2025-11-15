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
  shippingMethod?: any;
  items: {
    name: Record<string, string>;
    price: { eur: number };
    quantity?: number;
  }[];
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] =
    useState<"all" | "paid" | "pending_payment">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        let q;
        if (filter === "all") {
          q = query(
            collection(db, "pending_orders"),
            orderBy("createdAt", "desc")
          );
        } else {
          q = query(
            collection(db, "pending_orders"),
            where("status", "==", filter),
            orderBy("createdAt", "desc")
          );
        }

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(data);
      } catch (error) {
        console.error("Erreur chargement commandes :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">🧾 Commandes</h1>

      {/* FILTRES */}
      <div className="mb-6 flex gap-3">
        {[
          { key: "all", label: "Toutes" },
          { key: "paid", label: "Payées" },
          { key: "pending_payment", label: "En attente" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === key
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-center py-20">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Aucune commande trouvée.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // PROTECTION shippingMethod
            const shipping =
              typeof order.shippingMethod === "object"
                ? order.shippingMethod
                : null;

            // CALCUL TOTAL (sécurisé)
            const total =
              typeof order.amount_total === "number"
                ? (order.amount_total / 100).toFixed(2)
                : order.items?.length
                ? order.items
                    .reduce(
                      (sum, item) =>
                        sum + (item.price?.eur || 0) * (item.quantity || 1),
                      0
                    )
                    .toFixed(2)
                : "0.00";

            return (
              <div
                key={order.id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                {/* LIGNE COMPACTE */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpanded(expanded === order.id ? null : order.id)
                  }
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress?.name}
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{total} €</p>
                    <p
                      className={`text-xs inline-block px-2 py-1 rounded-full mt-1 ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "paid" ? "Payée" : "En attente"}
                    </p>
                  </div>

                  <div className="ml-4 text-sm text-blue-600">
                    {expanded === order.id ? "▲" : "▼"}
                  </div>
                </div>

                {/* DETAILS */}
                {expanded === order.id && (
                  <div className="border-t bg-gray-50 p-6 space-y-6">
                    {/* ADRESSE */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Adresse de livraison
                      </h3>
                      <p>{order.shippingAddress?.name}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>
                        {order.shippingAddress?.postalCode}{" "}
                        {order.shippingAddress?.city}
                      </p>
                      <p>{order.shippingAddress?.phone}</p>
                    </div>

                    {/* SHIPPING */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Méthode d’envoi
                      </h3>
                      <p>{shipping?.name?.fr || "—"}</p>
                      <p className="text-gray-700">
                        {typeof shipping?.price?.fr === "number"
                          ? `${shipping.price.fr.toFixed(2)} €`
                          : "—"}
                      </p>
                    </div>

                    {/* PRODUITS */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Produits
                      </h3>

                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between bg-white border rounded-md p-3"
                          >
                            <div>
                              <p className="font-medium">
                                {item.name.fr || item.name.en}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qté : {item.quantity || 1}
                              </p>
                            </div>

                            <p className="font-semibold text-gray-800">
                              {typeof item.price?.eur === "number"
                                ? item.price.eur.toFixed(2)
                                : "0.00"}{" "}
                              €
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DATE */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        Date de commande
                      </h3>
                      <p className="text-gray-700">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString("fr-FR")
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
