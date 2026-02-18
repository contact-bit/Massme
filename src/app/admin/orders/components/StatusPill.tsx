"use client";
import React from "react";

export function StatusPill({ status }: { status?: string }) {
  const s = status || "—";
  let cls = "pill";
  let label = s;

  if (s === "paid") {
    cls = "pill pill--paid";
    label = "paid";
  } else if (s === "pending_payment") {
    cls = "pill pill--pending";
    label = "pending";
  } else if (s === "canceled") {
    cls = "pill pill--canceled";
    label = "canceled";
  } else if (s === "refunded") {
    cls = "pill pill--refunded";
    label = "refunded";
  } else if (s && s !== "—") {
    cls = "pill pill--other";
    label = s;
  }

  return <span className={cls}>{label}</span>;
}
