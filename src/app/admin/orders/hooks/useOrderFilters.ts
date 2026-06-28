"use client";
import { useMemo, useState } from "react";
import type { LangCode, Order, SortKey, StatusFilter } from "../domain/types";
import { safeLower, safeString } from "../domain/utils";
import { useDebouncedValue } from "./useDebouncedValue";

/* =========================================================
   🔥 DATE SAFE (ULTRA IMPORTANT)
========================================================= */
function toDateSafe(v: unknown): Date | null {
  if (!v) return null;

  if (v instanceof Date) return v;

  const timestamp = v as {
    toDate?: () => Date;
    _seconds?: number;
  };

  if (typeof timestamp.toDate === "function") return timestamp.toDate();
  if (typeof timestamp._seconds === "number") {
    return new Date(timestamp._seconds * 1000);
  }

  if (typeof v !== "string" && typeof v !== "number") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function useOrderFilters(initialFrom: string, initialTo: string) {
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 220);

  const [status, setStatus] = useState<StatusFilter>("all");

  // 🔥 IMPORTANT pas de filtre par défaut
  const [from, setFrom] = useState(initialFrom || "");
  const [to, setTo] = useState(initialTo || "");

  const [sort, setSort] = useState<SortKey>("date_desc");
  const [lang, setLang] = useState<LangCode | "all">("all");

  const apply = useMemo(
    () => (orders: Order[]) => {
      const qn = qDebounced.trim().toLowerCase();

      const fromD = from ? new Date(from + "T00:00:00") : null;
      const toD = to ? new Date(to + "T23:59:59") : null;

      const out = orders.filter((o) => {
        const st = safeString(o.status);

        /* ================= STATUS ================= */
        if (status !== "all") {
          if (status === "other") {
            if (["paid", "pending_payment", "refunded", "canceled"].includes(st))
              return false;
          } else {
            if (st !== status) return false;
          }
        }

        /* ================= DATE ================= */
        if (fromD || toD) {
          const d =
            toDateSafe(o.__created) ||
            toDateSafe(o.createdAt) ||
            null;

          // 🔥 FIX CRITIQUE ne plus supprimer la commande
          if (!d) return true;

          if (fromD && d.getTime() < fromD.getTime()) return false;
          if (toD && d.getTime() > toD.getTime()) return false;
        }

        /* ================= LANG ================= */
        if (lang !== "all") {
          if (o.__lang !== lang) return false;
        }

        /* ================= SEARCH ================= */
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

      /* ================= SORT ================= */
      out.sort((a, b) => {
        const da =
          toDateSafe(a.__created)?.getTime() ||
          toDateSafe(a.createdAt)?.getTime() ||
          0;

        const db =
          toDateSafe(b.__created)?.getTime() ||
          toDateSafe(b.createdAt)?.getTime() ||
          0;

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
          default:
            return 0;
        }
      });

      return out;
    },
    [qDebounced, from, to, status, sort, lang]
  );

  return {
    q,
    setQ,
    qDebounced,
    status,
    setStatus,
    from,
    setFrom,
    to,
    setTo,
    sort,
    setSort,
    lang,
    setLang,
    apply,
  };
}
