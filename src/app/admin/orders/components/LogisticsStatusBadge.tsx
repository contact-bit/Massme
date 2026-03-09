"use client";

import React from "react";
import type { Order, ShippingStatus } from "../domain/types";
import {
  getEffectiveShippingStatus,
  getShippingStatusLabel,
  getShippingStatusUi,
} from "../domain/logistics";

export function LogisticsStatusBadge({
  order,
  status,
}: {
  order?: Order;
  status?: ShippingStatus;
}) {
  const effectiveStatus = status || (order ? getEffectiveShippingStatus(order) : "pending");
  const ui = getShippingStatusUi(effectiveStatus);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.border}`,
        background: ui.bg,
        color: ui.color,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {getShippingStatusLabel(effectiveStatus)}
    </span>
  );
}