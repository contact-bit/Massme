"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from "next/font/google";

import { CartProvider } from "@/context/CartContext";

import "./styles/admin.css";
import AdminShell from "./components/AdminShell";

type AdminRole = "admin" | "logistics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-admin-inter",
});

/* ================= AUTH ================= */

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

/* ================= LAYOUT ================= */

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";
  const [isReady, setIsReady] = useState(isLoginPage);

  useEffect(() => {
    const storedTheme =
      localStorage.getItem("admin_theme") ===
      "light"
        ? "light"
        : "dark";

    document.documentElement.dataset.adminTheme =
      storedTheme;
  }, []);

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_password");
    localStorage.removeItem("admin_role");

    if (isLoginPage) {
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      const response = await fetch("/api/admin/session", {
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/admin/login");
        return;
      }

      const data = (await response.json()) as { role?: AdminRole };
      const role = data.role === "logistics" ? "logistics" : "admin";

      if (!isAllowedForRole(pathname, role)) {
        router.replace(role === "logistics" ? "/admin/logistics" : "/admin");
        return;
      }

      if (!cancelled) setIsReady(true);
    };

    validateSession().catch(() => {
      router.replace("/admin/login");
    });

    return () => {
      cancelled = true;
    };
  }, [router, pathname, isLoginPage]);

  if (!isLoginPage && !isReady) return null;

  /* ================= RENDER ================= */

  return (
    <CartProvider>
      <div
        className={`${inter.variable} admin-font-root`}
      >
        {isLoginPage ? (
          children
        ) : (
          <div className="admin-root min-h-screen flex">

            {/* SHELL (navbar / layout global) */}
            <AdminShell>

              {/* MAIN CONTENT — FULL WIDTH */}
              <main className="w-full">

                {/* CONTAINER CLEAN (PAS DE max-w ici) */}
                <div className="w-full px-5 md:px-8 xl:px-10 py-5 md:py-6 flex flex-col gap-6">
                  {children}
                </div>

              </main>

            </AdminShell>

          </div>
        )}
      </div>
    </CartProvider>
  );
}
