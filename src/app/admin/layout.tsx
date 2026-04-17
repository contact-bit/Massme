"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CartProvider } from "@/context/CartContext";

import "./styles/admin.css";
import AdminShell from "./components/AdminShell";

type AdminRole = "admin" | "logistics";

function isAllowedForRole(pathname: string, role: AdminRole) {
  if (role === "admin") return true;

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

  const isLoginPage = pathname === "/admin/login";
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    const role = (localStorage.getItem("admin_role") || "admin") as AdminRole;

    if (!token && !isLoginPage) {
      router.replace("/admin/login");
      return;
    }

    if (token && isLoginPage) {
      router.replace(role === "logistics" ? "/admin/logistics" : "/admin");
      return;
    }

    if (token && !isLoginPage && !isAllowedForRole(pathname, role)) {
      router.replace(role === "logistics" ? "/admin/logistics" : "/admin");
      return;
    }

    setIsReady(true);
  }, [router, pathname, isLoginPage]);

  if (!isLoginPage && !isReady) {
    return null;
  }

  return (
    <CartProvider>
      {isLoginPage ? children : <AdminShell>{children}</AdminShell>}
    </CartProvider>
  );
}