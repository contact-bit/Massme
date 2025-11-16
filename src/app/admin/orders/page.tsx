"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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
    name?: string | Record<string, string>;
    price?: number | Record<string, number>;
  };
  items: {
    name: Record<string, string>;
    price?: number | { eur: number };
    quantity?: number;
  }[];
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending_payment">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  /* -------------------------------------------------------
     🔄 CHARGEMENT DES COMMANDES
  -------------------------------------------------------- */
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
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];

        setOrders(data);
      } catch (e) {
        console.error("Erreur chargement commandes :", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  /* -------------------------------------------------------
     🔘 SELECTION UNIQUE
  -------------------------------------------------------- */
  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* -------------------------------------------------------
     🔘 TOUT SELECTIONNER
  -------------------------------------------------------- */
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  /* -------------------------------------------------------
     🗑️ SUPPRESSION INDIVIDUELLE
  -------------------------------------------------------- */
  const deleteSingle = async (id: string) => {
    if (!confirm("❌ Supprimer définitivement cette commande ?")) return;

    await deleteDoc(doc(db, "pending_orders", id));
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelectedOrders((prev) => prev.filter((x) => x !== id));
  };

  /* -------------------------------------------------------
     🗑️ SUPPRESSION MULTIPLE
  -------------------------------------------------------- */
  const deleteMultiple = async () => {
    if (selectedOrders.length === 0) return;

    if (
      !confirm(
        `⚠️ Vous allez supprimer ${selectedOrders.length} commande(s).\nCONFIRMER ?`
      )
    )
      return;

    for (const id of selectedOrders) {
      await deleteDoc(doc(db, "pending_orders", id));
    }

    setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
    setSelectedOrders([]);
  };

  /* -------------------------------------------------------
     🧮 FONCTION DE CALCUL DU PRIX (FIX)
  -------------------------------------------------------- */
  const getItemPrice = (item: any) => {
    if (typeof item.price === "number") return item.price;
    if (typeof item.price?.eur === "number") return item.price.eur;
    return 0;
  };

  /* -------------------------------------------------------
     🖥️ RENDU UI
  -------------------------------------------------------- */

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">
        🧾 Tableau de bord – Commandes
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

      {/* ACTIONS MULTIPLES */}
      <div className="flex items-center justify-between mb-3">
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
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm"
          >
            🗑️ Supprimer {selectedOrders.length} commande(s)
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-500">
          Chargement des commandes…
        </p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Aucune commande trouvée.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isChecked = selectedOrders.includes(order.id);

            /* ---- FIX CALCUL TOTAL ---- */
            const total =
              typeof order.amount_total === "number"
                ? (order.amount_total / 100).toFixed(2)
                : order.items
                    ?.reduce(
                      (sum, item) =>
                        sum + getItemPrice(item) * (item.quantity || 1),
                      0
                    )
                    .toFixed(2);

            return (
              <div
                key={order.id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex items-center p-4">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelect(order.id)}
                    className="w-5 h-5 accent-blue-600 mr-3"
                  />

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                  >
                    <p className="font-semibold">
                      {order.shippingAddress?.name}
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-semibold">{total} €</p>

                    <p
                      className={`text-xs inline-block px-2 py-1 rounded-full ${
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
                    {/* Adresse */}
                    <div>
                      <h3 className="text-sm font-bold mb-1">
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

                    {/* MÉTHODE D’ENVOI */}
                    <div>
                      <h3 className="text-sm font-bold mb-1">
                        Méthode d’envoi
                      </h3>

                      <p>
                        {typeof order.shippingMethod?.name === "string"
                          ? order.shippingMethod.name
                          : order.shippingMethod?.name?.fr ||
                            order.shippingMethod?.name?.en ||
                            "—"}
                      </p>

                      <p>
                        {typeof order.shippingMethod?.price === "number"
                          ? order.shippingMethod.price.toFixed(2) + " €"
                          : order.shippingMethod?.price?.fr
                          ? order.shippingMethod.price.fr.toFixed(2) + " €"
                          : "—"}
                      </p>
                    </div>

                    {/* Produits */}
                    <div>
                      <h3 className="text-sm font-bold mb-1">Produits</h3>

                      {order.items?.map((item, i) => {
                        const price = getItemPrice(item);

                        return (
                          <div
                            key={i}
                            className="flex justify-between bg-white border rounded-md p-3 mb-2"
                          >
                            <div>
                              <p className="font-medium">
                                {item.name.fr || item.name.en}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qté : {item.quantity || 1}
                              </p>
                            </div>

                            <p className="font-semibold">
                              {price.toFixed(2)} €
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* DELETE SINGLE */}
                    <button
                      onClick={() => deleteSingle(order.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      🗑️ Supprimer cette commande
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
