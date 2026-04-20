"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name?: { fr?: string; en?: string } | string;
  price?: { eur?: number } | number;
  isActive?: boolean;
  stock?: number;
  manageStock?: boolean;
  imageUrl?: string;
};

function getName(p: Product) {
  return typeof p.name === "string"
    ? p.name
    : p.name?.fr || p.name?.en || "Produit";
}

function getPrice(p: Product) {
  return typeof p.price === "number"
    ? p.price
    : p.price?.eur || 0;
}

function moneyEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n || 0);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const pageSize = 12;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const pass = localStorage.getItem("admin_password") || "";
      const res = await fetch("/api/admin/products", {
        headers: { "x-admin-password": pass },
      });
      const json = await res.json();
      setProducts(json?.products || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;

    const pass = localStorage.getItem("admin_password") || "";

    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pass },
    });

    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;

      if (!q) return true;

      return (
        p.id.toLowerCase().includes(q.toLowerCase()) ||
        getName(p).toLowerCase().includes(q.toLowerCase())
      );
    });
  }, [products, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = clamp(page, 1, totalPages);

  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Produits</h1>
          <p>Gestion du catalogue</p>
        </div>

        <div className="actions">
          <Link href="/admin/products/new" className="btn-primary">
            + Ajouter un produit
          </Link>

          <button className="btn-secondary" onClick={fetchProducts}>
            ↻
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          className="input"
          placeholder="Rechercher un produit..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tous les produits</option>
          <option value="active">Produits actifs</option>
          <option value="inactive">Produits inactifs</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid">
        {loading ? (
          <div className="empty">Chargement…</div>
        ) : paged.length === 0 ? (
          <div className="empty">Aucun produit</div>
        ) : (
          paged.map((p) => {
            const stock = p.stock ?? 0;

            return (
              <div key={p.id} className="card">

                <div className="card-top">
                  <div className="thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} />
                    ) : (
                      <span>IMG</span>
                    )}
                  </div>

                  <div className="info">
                    <div className="name">{getName(p)}</div>
                    <div className="price">{moneyEUR(getPrice(p))}</div>
                    <div className="stock">
                      {p.manageStock
                        ? `Stock : ${stock}`
                        : "Stock non géré"}
                    </div>
                  </div>

                  <div className={`badge ${p.isActive ? "on" : "off"}`}>
                    {p.isActive ? "Actif" : "Inactif"}
                  </div>
                </div>

                <div className="actions-row">
                  <Link href={`/admin/products/${p.id}`} className="btn edit">
                    Modifier
                  </Link>

                  <button
                    className="btn delete"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Supprimer
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      <div className="pagination">
        {currentPage} / {totalPages}
      </div>

      <style jsx>{`

        .page {
  min-height: 100vh;
  padding: 32px;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
  font-weight: 800;
}

.header p {
  color: #94a3b8;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
}

/* 🔥 CTA PRIMARY (MODERNE) */
.btn-primary {
  height: 44px;
  padding: 0 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: linear-gradient(135deg,  rgba(37,99,235,0.5),  rgba(37,99,235,0.5));
  color: #fff;

  font-weight: 600;
  font-size: 14px;
  text-decoration: none;

  border: 1px solid rgba(255,255,255,0.12);

  box-shadow:
    0 6px 18px rgba(37,99,235,0.35),
    inset 0 1px 0 rgba(255,255,255,0.15);

  transition: all 0.18s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 28px rgba(37,99,235,0.5),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.btn-primary:active {
  transform: scale(0.97);
}

/* 🔹 SECONDARY (refresh etc) */
.btn-secondary {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);

  color: white;
  cursor: pointer;

  transition: 0.2s;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.12);
}

/* FILTERS */
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.input,
.select {
  padding: 12px;
  border-radius: 10px;

  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(15,23,42,0.6);

  color: white;
  font-size: 14px;

  transition: 0.2s;
}

.input::placeholder {
  color: #64748b;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15,23,42,0.9);
}

.select option {
  background: #020617;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

/* CARD */
.card {
  background: rgba(2,6,23,0.9);
  border: 1px solid rgba(255,255,255,0.08);

  padding: 16px;
  border-radius: 14px;

  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.18);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.card-top {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 14px;
  align-items: center;
}

/* IMAGE */
.thumb {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* TEXT */
.name {
  font-weight: 600;
}

.price {
  color: #60a5fa;
  font-weight: 600;
}

.stock {
  font-size: 12px;
  color: #94a3b8;
}

/* STATUS */
.badge {
  font-size: 12px;
  font-weight: 600;
}

.badge.on {
  color: #22c55e;
}

.badge.off {
  color: #ef4444;
}

/* ACTIONS */
.actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  height: 38px;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 500;

  cursor: pointer;
  transition: 0.2s;
}

.btn.edit {
  background: rgba(255,255,255,0.06);
  color: white;
}

.btn.edit:hover {
  background: rgba(255,255,255,0.12);
}

.btn.delete {
  background: rgba(239,68,68,0.18);
  color: #ef4444;
}

.btn.delete:hover {
  background: rgba(239,68,68,0.3);
}

/* PAGINATION */
.pagination {
  text-align: center;
  color: #94a3b8;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}

      `}</style>
    </main>
  );
}