"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Tab = { href: string; label: string };

type AlertTone = "info" | "warning" | "success" | "danger";
type AlertItem = {
  tone: AlertTone;
  title: string;
  desc: string;
  actionHref?: string;
};

type LastOrder = {
  id: string;
  status?: "pending_payment" | "paid" | string;
  total?: number;
  email?: string;
  createdAt?: string; // ISO
};

type StatsResponse = {
  alerts?: AlertItem[];
  lastOrders?: LastOrder[];
  lowStock?: any[];
};

const LS_READ_KEY = "admin_notifs_read_v1";
const LS_LAST_SEEN_ORDER_AT = "admin_last_seen_order_at_v1";

function notifId(n: AlertItem) {
  return `${n.tone}|${n.title}|${n.desc}`;
}

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_READ_KEY, JSON.stringify(Array.from(set)));
}

function getLastSeenAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(LS_LAST_SEEN_ORDER_AT);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setLastSeenAt(ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_LAST_SEEN_ORDER_AT, String(ts));
}

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

  // Notifications
  const [notifs, setNotifs] = useState<AlertItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(() => loadReadSet());

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => notifs.filter((n) => !read.has(notifId(n))).length,
    [notifs, read]
  );

  const pageTitle = useMemo(() => {
    return (
      tabs.find((t) =>
        t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href)
      )?.label ?? "Dashboard"
    );
  }, [pathname, tabs]);

  const toneLabel = (tone: AlertTone) => {
    if (tone === "success") return "OK";
    if (tone === "warning") return "Attention";
    if (tone === "danger") return "Urgent";
    return "Info";
  };

  const routeFromNotif = (n: AlertItem) => {
    const t = `${n.title} ${n.desc}`.toLowerCase();
    if (t.includes("commande") || t.includes("order")) return "/admin/orders";
    if (t.includes("stock") || t.includes("produit")) return "/admin/products";
    if (t.includes("livraison") || t.includes("shipping")) return "/admin/shipping";
    return "/admin";
  };

  const fetchNotifs = async () => {
    try {
      if (typeof window === "undefined") return;

      const adminPassword = localStorage.getItem("admin_password");
      const adminToken = localStorage.getItem("admin_token");

      const headers: Record<string, string> = {};
      if (adminPassword) headers["x-admin-password"] = adminPassword;
      if (adminToken) headers["x-admin-token"] = adminToken;

      const res = await fetch("/api/admin/stats", { headers, cache: "no-store" });
      if (!res.ok) {
        // si 401/403 => on ne crashe pas, mais on n'affiche rien
        return;
      }

      const json = (await res.json()) as StatsResponse;

      const baseAlerts = Array.isArray(json.alerts) ? json.alerts : [];
      const lastOrders = Array.isArray(json.lastOrders) ? json.lastOrders : [];

      const computed: AlertItem[] = [...baseAlerts];

      // ✅ Notifs “nouvelles commandes” (même si alerts = [])
      const newest = lastOrders[0];
      const newestAt = newest?.createdAt ? Date.parse(newest.createdAt) : 0;
      const lastSeen = getLastSeenAt();

      if (newest && newestAt && newestAt > lastSeen) {
        const isPaid = (newest.status || "").toString() === "paid";

        computed.unshift({
          tone: isPaid ? "success" : "warning",
          title: isPaid ? "Nouvelle commande payée" : "Nouvelle commande à traiter",
          desc: `${newest.email ?? "Client"} • ${(newest.total ?? 0).toFixed(2)} €`,
          actionHref: "/admin/orders",
        });
      }

      // (Optionnel) low stock => notif
      if (Array.isArray(json.lowStock) && json.lowStock.length > 0) {
        computed.push({
          tone: "warning",
          title: "Stock faible",
          desc: `${json.lowStock.length} produit(s) à surveiller.`,
          actionHref: "/admin/products",
        });
      }

      setNotifs(computed);
    } catch {
      // silencieux
    }
  };

  // Initial + polling léger
  useEffect(() => {
    fetchNotifs();
    const id = window.setInterval(fetchNotifs, 20_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh quand on revient sur l’onglet
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") fetchNotifs();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click outside -> close
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setNotifOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  const markAllRead = () => {
    const next = new Set(read);
    notifs.forEach((n) => next.add(notifId(n)));
    setRead(next);
    saveReadSet(next);

    // ✅ on enregistre “vu jusqu’à la dernière commande”
    // (si une notif "nouvelle commande" existe, on considère qu’elle est vue)
    const newestOrderNotif = notifs.find((n) => n.title.toLowerCase().includes("commande"));
    if (newestOrderNotif) {
      setLastSeenAt(Date.now());
    }
  };

  const openNotifs = () => {
    setNotifOpen((v) => !v);
  };

  // Cmd/Ctrl + K focus search (robuste)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (!key) return;
      // @ts-ignore
      if (e.isComposing) return;

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("adminQuickSearch") as HTMLInputElement | null;
        el?.focus();
      }
      if (key === "Escape") {
        setNotifOpen(false);
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

  const logout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_password");
    router.replace("/admin/login");
  };

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
              <span className="admin-search-kbd">⌘K</span>
            </form>

            {/* NOTIFS */}
            <div className="admin-notifs">
              <button
                ref={btnRef}
                type="button"
                onClick={openNotifs}
                className="admin-btn admin-btn-ghost"
              >
                Notifications
                {unreadCount > 0 && <span className="admin-pill">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div ref={panelRef} className="admin-notifs-panel" role="dialog">
                  <div className="admin-notifs-head">
                    <div>
                      <div className="admin-notifs-title">Notifications</div>
                      <div className="admin-notifs-sub">
                        {notifs.length === 0 ? "Aucune notification." : `${notifs.length} élément(s)`}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="admin-notifs-refresh"
                        onClick={fetchNotifs}
                        title="Rafraîchir"
                      >
                        ↻
                      </button>
                      {notifs.length > 0 && (
                        <button
                          type="button"
                          className="admin-notifs-refresh"
                          onClick={markAllRead}
                          title="Tout marquer comme lu"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="admin-notifs-list">
                    {notifs.length === 0 ? (
                      <div className="admin-notifs-empty">Tout est clean ✅</div>
                    ) : (
                      notifs.map((n) => {
                        const id = notifId(n);
                        const isUnread = !read.has(id);

                        return (
                          <button
                            key={id}
                            type="button"
                            className={`admin-notif ${isUnread ? "unread" : ""}`}
                            onClick={() => {
                              // mark read single
                              const next = new Set(read);
                              next.add(id);
                              setRead(next);
                              saveReadSet(next);

                              setNotifOpen(false);
                              router.push(n.actionHref ?? routeFromNotif(n));
                            }}
                          >
                            <span className={`admin-notif-dot tone-${n.tone}`} aria-hidden />
                            <div className="admin-notif-body">
                              <div className="admin-notif-top">
                                <span className="admin-notif-badge">{toneLabel(n.tone)}</span>
                                <span className="admin-notif-title">{n.title}</span>
                              </div>
                              <div className="admin-notif-desc">{n.desc}</div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
              const active = t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href);
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
