"use client";

import { useCallback, useRef, useState } from "react";

import type {
  Order,
  ShippingStatus,
} from "../domain/types";

import {
  normalizeOrders,
} from "../domain/orderNormalize";

export function useOrders(
  toastIt: (m: string) => void
) {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState<
      Record<string, boolean>
    >({});

  const didFetchRef =
    useRef(false);

  /* =========================================================
     FETCH ORDERS
  ========================================================= */

  const fetchOrders =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          "/api/admin/orders",
          {
            cache: "no-store",
          }
        );

        const txt =
          await res.text();

        if (!res.ok) {
          throw new Error(
            txt ||
              `HTTP ${res.status}`
          );
        }

        const json =
          JSON.parse(txt);

        const list: Order[] =
          Array.isArray(
            json?.orders
          )
            ? json.orders
            : [];

        console.log(
          "🔥 RAW LIST",
          list
        );

        /* =====================================
           NORMALIZE
        ===================================== */

        const normalized =
          normalizeOrders(list);

        /* =====================================
           SAFE ORDERS
        ===================================== */

        const safeOrders =
          normalized.map(
            (o, i) => {
              const raw =
                list[i] as any;

              /* ===============================
                 TOTAL
              =============================== */

              const total =
                typeof raw?.total ===
                "number"
                  ? raw.total
                  : typeof raw
                      ?.totals
                      ?.totalTTC ===
                    "number"
                  ? raw.totals
                      .totalTTC
                  : 0;

              return {
                ...o,

                /* ===========================
                   TOTAL
                =========================== */

                total,
                __total: total,

                /* ===========================
                   RELAY
                =========================== */

                relayPoint:
                  raw?.relayPoint ??
                  null,

                /* ===========================
                   MEDIA / ACQUISITION
                =========================== */

                heardFrom:
                  raw?.heardFrom ??
                  null,

                heardFromOther:
                  raw?.heardFromOther ??
                  null,
              };
            }
          );

        console.log(
          "✅ SAFE ORDERS",
          safeOrders
        );

        setOrders(safeOrders);
      } catch (e: any) {
        console.error(e);

        setError(
          e?.message ||
            "Erreur chargement commandes"
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    }, []);

  /* =========================================================
     INIT
  ========================================================= */

  const initOnce =
    useCallback(async () => {
      if (
        didFetchRef.current
      ) {
        return;
      }

      didFetchRef.current = true;

      await fetchOrders();
    }, [fetchOrders]);

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteOrder =
    useCallback(
      async (
        id: string,
        onAfter?: () => void
      ) => {
        const ok = confirm(
          "Supprimer cette commande ? (irréversible)"
        );

        if (!ok) return;

        if (deleting[id]) {
          return;
        }

        try {
          setDeleting((m) => ({
            ...m,
            [id]: true,
          }));

          const res =
            await fetch(
              `/api/admin/orders/${encodeURIComponent(
                id
              )}`,
              {
                method: "DELETE",

                cache: "no-store",
              }
            );

          const txt =
            await res.text();

          if (!res.ok) {
            throw new Error(
              txt ||
                `HTTP ${res.status}`
            );
          }

          setOrders((prev) =>
            prev.filter(
              (o) => o.id !== id
            )
          );

          toastIt(
            "Commande supprimée ✅"
          );

          onAfter?.();
        } catch (e: any) {
          toastIt(
            "Erreur suppression ❌"
          );

          alert(
            e?.message ??
              "Erreur suppression"
          );
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

  /* =========================================================
     UPDATE SHIPPING
  ========================================================= */

  const updateShippingStatus =
    useCallback(
      async (
        order: Order,
        nextStatus: ShippingStatus
      ) => {
        const isPickup =
          order.shippingMethod?.name
            ?.toLowerCase()
            .includes(
              "retrait"
            ) ?? false;

        let tracking:
          | string
          | null =
          order.trackingNumber ??
          null;

        try {
          const res =
            await fetch(
              `/api/admin/orders/${encodeURIComponent(
                order.id
              )}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify(
                  {
                    shippingStatus:
                      nextStatus,

                    trackingNumber:
                      isPickup
                        ? null
                        : tracking,

                    carrier:
                      isPickup
                        ? null
                        : order.carrier ||
                          "mondialrelay",
                  }
                ),
              }
            );

          const txt =
            await res.text();

          if (!res.ok) {
            throw new Error(
              txt ||
                `HTTP ${res.status}`
            );
          }

          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,

                    shippingStatus:
                      nextStatus,

                    trackingNumber:
                      isPickup
                        ? null
                        : tracking,

                    carrier:
                      isPickup
                        ? null
                        : order.carrier ||
                          "mondialrelay",
                  }
                : o
            )
          );

          toastIt(
            isPickup
              ? "Commande prête en retrait ✅"
              : nextStatus ===
                "shipped"
              ? "Colis expédié ✅"
              : nextStatus ===
                "delivered"
              ? "Colis livré ✅"
              : "Statut mis à jour"
          );
        } catch (e: any) {
          toastIt(
            "Erreur mise à jour livraison ❌"
          );

          alert(
            e?.message ??
              "Erreur mise à jour livraison"
          );

        }
      },
      [toastIt]
    );

  const updateShippingAddress =
    useCallback(
      async (
        order: Order,
        shippingAddress: Record<string, unknown>
      ) => {
        try {
          const res =
            await fetch(
              `/api/admin/orders/${encodeURIComponent(
                order.id
              )}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  shippingAddress,
                }),
              }
            );

          const data = await res
            .json()
            .catch(() => null);

          if (!res.ok || !data?.ok) {
            throw new Error(
              data?.error ||
                `HTTP ${res.status}`
            );
          }

          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,
                    shippingAddress,
                  }
                : o
            )
          );

          toastIt(
            "Informations de livraison mises à jour ✅"
          );
        } catch (e: any) {
          toastIt(
            "Erreur mise à jour livraison ❌"
          );

          alert(
            e?.message ??
              "Erreur mise à jour livraison"
          );

          throw e;
        }
      },
      [toastIt]
    );

  const updateBillingAddress =
    useCallback(
      async (
        order: Order,
        billingAddress: Record<string, unknown>
      ) => {
        try {
          const res =
            await fetch(
              `/api/admin/orders/${encodeURIComponent(
                order.id
              )}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  billingAddress,
                }),
              }
            );

          const data = await res
            .json()
            .catch(() => null);

          if (!res.ok || !data?.ok) {
            throw new Error(
              data?.error ||
                `HTTP ${res.status}`
            );
          }

          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,
                    billingAddress,
                  }
                : o
            )
          );

          toastIt(
            "Adresse de facturation mise à jour ✅"
          );
        } catch (e: any) {
          toastIt(
            "Erreur mise à jour facturation ❌"
          );

          alert(
            e?.message ??
              "Erreur mise à jour facturation"
          );

          throw e;
        }
      },
      [toastIt]
    );

  /* =========================================================
     EXPORT
  ========================================================= */

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
    updateShippingAddress,
    updateBillingAddress,
  };
}
