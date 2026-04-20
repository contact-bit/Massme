"use client";
import React, { useEffect } from "react";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  /* ================= ESC KEY ================= */

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ================= LOCK SCROLL ================= */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`admin-drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside
        className={`admin-drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* HEADER */}
        <div className="admin-drawer-header">
          <div className="admin-drawer-title">{title}</div>

          <button
            type="button"
            className="admin-icon-btn btn-secondary"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="admin-drawer-body">
          {children}
        </div>
      </aside>
    </>
  );
}