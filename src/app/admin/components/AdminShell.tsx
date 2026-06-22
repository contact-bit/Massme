"use client";

import type { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminCountryScopeBar from "./AdminCountryScopeBar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root">
      <div className="admin-layout">
        <AdminNavbar />
        <AdminCountryScopeBar />

        <div className="admin-layout-main">
          <div className="admin-main">

            {/* 🔥 LE BON CONTAINER */}
            <div className="admin-container">
              {children}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
