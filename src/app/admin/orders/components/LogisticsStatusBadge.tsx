"use client";

import React from "react";
import type { Order, ShippingStatus } from "../domain/types";
import {
  getEffectiveShippingStatus,
  getShippingStatusLabel,
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

  return (
    <span className={`admin-badge status-${effectiveStatus}`}>
      {getShippingStatusLabel(effectiveStatus)}
    </span>
  );
}