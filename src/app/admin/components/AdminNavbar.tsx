"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Item = { label: string; href: string };

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const items: Item[] = [
    { label: "Dashboard", href: "/admin" },
    { label: "Produits", href: "/admin/products" },
    { label: "Commandes", href: "/admin/orders" },
    { label: "Livraison", href: "/admin/shipping" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <Link href="/admin" className="admin-topbar-brand">
          Admin
        </Link>

        <nav className="admin-topbar-nav" aria-label="Admin navigation">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`admin-topbar-link ${isActive(it.href) ? "active" : ""}`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="admin-topbar-right">
          <button className="admin-topbar-logout" onClick={logout} type="button">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
