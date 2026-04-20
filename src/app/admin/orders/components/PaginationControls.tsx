"use client";
import React from "react";

export function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="pagination">

      {/* INFO */}
      <div className="pagination-info">
        Page <strong>{currentPage}</strong>
        <span className="muted"> / {totalPages}</span>
      </div>

      {/* ACTIONS */}
      <div className="pagination-actions">
        <button
          className="pagination-btn"
          onClick={onPrev}
          disabled={currentPage <= 1}
        >
          ←
        </button>

        <button
          className="pagination-btn"
          onClick={onNext}
          disabled={currentPage >= totalPages}
        >
          →
        </button>
      </div>

    </div>
  );
}