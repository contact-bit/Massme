"use client";

import React, { useEffect, useMemo, useState } from "react";
import { firstDayOfMonthISO, todayISO, copyText, compactId, formatAddress } from "./_domain/utils";
import type { Order } from "./domain/types";

import { useToast } from "./hooks/useToast";
import { useOrders } from "./hooks/useOrders";
import { useSelection } from "./hooks/useSelection";
import { usePagination } from "./hooks/usePagination";
import { useOrderFilters } from "./hooks/useOrderFilters";

import { AdminOrdersStyles } from "./components/AdminOrdersStyles";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { KpiGrid } from "./components/KpiGrid";
import { FiltersBar } from "./components/FiltersBar";
import { OrdersList } from "./components/OrdersList";
import { Drawer } from "./components/Drawer";
import { OrderDetails } from "./components/OrderDetails";

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
    updateShippingStatus,
  } = useOrders(toastIt);

  const filters = useOrderFilters(firstDayOfMonthISO(), todayISO());
  const filtered = useMemo(() => filters.apply(orders), [orders, filters]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const paidCount = filtered.filter((o) => o.status === "paid").length;
    const pendingCount = filtered.filter((o) => o.status === "pending_payment").length;

    const totalEUR = filtered.reduce((sum, o) => sum + (o.__total ?? 0), 0);
    const paidEUR = filtered
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (o.__total ?? 0), 0);
    const avg = count > 0 ? totalEUR / count : 0;

    return { count, paidCount, pendingCount, totalEUR, paidEUR, avg };
  }, [filtered]);

  const pagination = usePagination(filtered, 12);
  const selection = useSelection();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const activeOrder = useMemo(
    () => orders.find((o) => o.id === drawerId) || null,
    [orders, drawerId]
  );

  useEffect(() => {
    initOnce();
  }, [initOnce]);

  const handleDelete = async (id: string) => {
    await deleteOrder(id, () => {
      selection.setSelected((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setDrawerId((curr) => (curr === id ? null : curr));
    });
  };

  return (
    <>
      <AdminOrdersStyles />
      <Toast message={toast} />

      <div className="adminWrap">
        <TopBar
          loading={loading}
          onRefresh={fetchOrders}
          selectedCount={selection.selectedIds.length}
          onClearSelection={selection.clearSelection}
        />

        <KpiGrid stats={stats} from={filters.from} to={filters.to} />

        <FiltersBar
          filters={filters}
          onReset={() => {
            filters.setQ("");
            filters.setStatus("all");
            filters.setSort("date_desc");
            filters.setFrom(firstDayOfMonthISO());
            filters.setTo(todayISO());
            filters.setLang("all");
            pagination.setPage(() => 1);
          }}
          onAnyChange={() => pagination.setPage(() => 1)}
        />

        <OrdersList
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
          onOpen={(id) => setDrawerId(id)}
          onCopyId={async (id) => {
            await copyText(id);
            toastIt("ID copié ✅");
          }}
          onDelete={handleDelete}
          onUpdateShippingStatus={updateShippingStatus}
        />

        <Drawer
          open={!!drawerId}
          onClose={() => setDrawerId(null)}
          title={activeOrder ? `Commande ${compactId(activeOrder.id)}` : "Commande"}
        >
          {!activeOrder ? (
            <div className="muted">Chargement…</div>
          ) : (
            <OrderDetails
              order={activeOrder}
              onCopyId={async () => {
                await copyText(activeOrder.id);
                toastIt("ID copié ✅");
              }}
              onCopyEmail={async () => {
                await copyText(activeOrder.__email || activeOrder.email || "");
                toastIt("Email copié ✅");
              }}
              onCopyAddress={async () => {
                await copyText(formatAddress(activeOrder.shippingAddress));
                toastIt("Adresse copiée ✅");
              }}
            />
          )}
        </Drawer>
      </div>
    </>
  );
}
