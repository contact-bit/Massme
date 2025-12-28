"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  email?: string;
  status?: "pending_payment" | "paid" | string;
  createdAt?: any; // ISO string ou Timestamp/Date

  amount_total?: number;
  total?: number;
  shippingPrice?: number;

  shippingMethod?: { name?: string; price?: number };
  shippingAddress?: { name?: string; address?: string; city?: string; postalCode?: string; country?: string };

  items?: {
    name: { fr?: string; en?: string } | string;
    price: number | { eur?: number };
    quantity: number;
  }[];
};

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseCreatedAt(o: Order): Date | null {
  const v: any = o.createdAt;

  // ISO string
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? new Date(t) : null;
  }

  // Firestore Timestamp (client) { seconds, nanoseconds }
  if (v && typeof v === "object" && typeof v.seconds === "number") {
    return new Date(v.seconds * 1000);
  }

  // Date
  if (v instanceof Date) return v;

  return null;
}

function getItemName(item: any): string {
  if (!item) return "Produit";
  if (typeof item.name === "string") return item.name;
  return item.name?.fr || item.name?.en || "Produit";
}

function getItemPrice(item: any): number {
  if (!item) return 0;
  if (typeof item.price === "number") return item.price;
  if (typeof item.price?.eur === "number") return item.price.eur;
  return 0;
}

function getSubtotal(order: Order): number {
  return (
    order.items?.reduce((sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1), 0) ?? 0
  );
}

function getShipping(order: Order): number {
  if (typeof order.shippingMethod?.price === "number") return order.shippingMethod.price;
  if (typeof order.shippingPrice === "number") return order.shippingPrice;
  return 0;
}

function getTotal(order: Order): number {
  if (typeof order.amount_total === "number") return order.amount_total / 100;
  if (typeof order.total === "number") return order.total;
  return getSubtotal(order) + getShipping(order);
}

