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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawerBackdrop ${open ? "drawerBackdrop--open" : ""}`}
        onClick={onClose}
      />
      <div className={`drawer ${open ? "drawer--open" : ""}`}>
        <div className="drawerHead">
          <div className="drawerTitle">{title}</div>
          <button className="btn btn--ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="drawerBody">{children}</div>
      </div>
    </>
  );
}
