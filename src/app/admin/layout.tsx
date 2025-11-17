import type { ReactNode } from "react";
import "./styles/admin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* CONTENT */}
      <div className="admin-content">
        <AdminHeader />
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
