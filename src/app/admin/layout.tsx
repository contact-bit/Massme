"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

    if (!token && !isLogin) {
      router.replace("/admin/login");
      return;
    }
    if (token && isLogin) {
      router.replace("/admin");
      return;
    }

    setAuthChecked(true);
  }, [router, isLogin]);

  if (!authChecked && !isLogin) return null;
  if (isLogin) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
