"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../styles/admin-navbar.css";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Commandes" },
    { href: "/admin/products", label: "Produits" },
    { href: "/admin/reviews", label: "Avis" },
    { href: "/admin/shipping", label: "Livraison" },
    { href: "/admin/payment-methods", label: "Méthodes de paiement" },
  ];

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
        
        {/* BRAND */}
        <Link href="/admin" className="admin-logo">
          OculaRest <span>Admin</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`admin-nav-link ${
                isActive(tab.href) ? "active" : ""
              }`}
            >
              {tab.label}
              <span className="nav-underline" />
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="admin-actions">
          <button className="admin-logout" onClick={logout}>
            Déconnexion
          </button>
        </div>

      </div>
    </header>
  );
}