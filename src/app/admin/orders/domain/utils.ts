export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function firstDayOfMonthISO() {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0, 10);
}

export function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
export function safeLower(v: any) {
  return safeString(v).toLowerCase();
}

export function parseCreatedAt(value: any): Date | null {
  if (!value) return null;

  if (typeof value === "object" && typeof (value as any).toDate === "function") {
    try {
      const d = (value as any).toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }

  if (typeof value === "object") {
    const sec =
      typeof (value as any).seconds === "number"
        ? (value as any).seconds
        : typeof (value as any)._seconds === "number"
        ? (value as any)._seconds
        : null;

    const nano =
      typeof (value as any).nanoseconds === "number"
        ? (value as any).nanoseconds
        : typeof (value as any)._nanoseconds === "number"
        ? (value as any)._nanoseconds
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

export function formatDateFR(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function moneyEUR(n: number) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

export function compactId(id: string) {
  if (!id) return "—";
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export async function copyText(text: string) {
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

export function formatAddress(a: any) {
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
