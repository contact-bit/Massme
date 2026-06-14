"use client";

import Link from "next/link";
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./products.css";

type Product = {
  id: string;

  name?:
    | {
        fr?: string;
        en?: string;
      }
    | string;

  price?:
    | {
        eur?: number;
      }
    | number;

  isActive?: boolean;

  imageUrl?: string;
  productCode?: string;
  weightKg?: number;
  deliveryPackageCount?: number;
  markets?: string[];
  variants?: unknown[];
  addons?: unknown[];
  pricesByMarket?: Record<string, number>;
};

function getName(p: Product) {
  return typeof p.name === "string"
    ? p.name
    : p.name?.fr ||
        p.name?.en ||
        "Produit";
}

function getPrice(p: Product) {
  if (typeof p.pricesByMarket?.FR === "number") {
    return p.pricesByMarket.FR;
  }

  return typeof p.price === "number"
    ? p.price
    : p.price?.eur || 0;
}

function plural(count: number, singular: string, pluralLabel = `${singular}s`) {
  return `${count} ${count > 1 ? pluralLabel : singular}`;
}

function moneyEUR(n: number) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(n || 0);
}

function clamp(
  n: number,
  a: number,
  b: number
) {
  return Math.max(
    a,
    Math.min(b, n)
  );
}

export default function ProductsAdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [q, setQ] = useState("");

  const [status, setStatus] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [togglingId, setTogglingId] =
    useState<string | null>(null);

  const pageSize = 12;

  const fetchProducts =
    async () => {
      setLoading(true);

      try {
        const pass =
          localStorage.getItem(
            "admin_password"
          ) || "";

        const res = await fetch(
          "/api/admin/products",
          {
            headers: {
              "x-admin-password":
                pass,
            },
          }
        );

        const json =
          await res.json();

        setProducts(
          json?.products || []
        );
      } finally {
        setLoading(false);
      }
    };

  const deleteProduct =
    async (id: string) => {
      if (
        !confirm(
          "Supprimer ce produit ?"
        )
      ) {
        return;
      }

      const pass =
        localStorage.getItem(
          "admin_password"
        ) || "";

      await fetch(
        `/api/admin/products/${id}`,
        {
          method: "DELETE",

          headers: {
            "x-admin-password":
              pass,
          },
        }
      );

      fetchProducts();
    };

  const toggleProductVisibility =
    async (product: Product) => {
      setTogglingId(product.id);

      try {
        const pass =
          localStorage.getItem(
            "admin_password"
          ) || "";

        const res = await fetch(
          `/api/admin/products/${product.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              "x-admin-password":
                pass,
            },
            body: JSON.stringify({
              data: {
                isActive:
                  !product.isActive,
              },
            }),
          }
        );

        if (!res.ok) {
          throw new Error();
        }

        setProducts((current) =>
          current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  isActive:
                    !product.isActive,
                }
              : item
          )
        );
      } catch {
        alert(
          "Impossible de modifier la visibilité du produit."
        );
      } finally {
        setTogglingId(null);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (
        status === "active" &&
        !p.isActive
      ) {
        return false;
      }

      if (
        status === "inactive" &&
        p.isActive
      ) {
        return false;
      }

      if (!q) {
        return true;
      }

      return (
        p.id
          .toLowerCase()
          .includes(
            q.toLowerCase()
          ) ||
        getName(p)
          .toLowerCase()
          .includes(
            q.toLowerCase()
          )
      );
    });
  }, [products, q, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / pageSize
    )
  );

  const currentPage = clamp(
    page,
    1,
    totalPages
  );

  const paged = filtered.slice(
    (currentPage - 1) *
      pageSize,
    currentPage * pageSize
  );

  return (
    <main className="admin-page products-page">

      {/* TOOLBAR */}
      <div className="products-filters">

        <input
          className="products-input"
          placeholder="Rechercher un produit..."
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
        />

        <div className="products-select-wrap">
          <select
            className="products-select"
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="all">
              Tous les produits
            </option>

            <option value="active">
              Produits actifs
            </option>

            <option value="inactive">
              Produits inactifs
            </option>

          </select>
        </div>

        <Link
          href="/admin/products/new"
          className="products-btn-primary"
        >
          + Ajouter un produit
        </Link>

      </div>

      {/* GRID */}
      <div className="products-grid">

        {loading ? (
          <div className="products-empty">
            Chargement…
          </div>
        ) : paged.length === 0 ? (
          <div className="products-empty">
            Aucun produit
          </div>
        ) : (
          paged.map((p) => {
            return (
              <div
                key={p.id}
                className="products-card"
              >

                {/* TOP */}
                <div className="products-card-top">

                  {/* IMAGE */}
                  <div className="products-thumb">

                    {p.imageUrl ? (
                      <img
                        src={
                          p.imageUrl
                        }
                        alt={getName(
                          p
                        )}
                      />
                    ) : (
                      <span>
                        IMG
                      </span>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="products-info">

                    <div className="products-name">
                      {getName(p)}
                    </div>

                    {p.productCode && (
                      <div className="products-reference">
                        Réf. {p.productCode}
                      </div>
                    )}

                    <div className="products-price">
                      {moneyEUR(
                        getPrice(p)
                      )}
                    </div>

                  </div>

                  <button
                    type="button"
                    className={`products-visibility-switch ${
                      p.isActive
                        ? "is-active"
                        : ""
                    }`}
                    role="switch"
                    aria-checked={p.isActive ?? false}
                    disabled={togglingId === p.id}
                    onClick={() =>
                      toggleProductVisibility(p)
                    }
                  >
                    <span className="products-visibility-switch-text">
                      <strong>Visible sur la boutique</strong>
                      <small>
                        {togglingId === p.id
                          ? "Enregistrement..."
                          : p.isActive
                          ? "Visible"
                          : "Masqué"}
                      </small>
                    </span>
                    <span className="products-visibility-switch-track">
                      <span />
                    </span>
                  </button>

                </div>

                <div className="products-meta">
                  <span>
                    {plural(p.markets?.length || 0, "pays")}
                  </span>
                  <span>
                    {plural(p.variants?.length || 0, "variante")}
                  </span>
                  <span>
                    {plural(p.addons?.length || 0, "complément")}
                  </span>
                  <span>
                    {p.weightKg
                      ? `${p.weightKg} kg`
                      : "Poids non défini"}
                    {" · "}
                    {plural(p.deliveryPackageCount || 1, "colis", "colis")}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="products-actions-row">

                  <Link
                    href={`/admin/products/${p.id}`}
                    className="products-btn products-btn-edit"
                  >
                    Modifier
                  </Link>

                  <button
                    className="products-btn products-btn-delete"
                    onClick={() =>
                      deleteProduct(
                        p.id
                      )
                    }
                  >
                    Supprimer
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* PAGINATION */}
      <div className="products-pagination">

        <button
          className="products-page-btn"
          disabled={
            currentPage <= 1
          }
          onClick={() =>
            setPage(
              currentPage - 1
            )
          }
        >
          ←
        </button>

        <div className="products-page-indicator">
          {currentPage} /{" "}
          {totalPages}
        </div>

        <button
          className="products-page-btn"
          disabled={
            currentPage >=
            totalPages
          }
          onClick={() =>
            setPage(
              currentPage + 1
            )
          }
        >
          →
        </button>

      </div>

    </main>
  );
}
