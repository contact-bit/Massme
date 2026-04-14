"use client";
import { useCallback, useRef, useState } from "react";
import type { Order, ShippingStatus } from "../domain/types";
import { normalizeOrders } from "../domain/orderNormalize";

export function useOrders(toastIt: (m: string) => void) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const didFetchRef = useRef(false);

  const requirePassOrRedirect = () => {
    const pass = localStorage.getItem("admin_password") || "";
    if (!pass) {
      window.location.href = "/admin/login";
      return null;
    }
    return pass;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const pass = requirePassOrRedirect();
      if (!pass) return;

      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      const json = JSON.parse(txt);
      const list: Order[] = Array.isArray(json?.orders) ? json.orders : [];

      // 🔥 FIX CRITIQUE : on réinjecte relayPoint après normalize
      const normalized = normalizeOrders(list);

      const safeOrders = normalized.map((o, i) => ({
        ...o,
        relayPoint: (list[i] as any)?.relayPoint ?? null,
      }));

      setOrders(safeOrders);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const initOnce = useCallback(async () => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    await fetchOrders();
  }, [fetchOrders]);

  const deleteOrder = useCallback(
    async (id: string, onAfter?: () => void) => {
      const ok = confirm("Supprimer cette commande ? (irréversible)");
      if (!ok) return;

      const pass = requirePassOrRedirect();
      if (!pass) return;

      if (deleting[id]) return;

      try {
        setDeleting((m) => ({ ...m, [id]: true }));

        const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { "x-admin-password": pass },
          cache: "no-store",
        });

        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

        setOrders((prev) => prev.filter((o) => o.id !== id));
        toastIt("Commande supprimée ✅");
        onAfter?.();
      } catch (e: any) {
        toastIt("Erreur suppression ❌");
        alert(e?.message ?? "Erreur suppression");
      } finally {
        setDeleting((m) => {
          const n = { ...m };
          delete n[id];
          return n;
        });
      }
    },
    [deleting, toastIt]
  );

  const updateShippingStatus = useCallback(
    async (order: Order, nextStatus: ShippingStatus) => {
      const pass = requirePassOrRedirect();
      if (!pass) return;

      const isPickup =
        order.shippingMethod?.name
          ?.toLowerCase()
          .includes("retrait") ?? false;

      let tracking: string | null = order.trackingNumber ?? null;

      try {
        const res = await fetch(
          `/api/admin/orders/${encodeURIComponent(order.id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": pass,
            },
            body: JSON.stringify({
              shippingStatus: nextStatus,
              trackingNumber: isPickup ? null : tracking,
              carrier: isPickup
                ? null
                : order.carrier || "mondialrelay",
            }),
          }
        );

        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  shippingStatus: nextStatus,
                  trackingNumber: isPickup ? null : tracking,
                  carrier: isPickup
                    ? null
                    : order.carrier || "mondialrelay",
                }
              : o
          )
        );

        toastIt(
          isPickup
            ? "Commande prête en retrait ✅"
            : nextStatus === "shipped"
            ? "Colis expédié ✅"
            : nextStatus === "delivered"
            ? "Colis livré ✅"
            : "Statut mis à jour"
        );
      } catch (e: any) {
        toastIt("Erreur mise à jour livraison ❌");
        alert(e?.message ?? "Erreur mise à jour livraison");
      }
    },
    [toastIt]
  );

  return {
    orders,
    setOrders,
    loading,
    error,
    deleting,
    fetchOrders,
    initOnce,
    deleteOrder,
    updateShippingStatus,
  };
}