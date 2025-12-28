// src/app/admin/orders/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type OrderItem = {
  name?: any;
  price?: number | { eur?: number };
  quantity?: number;
  description?: string;
};

type Order = {
  id: string;
  email?: string;
  status?: string;
  createdAt?: any;

  amount_total?: number; // stripe cents
  total?: number; // eur

  shippingMethod?: { name?: string; price?: number | { eur?: number } };
  shippingPrice?: number;

  items?: OrderItem[];
  shippingAddress?: any;
};

type StatusFilter = "all" | "paid" | "pending_payment" | "refunded" | "canceled";

function moneyEUR(n: number) {
  const v = Math.round((Number(n || 0)) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function parseCreatedAt(value: any): Date | null {
  if (!value) return null;

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfCurrentMonthISO() {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0, 10);
}

function compactId(id: string) {
  if (!id) return "—";
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

async function safeReadText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function safeReadJSON(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [debug, setDebug] = useState<any>(null);

  const [orders, setOrders] = useState<Order[]>([]);

  // UI
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>(() => startOfCurrentMonthISO());
  const [to, setTo] = useState<string>(() => todayISO());

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const adminPasswordRef = useRef<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    setDebug(null);

    try {
      const pass = localStorage.getItem("admin_password") || "";
      if (!pass) {
        window.location.href = "/admin/login";
        return;
      }
      adminPasswordRef.current = pass;

      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      // ✅ Handle 401 cleanly
      if (res.status === 401) {
        localStorage.removeItem("admin_password");
        window.location.href = "/admin/login";
        return;
      }

      // ✅ Handle 404 (route missing)
      if (res.status === 404) {
        const txt = await safeReadText(res);
        setDebug({ status: 404, body: txt || "Not Found", hint: "Vérifie /src/app/api/admin/orders/route.ts" });
        throw new Error("API introuvable (404). La route /api/admin/orders n'existe pas en prod.");
      }

      if (!res.ok) {
        const txt = await safeReadText(res);
        const maybeJson = (() => {
          try {
            return JSON.parse(txt);
          } catch {
            return null;
          }
        })();

        setDebug({ status: res.status, body: maybeJson ?? txt });
        throw new Error(maybeJson?.message || maybeJson?.error || txt || `HTTP ${res.status}`);
      }

      const json = await safeReadJSON(res);
      const list: Order[] = Array.isArray(json?.orders) ? json.orders : [];

      setOrders(list);
      setSelected({});
      setPage(1);

      setDebug({
        status: 200,
        count: list.length,
        sampleId: list?.[0]?.id,
        sampleStatus: list?.[0]?.status,
      });
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
      .map((o) => ({ ...o, __created: parseCreatedAt(o.createdAt), __total: getTotal(o) } as any))
      .filter((o: any) => {
        if (status !== "all" && safeString(o.status) !== status) return false;

        if (fromD || toD) {
          const d: Date | null = o.__created;
          if (!d) return false;
          if (fromD && d.getTime() < fromD.getTime()) return false;
          if (toD && d.getTime() > toD.getTime()) return false;
        }

        if (!qn) return true;

        const items = Array.isArray(o.items) ? o.items : [];
        const itemsText = items
          .map((it: any) => (typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || ""))
          .join(" ");

        const hay = [o.id, o.email, o.status, itemsText]
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
    const paidEUR = filtered.filter((o) => o.status === "paid").reduce((sum, o) => sum + getTotal(o), 0);

    return { totalCount, paidCount, pendingCount, totalEUR, paidEUR };
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

  // Actions (stubs)
  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      const t = document.createElement("textarea");
      t.value = id;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
  };

  const openDetails = (id: string) => alert(`TODO: ouvrir détails ${id}`);
  const markPaid = (id: string) => alert(`TODO: marquer payé ${id}`);
  const deleteOrder = (id: string) => alert(`TODO: supprimer ${id}`);

  return (
    <main className="admin-page" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="admin-title" style={{ marginBottom: 6 }}>
            📦 Commandes
          </h1>
          <div style={{ color: "rgba(11,18,32,.6)", fontSize: 13 }}>
            Tableau robuste (erreurs API claires + desktop table + mobile cards).
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

      {/* Debug line */}
      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(11,18,32,.55)" }}>
        API: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>/api/admin/orders</span>{" "}
        {debug ? (
          <>
            • status: <b>{debug.status}</b>
            {typeof debug.count === "number" ? (
              <>
                {" "}
                • count: <b>{debug.count}</b>
              </>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: 12,
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
          <div style={{ marginTop: 4, color: "rgba(11,18,32,.6)", fontSize: 12 }}>{moneyEUR(stats.paidEUR)}</div>
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
                setFrom(startOfCurrentMonthISO());
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
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.7)" }}>{selectedIds.length} sélectionnée(s)</div>

            <button className="btn-secondary" onClick={() => alert("TODO: bulk payé")}>
              Marquer payé
            </button>
            <button className="btn-secondary" onClick={() => alert("TODO: bulk export")}>
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
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.6)" }}>{filtered.length} résultat(s)</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "rgba(11,18,32,.6)" }}>
              Page {currentPage} / {totalPages}
            </div>
            <button className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
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

            {debug ? (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "12px 0 0",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(11,18,32,.12)",
                  background: "rgba(11,18,32,.02)",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(debug, null, 2)}
              </pre>
            ) : null}

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-secondary" onClick={fetchOrders}>
                Réessayer
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  localStorage.removeItem("admin_password");
                  window.location.href = "/admin/login";
                }}
              >
                Re-login
              </button>
            </div>
          </div>
        ) : paged.length === 0 ? (
          <div style={{ padding: 18, color: "rgba(11,18,32,.6)" }}>Aucune commande.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="orders-table" style={{ width: "100%", overflowX: "auto" }}>
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
                              const n = typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || "Produit";
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
                          {compactId(o.id)}
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
            </div>

            {/* Mobile cards */}
            <div className="orders-cards" style={{ padding: 12, display: "none" }}>
              {paged.map((o) => {
                const created = parseCreatedAt(o.createdAt);
                const items = Array.isArray(o.items) ? o.items : [];
                const total = getTotal(o);

                const itemsLabel =
                  items.length === 0
                    ? "—"
                    : items
                        .map((it: any) => {
                          const n = typeof it?.name === "string" ? it.name : it?.name?.fr || it?.name?.en || "Produit";
                          const q = it?.quantity ?? 1;
                          return `${n} x${q}`;
                        })
                        .slice(0, 3)
                        .join(" • ") + (items.length > 3 ? " …" : "");

                return (
                  <div
                    key={o.id}
                    style={{
                      border: "1px solid rgba(11,18,32,.08)",
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 10,
                      background: "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{moneyEUR(total)}</div>
                      <StatusPill status={o.status || "—"} />
                    </div>

                    <div style={{ marginTop: 8, fontSize: 13, color: "rgba(11,18,32,.75)" }}>
                      <div>{formatDateFR(created)}</div>
                      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{compactId(o.id)}</div>
                      <div>{o.email || "—"}</div>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 13 }}>{itemsLabel}</div>

                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                  </div>
                );
              })}
            </div>

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
                <button className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
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

            {/* Responsive CSS via style tag (no file needed) */}
            <style>{`
              @media (max-width: 900px) {
                .orders-table { display: none; }
                .orders-cards { display: block !important; }
              }
            `}</style>
          </>
        )}
      </div>

      <div style={{ marginTop: 12, color: "rgba(11,18,32,.55)", fontSize: 12 }}>
        Si tu vois “0 commande” alors que tu en as : c’est **collection** ou **Firebase project prod**. Dans ce cas,
        je te fais le diagnostic en 2 logs côté API.
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
        fontWeight: 900,
        fontSize: 12,
        whiteSpace: "nowrap",
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
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontSize: 13,
  color: "rgba(11,18,32,.9)",
  verticalAlign: "top",
};
