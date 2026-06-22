"use client";

import React from "react";
import type { Order } from "../domain/types";
import OrdersTable from "./OrdersTable";
import { OrdersCards } from "./OrdersCards";

type Props = {
  activeId: string | null;

  loading: boolean;
  error?: string | null;
  filteredCount: number;

  pagination: {
    currentPage: number;
    totalPages: number;
    paged: Order[];
    setPage: React.Dispatch<
      React.SetStateAction<number>
    >;
  };

  selection: {
    selected: Record<string, boolean>;
    setSelected: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
    selectedIds: string[];
    toggleOne: (id: string) => void;
  };

  deleting: Record<string, boolean>;

  onOpen: (id: string) => void;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;

  onMarkAsPaid: (id: string) => Promise<void>; // 💥 FIX PRINCIPAL
};

/* ================= DESIGN ================= */

const T = {
  surface: "#0d1117",
  border: "rgba(255,255,255,0.07)",
  text: "#f0f2f5",
  textMuted: "rgba(255,255,255,0.25)",
  primaryFaint: "rgba(99,102,241,0.12)",
  radius: "12px",
  radiusSm: "8px",
};

const S: Record<string, React.CSSProperties> = {
  block: { display: "flex", flexDirection: "column" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "14px",
  },

  sub: {
    fontSize: "12px",
    color: T.textMuted,
  },

  headerRight: { display: "flex", alignItems: "center", gap: "10px" },

  selectedBadge: {
    height: "26px",
    padding: "0 10px",
    borderRadius: "999px",
    background: T.primaryFaint,
    color: "#a5b4fc",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusSm,
    padding: "3px",
  },

  pageBtn: {
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    color: T.text,
    cursor: "pointer",
  },

  pageInfo: {
    fontSize: "12px",
    padding: "0 8px",
  },

  card: {
    background: "transparent",
    border: "none",
    borderRadius: "0",
    overflow: "hidden",
  },

  empty: {
    padding: "52px",
    textAlign: "center",
    color: T.textMuted,
  },

  loadingWrap: {
    padding: "40px",
    textAlign: "center",
    color: T.textMuted,
  },

  errorWrap: { padding: "24px" },

  desktopOnly: { display: "block" },
  mobileOnly: { display: "none" },
};

/* ================= COMPONENT ================= */

export function OrdersList({
  activeId,
  loading,
  error,
  filteredCount,
  pagination,
  selection,
  deleting,
  onOpen,
  onCopyId,
  onDelete,
  onMarkAsPaid,
}: Props) {
  const { currentPage, totalPages, paged, setPage } = pagination;

  return (
    <div style={S.block}>
      {/* HEADER */}
      <div className="admin-table-list-header" style={S.header}>
        <div>
          <div className="admin-table-list-count" style={S.sub}>
            {filteredCount} résultat{filteredCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="admin-table-list-header-right" style={S.headerRight}>
          {selection.selectedIds.length > 0 && (
            <div style={S.selectedBadge}>
              {selection.selectedIds.length} sélectionné
            </div>
          )}

          <div className="admin-table-pagination orders-page-pagination" style={S.pagination}>
            <button
              className="admin-table-pagination-btn orders-page-btn"
              style={S.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ←
            </button>

            <span className="admin-table-pagination-indicator orders-page-indicator" style={S.pageInfo}>
              {currentPage} / {totalPages || 1}
            </span>

            <button
              className="admin-table-pagination-btn orders-page-btn"
              style={S.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div style={S.card}>
        {loading ? (
          <div style={S.loadingWrap}>Chargement…</div>
        ) : error ? (
          <div style={S.errorWrap}>{error}</div>
        ) : filteredCount === 0 ? (
          <div style={S.empty}>Aucune commande trouvée</div>
        ) : (
          <>
            {/* DESKTOP */}
            <div style={S.desktopOnly}>
              <OrdersTable
  orders={paged}
  activeId={activeId}
  onOpen={onOpen}
  onDelete={onDelete}
  deleting={deleting}
  onMarkAsPaid={onMarkAsPaid}
/>
            </div>

            {/* MOBILE */}
            <div style={S.mobileOnly}>
              <OrdersCards
                orders={paged}
                selected={selection.selected}
                onToggleOne={selection.toggleOne}
                onOpen={onOpen}
                onDelete={onDelete}
                deleting={deleting}
                onCopyId={onCopyId}
                onMarkAsPaid={onMarkAsPaid} // 💥 FIX
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
