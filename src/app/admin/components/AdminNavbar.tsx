"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Tab = { href: string; label: string };

type AlertTone = "info" | "warning" | "success" | "danger";
type AlertItem = {
  id: string;
  tone: AlertTone;
  title: string;
  desc: string;
  actionHref?: string;
  meta?: { orderId?: string; email?: string; amount?: number; createdAt?: string };
};

type LastOrder = {
  id: string;
  status?: string;
  total?: number;
  email?: string;
  createdAt?: string; // ISO
};

type StatsResponse = {
  alerts?: { tone: AlertTone; title: string; desc: string }[];
  lastOrders?: LastOrder[];
  lowStock?: any[];
};

const LS_READ_KEY = "admin_notifs_read_v5";
const LS_LAST_SEEN_ORDER_AT = "admin_last_seen_order_at_v5";
const LS_LAST_ORDER_ID = "admin_last_order_id_v5";

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_READ_KEY);
    const arr = raw ? JSON.parse(raw) : [];
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
function getLastOrderId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_LAST_ORDER_ID) || "";
}
function setLastOrderId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_LAST_ORDER_ID, id);
}

function toneLabel(t: AlertTone) {
  if (t === "success") return "OK";
  if (t === "warning") return "À traiter";
  if (t === "danger") return "Urgent";
  return "Info";
}
function toneIcon(t: AlertTone) {
  if (t === "success") return "✓";
  if (t === "warning") return "!";
  if (t === "danger") return "⚠";
  return "i";
}

// IDs stables
function idAlert(a: { tone: AlertTone; title: string; desc: string }) {
  return `alert:${a.tone}:${a.title}:${a.desc}`;
}
function idOrder(orderId: string) {
  return `order:${orderId}`;
}
function idStock(count: number) {
  return `stock:${count}`;
}

