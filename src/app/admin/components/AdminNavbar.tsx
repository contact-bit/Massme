"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import "../styles/admin-navbar.css";

type AdminRole = "admin" | "logistics";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const role = (typeof window !== "undefined"
    ? localStorage.getItem("admin_role")
    : "admin") as AdminRole | null;

  const tabs = useMemo(() => {
    if (role === "logistics") {
      return [{ href: "/admin/logistics", label: "Logistique" }];
    }

    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Commandes" },
      { href: "/admin/logistics", label: "Logistique" },
      { href: "/admin/products", label: "Produits" },
      { href: "/admin/reviews", label: "Avis" },
      { href: "/admin/shipping", label: "Livraison" },
      { href: "/admin/payment-methods", label: "Méthodes de paiement" },
    ];
  }, [role]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  function logout() {
    localStorage.clear();
    router.replace("/admin/login");
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <Link href={role === "logistics" ? "/admin/logistics" : "/admin"} className="admin-logo">
          Vitectromed <span>Admin</span>
        </Link>

        <nav className="admin-nav">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`admin-nav-link ${isActive(tab.href) ? "active" : ""}`}
            >
              {tab.label}
              <span className="nav-underline" />
            </Link>
          ))}
        </nav>

        <div className="admin-actions">
          <button className="admin-logout" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}