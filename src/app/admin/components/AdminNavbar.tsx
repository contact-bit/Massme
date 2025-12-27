"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Tab = { href: string; label: string };

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs: Tab[] = useMemo(
    () => [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Commandes" },
      { href: "/admin/products", label: "Produits" },
      { href: "/admin/shipping", label: "Livraison" },
    ],
    []
  );

  const [q, setQ] = useState("");

  // Cmd/Ctrl + K focus search (robuste, évite e.key undefined)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (!key) return;

      // ignore IME composition
      // @ts-ignore
      if (e.isComposing) return;

      const isK = key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        const el = document.getElementById(
          "adminQuickSearch"
        ) as HTMLInputElement | null;
        el?.focus();
      }

      // ESC = clear + blur
      if (key === "Escape") {
        const el = document.getElementById(
          "adminQuickSearch"
        ) as HTMLInputElement | null;
        if (document.activeElement === el) {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
        setQ("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/admin/orders?q=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => setQ("");

  const logout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_password");
    router.replace("/admin/login");
  };

  // titre dynamique (plus propre)
  const pageTitle = useMemo(() => {
    const match =
      tabs.find((t) => (t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href)))
        ?.label ?? "Dashboard";
    return match;
  }, [pathname, tabs]);

  return (
    <>
      {/* TOP BAR */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          {/* BRAND */}
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark" aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div className="admin-brand-title">OculaRest</div>
              <div className="admin-brand-sub">Admin</div>
            </div>
          </Link>

          {/* TITLE ZONE */}
          <div className="admin-title-zone">
            <h1 className="admin-h1">{pageTitle}</h1>
            <p className="admin-hint">Gérez produits, commandes et livraisons.</p>
          </div>

          {/* ACTIONS */}
          <div className="admin-actions">
            <form className="admin-search" onSubmit={onSubmit}>
              <input
                id="adminQuickSearch"
                className="admin-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (commande, email, produit)…"
                autoComplete="off"
              />

              {q.trim().length > 0 ? (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={clearSearch}
                  aria-label="Effacer la recherche"
                  title="Effacer"
                >
                  ✕
                </button>
              ) : (
                <span className="admin-search-kbd">⌘K</span>
              )}
            </form>

            <button type="button" className="admin-btn admin-btn-ghost">
              Notifications <span className="admin-pill">3</span>
            </button>

            <button type="button" onClick={logout} className="admin-btn admin-btn-danger">
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="admin-shell-inner">
        <div className="admin-tabs">
          <div className="admin-tabs-inner">
            {tabs.map((t) => {
              const active =
                t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href);

              return (
                <Link key={t.href} href={t.href} className={`admin-tab ${active ? "active" : ""}`}>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
