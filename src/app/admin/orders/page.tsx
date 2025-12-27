"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Order = {
  id: string;
  email: string;
  status?: "pending_payment" | "paid";
  createdAt?: any;

  amount_total?: number;
  subtotal?: number;
  shippingPrice?: number;
  total?: number;

  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    country?: string;
  };

  shippingMethod?: {
    name?: string;
    price?: number;
  };

  items: {
    name: { fr?: string; en?: string } | string;
    price: number | { eur?: number };
    quantity: number;
  }[];
};

export default function OrdersAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ q vient de l’URL (recherche rapide navbar)
  const qFromUrl = (searchParams.get("q") ?? "").trim();

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "paid" | "pending_payment">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // ✅ champ recherche visible sur la page (synchro avec q URL)
  const [search, setSearch] = useState(qFromUrl);

  useEffect(() => {
    setSearch(qFromUrl);
  }, [qFromUrl]);

  /* ---------------------------------------------------------
     🔄 Chargement des commandes via API admin sécurisée
  --------------------------------------------------------- */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        if (typeof window === "undefined") return;

        const adminPassword = localStorage.getItem("admin_password");
        if (!adminPassword) {
          window.location.href = "/admin-login";
          return;
        }

        const res = await fetch("/api/admin/orders", {
          headers: { "x-admin-password": adminPassword },
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Erreur API admin/orders:", await res.text());
          setAllOrders([]);
          return;
        }

        const data = await res.json();
        setAllOrders((data.orders || []) as Order[]);
      } catch (err) {
        console.error("Erreur Orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  /* ---------------------------------------------------------
     🧮 Calculs des prix
  --------------------------------------------------------- */
  const getItemPrice = (item: any): number =>
    typeof item.price === "number"
      ? item.price
      : typeof item.price?.eur === "number"
      ? item.price.eur
      : 0;

  const getSubtotal = (order: Order): number =>
    order.items?.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0) || 0;

  const getShippingPrice = (order: Order): number =>
    typeof order.shippingMethod?.price === "number"
      ? order.shippingMethod.price
      : typeof order.shippingPrice === "number"
      ? order.shippingPrice
      : 0;

  const getTotal = (order: Order): number => {
    if (typeof order.amount_total === "number") return order.amount_total / 100;
    if (typeof order.total === "number") return order.total;
    return getSubtotal(order) + getShippingPrice(order);
  };

  /* ---------------------------------------------------------
     🔎 Filtrage combiné: status + search (q)
  --------------------------------------------------------- */
  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allOrders.filter((o) => {
      // 1) status
      if (filter !== "all" && o.status !== filter) return false;

      // 2) search (id / email / nom / statut)
      if (!term) return true;

      const id = (o.id ?? "").toLowerCase();
      const email = (o.email ?? "").toLowerCase();
      const name = (o.shippingAddress?.name ?? "").toLowerCase();
      const status = (o.status ?? "").toLowerCase();

      return (
        id.includes(term) ||
        email.includes(term) ||
        name.includes(term) ||
        status.includes(term)
      );
    });
  }, [allOrders, filter, search]);

  // Reset selections quand la liste visible change
  useEffect(() => {
    setSelectedOrders([]);
    setExpanded(null);
  }, [filter, search]);

  /* ---------------------------------------------------------
     🗑️ Suppression via API sécurisée
  --------------------------------------------------------- */
  const deleteSingle = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;

    try {
      const adminPassword = localStorage.getItem("admin_password");
      if (!adminPassword) {
        alert("Session admin expirée, reconnecte-toi.");
        window.location.href = "/admin-login";
        return;
      }

      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });

      if (!res.ok) {
        alert("Erreur lors de la suppression");
        return;
      }

      setAllOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erreur suppression commande:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const toggleSelectAll = () => {
    // ✅ sélectionne uniquement la liste affichée (visibleOrders)
    if (selectedOrders.length === visibleOrders.length) setSelectedOrders([]);
    else setSelectedOrders(visibleOrders.map((o) => o.id));
  };

  const deleteMultiple = async () => {
    if (selectedOrders.length === 0) return;
    if (!confirm(`Supprimer ${selectedOrders.length} commande(s) ?`)) return;

    try {
      const adminPassword = localStorage.getItem("admin_password");
      if (!adminPassword) {
        alert("Session admin expirée, reconnecte-toi.");
        window.location.href = "/admin-login";
        return;
      }

      await Promise.all(
        selectedOrders.map((id) =>
          fetch(`/api/admin/orders?id=${id}`, {
            method: "DELETE",
            headers: { "x-admin-password": adminPassword },
          })
        )
      );

      setAllOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
      setSelectedOrders([]);
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
      alert("Erreur lors de la suppression multiple");
    }
  };

  // ✅ Met à jour l’URL quand tu tapes dans la barre (optionnel)
  const applyUrlSearch = (value: string) => {
    const v = value.trim();
    if (!v) router.push("/admin/orders");
    else router.push(`/admin/orders?q=${encodeURIComponent(v)}`);
  };

  return (
    <main className="admin-page">
      <h1 className="admin-title">🧾 Commandes</h1>

      {/* ✅ Barre de recherche (synchro avec ?q=) */}
      <div className="mb-4 flex gap-3 items-center">
        <input
          className="admin-input"
          placeholder="Rechercher (id, email, nom, statut)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyUrlSearch(search);
          }}
        />
        <button className="btn-secondary" onClick={() => applyUrlSearch(search)}>
          Rechercher
        </button>
        {qFromUrl ? (
          <button className="btn-secondary" onClick={() => applyUrlSearch("")}>
            Effacer
          </button>
        ) : null}
      </div>

      {/* FILTRE */}
      <div className="mb-6 flex gap-4">
        {["all", "paid", "pending_payment"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === type ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type === "all" ? "Toutes" : type === "paid" ? "Payées" : "En attente"}
          </button>
        ))}
      </div>

      {/* ACTIONS GLOBALES */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleSelectAll}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          {selectedOrders.length === visibleOrders.length && visibleOrders.length > 0
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
      ) : visibleOrders.length === 0 ? (
        <p className="text-gray-600">Aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const subtotal = getSubtotal(order);
            const shipping = getShippingPrice(order);
            const total = getTotal(order);

            const name =
              typeof order.items?.[0]?.name === "string"
                ? order.items[0].name
                : order.shippingAddress?.name || "Client";

            return (
              <div key={order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <p className="font-semibold">{order.shippingAddress?.name || name}</p>
                    <p className="text-sm text-gray-500">{order.email || "—"}</p>
                    <p className="text-xs text-gray-400">{order.id}</p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-semibold">{total.toFixed(2)} €</p>
                    <p
                      className={`text-xs px-2 py-1 rounded-full inline-block ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "paid" ? "Payée" : "En attente"}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
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
                        {order.shippingAddress?.postalCode} {order.shippingAddress?.city}
                      </p>
                      {order.shippingAddress?.country ? <p>{order.shippingAddress.country}</p> : null}
                      <p>{order.shippingAddress?.phone}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-1">Livraison</h3>
                      <p>{order.shippingMethod?.name || "—"}</p>
                      <p className="font-semibold">{shipping.toFixed(2)} €</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold mb-2">Produits</h3>

                      {order.items?.map((item, i) => {
                        const price = getItemPrice(item);
                        const itemName =
                          typeof item.name === "string"
                            ? item.name
                            : item.name.fr || item.name.en || "Produit";

                        return (
                          <div
                            key={i}
                            className="flex justify-between bg-white border rounded-md p-3 mb-2"
                          >
                            <div>
                              <p className="font-medium">{itemName}</p>
                              <p className="text-xs text-gray-500">Qté : {item.quantity}</p>
                            </div>
                            <p className="font-semibold">{price.toFixed(2)} €</p>
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
