"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  copyText,
  compactId,
} from "./domain/utils";

import type { Order } from "./domain/types";

import { useToast } from "./hooks/useToast";
import { useOrders } from "./hooks/useOrders";
import { useSelection } from "./hooks/useSelection";
import { usePagination } from "./hooks/usePagination";
import { useOrderFilters } from "./hooks/useOrderFilters";

import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { OrdersList } from "./components/OrdersList";

/* ================= HELPERS ================= */

function getOrderLabel(o?: Order | null) {
  return o?.orderNumber || (o?.id ? compactId(o.id) : "—");
}

export default function AdminOrdersPage() {
  const { toast, toastIt } = useToast();

  const {
    orders,
    loading,
    error,
    deleting,
    fetchOrders,
    initOnce,
    deleteOrder,
  } = useOrders(toastIt);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const filters = useOrderFilters("", "");

  const filtered = useMemo(
    () => filters.apply(orders),
    [orders, filters]
  );

  const pagination = usePagination(filtered, 12);

  const selection = useSelection();

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id: string) => {
    await deleteOrder(id, () => {
      selection.setSelected((prev) => {
        const next = { ...prev };

        delete next[id];

        return next;
      });
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await fetch("/api/mark-as-paid", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId: id,
        }),
      });

      await fetchOrders();

      toastIt("Commande marquée comme payée ✅");
    } catch {
      toastIt("Erreur paiement ❌");
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <Toast message={toast} />

      <div className="flex flex-col gap-5 h-full">

        <TopBar
          loading={loading}
          onRefresh={fetchOrders}
          selectedCount={selection.selectedIds.length}
          onClearSelection={selection.clearSelection}
        />

        <section className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden flex-1 min-h-0 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">

          <div className="h-full overflow-y-auto">

            <OrdersList
              activeId={activeId}
              loading={loading}
              error={error}
              filteredCount={filtered.length}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                paged: pagination.paged as Order[],
                setPage: pagination.setPage as any,
              }}
              selection={selection}
              deleting={deleting}
              onOpen={(id) => setActiveId(id)}
              onCopyId={async (id) => {
                const order = orders.find(
                  (o) => o.id === id
                );

                await copyText(
                  getOrderLabel(order)
                );

                toastIt("Copié ✅");
              }}
              onDelete={handleDelete}
              onMarkAsPaid={handleMarkAsPaid}
            />

          </div>

        </section>
      </div>
    </>
  );
}