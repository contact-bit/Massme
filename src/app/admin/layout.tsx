"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CartProvider } from "@/context/CartContext";

import "./styles/admin.css";
import "./styles/admin-login.css";

import AdminShell from "./components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = pathname === "/admin/login";
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");

    // 🔐 Pas connecté => tout sauf /admin/login redirige vers login
    if (!token && !isLogin) {
      router.replace("/admin/login");
      return;
    }

    // ✅ Déjà connecté => si on est sur login, on renvoie vers /admin
    if (token && isLogin) {
      router.replace("/admin");
      return;
    }

    setAuthChecked(true);
  }, [router, isLogin]);

  // ⏳ Évite le flash des pages protégées
  if (!authChecked && !isLogin) return null;

  // 🧾 Page login = pas de shell, MAIS provider OK
  if (isLogin) {
    return <CartProvider>{children}</CartProvider>;
  }

  // ✅ Pages admin = shell + provider
  return (
    <CartProvider>
      <AdminShell>{children}</AdminShell>
    </CartProvider>
  );
}
