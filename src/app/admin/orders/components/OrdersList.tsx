"use client";

import React from "react";
import type { Order, ShippingStatus } from "../domain/types";
import OrdersTable from "./OrdersTable";
import { OrdersCards } from "./OrdersCards";
import { PaginationControls } from "./PaginationControls";

type Props = {
  loading: boolean;
  error?: string | null;
  filteredCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    paged: Order[];
    setPage: (fn: (p: number) => number) => void;
  };
  selection: {
    selected: Record<string, boolean>;
    setSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    selectedIds: string[];
    toggleOne: (id: string) => void;
  };
  deleting: Record<string, boolean>;
  onOpen: (id: string) => void;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
};

export function OrdersList({
  loading,
  error,
  filteredCount,
  pagination,
  selection,
  deleting,
  onOpen,
  onCopyId,
  onDelete,
}: Props) {
  const { currentPage, totalPages, paged, setPage } = pagination;

  const toggleAllPage = () => {
    selection.setSelected((prev) => {
      const next = { ...prev };

      const allSelected =
        paged.length > 0 && paged.every((o) => prev[o.id]);

      const target = !allSelected;

      for (const o of paged) {
        next[o.id] = target;
      }

      return next;
    });
  };

  return (
    <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
      {/* HEADER */}
      <div className="listHead">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="listTitle">Liste</div>
          <div className="muted">
            {filteredCount} résultat{filteredCount > 1 ? "s" : ""}
          </div>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={{ padding: 16 }} className="muted">
          Chargement…
        </div>
      ) : error ? (
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>
            Erreur
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(11,18,32,.12)",
              background: "rgba(11,18,32,.03)",
              fontSize: 12,
            }}
          >
            {error}
          </pre>
        </div>
      ) : filteredCount === 0 ? (
        <div style={{ padding: 16 }} className="muted">
          Aucune commande.
        </div>
      ) : (
        <>
          {/* TABLE DESKTOP */}
          <OrdersTable
            orders={paged}
            selected={selection.selected}
            onToggleOne={selection.toggleOne}
            onToggleAll={toggleAllPage}
            onOpen={onOpen}
            onCopyId={onCopyId}
            onDelete={onDelete}
            deleting={deleting}
          />

          {/* CARDS MOBILE */}
          <OrdersCards
            orders={paged}
            selected={selection.selected}
            onToggleOne={selection.toggleOne}
            onOpen={onOpen}
            onCopyId={onCopyId}
            onDelete={onDelete}
            deleting={deleting}
          />

          {/* FOOTER */}
          <div className="footer">
            <div className="muted">
              {selection.selectedIds.length > 0
                ? `${selection.selectedIds.length} sélectionnée${
                    selection.selectedIds.length > 1 ? "s" : ""
                  }`
                : ""}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn--ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                ←
              </button>

              <button
                className="btn btn--ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}