function euros(n: number) {
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

type Preset = "today" | "yesterday" | "this_month" | "last_month" | "custom";

export default function AdminExportPage() {
  const [preset, setPreset] = useState<Preset>("this_month");
  const [from, setFrom] = useState<string>(() => {
    const now = new Date();
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [to, setTo] = useState<string>(() => toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // apply preset => from/to
  useEffect(() => {
    const now = new Date();

    if (preset === "today") {
      setFrom(toISODate(now));
      setTo(toISODate(now));
    }

    if (preset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      setFrom(toISODate(y));
      setTo(toISODate(y));
    }

    if (preset === "this_month") {
      setFrom(toISODate(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(toISODate(now));
    }

    if (preset === "last_month") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setFrom(toISODate(first));
      setTo(toISODate(last));
    }
  }, [preset]);

  const periodLabel = useMemo(() => {
    if (!from || !to) return "";
    if (from === to) return `Jour : ${from}`;
    return `Période : ${from} → ${to}`;
  }, [from, to]);

  const filteredAndSorted = useMemo(() => {
    // on filtre aussi côté client pour être sûr (au cas où l’API ne filtre pas encore)
    const fromD = startOfDay(new Date(from));
    const toD = endOfDay(new Date(to));

    const list = orders
      .filter((o) => {
        const d = parseCreatedAt(o);
        if (!d) return true; // si pas de date, on garde (ou change si tu veux exclure)
        return d >= fromD && d <= toD;
      })
      .sort((a, b) => {
        const da = parseCreatedAt(a)?.getTime() ?? 0;
        const db = parseCreatedAt(b)?.getTime() ?? 0;
        return db - da;
      });

    return list;
  }, [orders, from, to]);

  const totals = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let revenue = 0;

    for (const o of filteredAndSorted) {
      const total = getTotal(o);
      if ((o.status || "") === "paid") {
        paid++;
        revenue += total;
      } else {
        pending++;
      }
    }

    return {
      count: filteredAndSorted.length,
      paid,
      pending,
      revenue,
      aov: paid > 0 ? revenue / paid : 0,
    };
  }, [filteredAndSorted]);

  const load = async () => {
    try {
      setErr(null);
      setLoading(true);

      const adminPassword = localStorage.getItem("admin_password");
      if (!adminPassword) {
        window.location.href = "/admin/login";
        return;
      }

      // ✅ idéal : ton API filtre déjà (voir section 3)
      const res = await fetch(`/api/admin/orders?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        headers: { "x-admin-password": adminPassword },
        cache: "no-store",
      });

      if (!res.ok) {
        const t = await res.text();
        setErr(t || "Erreur API export");
        setOrders([]);
        return;
      }

      const json = await res.json();
      setOrders((json.orders || []) as Order[]);
    } catch (e: any) {
      setErr(e?.message ?? "Erreur");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // charge direct au 1er rendu
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadCSV = () => {
    const rows = filteredAndSorted.map((o) => {
      const d = parseCreatedAt(o);
      const dateStr = d ? d.toISOString() : "";
      const subtotal = getSubtotal(o);
      const shipping = getShipping(o);
      const total = getTotal(o);

      const itemsStr =
        o.items?.map((it) => `${getItemName(it)} x${it.quantity}`).join(" | ") ?? "";

      return {
        id: o.id,
        date: dateStr,
        status: o.status ?? "",
        email: o.email ?? "",
        customer: o.shippingAddress?.name ?? "",
        shipping_method: o.shippingMethod?.name ?? "",
        items: itemsStr,
        subtotal: euros(subtotal),
        shipping: euros(shipping),
        total: euros(total),
      };
    });

    const headers = Object.keys(rows[0] || { id: "" });
    const csv = [
      headers.join(";"),
      ...rows.map((r) => headers.map((h) => String((r as any)[h] ?? "").replaceAll(";", ",")).join(";")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-commandes_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPrintPDF = () => {
    // On génère un HTML “print-ready”
    const htmlRows = filteredAndSorted
      .map((o) => {
        const d = parseCreatedAt(o);
        const dateStr = d ? d.toLocaleString("fr-FR") : "—";
        const subtotal = getSubtotal(o);
        const shipping = getShipping(o);
        const total = getTotal(o);
        const items = o.items?.map((it) => `${getItemName(it)} × ${it.quantity}`).join(", ") ?? "—";

        return `
          <tr>
            <td>${dateStr}</td>
            <td>${o.id}</td>
            <td>${(o.status || "").toUpperCase()}</td>
            <td>${o.email ?? ""}</td>
            <td>${items}</td>
            <td class="num">${euros(subtotal)} €</td>
            <td class="num">${euros(shipping)} €</td>
            <td class="num total">${euros(total)} €</td>
          </tr>
        `;
      })
      .join("");

    const doc = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Export commandes ${from} → ${to}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #111827; }
    .top { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom: 10px; }
    .brand { display:flex; align-items:center; gap:10px; }
    .mark { width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(145deg, #2563eb, #60a5fa); }
    h1 { font-size: 16px; margin: 0; }
    .meta { color: #6b7280; font-size: 12px; }
    .kpis { display:flex; gap:10px; flex-wrap:wrap; margin: 10px 0 12px; }
    .pill { border:1px solid #e5e7eb; background:#f9fafb; border-radius:999px; padding:6px 10px; font-size:12px; }
    table { width:100%; border-collapse:collapse; font-size: 11px; }
    thead th { text-align:left; padding:8px; border-bottom:1px solid #e5e7eb; background:#f3f4f6; }
    tbody td { padding:8px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    .num { text-align:right; white-space:nowrap; }
    .total { font-weight: 800; }
    .foot { margin-top: 10px; font-size: 11px; color:#6b7280; display:flex; justify-content:space-between; }
  </style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <div class="mark"></div>
      <div>
        <h1>OculaRest — Export commandes</h1>
        <div class="meta">${periodLabel} • Généré le ${new Date().toLocaleString("fr-FR")}</div>
      </div>
    </div>
    <div class="meta">Admin</div>
  </div>

  <div class="kpis">
    <div class="pill">Commandes: <b>${totals.count}</b></div>
    <div class="pill">Payées: <b>${totals.paid}</b></div>
    <div class="pill">En attente: <b>${totals.pending}</b></div>
    <div class="pill">CA (payées): <b>${euros(totals.revenue)} €</b></div>
    <div class="pill">Panier moyen: <b>${euros(totals.aov)} €</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>ID</th>
        <th>Statut</th>
        <th>Email</th>
        <th>Articles</th>
        <th class="num">Sous-total</th>
        <th class="num">Livraison</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${htmlRows || `<tr><td colspan="8">Aucune commande sur la période.</td></tr>`}
    </tbody>
  </table>

  <div class="foot">
    <div>OculaRest • Export interne</div>
    <div>Page <script>document.write(String(1))</script></div>
  </div>

  <script>
    // Auto open print dialog
    window.onload = () => {
      window.print();
    };
  </script>
</body>
</html>
    `.trim();

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(doc);
    w.document.close();
  };

  return (
    <main className="admin-page">
      <h1 className="admin-title">📤 Export des commandes</h1>

      <div className="admin-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="admin-select"
            value={preset}
            onChange={(e) => setPreset(e.target.value as Preset)}
            style={{ maxWidth: 220 }}
          >
            <option value="today">Aujourd’hui</option>
            <option value="yesterday">Hier</option>
            <option value="this_month">Ce mois</option>
            <option value="last_month">Mois précédent</option>
            <option value="custom">Personnalisé</option>
          </select>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label className="admin-label" style={{ margin: 0 }}>
              Du
            </label>
            <input
              className="admin-input"
              type="date"
              value={from}
              onChange={(e) => {
                setPreset("custom");
                setFrom(e.target.value);
              }}
              style={{ maxWidth: 170 }}
            />
            <label className="admin-label" style={{ margin: 0 }}>
              au
            </label>
            <input
              className="admin-input"
              type="date"
              value={to}
              onChange={(e) => {
                setPreset("custom");
                setTo(e.target.value);
              }}
              style={{ maxWidth: 170 }}
            />
          </div>

          <button className="btn-primary" onClick={load} disabled={loading}>
            {loading ? "Chargement…" : "Actualiser"}
          </button>

          <div style={{ flex: 1 }} />

          <button className="btn-secondary" onClick={downloadCSV} disabled={filteredAndSorted.length === 0}>
            Télécharger CSV
          </button>
          <button className="btn-primary" onClick={openPrintPDF} disabled={filteredAndSorted.length === 0}>
            Générer PDF
          </button>
        </div>

        <div style={{ marginTop: 10, color: "var(--color-text-light)" }}>
          <b>{periodLabel}</b> — {totals.count} commande(s) • CA payées: <b>{euros(totals.revenue)} €</b>
        </div>

        {err ? (
          <div style={{ marginTop: 10, color: "#dc2626", fontWeight: 700 }}>Erreur: {err}</div>
        ) : null}
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Chargement…</p>
        ) : filteredAndSorted.length === 0 ? (
          <p>Aucune commande sur la période.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>Date</th>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>ID</th>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>Statut</th>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>Email</th>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>Articles</th>
                  <th style={{ padding: 10, borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((o) => {
                  const d = parseCreatedAt(o);
                  const total = getTotal(o);
                  const items =
                    o.items?.map((it) => `${getItemName(it)} × ${it.quantity}`).join(", ") ?? "—";

                  return (
                    <tr key={o.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                        {d ? d.toLocaleString("fr-FR") : "—"}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", fontFamily: "ui-monospace" }}>
                        {o.id}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>
                        {o.status === "paid" ? "Payée" : o.status || "—"}
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>{o.email ?? "—"}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>{items}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9", textAlign: "right", fontWeight: 800 }}>
                        {euros(total)} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
