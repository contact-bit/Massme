"use client";

import React from "react";
import type { Order } from "../domain/types";
import {
  getLogisticsSource,
  getLogisticsSourceLabel,
  getLogisticsSourceUi,
} from "../domain/logistics";

export function LogisticsSourceBadge({ order }: { order: Order }) {
  const source = getLogisticsSource(order);
  const ui = getLogisticsSourceUi(source);

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
      {getLogisticsSourceLabel(source)}
    </span>
  );
}