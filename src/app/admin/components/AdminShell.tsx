"use client";

import type { ReactNode } from "react";
import AdminTopbar from "./AdminTopbar";
import AdminTabs from "./AdminTabs";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminTopbar />
      <div className="admin-shell-inner">
        <AdminTabs />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
