"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  id: string;
  email: string;
  status?: "pending_payment" | "paid";
  createdAt?: any;

  // Stripe
  amount_total?: number; // total payé en centimes

  // Stocké par ton API
  subtotal?: number;
  shippingPrice?: number;
  total?: number;

  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };

  shippingMethod?: {
    name?: string;
    price?: number;
  };

  items: {
    name: { fr?: string; en?: string };
    price: number | { eur?: number };
    quantity: number;
  }[];
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending_payment">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  /* ---------------------------------------------------------
     🔄 Chargement des commandes (Full + filtrage front-end)
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);

      const q = query(collection(db, "pending_orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];

      // 🔥 Filtrage front-end → FINI les soucis Firestore
      const filtered =
        filter === "all" ? allOrders : allOrders.filter((o) => o.status === filter);

      setOrders(filtered);
      setLoading(false);
    }

    loadOrders();
  }, [filter]);

  /* ---------------------------------------------------------
     🧮 Calculs des prix
  --------------------------------------------------------- */
  const getItemPrice = (item: any): number =>
    typeof item.price === "number" ? item.price :
    typeof item.price?.eur === "number" ? item.price.eur : 0;

  const getSubtotal = (order: Order): number =>
    order.items?.reduce(
      (sum, item) => sum + getItemPrice(item) * item.quantity,
      0
    ) || 0;

  const getShippingPrice = (order: Order): number =>
    typeof order.shippingMethod?.price === "number"
      ? order.shippingMethod.price
      : typeof order.shippingPrice === "number"
      ? order.shippingPrice
      : 0;

  const getTotal = (order: Order): number => {
    // 1️⃣ Stripe → le plus fiable
    if (typeof order.amount_total === "number") return order.amount_total / 100;

    // 2️⃣ Stocké par ton API
    if (typeof order.total === "number") return order.total;

    // 3️⃣ Recalcul propre
    return getSubtotal(order) + getShippingPrice(order);
  };

  /* ---------------------------------------------------------
     🗑️ Suppression commandes
  --------------------------------------------------------- */
  const deleteSingle = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    await deleteDoc(doc(db, "pending_orders", id));
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) setSelectedOrders([]);
    else setSelectedOrders(orders.map((o) => o.id));
  };

  const deleteMultiple = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(`Supprimer ${selectedOrders.length} commandes ?`)) return;

    for (const id of selectedOrders) {
      await deleteDoc(doc(db, "pending_orders", id));
    }

    setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
    setSelectedOrders([]);
  };

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <main className="max-w-6xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">🧾 Commandes</h1>

      {/* FILTRE */}
      <div className="mb-6 flex gap-4">
        {["all", "paid", "pending_payment"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
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

      {/* ACTIONS GLOBALES */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleSelectAll}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          {selectedOrders.length === orders.length
            ? "Tout désélectionner"
            : "Tout sélectionner"}
        </button>

        {selectedOrders.length > 0 && (
          <button
            onClick={deleteMultiple}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Supprimer {selectedOrders.length} commande(s)
          </button>
        )}
      </div>

      {/* LISTE COMMANDES */}
      {loading ? (
        <p className="text-center py-20 text-gray-500">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const subtotal = getSubtotal(order);
            const shipping = getShippingPrice(order);
            const total = getTotal(order);

            return (
              <div
                key={order.id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex items-center p-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() =>
                      setSelectedOrders((prev) =>
                        prev.includes(order.id)
                          ? prev.filter((x) => x !== order.id)
                          : [...prev, order.id]
                      )
                    }
                    className="w-5 h-5 accent-blue-600 mr-3"
                  />

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                  >
                    <p className="font-semibold">
                      {order.shippingAddress?.name || "Client"}
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-semibold">{total.toFixed(2)} €</p>

                    <p
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "paid" ? "Payée" : "En attente"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                    className="text-blue-600 w-6"
                  >
                    {expanded === order.id ? "▲" : "▼"}
                  </button>
                </div>

                {/* DETAILS */}
                {expanded === order.id && (
                  <div className="border-t bg-gray-50 p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold mb-1">Adresse</h3>
                      <p>{order.shippingAddress?.name}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>
                        {order.shippingAddress?.postalCode}{" "}
                        {order.shippingAddress?.city}
                      </p>
                      <p>{order.shippingAddress?.phone}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-1">Livraison</h3>
                      <p>{order.shippingMethod?.name || "—"}</p>
                      <p className="font-semibold">
                        {shipping.toFixed(2)} €
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-2">Produits</h3>

                      {order.items?.map((item, i) => {
                        const price = getItemPrice(item);

                        return (
                          <div
                            key={i}
                            className="flex justify-between bg-white border rounded-md p-3 mb-2"
                          >
                            <div>
                              <p className="font-medium">
                                {item.name.fr || item.name.en || "Produit"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qté : {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {price.toFixed(2)} €
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t pt-4 space-y-1 text-sm">
                      <p>Sous-total : {subtotal.toFixed(2)} €</p>
                      <p>Livraison : {shipping.toFixed(2)} €</p>
                      <p className="font-bold text-lg">Total : {total.toFixed(2)} €</p>
                    </div>

                    <button
                      onClick={() => deleteSingle(order.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
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
