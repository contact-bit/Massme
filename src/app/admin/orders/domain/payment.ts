import type { Order } from "./types";

export function getOrderPaymentStatus(order: Order) {
  return String(
    order.payment?.status ||
      order.paymentStatus ||
      order.status ||
      ""
  ).toLowerCase();
}

export function getOrderPaymentProvider(order: Order) {
  return String(
    order.payment?.provider ||
      order.paymentProvider ||
      order.provider ||
      ""
  ).toLowerCase();
}

export function isPendingBankTransfer(order: Order) {
  const status = getOrderPaymentStatus(order);
  const provider = getOrderPaymentProvider(order);

  return (
    provider === "bank_transfer" &&
    status !== "paid" &&
    status !== "validated"
  );
}

