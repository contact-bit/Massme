// src/app/admin/orders/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OrderItem = {
  name?: any;
  price?: number | { eur?: number };
  quantity?: number;
};

type Order = {
  id: string;
  email?: string;
  status?: string;
  createdAt?: any; // Timestamp | string | number

  amount_total?: number; // stripe cents
  total?: number; // eur

  shippingMethod?: { name?: string; price?: number | { eur?: number } };
  shippingPrice?: number;

  items?: OrderItem[];
  shippingAddress?: any;
};

type StatusFilter = "all" | "paid" | "pending_payment" | "refunded" | "canceled";

function moneyEUR(n: number) {
  const v = Math.round((n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function parseCreatedAt(value: any): Date | null {
  if (!value) return null;

  // Firestore Timestamp (admin/sdk) can have toDate()
  if (typeof value === "object" && typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function getItemPrice(it: OrderItem): number {
  const p = it?.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object" && typeof (p as any).eur === "number") return (p as any).eur;
  return 0;
}

function getSubtotal(o: Order): number {
  const items = Array.isArray(o.items) ? o.items : [];
  return items.reduce((sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1), 0);
}

function getShipping(o: Order): number {
  const m = o.shippingMethod?.price;
  if (typeof m === "number") return m;
  if (m && typeof m === "object" && typeof (m as any).eur === "number") return (m as any).eur;
  if (typeof o.shippingPrice === "number") return o.shippingPrice;
  return 0;
}

function getTotal(o: Order): number {
  if (typeof o.amount_total === "number") return o.amount_total / 100;
  if (typeof o.total === "number") return o.total;
  return getSubtotal(o) + getShipping(o);
}

function formatDateFR(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);

  // UI state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>(() => {
    // par défaut: début du mois
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    return first.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => todayISO());

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const adminPasswordRef = useRef<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const pass = localStorage.getItem("admin_password") || "";
      if (!pass) {
        window.location.href = "/admin/login";
        return;
      }
      adminPasswordRef.current = pass;

      // ✅ API list (tu as déjà un endpoint qui renvoie {orders})
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const list: Order[] = Array.isArray(json?.orders) ? json.orders : [];

      setOrders(list);
      setSelected({});
      setPage(1);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering
  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();

    const fromD = from ? new Date(from + "T00:00:00") : null;
    const toD = to ? new Date(to + "T23:59:59") : null;

    return orders
      .map((o) => {
        const created = parseCreatedAt(o.createdAt);
        const total = getTotal(o);
        return { ...o, __created: created, __total: total };
      })
      .filter((o: any) => {
        if (status !== "all" && safeString(o.status) !== status) return false;

        if (fromD || toD) {
          const d: Date | null = o.__created;
          if (!d) return false;
          if (fromD && d.getTime() < fromD.getTime()) return false;
          if (toD && d.getTime() > toD.getTime()) return false;
        }

        if (!qn) return true;

        const hay = [
          o.id,
          o.email,
          o.status,
          (Array.isArray(o.items) ? o.items : [])
            .map((it: any) => (typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || ""))
            .join(" "),
        ]
          .map((x: any) => safeString(x).toLowerCase())
          .join(" | ");

        return hay.includes(qn);
      })
      .sort((a: any, b: any) => {
        const ta = a.__created?.getTime?.() ?? 0;
        const tb = b.__created?.getTime?.() ?? 0;
        return tb - ta;
      });
  }, [orders, q, status, from, to]);

  // Stats
  const stats = useMemo(() => {
    const totalCount = filtered.length;
    const paidCount = filtered.filter((o) => o.status === "paid").length;
    const pendingCount = filtered.filter((o) => o.status === "pending_payment").length;

    const totalEUR = filtered.reduce((sum, o) => sum + getTotal(o), 0);
    const paidEUR = filtered
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + getTotal(o), 0);

    return {
      totalCount,
      paidCount,
      pendingCount,
      totalEUR,
      paidEUR,
    };
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const allPageSelected = useMemo(() => {
    if (paged.length === 0) return false;
    return paged.every((o) => selected[o.id]);
  }, [paged, selected]);

  const toggleAllPage = () => {
    const next = { ...selected };
    const target = !allPageSelected;
    for (const o of paged) next[o.id] = target;
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const clearSelection = () => setSelected({});

  // Actions (stubs propres — on reconnecte ensuite tes vraies routes)
  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // fallback
      const t = document.createElement("textarea");
      t.value = id;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
  };

  const markPaid = async (id: string) => {
    // 👉 à brancher sur TON endpoint (PATCH)
    // ex: /api/admin/orders/{id} ou /api/admin/orders (PATCH body)
    alert(`TODO: marquer payé (orderId=${id}). On reconnecte ensuite l’API.`);
  };

  const deleteOrder = async (id: string) => {
    const ok = confirm("Supprimer cette commande ? (action irréversible)");
    if (!ok) return;

    // 👉 à brancher sur TON endpoint (DELETE)
    alert(`TODO: supprimer (orderId=${id}). On reconnecte ensuite l’API.`);
  };

  const openDetails = (id: string) => {
    // si tu veux une page détail plus tard: /admin/orders/[id]
    // pour l’instant: on peut juste ouvrir un modal plus tard.
    alert(`TODO: détails (orderId=${id}). On reconnecte ensuite la page détail.`);
  };

  return (
    <main className="admin-page" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="admin-title" style={{ marginBottom: 6 }}>
            📦 Commandes
          </h1>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 13 }}>
            Liste + filtres + actions. (On reconnecte ensuite ta liste + actions ici.)
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a className="btn-secondary" href="/admin/export">
            📤 Export
          </a>
          <button className="btn-secondary" onClick={fetchOrders} disabled={loading}>
            ↻ Rafraîchir
          </button>
          {selectedIds.length > 0 && (
            <button className="btn-secondary" onClick={clearSelection}>
              ✕ Désélectionner ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        className="admin-grid"
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <div className="admin-card" style={{ padding: 14 }}>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 12 }}>Commandes</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.totalCount}</div>
        </div>

        <div className="admin-card" style={{ padding: 14 }}>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 12 }}>Payées</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.paidCount}</div>
          <div style={{ marginTop: 4, color: "rgba(11,18,32,.6)", fontSize: 12 }}>
            {moneyEUR(stats.paidEUR)}
          </div>
        </div>

        <div className="admin-card" style={{ padding: 14 }}>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 12 }}>En attente</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.pendingCount}</div>
        </div>

        <div className="admin-card" style={{ padding: 14 }}>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 12 }}>Total période</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{moneyEUR(stats.totalEUR)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginTop: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.8fr 0.7fr 0.7fr auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div className="admin-field">
            <label className="admin-label">Recherche</label>
            <input
              className="admin-input"
              placeholder="ID, email, produit…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Statut</label>
            <select
              className="admin-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">Tous</option>
              <option value="paid">paid</option>
              <option value="pending_payment">pending_payment</option>
              <option value="refunded">refunded</option>
              <option value="canceled">canceled</option>
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label">Du</label>
            <input
              className="admin-input"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Au</label>
            <input
              className="admin-input"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                setQ("");
                setStatus("all");
                // reset dates: mois en cours
                const d = new Date();
                const first = new Date(d.getFullYear(), d.getMonth(), 1);
                setFrom(first.toISOString().slice(0, 10));
                setTo(todayISO());
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid rgba(11,18,32,.08)",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.7)" }}>
              {selectedIds.length} sélectionnée(s)
            </div>

            <button
              className="btn-secondary"
              onClick={() => alert(`TODO: action bulk "marquer payé" (${selectedIds.length})`)}
            >
              Marquer payé
            </button>
            <button
              className="btn-secondary"
              onClick={() => alert(`TODO: action bulk "export sélection" (${selectedIds.length})`)}
            >
              Export sélection
            </button>
            <button className="btn-secondary" onClick={clearSelection}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="admin-card" style={{ marginTop: 14, overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid rgba(11,18,32,.08)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 800 }}>Liste</div>
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.6)" }}>
              {filtered.length} résultat(s)
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.6)" }}>
              Page {currentPage} / {totalPages}
            </div>
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              ←
            </button>
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              →
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: 18, color: "rgba(11,18,32,.6)" }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Erreur</div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                margin: 0,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(11,18,32,.12)",
                background: "rgba(11,18,32,.03)",
                fontSize: 12,
              }}
            >
              {error}
            </pre>
            <div style={{ marginTop: 12 }}>
              <button className="btn-secondary" onClick={fetchOrders}>
                Réessayer
              </button>
            </div>
          </div>
        ) : paged.length === 0 ? (
          <div style={{ padding: 18, color: "rgba(11,18,32,.6)" }}>Aucune commande.</div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ background: "rgba(11,18,32,.03)" }}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} />
                  </th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Articles</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((o) => {
                  const created = parseCreatedAt(o.createdAt);
                  const items = Array.isArray(o.items) ? o.items : [];
                  const total = getTotal(o);

                  const itemsLabel =
                    items.length === 0
                      ? "—"
                      : items
                          .map((it: any) => {
                            const n =
                              typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || "Produit";
                            const q = it?.quantity ?? 1;
                            return `${n} x${q}`;
                          })
                          .slice(0, 2)
                          .join(" • ") + (items.length > 2 ? " …" : "");

                  return (
                    <tr key={o.id} style={{ borderTop: "1px solid rgba(11,18,32,.06)" }}>
                      <td style={tdStyle}>
                        <input type="checkbox" checked={!!selected[o.id]} onChange={() => toggleOne(o.id)} />
                      </td>

                      <td style={tdStyle}>{formatDateFR(created)}</td>

                      <td style={{ ...tdStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {o.id.slice(0, 8)}…{o.id.slice(-6)}
                      </td>

                      <td style={tdStyle}>{o.email || "—"}</td>

                      <td style={tdStyle}>
                        <StatusPill status={o.status || "—"} />
                      </td>

                      <td style={tdStyle} title={itemsLabel}>
                        {itemsLabel}
                      </td>

                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800 }}>{moneyEUR(total)}</td>

                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <button className="btn-secondary" onClick={() => openDetails(o.id)}>
                            Voir
                          </button>
                          <button className="btn-secondary" onClick={() => copyId(o.id)}>
                            Copier ID
                          </button>
                          <button className="btn-secondary" onClick={() => markPaid(o.id)}>
                            Payé
                          </button>
                          <button className="btn-secondary" onClick={() => deleteOrder(o.id)}>
                            Suppr
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer pagination */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid rgba(11,18,32,.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, color: "rgba(11,18,32,.6)" }}>
                Affichage {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} /{" "}
                {filtered.length}
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn-secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>
                  Début
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
                <button className="btn-secondary" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
                  Fin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive hint */}
      <div style={{ marginTop: 12, color: "rgba(11,18,32,.55)", fontSize: 12 }}>
        Astuce : sur mobile, on pourra afficher une version “cards” (on le fera après).
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status || "—";

  let bg = "rgba(11,18,32,.06)";
  let fg = "rgba(11,18,32,.85)";
  let label = s;

  if (s === "paid") {
    bg = "rgba(16,185,129,.14)";
    fg = "rgba(5,150,105,1)";
    label = "paid";
  } else if (s === "pending_payment") {
    bg = "rgba(245,158,11,.14)";
    fg = "rgba(217,119,6,1)";
    label = "pending";
  } else if (s === "canceled") {
    bg = "rgba(239,68,68,.14)";
    fg = "rgba(220,38,38,1)";
    label = "canceled";
  } else if (s === "refunded") {
    bg = "rgba(59,130,246,.14)";
    fg = "rgba(37,99,235,1)";
    label = "refunded";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      {label}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  padding: "10px 10px",
  color: "rgba(11,18,32,.65)",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontSize: 13,
  color: "rgba(11,18,32,.9)",
  verticalAlign: "top",
};
