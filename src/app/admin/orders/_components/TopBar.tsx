"use client";
import React from "react";

export function TopBar({
  loading,
  onRefresh,
  selectedCount,
  onClearSelection,
}: {
  loading: boolean;
  onRefresh: () => void;
  selectedCount: number;
  onClearSelection: () => void;
}) {
  return (
    <div className="topBar">
      <div className="row">
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 className="title">📦 Commandes</h1>
          <div className="sub"></div>
        </div>

        <div className="rowRight">
          <a className="btn btn--ghost" href="/admin/export">
            📤 Export
          </a>
          <button className="btn btn--ghost" onClick={onRefresh} disabled={loading}>
            ↻ Rafraîchir
          </button>

          {selectedCount > 0 ? (
            <button className="btn btn--ghost" onClick={onClearSelection}>
              ✕ ({selectedCount})
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
