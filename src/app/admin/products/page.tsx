// src/app/admin/products/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name?: { fr?: string; en?: string } | string;
  price?: { eur?: number } | number;
  isActive?: boolean;
  stock?: number;
  imageUrl?: string;
  description?: { fr?: string; en?: string } | string;
};

type FilterStatus = "all" | "active" | "inactive";
type SortKey = "name_asc" | "price_desc" | "stock_asc" | "updated_desc";

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function getName(p: Product) {
  return typeof p.name === "string" ? p.name : p.name?.fr || p.name?.en || "Produit";
}

function getPrice(p: Product) {
  return typeof p.price === "number" ? p.price : typeof p.price?.eur === "number" ? p.price.eur : 0;
}

function moneyEUR(n: number) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** mini debounce */
function useDebouncedValue<T>(value: T, delayMs = 220) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

export default function ProductsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);

  // UI
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 220);
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortKey>("name_asc");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      if (typeof window === "undefined") return;

      // 🔐 Auth: on privilégie admin_password (comme orders/export)
      const adminPassword = localStorage.getItem("admin_password") || "";
      const adminToken = localStorage.getItem("admin_token") || "";

      if (!adminPassword && adminToken !== "true") {
        window.location.href = "/admin/login";
        return;
      }

      const headers: Record<string, string> = {};
      if (adminPassword) headers["x-admin-password"] = adminPassword;
      if (adminToken) headers["x-admin-token"] = adminToken;

      const res = await fetch("/api/admin/products", {
        headers,
        cache: "no-store",
      });

      const txt = await res.text();
      if (!res.ok) {
        throw new Error(txt || `HTTP ${res.status}`);
      }

      let json: any;
      try {
        json = JSON.parse(txt);
      } catch {
        // si ton endpoint renvoie direct {products} sans ok, on tente fallback
        json = null;
      }

      // ✅ Supporte 2 formats :
      // - { ok: true, products: [...] }
      // - { products: [...] }
      const list: Product[] = Array.isArray(json?.products)
        ? json.products
        : Array.isArray((json as any)?.data?.products)
        ? (json as any).data.products
        : // si ton endpoint renvoie déjà { products } sans JSON.parse possible (rare), on essaye:
          [];

      // Si { ok:false }, message
      if (json && json.ok === false) {
        throw new Error(json.error || "API produits: ok=false");
      }

      setProducts(list);
      setPage(1);
    } catch (e: any) {
      setProducts([]);
      setError(e?.message || "Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = qDebounced.trim().toLowerCase();

    let out = products.filter((p) => {
      const active = !!p.isActive;

      if (status === "active" && !active) return false;
      if (status === "inactive" && active) return false;

      if (!query) return true;

      const hay = [
        p.id,
        getName(p),
        safeString(p.description),
        safeString(p.stock),
        safeString(getPrice(p)),
        safeString(p.isActive),
      ]
        .join(" | ")
        .toLowerCase();

      return hay.includes(query);
    });

    out.sort((a, b) => {
      if (sort === "name_asc") return getName(a).localeCompare(getName(b), "fr");
      if (sort === "price_desc") return getPrice(b) - getPrice(a);
      if (sort === "stock_asc") return (a.stock ?? 0) - (b.stock ?? 0);
      // updated_desc : si tu n’as pas updatedAt, on garde stable
      return 0;
    });

    return out;
  }, [products, qDebounced, status, sort]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((p) => !!p.isActive).length;
    const inactive = total - active;
    const lowStock = filtered.filter((p) => (p.stock ?? 0) <= 2).length;
    return { total, active, inactive, lowStock };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = clamp(page, 1, totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <main className="p-wrap">
      {/* Header */}
      <div className="p-header">
        <div className="p-titlezone">
          <h1 className="p-title">🛍️ Produits</h1>
        </div>

        <div className="p-actions">
          <Link href="/admin/products/new" className="btn btn-primary">
            ➕ Ajouter
          </Link>
          <button className="btn btn-ghost" onClick={fetchProducts} disabled={loading}>
            ↻ Rafraîchir
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="p-kpis">
        <div className="kpi">
          <div className="kpi-label">Produits</div>
          <div className="kpi-val">{stats.total}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Actifs</div>
          <div className="kpi-val">{stats.active}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Inactifs</div>
          <div className="kpi-val">{stats.inactive}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Stock faible</div>
          <div className="kpi-val">{stats.lowStock}</div>
          <div className="kpi-hint">{stats.lowStock > 0 ? "≤ 2 unités" : "OK ✅"}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-filters">
        <div className="grid">
          <div className="field">
            <label>Recherche</label>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Nom, ID, stock…"
            />
            <div className="hint">{q ? `Filtre: “${qDebounced}”` : "Astuce: colle un ID produit"}</div>
          </div>

          <div className="field">
            <label>Statut</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as FilterStatus);
                setPage(1);
              }}
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          <div className="field">
            <label>Tri</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
            >
              <option value="name_asc">Nom (A→Z)</option>
              <option value="price_desc">Prix (haut→bas)</option>
              <option value="stock_asc">Stock (bas→haut)</option>
            </select>
          </div>

          <div className="field field-right">
            <label>&nbsp;</label>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setQ("");
                setStatus("all");
                setSort("name_asc");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-list">
        <div className="p-list-head">
          <div className="p-list-title">
            <span>Liste</span>
            <span className="muted">{filtered.length} résultat(s)</span>
          </div>

          <div className="p-pager">
            <span className="muted">
              Page {currentPage} / {totalPages}
            </span>
            <button className="btn btn-ghost" onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))} disabled={currentPage <= 1}>
              ←
            </button>
            <button className="btn btn-ghost" onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))} disabled={currentPage >= totalPages}>
              →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-skel">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skel-row" />
            ))}
          </div>
        ) : error ? (
          <div className="p-error">
            <div className="p-error-title">Erreur</div>
            <pre className="p-error-pre">{error}</pre>
            <button className="btn btn-ghost" onClick={fetchProducts}>
              Réessayer
            </button>
          </div>
        ) : paged.length === 0 ? (
          <div className="p-empty">Aucun produit.</div>
        ) : (
          <div className="p-grid">
            {paged.map((p) => {
              const name = getName(p);
              const price = getPrice(p);
              const stock = p.stock ?? 0;
              const active = !!p.isActive;

              const stockTone = stock <= 2 ? "danger" : stock <= 8 ? "warn" : "ok";

              return (
                <div key={p.id} className="p-card">
                  <div className="p-card-top">
                    <div className="thumb">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={name} />
                      ) : (
                        <div className="thumb-ph">No image</div>
                      )}
                    </div>

                    <div className="p-meta">
                      <div className="p-name" title={name}>
                        {name}
                      </div>

                      <div className="p-line">
                        <span className="price">{moneyEUR(price)}</span>
                        <span className={`pill ${active ? "pill-on" : "pill-off"}`}>{active ? "Actif" : "Inactif"}</span>
                      </div>

                      <div className="p-line muted small">
                        <span className={`dot dot-${stockTone}`} />
                        Stock : <b>{stock}</b>
                        <span className="mono"> • {p.id.slice(0, 8)}…</span>
                      </div>
                    </div>

                    <div className="p-more">
                      <Link className="btn btn-primary btn-sm" href={`/admin/products/${p.id}`}>
                        Modifier
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(p.id);
                          } catch {}
                        }}
                        title="Copier l'ID"
                      >
                        Copier ID
                      </button>
                    </div>
                  </div>

                  {/* Footer quick info */}
                  <div className="p-card-foot">
                    <div className="muted small">
                      Prix : <b>{moneyEUR(price)}</b>
                    </div>
                    <div className="muted small">
                      Stock : <b>{stock}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="p-foot">
            <div className="muted">
              Affichage {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length}
            </div>
            <div className="p-foot-btns">
              <button className="btn btn-ghost" onClick={() => setPage(1)} disabled={currentPage === 1}>
                Début
              </button>
              <button className="btn btn-ghost" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
                Fin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ CSS local (pas besoin d’un fichier global) */}
      <style jsx>{`
        .p-wrap {
          padding: 18px 16px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .p-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .p-titlezone {
          min-width: 260px;
          flex: 1;
        }

        .p-title {
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -0.02em;
          margin: 0 0 4px;
          color: rgba(11, 18, 32, 0.92);
        }

        .p-sub {
          margin: 0;
          color: rgba(11, 18, 32, 0.62);
          font-size: 13px;
        }

        .p-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .card {
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 18px 50px rgba(11, 18, 32, 0.06);
        }

        .p-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(220px, 1fr));
          gap: 12px;
          margin: 12px 0;
        }

        .kpi {
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(11, 18, 32, 0.02), rgba(11, 18, 32, 0));
          padding: 14px;
          box-shadow: 0 18px 50px rgba(11, 18, 32, 0.04);
        }

        .kpi-label {
          font-size: 12px;
          font-weight: 850;
          color: rgba(11, 18, 32, 0.62);
        }
        .kpi-val {
          font-size: 22px;
          font-weight: 950;
          margin-top: 6px;
          color: rgba(11, 18, 32, 0.92);
        }
        .kpi-hint {
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
          margin-top: 4px;
        }

        .p-filters {
          padding: 14px;
          margin-top: 10px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr 1fr auto;
          gap: 12px;
          align-items: end;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 850;
          color: rgba(11, 18, 32, 0.62);
          margin-bottom: 6px;
        }

        .field input,
        .field select {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(11, 18, 32, 0.12);
          background: white;
          padding: 0 12px;
          font-size: 13px;
          outline: none;
          color: rgba(11, 18, 32, 0.92);
        }
        .field input:focus,
        .field select:focus {
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
          border-color: rgba(37, 99, 235, 0.35);
        }

        .hint {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
        }

        .field-right {
          display: flex;
          justify-content: flex-end;
        }

        .p-list {
          margin-top: 14px;
          overflow: hidden;
        }

        .p-list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(11, 18, 32, 0.02);
          flex-wrap: wrap;
        }

        .p-list-title {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-weight: 950;
        }

        .p-pager {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .muted {
          color: rgba(11, 18, 32, 0.6);
          font-size: 13px;
          font-weight: 700;
        }
        .small {
          font-size: 12px;
          font-weight: 700;
        }
        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .p-grid {
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .p-card {
          border: 1px solid rgba(11, 18, 32, 0.1);
          border-radius: 16px;
          background: white;
          box-shadow: 0 12px 30px rgba(11, 18, 32, 0.06);
          overflow: hidden;
        }

        .p-card-top {
          display: grid;
          grid-template-columns: 86px 1fr auto;
          gap: 12px;
          padding: 12px;
          align-items: start;
        }

        .thumb {
          width: 86px;
          height: 86px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(11, 18, 32, 0.03);
          display: grid;
          place-items: center;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .thumb-ph {
          font-size: 12px;
          color: rgba(11, 18, 32, 0.55);
          font-weight: 800;
        }

        .p-meta {
          min-width: 0;
        }
        .p-name {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.92);
          line-height: 1.15;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-line {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .price {
          font-weight: 950;
          color: rgba(11, 18, 32, 0.92);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          border: 1px solid rgba(11, 18, 32, 0.1);
        }
        .pill-on {
          background: rgba(16, 185, 129, 0.14);
          color: rgba(5, 150, 105, 1);
          border-color: rgba(16, 185, 129, 0.25);
        }
        .pill-off {
          background: rgba(239, 68, 68, 0.12);
          color: rgba(220, 38, 38, 1);
          border-color: rgba(239, 68, 68, 0.25);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
        .dot-ok {
          background: rgba(16, 185, 129, 1);
        }
        .dot-warn {
          background: rgba(245, 158, 11, 1);
        }
        .dot-danger {
          background: rgba(239, 68, 68, 1);
        }

        .p-more {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .p-card-foot {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-top: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(11, 18, 32, 0.02);
        }

        .p-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-top: 1px solid rgba(11, 18, 32, 0.08);
          background: rgba(255, 255, 255, 0.9);
          flex-wrap: wrap;
        }
        .p-foot-btns {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .p-empty {
          padding: 18px;
          color: rgba(11, 18, 32, 0.6);
          font-weight: 750;
        }

        .p-error {
          padding: 18px;
        }
        .p-error-title {
          font-weight: 950;
          margin-bottom: 8px;
          color: rgba(11, 18, 32, 0.92);
        }
        .p-error-pre {
          white-space: pre-wrap;
          margin: 0 0 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(11, 18, 32, 0.12);
          background: rgba(11, 18, 32, 0.03);
          font-size: 12px;
          color: rgba(11, 18, 32, 0.85);
        }

        .p-skel {
          padding: 14px;
          display: grid;
          gap: 10px;
        }
        .skel-row {
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(11, 18, 32, 0.04), rgba(11, 18, 32, 0.08), rgba(11, 18, 32, 0.04));
          background-size: 200% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 0% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Buttons (fallback si tes classes globales manquent) */
        .btn {
          border: 1px solid rgba(11, 18, 32, 0.12);
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 950;
          font-size: 13px;
          background: white;
          color: rgba(11, 18, 32, 0.92);
          text-decoration: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background: rgba(37, 99, 235, 1);
          border-color: rgba(37, 99, 235, 1);
          color: white;
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22);
        }
        .btn-ghost {
          background: rgba(11, 18, 32, 0.03);
        }
        .btn-sm {
          padding: 8px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        @media (max-width: 1050px) {
          .p-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .p-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .grid {
            grid-template-columns: 1fr 1fr;
          }
          .field-right {
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .p-grid {
            grid-template-columns: 1fr;
          }
          .p-card-top {
            grid-template-columns: 76px 1fr;
          }
          .p-more {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: flex-end;
          }
        }
      `}</style>
    </main>
  );
}
