"use client";

import type { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminNavbar />
      <div className="admin-shell-inner">
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
