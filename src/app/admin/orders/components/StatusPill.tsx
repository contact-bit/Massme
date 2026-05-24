"use client";

import React from "react";
import { paymentStatusLabelFR } from "../domain/statusLabels";

type Tone = "success" | "warning" | "danger" | "info";

function getTone(status?: string): Tone {
  const s = (status || "unknown").toLowerCase();

  if (s === "paid") return "success";
  if (
    s === "pending_payment" ||
    s === "awaiting_bank_transfer" ||
    s === "pending" ||
    s === "failed" ||
    s === "refused" ||
    s === "declined" ||
    s === "canceled" ||
    s === "cancelled"
  ) {
    return "danger";
  }

  if (s === "refunded") return "info";

  return "info";
}

export function StatusPill({ status }: { status?: string }) {
  const tone = getTone(status);

  return (
    <span className={`status-pill ${tone}`}>
      <span className="status-dot" />
      {paymentStatusLabelFR(status || "unknown")}
    </span>
  );
}
