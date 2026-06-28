"use client";

import React from "react";

import type { Order } from "../domain/types";

import {
  getEffectiveShippingStatus,
} from "../domain/logistics";
import { isPendingBankTransfer } from "../domain/payment";

type Tone =
  | "success"
  | "warning"
  | "danger"
  | "info";

function getTone(status: string): Tone {
  if (
    status === "shipped" ||
    status === "delivered"
  ) {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "warning";
}

function getLabel(status: string) {
  if (
    status === "shipped" ||
    status === "delivered"
  ) {
    return "Expédié";
  }

  if (status === "cancelled") {
    return "Annulé";
  }

  return "Préparation";
}

export function ShippingStatusPill({
  order,
}: {
  order: Order;
}) {
  if (isPendingBankTransfer(order)) {
    return (
      <span className="status-pill warning">
        <span className="status-dot" />
        En attente de validation
      </span>
    );
  }

  const status =
    getEffectiveShippingStatus(order);

  return (
    <span
      className={`status-pill ${getTone(status)}`}
    >
      <span className="status-dot" />
      {getLabel(status)}
    </span>
  );
}
