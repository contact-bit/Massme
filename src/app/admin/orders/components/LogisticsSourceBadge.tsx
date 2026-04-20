"use client";

import React from "react";
import type { Order } from "../domain/types";
import {
  getLogisticsSource,
  getLogisticsSourceLabel,
} from "../domain/logistics";

export function LogisticsSourceBadge({ order }: { order: Order }) {
  const source = getLogisticsSource(order);

  return (
    <span className={`admin-badge logistics-${source}`}>
      {getLogisticsSourceLabel(source)}
    </span>
  );
}