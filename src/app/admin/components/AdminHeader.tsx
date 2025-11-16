"use client";

import Link from "next/link";

export default function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="admin-header">
      {/* LEFT : LOGO + TITLE */}
      <div className="admin-header-left">
        <div className="admin-logo">⚙️ MassMe Admin</div>
      </div>

      {/* RIGHT : NAVIGATION */}
      <nav className="admin-nav">
        <Link href="/admin" className="btn btn-secondary">
          Produits
        </Link>

        <Link href="/admin/shipping" className="btn btn-secondary">
          Livraisons
        </Link>

        <Link href="/admin/orders" className="btn btn-secondary">
          Commandes
        </Link>

        <button className="btn btn-danger" onClick={onLogout}>
          Déconnexion
        </button>
      </nav>
    </header>
  );
}
