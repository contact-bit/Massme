"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const pageTitle = useMemo(() => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname?.startsWith("/admin/products")) return "Produits";
    if (pathname?.startsWith("/admin/orders")) return "Commandes";
    if (pathname?.startsWith("/admin/shipping")) return "Livraison";
    if (pathname?.startsWith("/admin/payment-methods")) return "Méthodes de paiement";
    return "Admin";
  }, [pathname]);

  const pageHint = useMemo(() => {
    if (pathname === "/admin") {
      return "Gérez la performance globale de votre boutique.";
    }
    if (pathname?.startsWith("/admin/products")) {
      return "Gérez votre catalogue produits.";
    }
    if (pathname?.startsWith("/admin/orders")) {
      return "Suivez et gérez les commandes clients.";
    }
    if (pathname?.startsWith("/admin/shipping")) {
      return "Configurez les méthodes de livraison par pays.";
    }
    if (pathname?.startsWith("/admin/payment-methods")) {
      return "Configurez les méthodes de paiement disponibles par pays.";
    }
    return "Gérez produits, commandes, livraisons et paiements.";
  }, [pathname]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true" />
          <div className="admin-brand-text">
            <div className="admin-brand-title">Vitrectomed</div>
            <div className="admin-brand-sub">Admin</div>
          </div>
        </div>

        <div className="admin-title-zone">
          <h1 className="admin-h1">{pageTitle}</h1>
          <p className="admin-hint">{pageHint}</p>
        </div>

        <div className="admin-actions">
          <div className="admin-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="admin-search-input"
              placeholder="Rechercher (commande, email, produit)…"
            />
            <span className="admin-search-kbd">⌘K</span>
          </div>

          <button className="admin-btn admin-btn-ghost" type="button">
            Notifications
            <span className="admin-pill">3</span>
          </button>

          <button
            className="admin-btn admin-btn-danger"
            onClick={logout}
            type="button"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
