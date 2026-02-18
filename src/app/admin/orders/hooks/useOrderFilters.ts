"use client";
import { useMemo, useState } from "react";
import type { LangCode, Order, SortKey, StatusFilter } from "../domain/types";
import { safeLower, safeString } from "../domain/utils";
import { useDebouncedValue } from "./useDebouncedValue";

export function useOrderFilters(initialFrom: string, initialTo: string) {
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 220);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [lang, setLang] = useState<LangCode | "all">("all");

  const apply = useMemo(
    () => (orders: Order[]) => {
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

        if (lang !== "all") {
          if (o.__lang !== lang) return false;
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
