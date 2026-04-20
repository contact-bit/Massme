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
import { KpiGrid } from "./components/KpiGrid";
import { OrdersList } from "./components/OrdersList";

/* ================= HELPERS ================= */

function getOrderTotal(o: any): number {
  return o?.total ?? o?.__total ?? o?.totals?.totalTTC ?? 0;
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
  } = useOrders(toastIt); // ✅ FIX (plus de updatePaymentStatus)

  const [activeId, setActiveId] = useState<string | null>(null);

  const filters = useOrderFilters("", "");
  const filtered = useMemo(() => filters.apply(orders), [orders, filters]);

  const stats = useMemo(() => {
    const count = filtered.length;

    const paidOrders = filtered.filter((o) => o.status === "paid");

    const pendingCount = filtered.filter(
      (o) =>
        o.status === "pending_payment" ||
        o.status === "awaiting_bank_transfer"
    ).length;

    const totalEUR = filtered.reduce(
      (sum, o) => sum + getOrderTotal(o),
      0
    );

    const paidEUR = paidOrders.reduce(
      (sum, o) => sum + getOrderTotal(o),
      0
    );

    const avg = count > 0 ? totalEUR / count : 0;

    return {
      count,
      paidCount: paidOrders.length,
      pendingCount,
      totalEUR,
      paidEUR,
      avg,
    };
  }, [filtered]);

  const pagination = usePagination(filtered, 12);
  const selection = useSelection();

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id: string) => {
    await deleteOrder(id, () => {
      selection.setSelected((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    });
  };

  // 💥 VERSION SANS HOOK → API DIRECT
  const handleMarkAsPaid = async (id: string) => {
    try {
      await fetch("/api/mark-as-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: id }),
      });

      await fetchOrders(); // refresh propre

      toastIt("Commande marquée comme payée ✅");
    } catch {
      toastIt("Erreur paiement ❌");
    }
  };

  const getOrderLabel = (o?: Order | null) =>
    o?.orderNumber || (o?.id ? compactId(o.id) : "—");

  /* ================= UI ================= */

  return (
    <>
      <Toast message={toast} />

      <div className="flex flex-col gap-6 h-full">

        <TopBar
          loading={loading}
          onRefresh={fetchOrders}
          selectedCount={selection.selectedIds.length}
          onClearSelection={selection.clearSelection}
        />

        <KpiGrid stats={stats} from={filters.from} to={filters.to} />

        <div className="grid grid-cols-1 gap-4 flex-1 min-h-0">

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">

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
                  const order = orders.find((o) => o.id === id);
                  await copyText(getOrderLabel(order));
                  toastIt("Copié ✅");
                }}
                onDelete={handleDelete}
                onMarkAsPaid={handleMarkAsPaid} // ✅ OK
              />

            </div>
          </div>

        </div>
      </div>
    </>
  );
}