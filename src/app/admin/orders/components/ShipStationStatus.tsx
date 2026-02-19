"use client";
import React, { useEffect, useState } from "react";
import { ShipStationStatusPill } from "./ShipStationStatusPill";

export function ShipStationStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/shipstation/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setStatus(j?.shipstation?.orderStatus ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus(null);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return <ShipStationStatusPill status={status} />;
}
