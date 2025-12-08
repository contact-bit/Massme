"use client";

import { usePathname, useRouter } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  let title = "Admin";
  if (pathname.startsWith("/admin/orders")) title = "Commandes";
  else if (pathname.startsWith("/admin/products")) title = "Produits";
  else if (pathname.startsWith("/admin/shipping")) title = "Livraison";
  else if (pathname === "/admin") title = "Dashboard";

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  };

  return (
    <header className="admin-header">
      <h2>{title}</h2>
      <button onClick={logout} className="btn-logout">
        Déconnexion
      </button>
    </header>
  );
}
