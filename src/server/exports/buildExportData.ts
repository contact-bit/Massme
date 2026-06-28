// src/server/exports/buildExportData.ts

/* =========================================================
   HELPERS
========================================================= */

function num(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number) {
  return Math.round(num(n) * 100) / 100;
}

function parseDate(v: any): Date | null {
  if (!v) return null;

  // Firestore Timestamp
  if (typeof v?.toDate === "function") {
    try {
      return v.toDate();
    } catch {}
  }

  // Firestore raw {_seconds}
  if (v?._seconds) {
    return new Date(v._seconds * 1000);
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getOrderDate(order: any): Date | null {
  return (
    parseDate(order.createdAt) ||
    parseDate(order.paidAt) ||
    parseDate(order.updatedAt) ||
    null
  );
}

function formatDateFR(order: any) {
  const d = getOrderDate(order);
  if (!d) return "-";

  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

/* =========================================================
   ITEMS
========================================================= */

function getItems(order: any) {
  return Array.isArray(order.items) ? order.items : [];
}

function getQty(order: any) {
  return getItems(order).reduce(
    (sum: number, i: any) => sum + num(i?.quantity || 1),
    0
  );
}

/* =========================================================
   MONEY
========================================================= */

function getShippingHT(order: any) {
  return round2(
    num(order.totals?.shippingHT) ||
      num(order.shippingMethod?.priceHT) ||
      num(order.shippingPrice)
  );
}

function getTotalHT(order: any) {
  return round2(num(order.totals?.totalHT));
}

function getVAT(order: any) {
  return round2(num(order.totals?.totalVAT));
}

function getTotalTTC(order: any) {
  const ttc = num(order.totals?.totalTTC);
  if (ttc > 0) return round2(ttc);

  const captured = num(order.payment?.capturedAmount?.value);
  if (captured > 0) return round2(captured);

  return 0;
}

function getProductsHT(order: any) {
  const totalHT = getTotalHT(order);
  const shipping = getShippingHT(order);

  if (totalHT > 0) return round2(totalHT - shipping);

  return round2(
    getItems(order).reduce((sum: number, i: any) => {
      return sum + num(i?.priceHT) * num(i?.quantity || 1);
    }, 0)
  );
}

/* =========================================================
   BUSINESS
========================================================= */

function getCustomer(order: any) {
  return (
    order.billingAddress?.name ||
    [order.billingAddress?.firstName, order.billingAddress?.lastName]
      .filter(Boolean)
      .join(" ") ||
    order.shippingAddress?.name ||
    order.customerName ||
    order.email ||
    "-"
  );
}

function getEmail(order: any) {
  return (
    order.email ||
    order.billingAddress?.email ||
    order.debug?.paypalFinalizeResult?.email ||
    "-"
  );
}

function getStatus(order: any) {
  return order.status || order.paymentStatus || "-";
}

function getPayment(order: any) {
  return (
    order.payment?.provider ||
    order.paymentMethod?.label ||
    order.paymentProvider ||
    "-"
  );
}

/* =========================================================
   COSTS
========================================================= */

function getCommission(order: any) {
  const ttc = getTotalTTC(order);
  if (!ttc) return 0;

  return round2(ttc * 0.015 + 0.25);
}

function getFabrication() {
  return 0;
}

function getGain(order: any) {
  return round2(
    getTotalHT(order) - getCommission(order) - getFabrication()
  );
}

/* =========================================================
   MAIN
========================================================= */

export function buildExportData(order: any) {
  // 🔥 FIX NUMERO COMMANDE
  const orderNumber = order.orderNumber
    ? `#${order.orderNumber}`
    : order.id || "-";

  const result = {
    id: orderNumber, // 👈 IMPORTANT FIX

    date: formatDateFR(order),

    customer: getCustomer(order),
    email: getEmail(order),
    status: getStatus(order),
    payment: getPayment(order),

    qty: getQty(order),

    productsHT: getProductsHT(order),
    shippingHT: getShippingHT(order),
    vat: getVAT(order),
    totalHT: getTotalHT(order),
    totalTTC: getTotalTTC(order),

    commission: getCommission(order),
    fabrication: getFabrication(),
    gain: getGain(order),
  };

  // 🔍 DEBUG SAFE
  if (process.env.NODE_ENV !== "production") {
    if (!result.totalTTC && !result.totalHT) {
      console.warn("⚠️ EXPORT EMPTY ORDER:", order.id);
    }
  }

  return result;
}
