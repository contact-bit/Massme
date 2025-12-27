"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import "./styles/admin.css";
import "./styles/admin-login.css";

import AdminNavbar from "./components/AdminNavbar";

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

  // ⏳ On attend la vérif auth pour éviter le flash
  if (!authChecked && pathname !== "/admin/login") {
    return null;
  }

  // 🧾 Login → pas de navbar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ✅ Layout admin normal (navbar)
  return (
    <div className="admin-shell">
      <AdminNavbar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
