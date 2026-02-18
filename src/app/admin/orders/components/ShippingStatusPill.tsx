"use client";
import React from "react";
import type { ShippingStatus } from "../domain/types";

export function ShippingStatusPill({ status }: { status?: ShippingStatus }) {
  const s: ShippingStatus = status || "pending";
  let cls = "pill";
  let label = "";

  if (s === "pending") {
    cls = "pill pill--pending";
    label = "En attente";
  } else if (s === "preparing") {
    cls = "pill pill--other";
    label = "Préparation";
  } else if (s === "shipped") {
    cls = "pill pill--paid";
    label = "Expédiée";
  } else if (s === "delivered") {
    cls = "pill pill--paid";
    label = "Livrée";
  } else if (s === "cancelled") {
    cls = "pill pill--canceled";
    label = "Annulée";
  }

  return <span className={cls}>{label}</span>;
}
