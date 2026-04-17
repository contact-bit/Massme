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
      className="statusBadge"
      style={
        {
          "--badge-bg": ui.bg,
          "--badge-border": ui.border,
          "--badge-color": ui.color,
        } as React.CSSProperties
      }
    >
      {getLogisticsSourceLabel(source)}
    </span>
  );
}