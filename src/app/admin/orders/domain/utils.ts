import type { Order } from "./types";

/* =========================================================
   DATE
========================================================= */

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function firstDayOfMonthISO(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

/* =========================================================
   SAFE
========================================================= */

export function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

export function safeLower(v: unknown): string {
  return safeString(v).toLowerCase();
}

/* =========================================================
   DATE PARSER
========================================================= */

type FirestoreTimestampLike = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
};

export function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  const v = value as FirestoreTimestampLike;

  if (typeof v?.toDate === "function") {
    try {
      const d = v.toDate();
      if (!isNaN(d.getTime())) return d;
    } catch {}
  }

  const sec =
    typeof v.seconds === "number"
      ? v.seconds
      : typeof v._seconds === "number"
      ? v._seconds
      : null;

  const nano =
    typeof v.nanoseconds === "number"
      ? v.nanoseconds
      : typeof v._nanoseconds === "number"
      ? v._nanoseconds
      : 0;

  if (typeof sec === "number") {
    const d = new Date(sec * 1000 + Math.floor(nano / 1e6));
    if (!isNaN(d.getTime())) return d;
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

/* =========================================================
   FORMAT
========================================================= */

export function formatDateFR(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function moneyEUR(n: number): string {
  const v = Math.round((n ?? 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

/* =========================================================
   ID / COPY
========================================================= */

export function compactId(id?: string | null): string {
  if (!id) return "—";
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export async function copyText(text: string): Promise<void> {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {}

  const t = document.createElement("textarea");
  t.value = text;
  document.body.appendChild(t);
  t.select();
  document.execCommand("copy");
  t.remove();
}

/* =========================================================
   ADDRESS
========================================================= */

type Address = {
  name?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
};

export function formatAddress(a?: Address | null): string {
  if (!a) return "";

  return [
    a.name,
    a.email,
    a.address,
    [a.postalCode, a.city].filter(Boolean).join(" "),
    a.country,
    a.phone,
  ]
    .filter(Boolean)
    .join("\n");
}

/* =========================================================
   🔥 ORDER LABEL
========================================================= */

type OrderWithNumber = Order & {
  orderNumber?: string;
  __orderNumber?: string;
};

export function getOrderNumber(o?: Order | null): string | null {
  if (!o) return null;

  const order = o as OrderWithNumber;

  if (order.orderNumber) return order.orderNumber;
  if (order.__orderNumber) return order.__orderNumber;

  return null;
}

export function getOrderLabel(o?: Order | null): string {
  const num = getOrderNumber(o);
  if (num) return num;
  if (o?.id) return compactId(o.id);
  return "—";
}

export function getOrderLabelFromId(
  id?: string,
  orderNumber?: string
): string {
  if (orderNumber) return orderNumber;
  if (id) return compactId(id);
  return "—";
}