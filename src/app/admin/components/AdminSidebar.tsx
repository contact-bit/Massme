"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Truck } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const nav = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/orders", label: "Commandes", icon: <Package size={18} /> },
    { href: "/admin/products", label: "Produits", icon: <ShoppingBag size={18} /> },
    { href: "/admin/shipping", label: "Livraison", icon: <Truck size={18} /> },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">Vitrectomed Admin</div>

      <nav className="admin-nav">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              "admin-nav-link " + (pathname === item.href ? "active" : "")
            }
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
