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
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div className="muted">
        Page {currentPage} / {totalPages}
      </div>
      <button className="btn btn--ghost" onClick={onPrev} disabled={currentPage <= 1}>
        ←
      </button>
      <button className="btn btn--ghost" onClick={onNext} disabled={currentPage >= totalPages}>
        →
      </button>
    </div>
  );
}
