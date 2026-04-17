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
  const effectiveStatus =
    status || (order ? getEffectiveShippingStatus(order) : "pending");

  const ui = getShippingStatusUi(effectiveStatus);

  return (
    <span
      className="statusBadge"
      style={
        {
          "--badge-bg": ui.bg,
          "--badge-border": ui.border,
          "--badge-color": ui.color,
        } as React.CSSProperties
      }
    >
      {getShippingStatusLabel(effectiveStatus)}
    </span>
  );
}