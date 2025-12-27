"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produits", href: "/admin/products" },
  { label: "Commandes", href: "/admin/orders" },
  { label: "Livraison", href: "/admin/shipping" },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <nav className="admin-tabs" aria-label="Admin tabs">
      <div className="admin-tabs-inner">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`admin-tab ${isActive(t.href) ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
