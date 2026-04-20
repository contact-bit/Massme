"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import "../styles/admin-navbar.css";

type AdminRole = "admin" | "logistics";

type Tab = {
  href: string;
  label: string;
  short: string;
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("admin_role") as AdminRole | null)
      : "admin";

  const tabs: Tab[] = useMemo(() => {
    if (role === "logistics") {
      return [
        {
          href: "/admin/logistics",
          label: "Logistique",
          short: "Logistique",
        },
      ];
    }

    return [
      { href: "/admin", label: "Dashboard", short: "Dashboard" },
      { href: "/admin/orders", label: "Commandes", short: "Commandes" },
      { href: "/admin/products", label: "Produits", short: "Produits" },
      { href: "/admin/logistics", label: "Logistique", short: "Logistique" },
      { href: "/admin/shipping", label: "Livraison", short: "Livraison" },
      { href: "/admin/payment-methods", label: "Paiement", short: "Paiement" },
      { href: "/admin/reviews", label: "Avis clients", short: "Avis" },
      { href: "/admin/export", label: "Exports", short: "Exports" },
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
    <>
      <header className="admin-topbar">
        <div className="admin-topbar-inner">

          {/* LOGO */}
          <Link
            href={role === "logistics" ? "/admin/logistics" : "/admin"}
            className="admin-logo"
          >
            Vitrectomed
            <span>Admin</span>
          </Link>

          {/* NAV DESKTOP */}
          <div className="admin-nav-scroll">
            <nav className="admin-nav">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`admin-nav-link ${
                    isActive(tab.href) ? "active" : ""
                  }`}
                >
                  {tab.short}
                </Link>
              ))}
            </nav>
          </div>

          {/* ACTIONS */}
          <div className="admin-actions">
            <button className="admin-burger" onClick={() => setOpen(true)}>
              ☰
            </button>

            <button className="admin-logout" onClick={logout}>
              Déconnexion
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`admin-mobile-menu ${open ? "open" : ""}`}>
        <div className="admin-mobile-header">
          <span>Navigation</span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <nav className="admin-mobile-nav">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setOpen(false)}
              className={`admin-mobile-link ${
                isActive(tab.href) ? "active" : ""
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <button className="admin-mobile-logout" onClick={logout}>
          Déconnexion
        </button>
      </div>

      {/* BACKDROP */}
      {open && <div className="admin-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
}