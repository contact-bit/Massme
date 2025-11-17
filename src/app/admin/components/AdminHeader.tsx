"use client";

import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/orders": "Commandes",
    "/admin/products": "Produits",
    "/admin/shipping": "Livraison",
  };

  return (
    <header className="admin-header">
      <h2>{titles[pathname] || "Admin"}</h2>

      <button
        onClick={() => {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
        }}
        className="btn-logout"
      >
        Déconnexion
      </button>
    </header>
  );
}
