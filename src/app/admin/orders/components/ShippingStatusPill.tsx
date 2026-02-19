"use client";
import React from "react";
import type { ShippingStatus } from "../domain/types";
import { shippingStatusLabelFR } from "../domain/statusLabels";

export function ShippingStatusPill({ status }: { status?: ShippingStatus }) {
  const s: ShippingStatus = status || "pending";

  let cls = "pill pill--other";
  if (s === "pending") cls = "pill pill--pending";
  else if (s === "preparing") cls = "pill pill--other";
  else if (s === "shipped") cls = "pill pill--paid";
  else if (s === "delivered") cls = "pill pill--paid";
  else if (s === "cancelled") cls = "pill pill--canceled";

  return <span className={cls}>{shippingStatusLabelFR(s)}</span>;
}
