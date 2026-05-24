import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase.admin";
import { generateOrderNumber } from "@/server/orders/generateOrderNumber";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject(value: unknown) {
  return value && typeof value === "object" ? value : {};
}

function toSafeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeEmail(v: unknown): string | null {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!e || !e.includes("@")) return null;
  return e;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildBankTransferReference(orderNumber: string) {
  return orderNumber;
}

function computeTotals(items: any[], shippingMethod: any) {
  const itemsTotalHT = items.reduce((sum, item) => {
    const qty = Math.max(1, toNumber(item?.quantity, 1));
    const priceHT = toNumber(item?.priceHT, 0);
    return sum + priceHT * qty;
  }, 0);

  const vatRateRaw =
    items.length > 0 ? toNumber(items?.[0]?.vatRate, 20) : 20;

  const vatRate = vatRateRaw > 1 ? vatRateRaw : vatRateRaw * 100;
  const vatMultiplier = vatRate / 100;

  const shippingHT = toNumber(shippingMethod?.priceHT, 0);
  const shippingTTC =
    shippingMethod?.priceTTC !== undefined && shippingMethod?.priceTTC !== null
      ? toNumber(shippingMethod?.priceTTC, 0)
      : round2(shippingHT * (1 + vatMultiplier));

  const itemsVAT = round2(itemsTotalHT * vatMultiplier);
  const itemsTTC = round2(itemsTotalHT + itemsVAT);

  const shippingVAT = round2(shippingTTC - shippingHT);

  const totalHT = round2(itemsTotalHT + shippingHT);
  const totalVAT = round2(itemsVAT + shippingVAT);
  const totalTTC = round2(itemsTTC + shippingTTC);

  return {
    totalHT,
    totalVAT,
    totalTTC,
    vatRate,
    shippingHT,
    shippingTTC,
    country: toSafeString(shippingMethod?.country, "FR"),
    vatDisabled: false,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items = asArray<any>(body.items);
    const billingCustomer = asObject(body.billingCustomer);
    const shippingCustomer = asObject(body.shippingCustomer);
    const shippingMethod = body.shippingMethod ?? null;
    const relayPoint = body.relayPoint ?? null;

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "Panier vide" },
        { status: 400 }
      );
    }

    const orderNumber = await generateOrderNumber();
    const ref = dbAdmin.collection("orders").doc();

    const email =
      normalizeEmail((billingCustomer as any)?.email) ||
      normalizeEmail((shippingCustomer as any)?.email) ||
      null;

    const paymentReference = buildBankTransferReference(orderNumber);
    const totals = computeTotals(items, shippingMethod);

    const bankTransferDetails = {
      accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME || "Vitrectomed",
      iban: process.env.BANK_TRANSFER_IBAN || "",
      bic: process.env.BANK_TRANSFER_BIC || "",
      bankName: process.env.BANK_TRANSFER_BANK_NAME || "",
      reference: paymentReference,
      instructions:
        "Veuillez effectuer le virement en indiquant impérativement le numéro de commande comme référence.",
    };

    await ref.set({
      id: ref.id,
      createdAt: new Date(),
      updatedAt: new Date(),

      orderNumber,
      reference: paymentReference,

      status: "awaiting_bank_transfer",
      paymentStatus: "pending",
      provider: "bank_transfer",
      paymentProvider: "bank_transfer",

      locale: toSafeString(body.locale, "fr"),

      email,
      items,

      billingCustomer,
      shippingCustomer,

      billingAddress: billingCustomer,
      shippingAddress: shippingCustomer,

      shippingMethod,
      relayPoint,

      shippingPrice: totals.shippingTTC,
      totals,

      heardFrom: body.heardFrom ?? null,
      heardFromOther: body.heardFromOther ?? null,

      payment: {
        provider: "bank_transfer",
        status: "pending",
        validationMode: "manual",
        reference: paymentReference,
        requestedAt: new Date(),
        validatedAt: null,
        validatedBy: null,
      },

      bankTransfer: {
        ...bankTransferDetails,
        displayedAtCheckout: true,
        paymentProofUrl: null,
        paymentConfirmedByAdmin: false,
        paymentConfirmedAt: null,
      },

      emails: {
        sent: false,
      },

      invoiceEmail: {
        status: "pending",
      },

      reviewEmail: {
        status: "pending",
      },

      shipstation: {
        pushedAt: null,
      },

      source: "checkout_bank_transfer",
    });

    return NextResponse.json({
      ok: true,
      orderId: ref.id,
      orderNumber,
      reference: paymentReference,
      totalTTC: totals.totalTTC,
      bankTransfer: {
        accountName: bankTransferDetails.accountName,
        iban: bankTransferDetails.iban,
        bic: bankTransferDetails.bic,
        bankName: bankTransferDetails.bankName,
      },
    });
  } catch (e) {
    console.error("BANK TRANSFER CREATE ORDER ERROR", e);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
