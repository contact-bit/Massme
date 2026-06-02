import type { Order } from "./types";

type FeeInfo = {
  amount: number;
  label: string;
  provider: string;
};

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function pickStoredFee(order: Order): number {
  const o = order as Record<string, unknown>;
  const payment =
    (o.payment || {}) as Record<string, unknown>;
  const fees =
    (o.fees || {}) as Record<string, unknown>;

  return (
    num(payment.fee) ||
    num(payment.commission) ||
    num(payment.providerFee) ||
    num(payment.paypalFee) ||
    num(payment.stripeFee) ||
    num(fees.payment) ||
    num(o.commission)
  );
}

function providerLabel(provider: string) {
  const normalized = provider.toLowerCase();

  if (normalized === "stripe") {
    return "Stripe";
  }

  if (normalized === "paypal") {
    return "PayPal";
  }

  if (
    normalized === "bank_transfer" ||
    normalized === "transfer" ||
    normalized === "manual"
  ) {
    return "Virement bancaire";
  }

  return provider || "paiement";
}

export function getPaymentProvider(order: Order): string {
  const o = order as Record<string, unknown>;
  const payment =
    (o.payment || {}) as Record<string, unknown>;
  const paymentMethod =
    (o.paymentMethod || {}) as Record<string, unknown>;
  const invoiceEmail =
    (o.invoiceEmail || {}) as Record<string, unknown>;

  return String(
    payment.provider ||
      payment.finalizedProvider ||
      paymentMethod.provider ||
      invoiceEmail.provider ||
      o.paymentProvider ||
      ""
  ).toLowerCase();
}

export function getPaymentFee(
  order: Order,
  totalTTC: number
): FeeInfo | null {
  const o = order as Record<string, unknown>;
  const payment =
    (o.payment || {}) as Record<string, unknown>;
  const provider = getPaymentProvider(order);

  if (!provider) {
    return null;
  }

  const storedFee = pickStoredFee(order);

  if (storedFee > 0) {
    const feeProvider = String(
      payment.feeProvider ||
        payment.provider ||
        provider
    ).toLowerCase();

    const feeLabel =
      String(payment.feeLabel || "").trim() ||
      providerLabel(feeProvider);

    return {
      amount: round2(storedFee),
      label: feeLabel,
      provider: feeProvider || provider,
    };
  }

  return null;
}
