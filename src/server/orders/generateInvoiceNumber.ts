import { dbAdmin } from "@/lib/firebase.admin";
import type { DocumentReference } from "firebase-admin/firestore";

function formatInvoiceNumber(count: number) {
  return `FID${String(count).padStart(5, "0")}`;
}

function cleanString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isInvoiceNumber(value: string) {
  return /^FID\d{5,}$/.test(value);
}

function numberFromBusinessId(value: string) {
  const match = value.match(/^(?:ID|FID)(\d+)$/);

  if (!match) return 0;

  const n = Number(match[1]);

  return Number.isFinite(n) ? n : 0;
}

function getOrderSequence(
  data: Record<string, unknown> | undefined
) {
  const orderNumber =
    cleanString(data?.orderNumber) ||
    cleanString(data?.__orderNumber);

  return numberFromBusinessId(orderNumber);
}

function getExistingInvoiceNumber(
  data: Record<string, unknown> | undefined
) {
  const invoiceEmail =
    data?.invoiceEmail &&
    typeof data.invoiceEmail === "object"
      ? (data.invoiceEmail as Record<string, unknown>)
      : {};

  const existing =
    cleanString(data?.invoiceNumber) ||
    cleanString(invoiceEmail.invoiceNumber);

  if (!isInvoiceNumber(existing)) {
    return "";
  }

  const orderSequence = getOrderSequence(data);
  const invoiceSequence =
    numberFromBusinessId(existing);

  if (
    orderSequence > 0 &&
    invoiceSequence < orderSequence
  ) {
    return "";
  }

  return existing;
}

export async function generateInvoiceNumber() {
  const ref = dbAdmin
    .collection("counters")
    .doc("invoices");

  const count = await dbAdmin.runTransaction(
    async (tx) => {
      const doc = await tx.get(ref);

      if (!doc.exists) {
        tx.set(ref, {
          count: 1,
          createdAt: new Date(),
        });
        return 1;
      }

      const next =
        Number(doc.data()?.count || 0) + 1;

      tx.update(ref, { count: next });
      return next;
    }
  );

  return formatInvoiceNumber(count);
}

export async function ensureInvoiceNumberForOrder(
  orderRef: DocumentReference
) {
  const counterRef = dbAdmin
    .collection("counters")
    .doc("invoices");

  return dbAdmin.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    const orderData = orderSnap.exists
      ? (orderSnap.data() as
          | Record<string, unknown>
          | undefined)
      : undefined;

    const existing =
      getExistingInvoiceNumber(orderData);

    if (existing) return existing;

    const orderSequence =
      getOrderSequence(orderData);

    const counterSnap = await tx.get(counterRef);
    const counterNext = counterSnap.exists
      ? Number(
          counterSnap.data()?.count || 0
        ) + 1
      : 1;

    const next = Math.max(
      counterNext,
      orderSequence || 1
    );

    if (counterSnap.exists) {
      tx.update(counterRef, { count: next });
    } else {
      tx.set(counterRef, {
        count: next,
        createdAt: new Date(),
      });
    }

    const invoiceNumber =
      formatInvoiceNumber(next);

    tx.set(
      orderRef,
      {
        invoiceNumber,
        "invoiceEmail.invoiceNumber":
          invoiceNumber,
      },
      { merge: true }
    );

    return invoiceNumber;
  });
}
