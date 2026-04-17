"use client";

import type { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root">
      <div className="admin-layout">
        <AdminNavbar />

        <div className="admin-layout-main">
          <div className="admin-shell-inner">
            <main className="admin-main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}