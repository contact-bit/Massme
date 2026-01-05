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

  // computed
  __created?: Date | null;
  __total?: number;
  __email?: string;
  __itemsLabel?: string;
};

type StatusFilter =
  | "all"
  | "paid"
  | "pending_payment"
  | "refunded"
  | "canceled"
  | "other";
type SortKey = "date_desc" | "date_asc" | "total_desc" | "total_asc";

/* ------------------ helpers ------------------ */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function firstDayOfMonthISO() {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0, 10);
}

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function safeLower(v: any) {
  return safeString(v).toLowerCase();
}

function parseCreatedAt(value: any): Date | null {
  if (!value) return null;

  // Firestore Timestamp (admin/sdk) => toDate()
  if (typeof value === "object" && typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }

  // Timestamp-like shapes: { seconds, nanoseconds } / { _seconds, _nanoseconds }
  if (typeof value === "object") {
    const sec =
      typeof value.seconds === "number"
        ? value.seconds
        : typeof value._seconds === "number"
        ? value._seconds
        : null;

    const nano =
      typeof value.nanoseconds === "number"
        ? value.nanoseconds
        : typeof value._nanoseconds === "number"
        ? value._nanoseconds
        : 0;

    if (typeof sec === "number") {
      const ms = sec * 1000 + Math.floor(nano / 1e6);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === "number") {
    const ms = value < 2_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
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

function moneyEUR(n: number) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

function getItemPrice(it: OrderItem): number {
  const p = it?.price;
  if (typeof p === "number") return p;
  if (p && typeof p === "object" && typeof (p as any).eur === "number")
    return (p as any).eur;
  return 0;
}
function getSubtotal(o: Order): number {
  const items = Array.isArray(o.items) ? o.items : [];
  return items.reduce(
    (sum, it) => sum + getItemPrice(it) * (it.quantity ?? 1),
    0
  );
}
function getShipping(o: Order): number {
  const m = o.shippingMethod?.price;
  if (typeof m === "number") return m;
  if (m && typeof m === "object" && typeof (m as any).eur === "number")
    return (m as any).eur;
  if (typeof o.shippingPrice === "number") return o.shippingPrice;
  return 0;
}
function getTotal(o: Order): number {
  if (typeof o.amount_total === "number") return o.amount_total / 100;
  if (typeof o.total === "number") return o.total;
  return getSubtotal(o) + getShipping(o);
}

function compactId(id: string) {
  if (!id) return "—";
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function buildItemsLabel(items: OrderItem[]) {
  if (!items?.length) return "—";
  const txt =
    items
      .map((it: any) => {
        const n =
          typeof it?.name === "string"
            ? it.name
            : it?.name?.fr || it?.name?.en || "Produit";
        const q = it?.quantity ?? 1;
        return `${n} x${q}`;
      })
      .slice(0, 2)
      .join(" • ") + (items.length > 2 ? " …" : "");
  return txt || "—";
}

/** debounce simple (sans lib) */
function useDebouncedValue<T>(value: T, delayMs = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
}

/* ------------------ UI components ------------------ */

function StatusPill({ status }: { status?: string }) {
  const s = status || "—";
  let cls = "pill";
  let label = s;

  if (s === "paid") {
    cls = "pill pill--paid";
    label = "paid";
  } else if (s === "pending_payment") {
    cls = "pill pill--pending";
    label = "pending";
  } else if (s === "canceled") {
    cls = "pill pill--canceled";
    label = "canceled";
  } else if (s === "refunded") {
    cls = "pill pill--refunded";
    label = "refunded";
  } else if (s && s !== "—") {
    cls = "pill pill--other";
    label = s;
  }

  return <span className={cls}>{label}</span>;
}

type ActionVariant = "neutral" | "primary" | "success" | "danger";

function ActionIconButton({
  title,
  onClick,
  icon,
  variant = "neutral",
  disabled,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: ActionVariant;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`iconBtn iconBtn--${variant}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
    >
      {icon}
    </button>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawerBackdrop ${open ? "drawerBackdrop--open" : ""}`}
        onClick={onClose}
      />
      <div className={`drawer ${open ? "drawer--open" : ""}`}>
        <div className="drawerHead">
          <div className="drawerTitle">{title}</div>
          <button className="btn btn--ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="drawerBody">{children}</div>
      </div>
    </>
  );
}

function formatAddress(a: any) {
  if (!a) return "";
  const parts = [
    a.name,
    a.email,
    a.address,
    [a.postalCode, a.city].filter(Boolean).join(" "),
    a.country,
    a.phone,
  ].filter(Boolean);
  return parts.join("\n");
}

function OrderDetails({
  order,
  onCopyId,
  onCopyEmail,
  onCopyAddress,
}: {
  order: Order;
  onCopyId: () => void;
  onCopyEmail: () => void;
  onCopyAddress: () => void;
}) {
  const items = Array.isArray(order.items) ? order.items : [];
  const created = order.__created ?? null;
  const total = order.__total ?? getTotal(order);
  const shipping = getShipping(order);
  const subtotal = getSubtotal(order);

  const email = order.__email || order.email || "—";

  return (
    <div className="detailGrid">
      <div className="detailTop">
        <div>
          <div className="detailAmount">{moneyEUR(total)}</div>
          <div className="detailDate">{formatDateFR(created)}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="box">
        <div className="boxTitle">Infos</div>
        <div className="kv">
          <div className="kvKey">ID</div>
          <div className="kvVal mono">{order.id}</div>
        </div>
        <div className="kv">
          <div className="kvKey">Email</div>
          <div className="kvVal">{email}</div>
        </div>
        <div className="rowBtns">
          <button className="btn btn--soft" onClick={onCopyId}>
            Copier ID
          </button>
          <button className="btn btn--soft" onClick={onCopyEmail}>
            Copier email
          </button>
        </div>
      </div>

      <div className="box">
        <div className="boxTitle">Produits</div>

        {items.length === 0 ? (
          <div className="muted">Aucun item</div>
        ) : (
          <div className="items">
            {items.map((it, idx) => {
              const name =
                typeof it?.name === "string"
                  ? it.name
                  : it?.name?.fr || it?.name?.en || "Produit";
              const qty = it?.quantity ?? 1;
              const price = getItemPrice(it);
              const desc = it?.description || "";
              return (
                <div key={idx} className="itemCard">
                  <div className="itemLeft">
                    <div className="itemName">{name}</div>
                    {desc ? <div className="itemDesc">{desc}</div> : null}
                    <div className="itemMeta">Qté: {qty}</div>
                  </div>
                  <div className="itemPrice">{moneyEUR(price * qty)}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="sum">
          <div className="sumRow">
            <span className="sumKey">Sous-total</span>
            <span className="sumVal">{moneyEUR(subtotal)}</span>
          </div>
          <div className="sumRow">
            <span className="sumKey">Livraison</span>
            <span className="sumVal">{moneyEUR(shipping)}</span>
          </div>
          <div className="sumRow sumRow--total">
            <span className="sumKey sumKey--total">Total</span>
            <span className="sumVal sumVal--total">{moneyEUR(total)}</span>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="boxTitle">Livraison</div>
        <div className="addr">{formatAddress(order.shippingAddress) || "—"}</div>
        <div className="rowBtns">
          <button className="btn btn--soft" onClick={onCopyAddress}>
            Copier adresse
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ page ------------------ */

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 220);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState(firstDayOfMonthISO());
  const [to, setTo] = useState(todayISO());
  const [sort, setSort] = useState<SortKey>("date_desc");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const activeOrder = useMemo(
    () => orders.find((o) => o.id === drawerId) || null,
    [orders, drawerId]
  );

  const [toast, setToast] = useState<string>("");
  const toastIt = (msg: string) => {
    setToast(msg);
    window.clearTimeout((toastIt as any)._t);
    (toastIt as any)._t = window.setTimeout(() => setToast(""), 1500);
  };

  // ✅ anti double-fetch (React strict mode / double mount en dev)
  const didFetchRef = useRef(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const pass = localStorage.getItem("admin_password") || "";
      if (!pass) {
        window.location.href = "/admin/login";
        return;
      }

      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      const json = JSON.parse(txt);
      const list: Order[] = Array.isArray(json?.orders) ? json.orders : [];

      const normalized = list.map((o) => {
        const created =
          parseCreatedAt((o as any).createdAt) ||
          parseCreatedAt((o as any).created_at) ||
          parseCreatedAt((o as any).created) ||
          parseCreatedAt((o as any).paidAt) ||
          null;

        const items = Array.isArray(o.items) ? o.items : [];
        const total = getTotal(o);
        const email = o.email ?? o.shippingAddress?.email ?? "—";

        return {
          ...o,
          __created: created,
          __total: total,
          __email: email,
          __itemsLabel: buildItemsLabel(items),
        };
      });

      setOrders(normalized);
      setSelected({});
      setPage(1);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ évite les 2 appels en dev
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qn = qDebounced.trim().toLowerCase();
    const fromD = from ? new Date(from + "T00:00:00") : null;
    const toD = to ? new Date(to + "T23:59:59") : null;

    let out = orders.filter((o) => {
      const st = safeString(o.status);

      if (status !== "all") {
        if (status === "other") {
          if (["paid", "pending_payment", "refunded", "canceled"].includes(st))
            return false;
        } else {
          if (st !== status) return false;
        }
      }

      if (fromD || toD) {
        const d = o.__created ?? null;
        if (!d) return false;
        if (fromD && d.getTime() < fromD.getTime()) return false;
        if (toD && d.getTime() > toD.getTime()) return false;
      }

      if (!qn) return true;

      const hay = [
        o.id,
        o.__email,
        o.status,
        o.__itemsLabel,
        JSON.stringify(o.shippingAddress || {}),
      ]
        .map(safeLower)
        .join(" | ");

      return hay.includes(qn);
    });

    out.sort((a, b) => {
      const da = a.__created?.getTime?.() ?? 0;
      const db = b.__created?.getTime?.() ?? 0;
      const ta = a.__total ?? 0;
      const tb = b.__total ?? 0;

      switch (sort) {
        case "date_asc":
          return da - db;
        case "date_desc":
          return db - da;
        case "total_asc":
          return ta - tb;
        case "total_desc":
          return tb - ta;
      }
    });

    return out;
  }, [orders, qDebounced, status, from, to, sort]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const paidCount = filtered.filter((o) => o.status === "paid").length;
    const pendingCount = filtered.filter((o) => o.status === "pending_payment").length;

    const totalEUR = filtered.reduce((sum, o) => sum + (o.__total ?? 0), 0);
    const paidEUR = filtered
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (o.__total ?? 0), 0);
    const avg = count > 0 ? totalEUR / count : 0;

    return { count, paidCount, pendingCount, totalEUR, paidEUR, avg };
  }, [filtered]);

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
  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSelection = () => setSelected({});

  // placeholders actions
  const markPaid = (id: string) => alert(`TODO: marquer payé ${id}`);

  // ✅ suppression réelle via API + update local (0 requêtes inutiles)
  const deleteOrder = async (id: string) => {
    const ok = confirm("Supprimer cette commande ? (irréversible)");
    if (!ok) return;

    const pass = localStorage.getItem("admin_password") || "";
    if (!pass) {
      window.location.href = "/admin/login";
      return;
    }

    if (deleting[id]) return;

    try {
      setDeleting((m) => ({ ...m, [id]: true }));

      const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-password": pass },
        cache: "no-store",
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      // ✅ retire en local (pas de refetch)
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setDrawerId((curr) => (curr === id ? null : curr));

      toastIt("Commande supprimée ✅");
    } catch (e: any) {
      toastIt("Erreur suppression ❌");
      alert(e?.message ?? "Erreur suppression");
    } finally {
      setDeleting((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }
  };

  return (
    <>
      {/* CSS embarqué => plus de “blanc bizarre” */}
      <style jsx global>{`
        :root{
          --bg: #f5f7fb;
          --card: #ffffff;
          --text: #0b1220;
          --muted: rgba(11,18,32,.6);
          --border: rgba(11,18,32,.10);
          --shadow: 0 18px 40px rgba(11,18,32,.08);
          --shadow2: 0 12px 26px rgba(11,18,32,.06);
          --radius: 18px;
        }
        body { background: var(--bg); }
        .adminWrap{
          max-width: 1280px;
          margin: 0 auto;
          padding: 18px 16px 90px;
          color: var(--text);
        }
        .topBar{
          position: sticky;
          top: 0;
          z-index: 10;
          margin: -18px -16px 14px;
          padding: 14px 16px;
          background: rgba(245,247,251,.78);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(11,18,32,.08);
        }
        .title{ font-size: 22px; font-weight: 950; margin: 0; }
        .sub{ margin-top: 4px; font-size: 13px; color: var(--muted); }

        .row{ display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
        .rowRight{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

        .gridKpi{
          display:grid;
          grid-template-columns: repeat(4, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
        @media (max-width: 980px){
          .gridKpi{ grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px){
          .gridKpi{ grid-template-columns: 1fr; }
        }

        .card{
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow2);
        }
        .cardPad{ padding: 14px; }

        .kLabel{ font-size: 12px; color: var(--muted); font-weight: 850; }
        .kValue{ font-size: 22px; font-weight: 950; margin-top: 6px; }
        .kSub{ font-size: 12px; color: var(--muted); margin-top: 4px; }

        .filters{
          display:grid;
          grid-template-columns: 1.6fr .85fr .85fr .85fr 1fr auto;
          gap: 12px;
          align-items: end;
        }
        @media (max-width: 980px){
          .filters{ grid-template-columns: 1fr 1fr; }
        }

        .field label{
          display:block;
          font-size:12px;
          font-weight: 900;
          color: rgba(11,18,32,.7);
          margin-bottom: 6px;
        }
        .input, .select{
          width:100%;
          height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(11,18,32,.14);
          background: rgba(255,255,255,.92);
          padding: 0 12px;
          outline: none;
          color: rgba(11,18,32,.92);
          box-shadow: 0 10px 22px rgba(11,18,32,.06);
        }
        .input:focus, .select:focus{
          border-color: rgba(11,18,32,.30);
          box-shadow: 0 16px 34px rgba(11,18,32,.10);
        }

        .btn{
          height: 42px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(11,18,32,.14);
          background: rgba(255,255,255,.92);
          font-weight: 900;
          color: rgba(11,18,32,.92);
          cursor: pointer;
          box-shadow: 0 12px 26px rgba(11,18,32,.06);
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          display:inline-flex;
          align-items:center;
          gap: 8px;
        }
        .btn:hover{ box-shadow: 0 18px 40px rgba(11,18,32,.10); }
        .btn:active{ transform: translateY(1px); }
        .btn:disabled{ opacity: .6; cursor: not-allowed; }

        .btn--primary{
          background: rgba(11,18,32,.92);
          color: white;
          border-color: rgba(11,18,32,.20);
        }
        .btn--ghost{
          background: rgba(11,18,32,.04);
          border-color: rgba(11,18,32,.10);
        }
        .btn--soft{
          background: rgba(11,18,32,.04);
          border-color: rgba(11,18,32,.10);
        }

        .listHead{
          padding: 12px 14px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          border-bottom: 1px solid rgba(11,18,32,.08);
        }
        .listTitle{ font-weight: 950; }
        .muted{ color: var(--muted); font-size: 13px; }

        /* Desktop table */
        .tableWrap{ width:100%; overflow-x:auto; }
        table{ width:100%; border-collapse: collapse; min-width: 1080px; }
        th{
          text-align:left;
          font-size:12px;
          padding: 12px 12px;
          color: rgba(11,18,32,.65);
          font-weight: 950;
          white-space: nowrap;
          background: rgba(11,18,32,.03);
        }
        td{
          padding: 12px 12px;
          font-size: 13px;
          color: rgba(11,18,32,.92);
          border-top: 1px solid rgba(11,18,32,.06);
          vertical-align: top;
          background: white;
        }

        .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

        .actions{ display:flex; justify-content:flex-end; gap: 8px; flex-wrap: wrap; }

        .iconBtn{
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border: 1px solid rgba(11,18,32,.10);
          background: rgba(11,18,32,.04);
          color: rgba(11,18,32,.90);
          box-shadow: 0 12px 26px rgba(11,18,32,.06);
          cursor:pointer;
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
        }
        .iconBtn:hover{ box-shadow: 0 18px 40px rgba(11,18,32,.10); }
        .iconBtn:active{ transform: translateY(1px); }
        .iconBtn:disabled{ opacity:.55; cursor:not-allowed; box-shadow:none; }
        .iconBtn--primary{ background: rgba(11,18,32,.92); color: white; border-color: rgba(11,18,32,.20); }
        .iconBtn--success{ background: rgba(16,185,129,.14); color: rgba(5,150,105,1); border-color: rgba(16,185,129,.26); }
        .iconBtn--danger{ background: rgba(239,68,68,.12); color: rgba(220,38,38,1); border-color: rgba(239,68,68,.26); }

        .pill{
          display:inline-flex;
          align-items:center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          background: rgba(11,18,32,.06);
          color: rgba(11,18,32,.85);
          white-space: nowrap;
        }
        .pill--paid{ background: rgba(16,185,129,.14); color: rgba(5,150,105,1); }
        .pill--pending{ background: rgba(245,158,11,.14); color: rgba(217,119,6,1); }
        .pill--canceled{ background: rgba(239,68,68,.14); color: rgba(220,38,38,1); }
        .pill--refunded{ background: rgba(59,130,246,.14); color: rgba(37,99,235,1); }
        .pill--other{ background: rgba(148,163,184,.18); color: rgba(30,41,59,.95); }

        .footer{
          padding: 12px 14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 10px;
          border-top: 1px solid rgba(11,18,32,.08);
          flex-wrap: wrap;
        }

        /* mobile cards */
        .hideMobile{ display:block; }
        .showMobile{ display:none; }
        @media (max-width: 900px){
          .hideMobile{ display:none; }
          .showMobile{ display:block; }
        }
        .cards{ padding: 12px; display:grid; gap: 12px; }
        .orderCard{
          border: 1px solid rgba(11,18,32,.10);
          border-radius: 16px;
          padding: 12px;
          background: white;
          box-shadow: var(--shadow2);
        }
        .cardTop{ display:flex; justify-content:space-between; gap: 10px; align-items:flex-start; }
        .amount{ font-weight: 950; font-size: 16px; }
        .date{ font-size: 12px; color: var(--muted); margin-top: 2px; }
        .cardBody{ margin-top: 10px; font-size: 13px; }
        .cardEmail{ margin-top: 6px; color: rgba(11,18,32,.75); }
        .cardItems{ margin-top: 6px; }
        .cardBtns{ margin-top: 12px; display:flex; gap: 10px; flex-wrap: wrap; align-items:center; }
        .selectLine{ margin-top: 10px; display:flex; justify-content:space-between; align-items:center; }

        /* Drawer */
        .drawerBackdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity .18s ease;
          z-index: 50;
        }
        .drawerBackdrop--open{
          opacity: 1;
          pointer-events: auto;
        }
        .drawer{
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: min(560px, 94vw);
          background: white;
          border-left: 1px solid rgba(11,18,32,.10);
          box-shadow: 0 20px 60px rgba(0,0,0,.20);
          transform: translateX(102%);
          transition: transform .22s ease;
          z-index: 51;
          display:flex;
          flex-direction: column;
        }
        .drawer--open{ transform: translateX(0); }
        .drawerHead{
          padding: 14px;
          border-bottom: 1px solid rgba(11,18,32,.08);
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 10px;
        }
        .drawerTitle{ font-weight: 950; font-size: 14px; }
        .drawerBody{ padding: 14px; overflow:auto; }

        /* Details */
        .detailGrid{ display:grid; gap: 14px; }
        .detailTop{ display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; }
        .detailAmount{ font-weight: 950; font-size: 18px; }
        .detailDate{ margin-top: 4px; color: var(--muted); font-size: 12px; }

        .box{
          border: 1px solid rgba(11,18,32,.10);
          border-radius: 16px;
          padding: 12px;
          background: rgba(11,18,32,.02);
        }
        .boxTitle{ font-weight: 950; font-size: 13px; margin-bottom: 10px; }
        .kv{
          display:grid;
          grid-template-columns: 90px 1fr;
          gap: 10px;
          font-size: 13px;
          align-items:start;
          margin-top: 6px;
        }
        .kvKey{ color: var(--muted); font-weight: 850; }
        .kvVal{ color: rgba(11,18,32,.92); font-weight: 850; }
        .rowBtns{ margin-top: 10px; display:flex; gap: 8px; flex-wrap: wrap; }

        .items{ display:grid; gap: 10px; }
        .itemCard{
          border: 1px solid rgba(11,18,32,.10);
          border-radius: 16px;
          padding: 12px;
          background: white;
          display:flex;
          justify-content:space-between;
          gap: 12px;
        }
        .itemLeft{ min-width: 0; }
        .itemName{ font-weight: 900; font-size: 13px; }
        .itemDesc{ margin-top: 4px; font-size: 12px; color: var(--muted); }
        .itemMeta{ margin-top: 6px; font-size: 12px; color: var(--muted); }
        .itemPrice{ font-weight: 950; white-space: nowrap; }

        .sum{
          margin-top: 12px;
          border-top: 1px solid rgba(11,18,32,.08);
          padding-top: 12px;
          display:grid;
          gap: 6px;
        }
        .sumRow{ display:flex; justify-content:space-between; gap: 10px; font-size: 13px; }
        .sumKey{ color: rgba(11,18,32,.65); font-weight: 850; }
        .sumVal{ color: rgba(11,18,32,.92); font-weight: 900; }
        .sumRow--total{ margin-top: 4px; }
        .sumKey--total, .sumVal--total{ font-weight: 950; }

        .addr{
          font-size: 13px;
          color: rgba(11,18,32,.85);
          white-space: pre-wrap;
        }

        .toast{
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 60;
          padding: 10px 12px;
          border-radius: 16px;
          border: 1px solid rgba(11,18,32,.12);
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 40px rgba(11,18,32,.14);
          font-weight: 950;
          font-size: 13px;
          color: rgba(11,18,32,.92);
        }
      `}</style>

      {toast ? <div className="toast">{toast}</div> : null}

      <div className="adminWrap">
        <div className="topBar">
          <div className="row">
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 className="title">📦 Commandes</h1>
              <div className="sub">
                Vue admin propre + lisible (CSS inclus dans la page).
              </div>
            </div>

            <div className="rowRight">
              <a className="btn btn--ghost" href="/admin/export">
                📤 Export
              </a>
              <button className="btn btn--ghost" onClick={fetchOrders} disabled={loading}>
                ↻ Rafraîchir
              </button>
              {selectedIds.length > 0 ? (
                <button className="btn btn--ghost" onClick={clearSelection}>
                  ✕ ({selectedIds.length})
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="gridKpi">
          <div className="card cardPad">
            <div className="kLabel">Commandes</div>
            <div className="kValue">{stats.count}</div>
            <div className="kSub">
              Période: {from} → {to}
            </div>
          </div>

          <div className="card cardPad">
            <div className="kLabel">Payées</div>
            <div className="kValue">{stats.paidCount}</div>
            <div className="kSub">{moneyEUR(stats.paidEUR)}</div>
          </div>

          <div className="card cardPad">
            <div className="kLabel">En attente</div>
            <div className="kValue">{stats.pendingCount}</div>
            <div className="kSub">pending_payment</div>
          </div>

          <div className="card cardPad">
            <div className="kLabel">Panier moyen</div>
            <div className="kValue">{moneyEUR(stats.avg)}</div>
            <div className="kSub">CA: {moneyEUR(stats.totalEUR)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card cardPad" style={{ marginTop: 14 }}>
          <div className="filters">
            <div className="field">
              <label>Recherche</label>
              <input
                className="input"
                placeholder="ID, email, produit, ville…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
              <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                {q ? `Filtre: “${qDebounced}”` : "Astuce: colle un ID Firestore / Stripe"}
              </div>
            </div>

            <div className="field">
              <label>Statut</label>
              <select
                className="select"
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
                <option value="other">autres</option>
              </select>
            </div>

            <div className="field">
              <label>Du</label>
              <input
                className="input"
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="field">
              <label>Au</label>
              <input
                className="input"
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="field">
              <label>Tri</label>
              <select
                className="select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as any);
                  setPage(1);
                }}
              >
                <option value="date_desc">Date (récent → ancien)</option>
                <option value="date_asc">Date (ancien → récent)</option>
                <option value="total_desc">Total (haut → bas)</option>
                <option value="total_asc">Total (bas → haut)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setSort("date_desc");
                  setFrom(firstDayOfMonthISO());
                  setTo(todayISO());
                  setPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
          <div className="listHead">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="listTitle">Liste</div>
              <div className="muted">{filtered.length} résultat(s)</div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="muted">
                Page {currentPage} / {totalPages}
              </div>
              <button
                className="btn btn--ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                ←
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 16 }} className="muted">
              Chargement…
            </div>
          ) : error ? (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Erreur</div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid rgba(11,18,32,.12)",
                  background: "rgba(11,18,32,.03)",
                  fontSize: 12,
                }}
              >
                {error}
              </pre>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn--ghost" onClick={fetchOrders}>
                  Réessayer
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 16 }} className="muted">
              Aucune commande.
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hideMobile tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 42 }}>
                        <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} />
                      </th>
                      <th>Date</th>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Articles</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!selected[o.id]}
                            onChange={() => toggleOne(o.id)}
                          />
                        </td>
                        <td>{formatDateFR(o.__created ?? null)}</td>
                        <td className="mono">{compactId(o.id)}</td>
                        <td>{o.__email || "—"}</td>
                        <td>
                          <StatusPill status={o.status} />
                        </td>
                        <td title={o.__itemsLabel}>{o.__itemsLabel || "—"}</td>
                        <td style={{ textAlign: "right", fontWeight: 950 }}>
                          {moneyEUR(o.__total ?? 0)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="actions">
                            <ActionIconButton
                              title="Voir"
                              variant="primary"
                              icon={<IconEye />}
                              onClick={() => setDrawerId(o.id)}
                            />
                            <ActionIconButton
                              title="Copier ID"
                              icon={<IconCopy />}
                              onClick={async () => {
                                await copyText(o.id);
                                toastIt("ID copié ✅");
                              }}
                            />
                            <ActionIconButton
                              title="Marquer payé"
                              variant="success"
                              icon={<IconCheck />}
                              onClick={() => markPaid(o.id)}
                            />
                            <ActionIconButton
                              title="Supprimer"
                              variant="danger"
                              icon={<IconTrash />}
                              disabled={!!deleting[o.id]}
                              onClick={() => deleteOrder(o.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="footer">
                  <div className="muted">
                    Affichage {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button className="btn btn--ghost" onClick={() => setPage(1)} disabled={currentPage === 1}>
                      Début
                    </button>
                    <button className="btn btn--ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      ←
                    </button>
                    <button className="btn btn--ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      →
                    </button>
                    <button className="btn btn--ghost" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
                      Fin
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="showMobile">
                <div className="cards">
                  {paged.map((o) => (
                    <div key={o.id} className="orderCard">
                      <div className="cardTop">
                        <div>
                          <div className="amount">{moneyEUR(o.__total ?? 0)}</div>
                          <div className="date">{formatDateFR(o.__created ?? null)}</div>
                        </div>
                        <StatusPill status={o.status} />
                      </div>

                      <div className="cardBody">
                        <div className="mono">{compactId(o.id)}</div>
                        <div className="cardEmail">{o.__email || "—"}</div>
                        <div className="cardItems">{o.__itemsLabel || "—"}</div>
                      </div>

                      <div className="cardBtns">
                        <button className="btn btn--primary" onClick={() => setDrawerId(o.id)}>
                          Voir
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={async () => {
                            await copyText(o.id);
                            toastIt("ID copié ✅");
                          }}
                        >
                          Copier ID
                        </button>
                        <button className="btn btn--ghost" onClick={() => markPaid(o.id)}>
                          Payé
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={() => deleteOrder(o.id)}
                          disabled={!!deleting[o.id]}
                        >
                          Suppr
                        </button>
                      </div>

                      <div className="selectLine">
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="checkbox" checked={!!selected[o.id]} onChange={() => toggleOne(o.id)} />
                          <span className="muted" style={{ fontSize: 12 }}>
                            Sélectionner
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="footer" style={{ borderTop: "none" }}>
                  <div className="muted">{filtered.length} résultat(s)</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button className="btn btn--ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                      ←
                    </button>
                    <button className="btn btn--ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                      →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer */}
        <Drawer
          open={!!drawerId}
          onClose={() => setDrawerId(null)}
          title={activeOrder ? `Commande ${compactId(activeOrder.id)}` : "Commande"}
        >
          {!activeOrder ? (
            <div className="muted">Chargement…</div>
          ) : (
            <OrderDetails
              order={activeOrder}
              onCopyId={async () => {
                await copyText(activeOrder.id);
                toastIt("ID copié ✅");
              }}
              onCopyEmail={async () => {
                await copyText(activeOrder.__email || activeOrder.email || "");
                toastIt("Email copié ✅");
              }}
              onCopyAddress={async () => {
                await copyText(formatAddress(activeOrder.shippingAddress));
                toastIt("Adresse copiée ✅");
              }}
            />
          )}
        </Drawer>
      </div>
    </>
  );
}
