"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import "./styles/admin.css";
import "./styles/adminlogin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");

    // 🔐 Pas connecté → tout sauf /admin/login redirige vers /admin/login
    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
      return;
    }

    // ✅ Déjà connecté → si on est sur /admin/login, on redirige vers /admin
    if (token && pathname === "/admin/login") {
      router.replace("/admin");
      return;
    }

    setAuthChecked(true);
  }, [pathname, router]);

  // ⏳ On attend d'avoir vérifié l'auth avant d'afficher les pages protégées
  if (!authChecked && pathname !== "/admin/login") {
    return null;
  }

  // 🧾 Page de login → pas de sidebar / header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 🎨 Layout admin normal pour tout le reste
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <AdminHeader />
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
