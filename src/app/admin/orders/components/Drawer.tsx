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
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawerBackdrop ${open ? "drawerBackdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`drawer ${open ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={title}
      >
        <div className="drawerHead">
          <div className="drawerTitle">{title}</div>

          <button
            type="button"
            className="iconBtn"
            onClick={onClose}
            aria-label="Fermer le panneau"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="drawerBody">{children}</div>
      </aside>
    </>
  );
}