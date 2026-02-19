"use client";
import React from "react";
import { paymentStatusLabelFR } from "../domain/statusLabels";

export function StatusPill({ status }: { status?: string }) {
  const s = (status || "unknown").toLowerCase();

  let cls = "pill";

  if (s === "paid") {
    cls = "pill pill--paid";
  } else if (s === "pending_payment" || s === "pending") {
    cls = "pill pill--pending";
  } else if (s === "canceled" || s === "cancelled") {
    cls = "pill pill--canceled";
  } else if (s === "refunded") {
    cls = "pill pill--refunded";
  } else {
    cls = "pill pill--other";
  }

  return <span className={cls}>{paymentStatusLabelFR(s)}</span>;
}
