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
    <div className="topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <div className="topbar-title">
          <div>
            <div className="topbar-main">Commandes</div>
            <div className="topbar-sub">
              Gestion des commandes clients
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {/* BULK ACTION */}
        {selectedCount > 0 && (
          <button
            className="btn-danger"
            onClick={onClearSelection}
          >
            Supprimer ({selectedCount})
          </button>
        )}

        <button
          className="btn-primary"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Chargement..." : "Actualiser"}
        </button>

      </div>
    </div>
  );
}
