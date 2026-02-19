"use client";
import React from "react";
import { shipstationOrderStatusLabelFR } from "../domain/shipstationLabels";

export function ShipStationStatusPill({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();

  let cls = "pill pill--other";
  if (s === "awaiting_shipment") cls = "pill pill--pending";
  else if (s === "on_hold") cls = "pill pill--pending";
  else if (s === "shipped") cls = "pill pill--paid";
  else if (s === "cancelled") cls = "pill pill--canceled";

  return <span className={cls}>Statut livraison: {shipstationOrderStatusLabelFR(status || "")}</span>;
}
