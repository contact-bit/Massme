"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../styles/admin-navbar.css";

type Notif = {
  id: string;
  title: string;
  desc: string;
  href?: string;
  tone: "info" | "success" | "warning" | "danger";
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const tabs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Commandes" },
    { href: "/admin/products", label: "Produits" },
    { href: "/admin/shipping", label: "Livraison" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  /* =========================
     FETCH NOTIFS (simple)
  ========================= */
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const o = json?.lastOrders?.[0];
        if (!o) return;

        setNotifs([
          {
            id: o.id,
            title:
              o.status === "paid"
                ? "Commande payée"
                : "Commande à traiter",
            desc: `${o.email} • ${o.total.toFixed(2)} €`,
            href: `/admin/orders?q=${o.id}`,
            tone: o.status === "paid" ? "success" : "warning",
          },
        ]);
      })
      .catch(() => {});
  }, []);

  /* =========================
     CLICK OUTSIDE
  ========================= */
  useEffect(() => {
    if (!open) return;

    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        btnRef.current?.contains(t)
      )
        return;
      setOpen(false);
    }

    window.addEventListener("mousedown", onClick);
    return () =>
      window.removeEventListener("mousedown", onClick);
  }, [open]);

  function logout() {
    localStorage.clear();
    router.replace("/admin/login");
  }

  return (
    <>
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          {/* BRAND */}
          <Link href="/admin" className="admin-logo">
            OculaRest <span>Admin</span>
          </Link>

          {/* NAV */}
          <nav className="admin-nav">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`admin-nav-link ${
                  isActive(t.href) ? "active" : ""
                }`}
              >
                {t.label}
                <span className="nav-underline" />
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="admin-actions">
            <button
              ref={btnRef}
              className="admin-notif-btn"
              onClick={() => setOpen((v) => !v)}
            >
              🔔
              {notifs.length > 0 && (
                <span className="notif-badge">
                  {notifs.length}
                </span>
              )}
            </button>

            <button
              className="admin-logout"
              onClick={logout}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFS PANEL */}
      {open && (
        <div className="notif-panel" ref={panelRef}>
          <h4>Notifications</h4>

          {notifs.length === 0 ? (
            <p className="notif-empty">
              Aucune notification
            </p>
          ) : (
            notifs.map((n) => (
              <button
                key={n.id}
                className={`notif-item tone-${n.tone}`}
                onClick={() => {
                  setOpen(false);
                  n.href && router.push(n.href);
                }}
              >
                <strong>{n.title}</strong>
                <span>{n.desc}</span>
              </button>
            ))
          )}
        </div>
      )}
    </>
  );
}
