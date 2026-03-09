"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CartProvider } from "@/context/CartContext";

import "./styles/admin.css";
import "./styles/admin-login.css";

import AdminShell from "./components/AdminShell";

type AdminRole = "admin" | "logistics";

function isAllowedForRole(pathname: string, role: AdminRole) {
  if (role === "admin") return true;

  // logistics: accès très limité
  if (role === "logistics") {
    return (
      pathname === "/admin/logistics" ||
      pathname.startsWith("/admin/logistics/") ||
      pathname === "/admin/login"
    );
  }

  return false;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = pathname === "/admin/login";
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    const role = (localStorage.getItem("admin_role") || "admin") as AdminRole;

    if (!token && !isLogin) {
      router.replace("/admin/login");
      return;
    }

    if (token && isLogin) {
      router.replace(role === "logistics" ? "/admin/logistics" : "/admin");
      return;
    }

    if (token && !isLogin && !isAllowedForRole(pathname, role)) {
      router.replace(role === "logistics" ? "/admin/logistics" : "/admin");
      return;
    }

    setAuthChecked(true);
  }, [router, pathname, isLogin]);

  if (!authChecked && !isLogin) return null;

  if (isLogin) {
    return <CartProvider>{children}</CartProvider>;
  }

  return (
    <CartProvider>
      <AdminShell>{children}</AdminShell>
    </CartProvider>
  );
}