type Toast = {
  id: string;
  tone: AlertTone;
  title: string;
  desc: string;
  href?: string;
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs: Tab[] = useMemo(
    () => [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Commandes" },
      { href: "/admin/products", label: "Produits" },
      { href: "/admin/shipping", label: "Livraison" },
      { href: "/admin/export", label: "Export" },
    ],
    []
  );

  const pageTitle = useMemo(() => {
    return (
      tabs.find((t) => (t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href)))
        ?.label ?? "Dashboard"
    );
  }, [pathname, tabs]);

  const [q, setQ] = useState("");

  const [notifs, setNotifs] = useState<AlertItem[]>([]);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(() => loadReadSet());

  const [toasts, setToasts] = useState<Toast[]>([]);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(() => notifs.filter((n) => !read.has(n.id)).length, [notifs, read]);

  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `toast:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  };

  const pruneReadSet = (set: Set<string>, keepIds: string[]) => {
    const keep = new Set(keepIds);
    const next = new Set<string>();
    for (const id of set) if (keep.has(id)) next.add(id);
    return next;
  };

  // ✅ IMPORTANT: on n’affiche la notif "newest order" QUE si elle est nouvelle depuis la dernière vue
  const fetchNotifs = async (reason: "poll" | "manual" | "focus" = "poll") => {
    try {
      if (typeof window === "undefined") return;

      const adminPassword = localStorage.getItem("admin_password");
      const adminToken = localStorage.getItem("admin_token");

      const headers: Record<string, string> = {};
      if (adminPassword) headers["x-admin-password"] = adminPassword;
      if (adminToken) headers["x-admin-token"] = adminToken;

      const res = await fetch("/api/admin/stats", { headers, cache: "no-store" });
      if (!res.ok) return;

      const json = (await res.json()) as StatsResponse;

      const baseAlerts = Array.isArray(json.alerts) ? json.alerts : [];
      const lastOrders = Array.isArray(json.lastOrders) ? json.lastOrders : [];

      const computed: AlertItem[] = [];

      // 1) Alerts backend
      for (const a of baseAlerts) {
        computed.push({
          id: idAlert(a),
          tone: a.tone,
          title: a.title,
          desc: a.desc,
          actionHref: a.title.toLowerCase().includes("commande") ? "/admin/orders" : "/admin",
        });
      }

      // 2) Smart notif newest order (ONLY IF NEW)
      const newest = lastOrders[0];
      const newestAt = newest?.createdAt ? Date.parse(newest.createdAt) : 0;

      if (newest && newestAt) {
        const isPaid = (newest.status || "") === "paid";
        const lastSeen = getLastSeenAt();
        const lastId = getLastOrderId();

        const isNew = newestAt > lastSeen && newest.id !== lastId;

        if (isNew) {
          const n: AlertItem = {
            id: idOrder(newest.id),
            tone: isPaid ? "success" : "warning",
            title: isPaid ? "Commande payée" : "Commande à traiter",
            desc: `${newest.email ?? "Client"} • ${(newest.total ?? 0).toFixed(2)} €`,
            actionHref: `/admin/orders?q=${encodeURIComponent(newest.email ?? newest.id)}`,
            meta: {
              orderId: newest.id,
              email: newest.email,
              amount: newest.total,
              createdAt: newest.createdAt,
            },
          };

          computed.unshift(n);

          if (reason !== "manual") {
            pushToast({
              tone: n.tone,
              title: isPaid ? "Nouvelle commande payée" : "Nouvelle commande",
              desc: n.desc,
              href: n.actionHref,
            });
          }
        }

        // ✅ on sauvegarde quand même le dernier id vu côté polling
        // (mais la "disparition" est gérée via lastSeenAt quand tu ouvres / marques lu)
        setLastOrderId(newest.id);
      }

      // 3) Low stock
      if (Array.isArray(json.lowStock) && json.lowStock.length > 0) {
        computed.push({
          id: idStock(json.lowStock.length),
          tone: "warning",
          title: "Stock faible",
          desc: `${json.lowStock.length} produit(s) à surveiller.`,
          actionHref: "/admin/products",
        });
      }

      setNotifs(computed);

      // prune read
      setRead((prev) => {
        const next = pruneReadSet(prev, computed.map((x) => x.id));
        if (next.size !== prev.size) saveReadSet(next);
        return next;
      });
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    fetchNotifs("poll");
    const id = window.setInterval(() => fetchNotifs("poll"), 20_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") fetchNotifs("focus");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (!key) return;
      // @ts-ignore
      if (e.isComposing) return;

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === "k") {
        e.preventDefault();
        (document.getElementById("adminQuickSearch") as HTMLInputElement | null)?.focus();
      }
      if (key === "Escape") setOpen(false);
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

  const markAllRead = () => {
    const next = new Set(read);
    notifs.forEach((n) => next.add(n.id));
    setRead(next);
    saveReadSet(next);

    // ✅ c’est CA qui fait “disparaître” la notif newest order au prochain fetch
    setLastSeenAt(Date.now());
  };

  const markOneRead = (id: string) => {
    const next = new Set(read);
    next.add(id);
    setRead(next);
    saveReadSet(next);

    // ✅ pareil
    setLastSeenAt(Date.now());
  };

  const togglePanel = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      // tu ouvres le centre -> tu "as vu"
      setLastSeenAt(Date.now());
      markAllRead();
    }
  };

  const refreshAndClear = async () => {
    await fetchNotifs("manual");
    setLastSeenAt(Date.now());
    markAllRead();
  };

  const asClickable = (onClick: () => void) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
  });

  return (
    <>
      {/* Toasts */}
      <div className="admin-toasts" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-toast tone-${t.tone}`}
            onClick={() => t.href && router.push(t.href)}
            title="Ouvrir"
          >
            <div className="admin-toast-ic">{toneIcon(t.tone)}</div>
            <div className="admin-toast-body">
              <div className="admin-toast-title">{t.title}</div>
              <div className="admin-toast-desc">{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* TOP BAR */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark" aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div className="admin-brand-title">OculaRest</div>
              <div className="admin-brand-sub">Admin</div>
            </div>
          </Link>

          <div className="admin-title-zone">
            <h1 className="admin-h1">Dashboard</h1>
            <p className="admin-hint">Gérez produits, commandes et livraisons.</p>
          </div>

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

            {/* Notifications */}
            <div className="admin-notifs">
              <button
                ref={btnRef}
                type="button"
                onClick={togglePanel}
                className="admin-btn admin-btn-ghost"
              >
                Notifications
                {unreadCount > 0 ? <span className="admin-pill">{unreadCount}</span> : null}
              </button>

              {open && (
                <div ref={panelRef} className="admin-notifs-panel">
                  <div className="admin-notifs-head">
                    <div>
                      <div className="admin-notifs-title">Centre de notifications</div>
                      <div className="admin-notifs-sub">
                        {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Tout est à jour ✅"}
                      </div>
                    </div>

                    <div className="admin-notifs-head-actions">
                      <button
                        type="button"
                        className="admin-notifs-iconbtn"
                        onClick={refreshAndClear}
                        title="Rafraîchir"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        className="admin-notifs-iconbtn"
                        onClick={markAllRead}
                        title="Tout marquer lu"
                      >
                        ✓
                      </button>
                    </div>
                  </div>

                  <div className="admin-notifs-list">
                    {notifs.length === 0 ? (
                      <div className="admin-notifs-empty">Aucune notification pour le moment.</div>
                    ) : (
                      notifs.map((n) => {
                        const isUnread = !read.has(n.id);
                        const orderId = n.meta?.orderId;
                        const email = n.meta?.email;

                        return (
                          <div key={n.id} className={`admin-notif-row ${isUnread ? "unread" : ""}`}>
                            <div
                              className="admin-notif-main"
                              {...asClickable(() => {
                                markOneRead(n.id);
                                setOpen(false);
                                router.push(n.actionHref ?? "/admin");
                              })}
                            >
                              <span className={`admin-notif-dot tone-${n.tone}`} aria-hidden />
                              <div className="admin-notif-body">
                                <div className="admin-notif-top">
                                  <span className="admin-notif-badge">{toneLabel(n.tone)}</span>
                                  <span className="admin-notif-title">{n.title}</span>
                                </div>

                                <div className="admin-notif-desc">{n.desc}</div>

                                {(email || orderId) && (
                                  <div className="admin-notif-actions">
                                    {orderId && (
                                      <button
                                        type="button"
                                        className="admin-notif-chip"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markOneRead(n.id);
                                          setOpen(false);
                                          router.push(`/admin/orders?q=${encodeURIComponent(orderId)}`);
                                        }}
                                      >
                                        Voir
                                      </button>
                                    )}

                                    {email && (
                                      <button
                                        type="button"
                                        className="admin-notif-chip"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard?.writeText(email);
                                          pushToast({ tone: "info", title: "Copié", desc: email });
                                        }}
                                      >
                                        Copier email
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="admin-notif-mark"
                              onClick={() => markOneRead(n.id)}
                              title="Marquer comme lu"
                            >
                              {isUnread ? "•" : "✓"}
                            </button>
                          </div>
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
